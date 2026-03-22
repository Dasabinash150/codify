from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    ProblemViewSet,
    TestCaseViewSet,
    SubmissionViewSet,
    ContestViewSet,
    ContestProblemViewSet,
    LeaderboardViewSet,
    run_code,
    submit_contest,
    leaderboard,
    join_contest
)

router = DefaultRouter()
router.register("users", UserViewSet)
router.register("problems", ProblemViewSet)
router.register("testcases", TestCaseViewSet)
router.register("submissions", SubmissionViewSet)
router.register("contests", ContestViewSet)
router.register("contestproblems", ContestProblemViewSet)
router.register("leaderboard-all", LeaderboardViewSet, basename="leaderboard-all")

urlpatterns = [
    path("", include(router.urls)),
    path("run-code/", run_code),
    path("submit-contest/", submit_contest),
    path("leaderboard/<int:contest_id>/", leaderboard),
    path("contests/<int:contest_id>/join/", join_contest),
]