from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from account.models import User


class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    title = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    constraints = models.TextField(blank=True, null=True)
    tags = models.CharField(max_length=255, blank=True, null=True)
    points = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class TestCase(models.Model):
    problem = models.ForeignKey(
        Problem,
        related_name="testcases",
        on_delete=models.CASCADE
    )
    input = models.TextField()
    expected_output = models.TextField()
    is_sample = models.BooleanField(default=False)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"TestCase - {self.problem.title}"


class Contest(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_time"]

    def clean(self):
        if not self.start_time or not self.end_time:
            return

        if self.end_time <= self.start_time:
            raise ValidationError({
                "end_time": "End time must be after start time."
            })

    @property
    def status(self):
        now = timezone.now()
        if now < self.start_time:
            return "Upcoming"
        elif self.start_time <= now <= self.end_time:
            return "Live"
        return "Ended"

    @property
    def duration_minutes(self):
        return int((self.end_time - self.start_time).total_seconds() // 60)

    def __str__(self):
        return self.name


class ContestProblem(models.Model):
    contest = models.ForeignKey(
        Contest,
        related_name="contest_problems",
        on_delete=models.CASCADE
    )
    problem = models.ForeignKey(
        Problem,
        related_name="contest_problems",
        on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("contest", "problem")
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.contest.name} - {self.problem.title}"
class ContestRegistration(models.Model):
    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name="registrations"
    )
    user = models.ForeignKey(
        "account.User",
        on_delete=models.CASCADE
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["contest", "user"]

class Submission(models.Model):
    STATUS_CHOICES = [
        ("AC", "Accepted"),
        ("WA", "Wrong Answer"),
        ("TLE", "Time Limit Exceeded"),
        ("RE", "Runtime Error"),
        ("CE", "Compilation Error"),
        ("PENDING", "Pending"),
    ]

    user = models.ForeignKey(
        User,
        related_name="submissions",
        on_delete=models.CASCADE
    )
    problem = models.ForeignKey(
        Problem,
        related_name="submissions",
        on_delete=models.CASCADE
    )
    contest = models.ForeignKey(
        Contest,
        related_name="submissions",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    code = models.TextField()
    language = models.CharField(max_length=50)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    runtime = models.FloatField(default=0.0)
    score = models.PositiveIntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["contest"]),
            models.Index(fields=["problem"]),
            models.Index(fields=["user"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.problem.title} - {self.status}"


class Leaderboard(models.Model):
    contest = models.ForeignKey(
        Contest,
        related_name="leaderboard_entries",
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        related_name="leaderboard_entries",
        on_delete=models.CASCADE
    )
    score = models.PositiveIntegerField(default=0)
    solved = models.PositiveIntegerField(default=0)
    penalty = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("contest", "user")
        ordering = ["rank", "-score", "penalty", "last_updated"]

    def __str__(self):
        return f"{self.contest.name} - {self.user.email} - Rank {self.rank}"