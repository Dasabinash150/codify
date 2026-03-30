from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    ProblemViewSet,
    TestCaseViewSet,
    SubmissionViewSet,
    ContestViewSet,
    ContestProblemViewSet,
    LeaderboardViewSet,
)

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"problems", ProblemViewSet)
router.register(r"testcases", TestCaseViewSet, basename="testcase")
router.register(r"submissions", SubmissionViewSet, basename="submission")
router.register(r"contests", ContestViewSet, basename="contest")
router.register(r"contest-problems", ContestProblemViewSet)
router.register(r"leaderboards", LeaderboardViewSet)

urlpatterns = router.urls