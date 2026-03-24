from celery import shared_task
from django.db import transaction
from django.utils import timezone

from contest.models import Submission, TestCase, Leaderboard


LANGUAGE_ID_MAP = {
    "python": 71,
    "cpp": 54,
    "c": 50,
    "java": 62,
}


def compare_output(actual, expected):
    actual = "\n".join(line.rstrip() for line in (actual or "").strip().splitlines())
    expected = "\n".join(line.rstrip() for line in (expected or "").strip().splitlines())
    return actual == expected


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def judge_submission(self, submission_id):
    from .services import submit_code_to_judge0, get_submission_result

    submission = Submission.objects.select_related("problem", "contest", "user").get(id=submission_id)
    testcases = TestCase.objects.filter(problem=submission.problem).order_by("id")

    language_id = LANGUAGE_ID_MAP.get((submission.language or "").lower())
    if not language_id:
        submission.status = "CE"
        submission.save(update_fields=["status"])
        return {
            "submission_id": submission.id,
            "status": "CE",
            "error": f"Unsupported language: {submission.language}",
        }

    total = testcases.count()
    passed_count = 0
    final_status = "AC"
    total_runtime = 0.0

    for tc in testcases:
        token = submit_code_to_judge0(
            source_code=submission.code,
            language_id=language_id,
            stdin=tc.input,
        )

        result = get_submission_result(token)

        if result.get("error"):
            final_status = "RE"
            break

        actual_output = (result.get("stdout") or "").strip()
        expected_output = (tc.expected_output or "").strip()
        stderr = (result.get("stderr") or "").strip()
        compile_output = (result.get("compile_output") or "").strip()
        status_id = (result.get("status") or {}).get("id")
        exec_time = result.get("time")

        if exec_time:
            try:
                total_runtime += float(exec_time)
            except Exception:
                pass

        if compile_output:
            final_status = "CE"
            break
        elif status_id == 5:
            final_status = "TLE"
            break
        elif stderr:
            final_status = "RE"
            break
        elif compare_output(actual_output, expected_output):
            passed_count += 1
        else:
            final_status = "WA"
            break

    score = submission.problem.points if total > 0 and passed_count == total else 0

    with transaction.atomic():
        submission.status = final_status
        submission.runtime = total_runtime
        submission.score = score
        submission.save(update_fields=["status", "runtime", "score"])

        if submission.contest_id:
            leaderboard_obj, _ = Leaderboard.objects.get_or_create(
                contest=submission.contest,
                user=submission.user,
            )

            user_submissions = Submission.objects.filter(
                contest=submission.contest,
                user=submission.user,
            ).select_related("problem")

            best_score_by_problem = {}
            for item in user_submissions:
                pid = item.problem_id
                current_best = best_score_by_problem.get(pid, 0)
                if item.score > current_best:
                    best_score_by_problem[pid] = item.score

            leaderboard_obj.score = sum(best_score_by_problem.values())
            leaderboard_obj.solved = sum(1 for val in best_score_by_problem.values() if val > 0)
            leaderboard_obj.last_updated = timezone.now()
            leaderboard_obj.save()

            leaders = Leaderboard.objects.filter(contest=submission.contest).order_by(
                "-score", "-solved", "penalty", "last_updated", "id"
            )

            updates = []
            for rank, entry in enumerate(leaders, start=1):
                if entry.rank != rank:
                    entry.rank = rank
                    updates.append(entry)

            if updates:
                Leaderboard.objects.bulk_update(updates, ["rank"])

    return {
        "submission_id": submission.id,
        "status": final_status,
        "passed": passed_count,
        "total": total,
        "score": score,
    }

