
import pytest

@pytest.mark.django_db
def test_contest_list(auth_client):
    response = auth_client.get("/api/contests/")
    assert response.status_code == 200
