# Judge Models

from django.db import models
from contest.models import Problem
from django.conf import settings

class Submission(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="judge_submissions",
        null=True,
        blank=True
    )
    VERDICT_CHOICES = [
        ("PENDING", "Pending"),
        ("AC", "Accepted"),
        ("WA", "Wrong Answer"),
        ("RTE", "Runtime Error"),
        ("TLE", "Time Limit Exceeded"),
        ("CE", "Compilation Error"),
        ("ERROR", "System Error"),
    ]

    LANGUAGE_CHOICES = [
        ("python", "Python"),
        ("cpp", "C++"),
        ("c", "C"),
        ("java", "Java"),
    ]

    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    code = models.TextField()
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES)
    verdict = models.CharField(max_length=20, choices=VERDICT_CHOICES, default="PENDING")
    total_testcases = models.IntegerField(default=0)
    passed_testcases = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission #{self.id} - {self.problem.title} - {self.verdict}"


class SubmissionResult(models.Model):
    submission = models.ForeignKey(Submission, related_name="results", on_delete=models.CASCADE)
    testcase_number = models.IntegerField()
    status = models.CharField(max_length=20)
    input_data = models.TextField(blank=True, null=True)
    expected_output = models.TextField(blank=True, null=True)
    actual_output = models.TextField(blank=True, null=True)
    execution_time = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"Submission {self.submission.id} - TC {self.testcase_number} - {self.status}"