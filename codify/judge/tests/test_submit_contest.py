import pytest
from unittest.mock import patch
from django.urls import reverse
from contest.models import ContestRegistration, ContestProblem


@pytest.mark.django_db
@patch("judge.views.run_single_testcase")
def test_submit_contest(mock_judge, auth_client, contest, problem, testcase, user):

    mock_judge.return_value = {
        "stdout": "[0,1]",
        "stderr": None,
        "compile_output": None,
        "status": {"description": "Accepted"}
    }

    ContestRegistration.objects.create(
        contest=contest,
        user=user
    )

    ContestProblem.objects.create(
        contest=contest,
        problem=problem,
        order=1
    )

    payload = {
        "contest_id": contest.id,
        "answers": [
            {
                "problem_id": problem.id,
                "source_code": "print('[0,1]')",
                "language_id": 71
            }
        ]
    }

    response = auth_client.post(
        reverse("submit-contest"),
        payload,
        format="json"
    )

    assert response.status_code == 200