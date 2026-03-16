from django.urls import path
# from .views import run_code
from .views import  run_code_against_testcases

urlpatterns = [
    # path("", include(router.urls)),
    # path("submit-contest/", submit_contest),
    path("run-code/", run_code_against_testcases),
]