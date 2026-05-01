from celery import shared_task
from django.utils import timezone

from contest.models import Submission
from .services import judge_problem_submission, rebuild_contest_leaderboard
from .websocket import broadcast_leaderboard, broadcast_submission_update


from contest.models import Contest, ContestRegistration



# ✅ Language → Judge0 ID mapping
JUDGE0_LANGUAGE_MAP = {
    "python": 71,
    "java": 62,
    "cpp": 54,
    "c": 50,
    "javascript": 63,
}


@shared_task
def evaluate_submission_task(submission_id):
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return

    problem = submission.problem
    contest = submission.contest

    # 🔥 FIX: map language → language_id
    language_id = JUDGE0_LANGUAGE_MAP.get(submission.language, 71)

    # 🔥 run judge
    result = judge_problem_submission(
        problem=problem,
        source_code=submission.code,
        language_id=language_id,
        use_sample=False,
    )

    # ✅ update submission safely
    submission.status = result.get("status", "ERROR")
    submission.runtime = result.get("runtime", 0.0)
    submission.score = problem.points if submission.status == "AC" else 0
    submission.save()

    # ✅ update leaderboard + websocket
    if contest:
        rebuild_contest_leaderboard(contest)

        broadcast_submission_update(
            contest.id,
            {
                "submission_id": submission.id,
                "problem_id": submission.problem_id,
                "status": submission.status,
                "runtime": submission.runtime,
                "score": submission.score,
            },
        )

        broadcast_leaderboard(contest.id)


@shared_task
def auto_finish_contest(contest_id):
    try:
        contest = Contest.objects.get(id=contest_id)
    except Contest.DoesNotExist:
        return

    # ⛔ skip if already ended
    if contest.status == "Ended":
        return

    # ✅ mark contest ended
    contest.status = "Ended"
    contest.save()

    registrations = ContestRegistration.objects.filter(contest=contest)

    for reg in registrations:
        user = reg.user

        # 🧠 get user's latest submissions per problem
        submissions = (
            Submission.objects.filter(contest=contest, user=user)
            .order_by("problem_id", "-submitted_at")
            .distinct("problem_id")
        )

        for sub in submissions:
            if sub.status == "PENDING":
                evaluate_submission_task.delay(sub.id)

    # 🔥 rebuild leaderboard
    rebuild_contest_leaderboard(contest)

    # 🔴 websocket update
    broadcast_leaderboard(contest.id)