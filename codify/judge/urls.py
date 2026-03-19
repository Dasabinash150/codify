from django.urls import path
from .views import run_code, submit_code, submission_status

urlpatterns = [
    path('run-code/', run_code, name='run_code'),
    path('submit/', submit_code, name='submit_code'),
    path('submission/<int:submission_id>/', submission_status, name='submission_status'),
]