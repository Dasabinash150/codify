from celery import shared_task
from django.utils import timezone

from contest.models import Submission, Leaderboard
from .services import judge_problem_submission
from .websocket import broadcast_submission_update, broadcast_leaderboard


def rebuild_contest_leaderboard(contest):
    submissions = (
        Submission.objects.filter(contest=contest)
        .select_related("user", "problem")
        .order_by("submitted_at", "id")
    )

    best_by_user_problem = {}

    for sub in submissions:
        key = (sub.user_id, sub.problem_id)
        existing = best_by_user_problem.get(key)

        if existing is None:
            best_by_user_problem[key] = sub
            continue

        if existing.status != "AC" and sub.status == "AC":
            best_by_user_problem[key] = sub
            continue

        if existing.status == "AC" and sub.status == "AC":
            if sub.submitted_at < existing.submitted_at:
                best_by_user_problem[key] = sub

    leaderboard_data = {}

    for (_, _), sub in best_by_user_problem.items():
        user_id = sub.user_id

        if user_id not in leaderboard_data:
            leaderboard_data[user_id] = {
                "user": sub.user,
                "score": 0,
                "solved": 0,
                "penalty": 0,
            }

        if sub.status == "AC":
            leaderboard_data[user_id]["score"] += sub.problem.points
            leaderboard_data[user_id]["solved"] += 1

            if contest.start_time and sub.submitted_at:
                delta = sub.submitted_at - contest.start_time
                penalty_minutes = max(int(delta.total_seconds() // 60), 0)
                leaderboard_data[user_id]["penalty"] += penalty_minutes

    existing_rows = {
        row.user_id: row
        for row in Leaderboard.objects.filter(contest=contest)
    }

    rows_to_create = []
    rows_to_update = []

    for user_id, data in leaderboard_data.items():
        row = existing_rows.get(user_id)

        if row:
            row.score = data["score"]
            row.solved = data["solved"]
            row.penalty = data["penalty"]
            row.last_updated = timezone.now()
            rows_to_update.append(row)
        else:
            rows_to_create.append(
                Leaderboard(
                    contest=contest,
                    user=data["user"],
                    score=data["score"],
                    solved=data["solved"],
                    penalty=data["penalty"],
                    last_updated=timezone.now(),
                )
            )

    if rows_to_create:
        Leaderboard.objects.bulk_create(rows_to_create)

    if rows_to_update:
        Leaderboard.objects.bulk_update(
            rows_to_update,
            ["score", "solved", "penalty", "last_updated"],
        )

    valid_user_ids = set(leaderboard_data.keys())
    Leaderboard.objects.filter(contest=contest).exclude(
        user_id__in=valid_user_ids
    ).delete()

    ranked_rows = list(
        Leaderboard.objects.filter(contest=contest).order_by(
            "-score",
            "-solved",
            "penalty",
            "last_updated",
            "id",
        )
    )

    changed_rank_rows = []
    for index, row in enumerate(ranked_rows, start=1):
        if row.rank != index:
            row.rank = index
            changed_rank_rows.append(row)

    if changed_rank_rows:
        Leaderboard.objects.bulk_update(changed_rank_rows, ["rank"])


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

    language_map = {
        "python": 71,
        "javascript": 63,
        "java": 62,
        "cpp": 54,
        "c++": 54,
        "c": 50,
    }

    language_id = language_map.get((submission.language or "python").lower(), 71)

    judge_result = judge_problem_submission(
        problem=problem,
        source_code=submission.code,
        language_id=language_id,
        use_sample=False,
    )

    final_status = judge_result["status"]
    passed_count = judge_result["passed_count"]
    total_testcases = judge_result["total_count"]
    total_runtime = judge_result.get("runtime") or 0.0

    score = problem.points if final_status == "AC" else 0

    if final_status == "ERROR":
        final_status = "RE"
        score = 0

    submission.status = final_status
    submission.score = score
    submission.runtime = total_runtime
    submission.save(update_fields=["status", "score", "runtime"])

    if contest:
        rebuild_contest_leaderboard(contest)

        broadcast_submission_update(
            contest.id,
            {
                "submission_id": submission.id,
                "problem_id": problem.id,
                "status": submission.status,
                "runtime": submission.runtime,
                "score": submission.score,
                "submitted_at": submission.submitted_at.isoformat()
                if submission.submitted_at
                else None,
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