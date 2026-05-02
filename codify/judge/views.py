from django.db import transaction

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from celery.result import AsyncResult

from contest.models import (
    Problem,
    Submission,
    Contest,
    ContestProblem,
    Leaderboard,
    ContestRegistration,
)

from .services import judge_problem_submission, rebuild_contest_leaderboard
from .websocket import (
    broadcast_leaderboard,
    broadcast_submission_update,
    broadcast_participant_count,
)


def get_user_display_name(user):
    return (
        getattr(user, "username", None)
        or getattr(user, "user_name", None)
        or getattr(user, "email", None)
        or getattr(user, "name", None)
        or str(user)
    )

from .services import run_single_testcase

@api_view(["POST"])
def run_code(request):
    problem_id = request.data.get("problem_id")
    source_code = request.data.get("source_code")
    language_id = request.data.get("language_id")
    stdin = request.data.get("stdin", "")

    if not problem_id or not source_code or not language_id:
        return Response({"error": "Missing fields"}, status=400)

    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        return Response({"error": "Problem not found"}, status=404)

    try:
        # 🟢 ALWAYS USE CUSTOM INPUT IF PROVIDED
        if stdin.strip():
            result = run_single_testcase(
                source_code=source_code,
                language_id=language_id,
                stdin=stdin,
            )
            
            stdout = result.get("stdout")
            stderr = result.get("stderr")

            actual_output = stdout if stdout else stderr
            is_error = bool(stderr)

            return Response({
                "results": [
                    {
                        "testcase": "Custom Input",
                        "input": stdin,
                        "expected_output": None,
                        "actual_output": actual_output,
                        "passed": not is_error,   # ❗ FIX
                        "judge_status": "ERROR" if is_error else "OK",  # ❗ FIX
                        "time": result.get("time"),
                    }
                ],
                "passed": 0 if is_error else 1,
                "total": 1,
            })

        # 🔵 ONLY if NO INPUT → run sample
        result = judge_problem_submission(
            problem=problem,
            source_code=source_code,
            language_id=language_id,
            use_sample=True,
        )

        return Response({
            "results": result.get("testcase_results", []),
            "passed": result.get("passed_count", 0),
            "total": result.get("total_count", 0),
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)

        
# @api_view(["POST"])
# def run_code(request):
#     problem_id = request.data.get("problem_id")
#     source_code = request.data.get("source_code")
#     language_id = request.data.get("language_id")
#     stdin = request.data.get("stdin", "")

#     if not problem_id or not source_code or not language_id:
#         return Response(
#             {"error": "problem_id, source_code and language_id are required"},
#             status=status.HTTP_400_BAD_REQUEST,
#         )

#     try:
#         problem = Problem.objects.get(id=problem_id)
#     except Problem.DoesNotExist:
#         return Response(
#             {"error": "Problem not found"},
#             status=status.HTTP_404_NOT_FOUND,
#         )

#     # print("problem_id =", problem_id)
#     # print("problem title =", problem.title)
#     # print("all testcases =", problem.testcases.count())
#     # print("sample testcases =", problem.testcases.filter(is_sample=True).count())

#     result = judge_problem_submission(
#         problem=problem,
#         source_code=source_code,
#         language_id=language_id,
#         use_sample=True,
#     )

#     if result["status"] == "ERROR":
#         return Response(
#             {"error": result.get("message", "Run failed")},
#             status=status.HTTP_400_BAD_REQUEST,
#         )

#     return Response(
#         {
#             "results": result.get("testcase_results", []),
#             "passed": result.get("passed_count", 0),
#             "total": result.get("total_count", 0),
#             "status": result.get("status"),
#             "runtime": result.get("runtime", 0),
#         },
#         status=status.HTTP_200_OK,
#     )


from .tasks import evaluate_submission_task


@api_view(["POST"])
@permission_classes([IsAuthenticated])
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

    # ✅ ADD THIS BLOCK
    from django.utils import timezone
    if timezone.now() > contest.end_time:
        return Response(
            {"error": "Contest has already ended"},
            status=status.HTTP_403_FORBIDDEN,
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

    submission_results = []

    for ans in answers:
        problem_id = ans.get("problem_id")
        source_code = (ans.get("source_code") or "").strip()
        language_id = ans.get("language_id")
        language_name = (ans.get("language") or "python").lower()

        if not problem_id or not source_code or not language_id:
            submission_results.append({
                "problem_id": problem_id,
                "status": "ERROR",
                "error": "Missing required fields",
            })
            continue

        contest_problem = (
            ContestProblem.objects.filter(contest=contest, problem_id=problem_id)
            .select_related("problem")
            .first()
        )

        if not contest_problem:
            submission_results.append({
                "problem_id": problem_id,
                "status": "ERROR",
                "error": "Problem not in contest",
            })
            continue

        problem = contest_problem.problem

        # ✅ CREATE SUBMISSION (PENDING)
        submission = Submission.objects.create(
            user=user,
            problem=problem,
            contest=contest,
            code=source_code,
            language=language_name,
            status="PENDING",
            runtime=0,
            score=0,
        )

        # ✅ SEND TO CELERY
        evaluate_submission_task.delay(submission.id)

        submission_results.append({
            "problem_id": problem.id,
            "title": problem.title,
            "status": "PENDING",
        })

    return Response(
        {
            "message": "Contest submitted",
            "status": "PENDING",
            "submissions": submission_results,
        },
        status=status.HTTP_200_OK,
    )
@api_view(["GET"])
def leaderboard(request, contest_id):
    try:
        contest = Contest.objects.get(id=contest_id)
    except Contest.DoesNotExist:
        return Response(
            {"error": "Contest not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    rebuild_contest_leaderboard(contest)

    rows = (
        Leaderboard.objects.filter(contest_id=contest_id)
        .select_related("user")
        .order_by("rank", "-score", "-solved", "penalty", "last_updated", "id")
    )

    result = []
    for row in rows:
        result.append(
            {
                "id": row.user.id,
                "rank": row.rank,
                "user_name": get_user_display_name(row.user),
                "email": row.user.email,
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

    if contest.status == "Ended":
        return Response(
            {"error": "Contest already ended"},
            status=status.HTTP_400_BAD_REQUEST,
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
            "joined_at": registration.joined_at,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def contest_join_status(request, contest_id):
    joined = ContestRegistration.objects.filter(
        contest_id=contest_id,
        user=request.user,
    ).exists()

    return Response(
        {
            "contest_id": contest_id,
            "joined": joined,
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

            if not ContestRegistration.objects.filter(
                contest=contest,
                user=request.user,
            ).exists():
                return Response(
                    {"error": "You must join the contest before submitting"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if not ContestProblem.objects.filter(
                contest=contest,
                problem_id=problem_id,
            ).exists():
                return Response(
                    {"error": "Problem does not belong to this contest"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        judge_result = judge_problem_submission(
            problem=problem,
            source_code=source_code,
            language_id=language_id,
            use_sample=False,
        )

        final_status = judge_result["status"]

        if final_status == "ERROR":
            return Response(
                {"error": judge_result.get("message", "Submit failed")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # score = problem.points if (contest and final_status == "AC") else 0
        score = problem.points if final_status == "AC" else 0

        submission = Submission.objects.create(
            user=request.user,
            problem=problem,
            contest=contest,
            code=source_code,
            language=language_name,
            status=final_status,
            runtime=judge_result.get("runtime") or 0.0,
            score=score,
        )

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
                    "submitted_at": submission.submitted_at.isoformat()
                    if getattr(submission, "submitted_at", None)
                    else None,
                    "passed_testcases": judge_result["passed_count"],
                    "total_testcases": judge_result["total_count"],
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
                "score": submission.score,
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
        rebuild_contest_leaderboard(submission.contest)

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