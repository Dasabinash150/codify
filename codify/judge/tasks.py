# from celery import shared_task
# from django.db import transaction
# from django.utils import timezone

# from contest.models import Submission, TestCase, Leaderboard


# LANGUAGE_ID_MAP = {
#     "python": 71,
#     "cpp": 54,
#     "c": 50,
#     "java": 62,
# }


# def compare_output(actual, expected):
#     actual = "\n".join(line.rstrip() for line in (actual or "").strip().splitlines())
#     expected = "\n".join(line.rstrip() for line in (expected or "").strip().splitlines())
#     return actual == expected


# @shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
# def judge_submission(self, submission_id):
#     from .services import submit_code_to_judge0, get_submission_result

#     submission = Submission.objects.select_related("problem", "contest", "user").get(id=submission_id)
#     testcases = TestCase.objects.filter(problem=submission.problem).order_by("id")

#     language_id = LANGUAGE_ID_MAP.get((submission.language or "").lower())
#     if not language_id:
#         submission.status = "CE"
#         submission.save(update_fields=["status"])
#         return {
#             "submission_id": submission.id,
#             "status": "CE",
#             "error": f"Unsupported language: {submission.language}",
#         }

#     total = testcases.count()
#     passed_count = 0
#     final_status = "AC"
#     total_runtime = 0.0

#     for tc in testcases:
#         token = submit_code_to_judge0(
#             source_code=submission.code,
#             language_id=language_id,
#             stdin=tc.input,
#         )

#         result = get_submission_result(token)

#         if result.get("error"):
#             final_status = "RE"
#             break

#         actual_output = (result.get("stdout") or "").strip()
#         expected_output = (tc.expected_output or "").strip()
#         stderr = (result.get("stderr") or "").strip()
#         compile_output = (result.get("compile_output") or "").strip()
#         status_id = (result.get("status") or {}).get("id")
#         exec_time = result.get("time")

#         if exec_time:
#             try:
#                 total_runtime += float(exec_time)
#             except Exception:
#                 pass

#         if compile_output:
#             final_status = "CE"
#             break
#         elif status_id == 5:
#             final_status = "TLE"
#             break
#         elif stderr:
#             final_status = "RE"
#             break
#         elif compare_output(actual_output, expected_output):
#             passed_count += 1
#         else:
#             final_status = "WA"
#             break

#     score = submission.problem.points if total > 0 and passed_count == total else 0

#     with transaction.atomic():
#         submission.status = final_status
#         submission.runtime = total_runtime
#         submission.score = score
#         submission.save(update_fields=["status", "runtime", "score"])

#         if submission.contest_id:
#             leaderboard_obj, _ = Leaderboard.objects.get_or_create(
#                 contest=submission.contest,
#                 user=submission.user,
#             )

#             user_submissions = Submission.objects.filter(
#                 contest=submission.contest,
#                 user=submission.user,
#             ).select_related("problem")

#             best_score_by_problem = {}
#             for item in user_submissions:
#                 pid = item.problem_id
#                 current_best = best_score_by_problem.get(pid, 0)
#                 if item.score > current_best:
#                     best_score_by_problem[pid] = item.score

#             leaderboard_obj.score = sum(best_score_by_problem.values())
#             leaderboard_obj.solved = sum(1 for val in best_score_by_problem.values() if val > 0)
#             leaderboard_obj.last_updated = timezone.now()
#             leaderboard_obj.save()

#             leaders = Leaderboard.objects.filter(contest=submission.contest).order_by(
#                 "-score", "-solved", "penalty", "last_updated", "id"
#             )

#             updates = []
#             for rank, entry in enumerate(leaders, start=1):
#                 if entry.rank != rank:
#                     entry.rank = rank
#                     updates.append(entry)

#             if updates:
#                 Leaderboard.objects.bulk_update(updates, ["rank"])

#     return {
#         "submission_id": submission.id,
#         "status": final_status,
#         "passed": passed_count,
#         "total": total,
#         "score": score,
#     }


from celery import shared_task
from django.utils import timezone

from contest.models import Submission, TestCase, Leaderboard
from .views import run_single_testcase, compare_output, get_submission_status
from .websocket import broadcast_submission_update, broadcast_leaderboard


@shared_task
def judge_submission(submission_id):
    try:
        submission = Submission.objects.select_related(
            "problem", "contest", "user"
        ).get(id=submission_id)
    except Submission.DoesNotExist:
        return {"error": "Submission not found"}

    problem = submission.problem
    contest = submission.contest
    user = submission.user

    language_map = {
        "python": 71,
        "javascript": 63,
        "java": 62,
        "cpp": 54,
        "c++": 54,
    }

    language_id = language_map.get((submission.language or "python").lower(), 71)

    testcases = TestCase.objects.filter(problem=problem).order_by("id")

    if not testcases.exists():
        submission.status = "RE"
        submission.score = 0
        submission.runtime = 0.0
        submission.save(update_fields=["status", "score", "runtime"])

        if contest:
            broadcast_submission_update(
                contest.id,
                {
                    "submission_id": submission.id,
                    "problem_id": problem.id,
                    "status": submission.status,
                    "runtime": submission.runtime,
                    "score": submission.score,
                    "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None,
                    "message": "No testcases found",
                },
            )

        return {"error": "No testcases found"}

    passed_count = 0
    total_testcases = testcases.count()
    final_status = "AC"
    total_runtime = 0.0

    for tc in testcases:
        try:
            result = run_single_testcase(submission.code, language_id, tc.input)
        except Exception as e:
            submission.status = "RE"
            submission.score = 0
            submission.runtime = total_runtime
            submission.save(update_fields=["status", "score", "runtime"])

            if contest:
                broadcast_submission_update(
                    contest.id,
                    {
                        "submission_id": submission.id,
                        "problem_id": problem.id,
                        "status": submission.status,
                        "runtime": submission.runtime,
                        "score": submission.score,
                        "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None,
                        "message": str(e),
                    },
                )

            return {"error": str(e)}

        actual_output = (result.get("stdout") or "").strip()
        verdict, details = get_submission_status(result)

        runtime_value = result.get("time")
        try:
            total_runtime += float(runtime_value or 0)
        except Exception:
            pass

        if verdict != "OK":
            final_status = verdict
            break

        expected_output = (tc.expected_output or "").strip()
        if compare_output(actual_output, expected_output):
            passed_count += 1
        else:
            final_status = "WA"
            break

    score = problem.points if final_status == "AC" and passed_count == total_testcases else 0

    submission.status = final_status
    submission.score = score
    submission.runtime = total_runtime
    submission.save(update_fields=["status", "score", "runtime"])

    if contest:
        leaderboard_obj, _ = Leaderboard.objects.get_or_create(
            contest=contest,
            user=user,
        )

        solved_now = 1 if final_status == "AC" else 0

        leaderboard_obj.score = score
        leaderboard_obj.solved = solved_now
        leaderboard_obj.last_updated = timezone.now()
        leaderboard_obj.save()

        leaders = Leaderboard.objects.filter(contest=contest).order_by(
            "-score",
            "-solved",
            "penalty",
            "last_updated",
            "id",
        )

        updates = []
        for index, lb in enumerate(leaders, start=1):
            if lb.rank != index:
                lb.rank = index
                updates.append(lb)

        if updates:
            Leaderboard.objects.bulk_update(updates, ["rank"])

        broadcast_submission_update(
            contest.id,
            {
                "submission_id": submission.id,
                "problem_id": problem.id,
                "status": submission.status,
                "runtime": submission.runtime,
                "score": submission.score,
                "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None,
                "passed_testcases": passed_count,
                "total_testcases": total_testcases,
            },
        )

        broadcast_leaderboard(contest.id)

    return {
        "submission_id": submission.id,
        "status": submission.status,
        "score": submission.score,
        "runtime": submission.runtime,
        "passed_testcases": passed_count,
        "total_testcases": total_testcases,
    }