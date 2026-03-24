from django.urls import path
from .views import (
    run_code,
    submit_contest,
    leaderboard,
    join_contest,
    SubmitCodeView,
    submission_status,
    task_status,
)

urlpatterns = [
    path("run-code/", run_code, name="run-code"),
    path("submit-contest/", submit_contest, name="submit-contest"),
    path("leaderboard/<int:contest_id>/", leaderboard, name="contest-leaderboard"),
    path("contests/<int:contest_id>/join/", join_contest, name="join-contest"),

    path("submit-code/", SubmitCodeView.as_view(), name="submit-code"),
    path("submission-status/<int:submission_id>/", submission_status, name="submission-status"),
    path("task-status/<str:task_id>/", task_status, name="task-status"),
]