import requests

# from rest_framework import viewsets
from rest_framework.decorators import api_view
# from rest_framework.response import Response

# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model


from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import TestCase
from .serializers import TestCaseSerializer


User = get_user_model()

from .models import (
    Problem,
    TestCase,
    Submission,
    Contest,
    ContestProblem,
    Leaderboard
)

from .serializers import (
    UserSerializer,
    ProblemSerializer,
    TestCaseSerializer,
    SubmissionSerializer,
    ContestSerializer,
    ContestProblemSerializer,
    LeaderboardSerializer
)


# -----------------------------
# CRUD APIs
# -----------------------------

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ProblemViewSet(viewsets.ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer


# class TestCaseViewSet(viewsets.ModelViewSet):
#     queryset = TestCase.objects.all()
#     serializer_class = TestCaseSerializer



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


# -----------------------------
# Contest Submit API
# -----------------------------

@api_view(["POST"])
def submit_contest(request):

    print("Incoming Data:", request.data)

    # TEMP user (replace with authentication later)
    user = User.objects.first()

    contest_id = request.data.get("contest_id")
    submissions = request.data.get("submissions")

    score = 0

    for sub in submissions:

        problem_id = sub.get("problem_id")
        code = sub.get("code")
        language_id = sub.get("language_id")

        testcases = TestCase.objects.filter(problem_id=problem_id)

        verdict = "AC"

        for tc in testcases:

            url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"

            payload = {
                "source_code": code,
                "language_id": language_id,
                "stdin": tc.input
            }

            headers = {
                "Content-Type": "application/json",
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                "X-RapidAPI-Key": "8307801589mshd6761039cd151eep1a493djsn25c419086fc4"
            }

            response = requests.post(url, json=payload, headers=headers)

            result = response.json()

            output = result.get("stdout")

            if output is None or output.strip() != tc.expected_output.strip():
                verdict = "WA"
                break

        # Save submission
        Submission.objects.create(
            user=user,
            problem_id=problem_id,
            contest_id=contest_id,
            code=code,
            language="python",
            status=verdict
        )

        if verdict == "AC":
            score += 100

    # Update leaderboard
    leaderboard, created = Leaderboard.objects.get_or_create(
        contest_id=contest_id,
        user=user
    )

    leaderboard.score = score
    leaderboard.save()

    return Response({
        "message": "Contest submitted successfully",
        "score": score
    })