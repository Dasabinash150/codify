from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from contest.models import (
    Contest,
    ContestProblem,
    ContestRegistration,
    Leaderboard,
    Problem,
    Submission,
    TestCase,
)

User = get_user_model()


class Command(BaseCommand):
    help = "Seed sample data for contests, problems, testcases, submissions and leaderboard"

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Seeding sample data..."))

        users = self.create_users()

        contest_seed_data = [
            {
                "name": "Python Fundamentals Challenge 2026",
                "description": "Basic Python coding contest for beginners.",
                "duration_hours": 2,
                "problems": [
                    {
                        "title": "Reverse String",
                        "description": "Reverse a given string.",
                        "difficulty": "easy",
                        "constraints": "1 <= len(s) <= 10^5",
                        "tags": "string,python",
                        "points": 100,
                        "testcases": [
                            {"input": "hello", "expected_output": "olleh", "is_sample": True},
                            {"input": "world", "expected_output": "dlrow", "is_sample": True},
                            {"input": "python", "expected_output": "nohtyp", "is_sample": False},
                        ],
                    },
                    {
                        "title": "Factorial Number",
                        "description": "Find factorial of a number.",
                        "difficulty": "easy",
                        "constraints": "0 <= n <= 12",
                        "tags": "math,loop",
                        "points": 100,
                        "testcases": [
                            {"input": "5", "expected_output": "120", "is_sample": True},
                            {"input": "0", "expected_output": "1", "is_sample": True},
                            {"input": "4", "expected_output": "24", "is_sample": False},
                        ],
                    },
                ],
            },
            {
                "name": "DSA Sprint Challenge 2026",
                "description": "Array and searching based coding contest.",
                "duration_hours": 2,
                "problems": [
                    {
                        "title": "Two Sum",
                        "description": "Find indices of two numbers whose sum equals target.",
                        "difficulty": "easy",
                        "constraints": "2 <= n <= 10^4",
                        "tags": "array,hashmap",
                        "points": 100,
                        "testcases": [
                            {"input": "nums = [2,7,11,15]\ntarget = 9", "expected_output": "[0,1]", "is_sample": True},
                            {"input": "nums = [3,2,4]\ntarget = 6", "expected_output": "[1,2]", "is_sample": True},
                            {"input": "nums = [3,3]\ntarget = 6", "expected_output": "[0,1]", "is_sample": False},
                        ],
                    },
                    {
                        "title": "Maximum in Array",
                        "description": "Find the maximum element in an array.",
                        "difficulty": "easy",
                        "constraints": "1 <= n <= 10^5",
                        "tags": "array",
                        "points": 100,
                        "testcases": [
                            {"input": "1 2 3 4 5", "expected_output": "5", "is_sample": True},
                            {"input": "10 7 3 2", "expected_output": "10", "is_sample": True},
                            {"input": "-1 -5 -2", "expected_output": "-1", "is_sample": False},
                        ],
                    },
                ],
            },
            {
                "name": "SQL Analytics Contest 2026",
                "description": "Database and logic oriented contest.",
                "duration_hours": 2,
                "problems": [
                    {
                        "title": "Palindrome Check",
                        "description": "Check whether a string is palindrome.",
                        "difficulty": "easy",
                        "constraints": "1 <= len(s) <= 10^5",
                        "tags": "string,two-pointers",
                        "points": 100,
                        "testcases": [
                            {"input": "madam", "expected_output": "True", "is_sample": True},
                            {"input": "hello", "expected_output": "False", "is_sample": True},
                            {"input": "racecar", "expected_output": "True", "is_sample": False},
                        ],
                    },
                    {
                        "title": "Count Vowels",
                        "description": "Count vowels in a string.",
                        "difficulty": "easy",
                        "constraints": "1 <= len(s) <= 10^5",
                        "tags": "string",
                        "points": 100,
                        "testcases": [
                            {"input": "hello", "expected_output": "2", "is_sample": True},
                            {"input": "python", "expected_output": "1", "is_sample": True},
                            {"input": "aeiou", "expected_output": "5", "is_sample": False},
                        ],
                    },
                ],
            },
        ]

        for contest_index, contest_data in enumerate(contest_seed_data):
            start_time = timezone.now() + timedelta(days=contest_index)
            end_time = start_time + timedelta(hours=contest_data["duration_hours"])

            contest, created = Contest.objects.get_or_create(
                name=contest_data["name"],
                defaults={
                    "description": contest_data["description"],
                    "start_time": start_time,
                    "end_time": end_time,
                },
            )

            if not created:
                contest.description = contest_data["description"]
                contest.start_time = start_time
                contest.end_time = end_time
                contest.save()

            created_problems = []

            for order, pdata in enumerate(contest_data["problems"], start=1):
                problem, _ = Problem.objects.get_or_create(
                    title=pdata["title"],
                    defaults={
                        "description": pdata["description"],
                        "difficulty": pdata["difficulty"],
                        "constraints": pdata["constraints"],
                        "tags": pdata["tags"],
                        "points": pdata["points"],
                    },
                )
                created_problems.append(problem)

                if not TestCase.objects.filter(problem=problem).exists():
                    for tc in pdata["testcases"]:
                        TestCase.objects.create(
                            problem=problem,
                            input=tc["input"],
                            expected_output=tc["expected_output"],
                            is_sample=tc["is_sample"],
                        )

                ContestProblem.objects.get_or_create(
                    contest=contest,
                    problem=problem,
                    defaults={"order": order},
                )

            for user in users:
                ContestRegistration.objects.get_or_create(
                    contest=contest,
                    user=user,
                )

            leaderboard_rows = [
                {"user": users[0], "score": 200, "solved": 2, "penalty": 15, "rank": 1},
                {"user": users[1], "score": 100, "solved": 1, "penalty": 25, "rank": 2},
                {"user": users[2], "score": 50, "solved": 0, "penalty": 40, "rank": 3},
            ]

            for row in leaderboard_rows:
                Leaderboard.objects.update_or_create(
                    contest=contest,
                    user=row["user"],
                    defaults={
                        "score": row["score"],
                        "solved": row["solved"],
                        "penalty": row["penalty"],
                        "rank": row["rank"],
                    },
                )

            for idx, problem in enumerate(created_problems):
                Submission.objects.get_or_create(
                    user=users[idx % 3],
                    contest=contest,
                    problem=problem,
                    code="print('sample output')",
                    language="python",
                    defaults={
                        "status": "AC" if idx % 2 == 0 else "WA",
                        "runtime": 0.12,
                        "score": problem.points if idx % 2 == 0 else 20,
                    },
                )

        self.stdout.write(self.style.SUCCESS("3 contests seeded successfully."))

    def create_users(self):
        users_data = [
            {
                "email": "student1@example.com",
                "name": "Student One",
                "password": "Test@1234",
                "tc": True,
            },
            {
                "email": "student2@example.com",
                "name": "Student Two",
                "password": "Test@1234",
                "tc": True,
            },
            {
                "email": "student3@example.com",
                "name": "Student Three",
                "password": "Test@1234",
                "tc": True,
            },
        ]

        created_users = []

        for data in users_data:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "name": data["name"],
                    "tc": data["tc"],
                },
            )
            if created:
                user.set_password(data["password"])
                user.save()

            created_users.append(user)

        return created_users