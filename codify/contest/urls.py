from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ProblemViewSet, TestCaseViewSet,
    SubmissionViewSet, ContestViewSet, ContestProblemViewSet,
    LeaderboardViewSet
)
# from .views import submit_contest,run_code
from .views import run_code, submit_contest, leaderboard

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
    # path("submit-contest/", submit_contest),
    # path("run-code/", run_code),
    path("run-code/", run_code),
    path("submit-contest/", submit_contest),
    path("/<int:contest_id>/leaderboard", leaderboard),
]


