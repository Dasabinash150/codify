from django.contrib.auth import get_user_model
from django.db.models import Count

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

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


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ProblemViewSet(viewsets.ModelViewSet):
    queryset = Problem.objects.all().order_by("-created_at")
    serializer_class = ProblemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all().order_by("id")
    serializer_class = TestCaseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all().order_by("-submitted_at")
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return (
            Contest.objects.all()
            .annotate(
                problems_count_db=Count("contest_problems", distinct=True),
                participants_count_db=Count("registrations", distinct=True),
            )
            .prefetch_related("contest_problems__problem")
            .order_by("-start_time")
        )


class ContestProblemViewSet(viewsets.ModelViewSet):
    queryset = ContestProblem.objects.all().select_related("contest", "problem").order_by("contest", "order")
    serializer_class = ContestProblemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = Leaderboard.objects.all().select_related("contest", "user").order_by("contest", "rank")
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]