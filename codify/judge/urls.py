from django.urls import path
from .views import run_code_against_testcases

urlpatterns = [
    path("run-code/", run_code_against_testcases, name="run-code"),
]
