from celery import shared_task
from .services import submit_code_to_judge0, get_submission_result
from .models import Submission
from contest.views import TestCase

@shared_task
def judge_submission(submission_id):
    submission = Submission.objects.get(id=submission_id)
    testcases = TestCase.objects.filter(problem=submission.problem)

    passed_count = 0
    total = testcases.count()
    final_status = "AC"
    results = []

    for tc in testcases:
        token = submit_code_to_judge0(
            source_code=submission.code,
            language_id=submission.language_id,
            stdin=tc.input_data
        )

        result = get_submission_result(token)

        actual_output = (result.get("stdout") or "").strip()
        expected_output = (tc.expected_output or "").strip()
        stderr = (result.get("stderr") or "").strip()
        compile_output = (result.get("compile_output") or "").strip()

        testcase_passed = actual_output == expected_output and not stderr and not compile_output

        if testcase_passed:
            passed_count += 1
        else:
            final_status = "WA"

        if compile_output:
            final_status = "CE"
        elif result.get("status", {}).get("id") == 5:
            final_status = "TLE"
        elif stderr:
            final_status = "RE"

        results.append({
            "input": tc.input_data,
            "expected_output": expected_output,
            "actual_output": actual_output,
            "stderr": stderr,
            "compile_output": compile_output,
            "passed": testcase_passed,
        })

    submission.status = final_status
    submission.passed_testcases = passed_count
    submission.total_testcases = total
    submission.result_json = results
    submission.save()

    return {
        "submission_id": submission.id,
        "status": final_status,
        "passed": passed_count,
        "total": total,
    }


@shared_task
def test_task(x, y):
    print("Running test task...")
    return x + y