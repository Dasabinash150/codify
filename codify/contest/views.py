import requests
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from .models import (
    Problem,
    TestCase,
    Submission,
    Contest,
    ContestProblem,
    Leaderboard,
    ContestRegistration
)

from .serializers import (
    UserSerializer,
    ProblemSerializer,
    TestCaseSerializer,
    SubmissionSerializer,
    ContestSerializer,
    ContestProblemSerializer,
    LeaderboardSerializer,
)

User = get_user_model()

JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"
RAPIDAPI_KEY = "YOUR_RAPIDAPI_KEY"
RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com"


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ProblemViewSet(viewsets.ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer


class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer

    def create(self, request, *args, **kwargs):
        many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=many)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer


# class ContestViewSet(viewsets.ModelViewSet):
#     queryset = Contest.objects.prefetch_related("contest_problems__problem").all()
#     serializer_class = ContestSerializer
class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.annotate(
        problems_count_db=Count("contest_problems", distinct=True),
        participants_count_db=Count("registrations", distinct=True),
    ).prefetch_related("contest_problems__problem")
    serializer_class = ContestSerializer

class ContestProblemViewSet(viewsets.ModelViewSet):
    queryset = ContestProblem.objects.select_related("problem", "contest").all()
    serializer_class = ContestProblemSerializer


class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = Leaderboard.objects.select_related("user", "contest").all()
    serializer_class = LeaderboardSerializer


def compare_output(actual, expected):
    actual = "\n".join(line.rstrip() for line in (actual or "").strip().splitlines())
    expected = "\n".join(line.rstrip() for line in (expected or "").strip().splitlines())
    return actual == expected


def run_single_testcase(source_code, language_id, stdin):
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

    response = requests.post(JUDGE0_BASE_URL, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    return response.json()


@api_view(["POST"])
def run_code(request):
    problem_id = request.data.get("problem_id")
    source_code = request.data.get("source_code")
    language_id = request.data.get("language_id")

    if not problem_id or not source_code or not language_id:
        return Response({"error": "problem_id, source_code and language_id are required"}, status=400)

    testcases = TestCase.objects.filter(problem_id=problem_id)

    results = []
    passed = 0

    for i, tc in enumerate(testcases, start=1):
        try:
            res = run_single_testcase(source_code, language_id, tc.input)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        output = (res.get("stdout") or "").strip()
        expected = (tc.expected_output or "").strip()
        is_passed = compare_output(output, tc.expected_output)

        if is_passed:
            passed += 1

        results.append({
            "testcase": i,
            "expected_output": expected,
            "actual_output": output,
            "passed": is_passed,
        })

    return Response({
        "passed": passed,
        "total": len(results),
        "results": results,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_contest(request):
    contest_id = request.data.get("contest_id")
    answers = request.data.get("answers") or request.data.get("submissions") or []

    if not contest_id:
        return Response({"error": "contest_id is required"}, status=400)

    try:
        contest = Contest.objects.get(id=contest_id)
    except Contest.DoesNotExist:
        return Response({"error": "Contest not found"}, status=404)

    user = request.user
    total_score = 0
    solved_count = 0
    submission_results = []

    for ans in answers:
        problem_id = ans.get("problem_id")
        source_code = ans.get("source_code") or ans.get("code") or ""
        language_id = ans.get("language_id", 71)
        language_name = ans.get("language", "python")

        contest_problem = ContestProblem.objects.filter(
            contest_id=contest_id,
            problem_id=problem_id
        ).first()

        if not contest_problem:
            continue

        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            continue

        testcases = TestCase.objects.filter(problem=problem)
        passed_count = 0
        total_testcases = testcases.count()
        all_passed = True

        for tc in testcases:
            try:
                result = run_single_testcase(source_code, language_id, tc.input)

                actual_output = result.get("stdout") or ""
                stderr = result.get("stderr") or ""
                compile_output = result.get("compile_output") or ""
                judge_status = result.get("status", {}).get("description", "")

                ok = (
                    judge_status == "Accepted"
                    and not stderr
                    and not compile_output
                    and compare_output(actual_output, tc.expected_output)
                )

                if ok:
                    passed_count += 1
                else:
                    all_passed = False

            except Exception as e:
                return Response({"error": f"Judge0 execution failed: {str(e)}"}, status=500)

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
            status="AC" if all_passed else "WA",
            runtime=0.0,
            score=score,
        )

        submission_results.append({
            "problem_id": problem.id,
            "title": problem.title,
            "passed": all_passed,
            "passed_testcases": passed_count,
            "total_testcases": total_testcases,
            "score": score,
        })

    leaderboard_obj, _ = Leaderboard.objects.get_or_create(
        contest=contest,
        user=user
    )

    leaderboard_obj.score = total_score
    leaderboard_obj.solved = solved_count
    leaderboard_obj.save()

    leaders = Leaderboard.objects.filter(contest=contest).order_by(
        "-score", "-solved", "last_updated", "id"
    )

    for index, lb in enumerate(leaders, start=1):
        lb.rank = index
        lb.save(update_fields=["rank"])

    return Response({
        "message": "Contest submitted successfully",
        "total_score": total_score,
        "solved_count": solved_count,
        "results": submission_results,
    }, status=200)


@api_view(["GET"])
def leaderboard(request, contest_id):
    rows = Leaderboard.objects.filter(contest_id=contest_id).select_related("user").order_by(
        "rank", "-score", "-solved", "last_updated", "id"
    )

    result = []
    for row in rows:
        result.append({
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
        })

    return Response(result)


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

    return Response({
        "joined": True,
        "created": created,
        "participants_count": contest.registrations.count(),
    }, status=200)