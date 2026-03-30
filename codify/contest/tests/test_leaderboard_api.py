
import pytest
from contest.models import Leaderboard
from django.urls import reverse


@pytest.mark.django_db
def test_leaderboard_api(auth_client, contest, user):

    Leaderboard.objects.create(
        contest=contest,
        user=user,
        score=100,
        solved=1,
        rank=1
    )

    
    response = auth_client.get(
        reverse("contest-leaderboard", args=[contest.id])
    )

    assert response.status_code == 200
