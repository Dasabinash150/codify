from django.contrib.auth import get_user_model
from django.db.models import Count

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .permissions import AdminWriteOnly

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
    permission_classes = [AdminWriteOnly]


class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    permission_classes = [AdminWriteOnly]

    def get_queryset(self):
        queryset = TestCase.objects.all().order_by("id")
        problem_id = self.request.query_params.get("problem")

        if problem_id:
            queryset = queryset.filter(problem_id=problem_id)

        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset

        return queryset.filter(is_hidden=False)


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Submission.objects.all().order_by("-submitted_at")

        if user.is_authenticated:
            return Submission.objects.filter(user=user).order_by("-submitted_at")

        return Submission.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = [AdminWriteOnly]

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
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    


class ContestProblemViewSet(viewsets.ModelViewSet):
    queryset = ContestProblem.objects.all().select_related("contest", "problem").order_by("contest", "order")
    serializer_class = ContestProblemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = Leaderboard.objects.all().select_related("contest", "user").order_by("contest", "rank")
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]