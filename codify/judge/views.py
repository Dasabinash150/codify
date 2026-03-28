from django.db import transaction
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from celery.result import AsyncResult

from judge.services import judge_problem_submission

from contest.models import (
    Problem,
    Submission,
    Contest,
    ContestProblem,
    Leaderboard,
    ContestRegistration,
)

from .websocket import (
    broadcast_leaderboard,
    broadcast_submission_update,
    broadcast_participant_count,
)


@api_view(["POST"])
def run_code(request):
    problem_id = request.data.get("problem_id")
    source_code = request.data.get("source_code")
    language_id = request.data.get("language_id")

    if not problem_id or not source_code or not language_id:
        return Response(
            {"error": "problem_id, source_code and language_id are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        return Response(
            {"error": "Problem not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    result = judge_problem_submission(
        problem=problem,
        source_code=source_code,
        language_id=language_id,
        use_sample=True,
    )

    http_status = (
        status.HTTP_200_OK
        if result["status"] != "ERROR"
        else status.HTTP_400_BAD_REQUEST
    )

    return Response(result, status=http_status)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def submit_contest(request):
    contest_id = request.data.get("contest_id")
    answers = request.data.get("answers") or request.data.get("submissions") or []

    if not contest_id:
        return Response(
            {"error": "contest_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not isinstance(answers, list) or not answers:
        return Response(
            {"error": "answers must be a non-empty list"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        contest = Contest.objects.get(id=contest_id)
    except Contest.DoesNotExist:
        return Response(
            {"error": "Contest not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    user = request.user

    if contest.status == "Upcoming":
        return Response(
            {"error": "Contest has not started yet"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if contest.status == "Ended":
        return Response(
            {"error": "Contest has already ended"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not ContestRegistration.objects.filter(contest=contest, user=user).exists():
        return Response(
            {"error": "You must join the contest before submitting"},
            status=status.HTTP_403_FORBIDDEN,
        )

    total_score = 0
    solved_count = 0
    submission_results = []

    for ans in answers:
        problem_id = ans.get("problem_id")
        source_code = (ans.get("source_code") or ans.get("code") or "").strip()
        language_id = ans.get("language_id")
        language_name = (ans.get("language") or "python").lower()

        if not problem_id:
            submission_results.append(
                {
                    "problem_id": None,
                    "title": "",
                    "passed": False,
                    "passed_testcases": 0,
                    "total_testcases": 0,
                    "score": 0,
                    "status": "ERROR",
                    "error": "problem_id is required",
                }
            )
            continue

        if not source_code:
            submission_results.append(
                {
                    "problem_id": problem_id,
                    "title": "",
                    "passed": False,
                    "passed_testcases": 0,
                    "total_testcases": 0,
                    "score": 0,
                    "status": "ERROR",
                    "error": "source_code is required",
                }
            )
            continue

        if not language_id:
            submission_results.append(
                {
                    "problem_id": problem_id,
                    "title": "",
                    "passed": False,
                    "passed_testcases": 0,
                    "total_testcases": 0,
                    "score": 0,
                    "status": "ERROR",
                    "error": "language_id is required",
                }
            )
            continue

        contest_problem = (
            ContestProblem.objects.filter(contest=contest, problem_id=problem_id)
            .select_related("problem")
            .first()
        )

        if not contest_problem:
            submission_results.append(
                {
                    "problem_id": problem_id,
                    "title": "",
                    "passed": False,
                    "passed_testcases": 0,
                    "total_testcases": 0,
                    "score": 0,
                    "status": "ERROR",
                    "error": "Problem does not belong to this contest",
                }
            )
            continue

        problem = contest_problem.problem

        judge_result = judge_problem_submission(
            problem=problem,
            source_code=source_code,
            language_id=language_id,
            use_sample=False,
        )

        passed_count = judge_result["passed_count"]
        total_testcases = judge_result["total_count"]
        final_status = judge_result["status"]
        all_passed = final_status == "AC"
        score = problem.points if all_passed else 0

        if all_passed:
            solved_count += 1

        total_score += score

        Submission.objects.create(
            user=user,
            problem=problem,
            contest=contest,
            code=source_code,
            language=language_name,
            status=final_status,
            runtime=judge_result.get("runtime") or 0.0,
            score=score,
        )

        submission_results.append(
            {
                "problem_id": problem.id,
                "title": problem.title,
                "passed": all_passed,
                "passed_testcases": passed_count,
                "total_testcases": total_testcases,
                "score": score,
                "status": final_status,
            }
        )

    leaderboard_obj, _ = Leaderboard.objects.get_or_create(
        contest=contest,
        user=user,
    )

    leaderboard_obj.score = total_score
    leaderboard_obj.solved = solved_count
    leaderboard_obj.last_updated = timezone.now()
    leaderboard_obj.save()

    leaders = Leaderboard.objects.filter(contest=contest).order_by(
        "-score",
        "-solved",
        "penalty",
        "last_updated",
        "id",
    )

    leaderboard_updates = []
    for index, lb in enumerate(leaders, start=1):
        if lb.rank != index:
            lb.rank = index
            leaderboard_updates.append(lb)

    if leaderboard_updates:
        Leaderboard.objects.bulk_update(leaderboard_updates, ["rank"])

    broadcast_leaderboard(contest.id)

    broadcast_submission_update(
        contest.id,
        {
            "contest_id": contest.id,
            "user": str(user),
            "type": "contest_submit",
            "total_score": total_score,
            "solved_count": solved_count,
        },
    )

    return Response(
        {
            "message": "Contest submitted successfully",
            "total_score": total_score,
            "solved_count": solved_count,
            "results": submission_results,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def leaderboard(request, contest_id):
    rows = (
        Leaderboard.objects.filter(contest_id=contest_id)
        .select_related("user")
        .order_by("rank", "-score", "-solved", "penalty", "last_updated", "id")
    )

    result = []
    for row in rows:
        result.append(
            {
                "rank": row.rank,
                "user_name": (
                    getattr(row.user, "username", None)
                    or getattr(row.user, "user_name", None)
                    or getattr(row.user, "email", None)
                    or getattr(row.user, "name", None)
                    or str(row.user)
                ),
                "score": row.score,
                "solved": row.solved,
                "penalty": row.penalty,
                "last_updated": row.last_updated,
            }
        )

    return Response(result, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_contest(request, contest_id):
    try:
        contest = Contest.objects.get(id=contest_id)
    except Contest.DoesNotExist:
        return Response(
            {"error": "Contest not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    registration, created = ContestRegistration.objects.get_or_create(
        contest=contest,
        user=request.user,
    )

    participants_count = contest.registrations.count()

    broadcast_participant_count(contest.id, participants_count)

    return Response(
        {
            "joined": True,
            "created": created,
            "participants_count": participants_count,
        },
        status=status.HTTP_200_OK,
    )


class SubmitCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        problem_id = request.data.get("problem_id")
        source_code = request.data.get("source_code")
        language_id = request.data.get("language_id")
        contest_id = request.data.get("contest_id")
        language_name = (request.data.get("language") or "python").lower()

        if not problem_id or not source_code or not language_id:
            return Response(
                {"error": "problem_id, source_code, language_id required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response(
                {"error": "Problem not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        contest = None
        if contest_id:
            try:
                contest = Contest.objects.get(id=contest_id)
            except Contest.DoesNotExist:
                return Response(
                    {"error": "Contest not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

        judge_result = judge_problem_submission(
            problem=problem,
            source_code=source_code,
            language_id=language_id,
            use_sample=False,
        )

        submission = Submission.objects.create(
            user=request.user,
            problem=problem,
            contest=contest,
            code=source_code,
            language=language_name,
            status=judge_result["status"],
            runtime=judge_result.get("runtime") or 0.0,
            score=0,
        )

        if contest and submission.status != "PENDING":
            broadcast_submission_update(
                contest.id,
                {
                    "submission_id": submission.id,
                    "problem_id": submission.problem_id,
                    "status": submission.status,
                    "runtime": submission.runtime,
                    "score": submission.score,
                    "submitted_at": submission.submitted_at.isoformat()
                    if getattr(submission, "submitted_at", None)
                    else None,
                },
            )
            broadcast_leaderboard(contest.id)

        return Response(
            {
                "submission_id": submission.id,
                "status": judge_result["status"],
                "passed": judge_result["passed_count"],
                "total": judge_result["total_count"],
                "runtime": judge_result["runtime"],
            },
            status=status.HTTP_201_CREATED,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def submission_status(request, submission_id):
    try:
        submission = Submission.objects.get(id=submission_id, user=request.user)
    except Submission.DoesNotExist:
        return Response(
            {"error": "Submission not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if submission.contest_id and submission.status != "PENDING":
        broadcast_submission_update(
            submission.contest_id,
            {
                "submission_id": submission.id,
                "problem_id": submission.problem_id,
                "status": submission.status,
                "runtime": submission.runtime,
                "score": submission.score,
                "submitted_at": submission.submitted_at.isoformat()
                if submission.submitted_at
                else None,
            },
        )
        broadcast_leaderboard(submission.contest_id)

    return Response(
        {
            "submission_id": submission.id,
            "status": submission.status,
            "runtime": submission.runtime,
            "score": submission.score,
            "submitted_at": submission.submitted_at,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def task_status(request, task_id):
    result = AsyncResult(task_id)

    return Response(
        {
            "task_id": task_id,
            "state": result.state,
            "result": result.result if result.ready() else None,
        },
        status=status.HTTP_200_OK,
    )