
import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from contest.models import Contest, Problem, TestCase
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="test@test.com",
        name="Test User",
        tc=True,
        password="test123"
    )

@pytest.fixture
def auth_client(client, user):
    client.force_authenticate(user=user)
    return client

@pytest.fixture
def problem(db):
    return Problem.objects.create(
        title="Two Sum",
        description="Find indices",
        difficulty="easy",
        points=100
    )

@pytest.fixture
def testcase(problem):
    return TestCase.objects.create(
        problem=problem,
        input="2 7\n9",
        expected_output="[0,1]"
    )

@pytest.fixture
def contest(db):
    now = timezone.now()
    return Contest.objects.create(
        name="Test Contest",
        start_time=now - timedelta(minutes=10),
        end_time=now + timedelta(hours=1)
    )
