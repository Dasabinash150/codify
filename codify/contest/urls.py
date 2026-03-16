from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ProblemViewSet, TestCaseViewSet,
    SubmissionViewSet, ContestViewSet, ContestProblemViewSet,
    LeaderboardViewSet
)
from .views import submit_contest

router = DefaultRouter()
router.register("users", UserViewSet)
router.register("problems", ProblemViewSet)
router.register("testcases", TestCaseViewSet)
router.register("submissions", SubmissionViewSet)
router.register("contests", ContestViewSet)
router.register("contestproblems", ContestProblemViewSet)
router.register("leaderboard", LeaderboardViewSet, basename="leaderboard")

urlpatterns = [
    path("", include(router.urls)),
    path("submit-contest/", submit_contest),
]
