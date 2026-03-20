import requests
from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


from .models import (
    Problem,
    TestCase,
    Submission,
    Contest,
    ContestProblem,
    Leaderboard,
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



# -----------------------------
# CRUD APIs
# -----------------------------

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


class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer


class ContestProblemViewSet(viewsets.ModelViewSet):
    queryset = ContestProblem.objects.all()
    serializer_class = ContestProblemSerializer


class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer


@api_view(["POST"])
def run_code(request):
    problem_id = request.data.get("problem_id")
    source_code = request.data.get("source_code")
    language_id = request.data.get("language_id")

    testcases = TestCase.objects.filter(problem_id=problem_id)

    results = []
    passed = 0

    for i, tc in enumerate(testcases, start=1):
        response = requests.post(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
            json={
                "source_code": source_code,
                "language_id": language_id,
                "stdin": tc.input
            },
            headers={
                "X-RapidAPI-Key": "8307801589mshd6761039cd151eep1a493djsn25c419086fc4",
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            }
        )

        res = response.json()
        output = (res.get("stdout") or "").strip()
        expected = tc.expected_output.strip()

        # is_passed = output == expected
        def normalize(s):
            return "\n".join(line.rstrip() for line in s.strip().splitlines())

        is_passed = normalize(output) == normalize(tc.expected_output)

        if is_passed:
            passed += 1

        results.append({
            "testcase": i,
            "expected_output": expected,
            "actual_output": output,
            "passed": is_passed
        })
    print(res)
    print("ACTUAL:", repr(output))
    print("EXPECTED:", repr(tc.expected_output))
    return Response({
        "passed": passed,
        "total": len(results),
        "results": results
    })




JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"
RAPIDAPI_KEY = "8307801589mshd6761039cd151eep1a493djsn25c419086fc4"
RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com"


def compare_output(actual, expected):
    actual = "\n".join(line.rstrip() for line in actual.strip().splitlines())
    expected = "\n".join(line.rstrip() for line in expected.strip().splitlines())
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


# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def submit_contest(request):
#     contest_id = request.data.get("contest_id")
#     answers = request.data.get("answers") or request.data.get("submissions") or []

#     if not contest_id:
#         return Response({"error": "contest_id is required"}, status=400)

#     try:
#         contest = Contest.objects.get(id=contest_id)
#     except Contest.DoesNotExist:
#         return Response({"error": "Contest not found"}, status=404)

#     user = request.user
#     print("AUTH USER:", user, user.is_authenticated)
#     print("AUTH HEADER:", request.headers.get("Authorization"))
#     print("USER:", request.user)
#     print("IS AUTH:", request.user.is_authenticated)

#     total_score = 0
#     solved_count = 0
#     submission_results = []
#     for ans in answers:
#         problem_id = ans.get("problem_id")
#         source_code = ans.get("source_code") or ans.get("code") or ""
#         language_id = ans.get("language_id", 71)

#         # Check problem belongs to contest through ContestProblem
#         contest_problem = ContestProblem.objects.filter(
#             contest_id=contest_id,
#             problem_id=problem_id
#         ).first()

#         if not contest_problem:
#             continue

#         try:
#             problem = Problem.objects.get(id=problem_id)
#         except Problem.DoesNotExist:
#             continue

#         testcases = TestCase.objects.filter(problem=problem)
#         passed_count = 0
#         total_testcases = testcases.count()
#         all_passed = True

#         for tc in testcases:
#             try:
#                 result = run_single_testcase(source_code, language_id, tc.input)

#                 actual_output = result.get("stdout") or ""
#                 stderr = result.get("stderr") or ""
#                 compile_output = result.get("compile_output") or ""
#                 judge_status = result.get("status", {}).get("description", "")

#                 ok = (
#                     judge_status == "Accepted"
#                     and not stderr
#                     and not compile_output
#                     and compare_output(actual_output, tc.expected_output)
#                 )

#                 if ok:
#                     passed_count += 1
#                 else:
#                     all_passed = False

#             except Exception as e:
#                 all_passed = False
#                 print("Submit testcase error:", str(e))

#         score = problem.points if all_passed else 0

#         if all_passed:
#             solved_count += 1

#         total_score += score

#         # Submission.objects.create(
#         #     user=user,
#         #     problem=problem,
#         #     contest=contest,
#         #     code=source_code,
#         #     language="python",
#         #     status="AC" if all_passed else "WA"
#         # )
#         Submission.objects.create(
#             user=user,
#             problem=problem,
#             contest=contest,
#             code=source_code,
#             language="python",
#             status="AC" if all_passed else "WA",
#             runtime=0.0
#         )

#         submission_results.append({
#             "problem_id": problem.id,
#             "title": problem.title,
#             "passed": all_passed,
#             "passed_testcases": passed_count,
#             "total_testcases": total_testcases,
#             "score": score,
#         })

#     leaderboard, created = Leaderboard.objects.get_or_create(
#         contest=contest,
#         user=user
#     )
#     leaderboard.score = total_score
#     leaderboard.solved = solved_count
#     leaderboard.save()

#     leaders = Leaderboard.objects.filter(contest=contest).order_by("-score", "-solved", "submitted_at")
#     for index, lb in enumerate(leaders, start=1):
#         lb.rank = index
#         lb.save(update_fields=["rank"])

#     print("TOTAL SCORE:", total_score)
#     print("SOLVED COUNT:", solved_count)
#     print(
#         "LEADERBOARD SAVED FOR:",
#         getattr(user, "username", None)
#         or getattr(user, "email", None)
#         or getattr(user, "name", None)
#         or str(user)
#     )
#     return Response({
#         "message": "Contest submitted successfully",
#         "total_score": total_score,
#         "solved_count": solved_count,
#         "results": submission_results,
#     }, status=200)

import requests

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_contest(request):
    # -----------------------------
    # 1. Get input data
    # -----------------------------
    contest_id = request.data.get("contest_id")
    answers = request.data.get("answers") or request.data.get("submissions") or []

    if not contest_id:
        return Response({"error": "contest_id is required"}, status=400)

    # -----------------------------
    # 2. Fetch contest
    # -----------------------------
    try:
        contest = Contest.objects.get(id=contest_id)
    except Contest.DoesNotExist:
        return Response({"error": "Contest not found"}, status=404)

    # -----------------------------
    # 3. Get authenticated user
    # -----------------------------
    user = request.user
    print("AUTH USER:", user, user.is_authenticated)

    total_score = 0
    solved_count = 0
    submission_results = []

    # 🚨 IMPORTANT FLAG (for Judge0 failure)
    judge_failed = False

    # -----------------------------
    # 4. Loop through submitted answers
    # -----------------------------
    for ans in answers:
        problem_id = ans.get("problem_id")
        source_code = ans.get("source_code") or ans.get("code") or ""
        language_id = ans.get("language_id", 71)

        # Check problem belongs to contest
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

        # -----------------------------
        # 5. Loop through testcases
        # -----------------------------
        for tc in testcases:
            try:
                # 🔴 CALL JUDGE0 HERE
                result = run_single_testcase(source_code, language_id, tc.input)

                # 🚨 HANDLE RATE LIMIT (429)
                if result.get("status_code") == 429:
                    print("Judge0 Rate Limit Hit 🚨")
                    judge_failed = True
                    break

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
                print("Submit testcase error:", str(e))

                # 🚨 CHECK IF 429 ERROR OCCURRED
                if "429" in str(e):
                    judge_failed = True
                    break

                all_passed = False

        # 🚨 STOP ALL PROCESSING IF JUDGE FAILED
        if judge_failed:
            break

        # -----------------------------
        # 6. Scoring logic
        # -----------------------------
        score = problem.points if all_passed else 0

        if all_passed:
            solved_count += 1

        total_score += score

        # -----------------------------
        # 7. Save submission
        # -----------------------------
        Submission.objects.create(
            user=user,
            problem=problem,
            contest=contest,
            code=source_code,
            language="python",
            status="AC" if all_passed else "WA",
            runtime=0.0
        )

        # -----------------------------
        # 8. Store result for response
        # -----------------------------
        submission_results.append({
            "problem_id": problem.id,
            "title": problem.title,
            "passed": all_passed,
            "passed_testcases": passed_count,
            "total_testcases": total_testcases,
            "score": score,
        })

    # -----------------------------
    # 🚨 9. IF JUDGE FAILED → STOP HERE
    # -----------------------------
    if judge_failed:
        return Response(
            {"error": "Judge0 API rate limit exceeded. Please try again later."},
            status=429
        )

    # -----------------------------
    # 10. Save leaderboard
    # -----------------------------
    leaderboard, created = Leaderboard.objects.get_or_create(
        contest=contest,
        user=user
    )

    leaderboard.score = total_score
    leaderboard.solved = solved_count
    leaderboard.save()

    # -----------------------------
    # 11. Ranking calculation
    # -----------------------------
    leaders = Leaderboard.objects.filter(contest=contest).order_by(
        "-score", "-solved", "submitted_at"
    )

    for index, lb in enumerate(leaders, start=1):
        lb.rank = index
        lb.save(update_fields=["rank"])

    print("TOTAL SCORE:", total_score)
    print("SOLVED COUNT:", solved_count)

    # -----------------------------
    # 12. Final response
    # -----------------------------
    return Response({
        "message": "Contest submitted successfully",
        "total_score": total_score,
        "solved_count": solved_count,
        "results": submission_results,
    }, status=200)


@api_view(["GET"])
def leaderboard(request, contest_id):
    rows = Leaderboard.objects.filter(contest_id=contest_id).order_by("-score", "-solved", "id")

    result = []
    rank = 1

    for row in rows:
        result.append({
            "rank": rank,
            "user_name": (
                getattr(row.user, "username", None)
                or getattr(row.user, "user_name", None)
                or getattr(row.user, "email", None)
                or getattr(row.user, "name", None)
                or str(row.user)
            ),
            "score": row.score,
            "solved": row.solved,
            "submitted_at": row.submitted_at,
        })
        rank += 1

    return Response(result)