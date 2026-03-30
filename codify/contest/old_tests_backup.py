from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from contest.models import (
    Problem,
    TestCase as ProblemTestCase,
    Contest,
    ContestProblem,
    Submission,
    Leaderboard
)

User = get_user_model()


class ContestPlatformTests(TestCase):

    def setUp(self):

        self.client = APIClient()

        self.user = User.objects.create_user(
            email="test@test.com",
            name="Test User",
            tc=True,
            password="test123"
        )

        self.problem = Problem.objects.create(
            title="Two Sum",
            description="Find two numbers",
            difficulty="easy",
            points=100
        )

        self.testcase = ProblemTestCase.objects.create(
            problem=self.problem,
            input="2 7",
            expected_output="9"
        )

        self.contest = Contest.objects.create(
            name="Test Contest",
            description="Testing contest",
            start_time=timezone.now(),
            end_time=timezone.now() + timedelta(hours=2)
        )

        ContestProblem.objects.create(
            contest=self.contest,
            problem=self.problem,
            order=1
        )

    def test_problem_created(self):
        self.assertEqual(self.problem.title, "Two Sum")

    def test_testcase_created(self):
        self.assertEqual(self.testcase.problem.title, "Two Sum")

    def test_contest_created(self):
        self.assertEqual(self.contest.name, "Test Contest")

    def test_submission(self):

        submission = Submission.objects.create(
            user=self.user,
            problem=self.problem,
            contest=self.contest,
            code="print(9)",
            language="python",
            status="AC",
            score=100
        )

        self.assertEqual(submission.status, "AC")

    def test_leaderboard(self):

        leaderboard = Leaderboard.objects.create(
            contest=self.contest,
            user=self.user,
            score=100,
            solved=1,
            rank=1
        )

        self.assertEqual(leaderboard.rank, 1)

    def test_contest_api(self):

        response = self.client.get("/api/contests/")

        self.assertEqual(response.status_code, 200)