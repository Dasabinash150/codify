import os
import requests

from django.db import transaction
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from contest.models import (
    Problem,
    TestCase,
    Submission,
    Contest,
    ContestProblem,
    Leaderboard,
    ContestRegistration,
)


JUDGE0_BASE_URL = os.getenv(
    "JUDGE0_BASE_URL",
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
)
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "judge0-ce.p.rapidapi.com")

print("JUDGE0:", JUDGE0_BASE_URL)
print("KEY:", RAPIDAPI_KEY)
def compare_output(actual, expected):
    actual = "\n".join(line.rstrip() for line in (actual or "").strip().splitlines())
    expected = "\n".join(line.rstrip() for line in (expected or "").strip().splitlines())
    return actual == expected


def get_submission_status(result):
    stderr = (result.get("stderr") or "").strip()
    compile_output = (result.get("compile_output") or "").strip()
    status_desc = ((result.get("status") or {}).get("description") or "").strip()

    if compile_output:
        return "CE", {
            "stderr": stderr,
            "compile_output": compile_output,
            "status": status_desc,
        }

    if stderr:
        return "RE", {
            "stderr": stderr,
            "compile_output": compile_output,
            "status": status_desc,
        }

    if status_desc.lower() in {"time limit exceeded"}:
        return "TLE", {
            "stderr": stderr,
            "compile_output": compile_output,
            "status": status_desc,
        }

    return "OK", {
        "stderr": stderr,
        "compile_output": compile_output,
        "status": status_desc,
    }


def run_single_testcase(source_code, language_id, stdin):
    if not RAPIDAPI_KEY:
        raise Exception("Judge0 API key is missing. Set RAPIDAPI_KEY in environment variables.")

    headers = {
        "content-type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
    }

    payload = {
        "source_code": source_code,
        "language_id": language_id,
        "stdin": stdin,
    }

    response = requests.post(
        JUDGE0_BASE_URL,
        json=payload,
        headers=headers,
        timeout=30,
    )

    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        try:
            error_body = response.json()
        except Exception:
            error_body = response.text
        raise Exception(f"Judge0 error {response.status_code}: {error_body}")

    return response.json()


@api_view(["POST"])
def run_code(request):
    problem_id = request.data.get("problem_id")
    source_code = request.data.get("source_code")
    language_id = request.data.get("language_id")

    if not problem_id or not source_code or not language_id:
        return Response(
            {"error": "problem_id, source_code and language_id are required"},
            status=400,
        )

    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        return Response({"error": "Problem not found"}, status=404)

    testcases = TestCase.objects.filter(problem=problem).order_by("id")

    if not testcases.exists():
        return Response({"error": "No testcases found for this problem"}, status=404)

    results = []
    passed = 0

    for i, tc in enumerate(testcases, start=1):
        try:
            res = run_single_testcase(source_code, language_id, tc.input)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        output = (res.get("stdout") or "").strip()
        verdict, details = get_submission_status(res)

        if verdict in {"CE", "RE", "TLE"}:
            return Response(
                {
                    "error": "Code execution failed",
                    "details": details,
                },
                status=400,
            )

        expected = (tc.expected_output or "").strip()
        is_passed = compare_output(output, tc.expected_output)

        if is_passed:
            passed += 1

        results.append(
            {
                "testcase": i,
                "expected_output": expected,
                "actual_output": output,
                "passed": is_passed,
            }
        )

    return Response(
        {
            "passed": passed,
            "total": len(results),
            "results": results,
            "message": "Run code API working"
        },
        status=200,

    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def submit_contest(request):
    contest_id = request.data.get("contest_id")
    answers = request.data.get("answers") or request.data.get("submissions") or []

    if not contest_id:
        return Response({"error": "contest_id is required"}, status=400)

    if not isinstance(answers, list) or not answers:
        return Response({"error": "answers must be a non-empty list"}, status=400)

    try:
        contest = Contest.objects.get(id=contest_id)
    except Contest.DoesNotExist:
        return Response({"error": "Contest not found"}, status=404)

    user = request.user

    if contest.status == "Upcoming":
        return Response({"error": "Contest has not started yet"}, status=400)

    if contest.status == "Ended":
        return Response({"error": "Contest has already ended"}, status=400)

    if not ContestRegistration.objects.filter(contest=contest, user=user).exists():
        return Response({"error": "You must join the contest before submitting"}, status=403)

    total_score = 0
    solved_count = 0
    submission_results = []

    for ans in answers:
        problem_id = ans.get("problem_id")
        source_code = (ans.get("source_code") or ans.get("code") or "").strip()
        language_id = ans.get("language_id")
        language_name = ans.get("language", "python")

        if not problem_id:
            submission_results.append(
                {
                    "problem_id": None,
                    "title": "",
                    "passed": False,
                    "passed_testcases": 0,
                    "total_testcases": 0,
                    "score": 0,
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
                    "error": "language_id is required",
                }
            )
            continue

        contest_problem = ContestProblem.objects.filter(
            contest=contest,
            problem_id=problem_id,
        ).select_related("problem").first()

        if not contest_problem:
            submission_results.append(
                {
                    "problem_id": problem_id,
                    "title": "",
                    "passed": False,
                    "passed_testcases": 0,
                    "total_testcases": 0,
                    "score": 0,
                    "error": "Problem does not belong to this contest",
                }
            )
            continue

        problem = contest_problem.problem
        testcases = TestCase.objects.filter(problem=problem).order_by("id")

        if not testcases.exists():
            submission_results.append(
                {
                    "problem_id": problem.id,
                    "title": problem.title,
                    "passed": False,
                    "passed_testcases": 0,
                    "total_testcases": 0,
                    "score": 0,
                    "error": "No testcases found for this problem",
                }
            )
            continue

        passed_count = 0
        total_testcases = testcases.count()
        all_passed = True
        final_status = "AC"

        for tc in testcases:
            try:
                result = run_single_testcase(source_code, language_id, tc.input)
            except Exception as e:
                return Response(
                    {"error": f"Judge0 execution failed: {str(e)}"},
                    status=500,
                )

            actual_output = (result.get("stdout") or "").strip()
            verdict, details = get_submission_status(result)

            if verdict != "OK":
                all_passed = False
                final_status = verdict
                break

            ok = compare_output(actual_output, tc.expected_output)

            if ok:
                passed_count += 1
            else:
                all_passed = False
                final_status = "WA"

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
            runtime=0.0,
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

    return Response(
        {
            "message": "Contest submitted successfully",
            "total_score": total_score,
            "solved_count": solved_count,
            "results": submission_results,
        },
        status=200,
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

    return Response(result, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_contest(request, contest_id):
    try:
        contest = Contest.objects.get(id=contest_id)
    except Contest.DoesNotExist:
        return Response({"error": "Contest not found"}, status=404)

    registration, created = ContestRegistration.objects.get_or_create(
        contest=contest,
        user=request.user,
    )

    return Response(
        {
            "joined": True,
            "created": created,
            "participants_count": contest.registrations.count(),
        },
        status=200,
    )


from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Submission
from .serializers import SubmissionSerializer

class SubmissionResultView(RetrieveAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Submission, Problem
from .tasks import judge_submission

class SubmitCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        problem_id = request.data.get("problem_id")
        code = request.data.get("source_code")
        language_id = request.data.get("language_id")

        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response({"error": "Problem not found"}, status=404)

        submission = Submission.objects.create(
            user=request.user,
            problem=problem,
            code=code,
            language_id=language_id,
            status="PENDING",
        )

        judge_submission.delay(submission.id)

        return Response({
            "message": "Submission queued",
            "submission_id": submission.id,
            "status": "PENDING",
        }, status=status.HTTP_202_ACCEPTED)