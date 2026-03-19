import requests
from celery import shared_task
from django.conf import settings

from .models import Submission
from contest.models import TestCase


def get_language_id(language):
    mapping = {
        "python": 71,
        "c": 50,
        "cpp": 54,
        "java": 62,
    }
    return mapping.get(language)


def normalize_output(text):
    return "\n".join(line.rstrip() for line in text.strip().splitlines())


@shared_task
def evaluate_submission(submission_id):
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return

    submission.status = "RUNNING"
    submission.save()

    testcases = TestCase.objects.filter(problem=submission.problem)
    total = testcases.count()
    passed = 0
    final_status = "ACCEPTED"

    language_id = get_language_id(submission.language)

    if not language_id:
        submission.status = "FAILED"
        submission.total_count = total
        submission.save()
        return

    for testcase in testcases:
        payload = {
            "source_code": submission.source_code,
            "language_id": language_id,
            "stdin": testcase.input_data,
            "expected_output": testcase.expected_output,
        }

        try:
            response = requests.post(
                f"{settings.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true",
                json=payload,
                timeout=20
            )
            result = response.json()
        except Exception:
            final_status = "FAILED"
            break

        judge_status = result.get("status", {}).get("description", "")

        stdout = result.get("stdout") or ""
        stderr = result.get("stderr") or ""
        compile_output = result.get("compile_output") or ""

        if judge_status == "Accepted":
            actual = normalize_output(stdout)
            expected = normalize_output(testcase.expected_output)
            if actual == expected:
                passed += 1
            else:
                final_status = "WRONG_ANSWER"
                break

        elif "Compilation Error" in judge_status:
            final_status = "COMPILATION_ERROR"
            break

        elif "Runtime Error" in judge_status:
            final_status = "RUNTIME_ERROR"
            break

        else:
            if compile_output:
                final_status = "COMPILATION_ERROR"
            elif stderr:
                final_status = "RUNTIME_ERROR"
            else:
                final_status = "FAILED"
            break

    if passed == total and total > 0:
        final_status = "ACCEPTED"

    submission.passed_count = passed
    submission.total_count = total
    submission.status = final_status
    submission.save()

    if final_status == "ACCEPTED":
        update_leaderboard_for_submission(submission.id)


def update_leaderboard_for_submission(submission_id):
    from leaderboard.models import LeaderboardEntry
    from contests.models import ContestProblem

    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return

    contest_problem = ContestProblem.objects.filter(problem=submission.problem).first()
    if not contest_problem or not submission.user:
        return

    contest = contest_problem.contest

    entry, created = LeaderboardEntry.objects.get_or_create(
        contest=contest,
        user=submission.user,
        defaults={
            "solved_count": 0,
            "score": 0,
            "penalty": 0,
        }
    )

    entry.solved_count += 1
    entry.score += 100
    entry.save()