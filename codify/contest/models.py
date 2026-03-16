from django.db import models
from django.contrib.auth.models import AbstractUser
from account.models import User

# ----------------- USERS -----------------
# class User(AbstractUser):
#     # username, password, email inherited from AbstractUser
#     role = models.CharField(max_length=20, choices=[("student", "Student"), ("admin", "Admin")], default="student")
#     rank = models.IntegerField(default=0)
#     badges = models.TextField(blank=True, null=True)  # store as JSON or comma-separated string

#     def __str__(self):
#         return self.username


# ----------------- PROBLEMS -----------------
class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    constraints = models.TextField()
    tags = models.TextField(blank=True, null=True)  # store as JSON or CSV

    def __str__(self):
        return self.title


# ----------------- TEST CASES -----------------
class TestCase(models.Model):
    problem = models.ForeignKey(Problem, related_name="testcases", on_delete=models.CASCADE)
    input = models.TextField()
    expected_output = models.TextField()

    def __str__(self):
        return f"TestCase for {self.problem.title}"
# ----------------- CONTESTS -----------------
class Contest(models.Model):
    name = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return self.name


# ----------------- SUBMISSIONS -----------------
class Submission(models.Model):

    STATUS_CHOICES = [
        ("AC", "Accepted"),
        ("WA", "Wrong Answer"),
        ("TLE", "Time Limit Exceeded"),
        ("RE", "Runtime Error"),
        ("CE", "Compilation Error"),
    ]

    user = models.ForeignKey(User, related_name="submissions", on_delete=models.CASCADE)

    problem = models.ForeignKey(Problem, related_name="submissions", on_delete=models.CASCADE)

    contest = models.ForeignKey(
        Contest,
        related_name="submissions",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    code = models.TextField()
    language = models.CharField(max_length=50)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    runtime = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.problem.title} - {self.status}"


# ----------------- CONTEST PROBLEMS -----------------
class ContestProblem(models.Model):
    contest = models.ForeignKey(Contest, related_name="contest_problems", on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, related_name="contest_problems", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("contest", "problem")

    def __str__(self):
        return f"{self.contest.name} - {self.problem.title}"


# ----------------- LEADERBOARD -----------------
class Leaderboard(models.Model):

    contest = models.ForeignKey(
        Contest,
        related_name="leaderboard",
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        User,
        related_name="leaderboard",
        on_delete=models.CASCADE
    )

    score = models.IntegerField(default=0)
    solved = models.IntegerField(default=0)
    penalty = models.IntegerField(default=0)

    rank = models.IntegerField(default=0)

    class Meta:
        unique_together = ("contest", "user")

    def __str__(self):
        return f"{self.contest.name} - {self.user.username} ({self.score})"