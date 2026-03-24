from django.urls import path
from .views import run_code, submit_contest, leaderboard, join_contest
from .views import SubmitCodeView, SubmissionResultView
urlpatterns = [
    path("run-code/", run_code, name="run-code"),
    path("submit-contest/", submit_contest, name="submit-contest"),
    path("leaderboard/<int:contest_id>/", leaderboard, name="contest-leaderboard"),
    path("contests/<int:contest_id>/join/", join_contest, name="join-contest"),
    path("submission/<int:pk>/", SubmissionResultView.as_view(), name="submission-result"),
    path("submit-code/", SubmitCodeView.as_view(), name="submit-code"),
]