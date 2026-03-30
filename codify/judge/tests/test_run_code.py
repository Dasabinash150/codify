import pytest
from unittest.mock import patch
from django.urls import reverse


@pytest.mark.django_db
@patch("judge.views.run_single_testcase")
def test_run_code_api(mock_judge, auth_client, problem, testcase):
    mock_judge.return_value = {
        "stdout": "[0,1]",
        "stderr": None,
        "compile_output": None,
        "status": {"description": "Accepted"}
    }

    payload = {
        "problem_id": problem.id,
        "source_code": "print('[0,1]')",
        "language_id": 71
    }

    response = auth_client.post(
        reverse("run-code"),
        payload
    )

    assert response.status_code == 200
    assert response.data["passed"] == 1