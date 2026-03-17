from contest.models import TestCase
from .models import SubmissionResult
from .executor import submit_to_judge0, get_result_from_judge0
from .utils import compare_output


def map_judge0_status(result_data):
    status_id = result_data["status"]["id"]

    if status_id == 3:
        return "SUCCESS"   # Accepted by executor, compare manually
    elif status_id in [4]:
        return "WA"
    elif status_id in [5]:
        return "TLE"
    elif status_id in [6, 7, 8, 9, 10, 11, 12]:
        return "RTE"
    elif status_id == 13:
        return "ERROR"
    else:
        return "ERROR"


def judge_submission(submission):
    testcases = TestCase.objects.filter(problem=submission.problem)
    submission.total_testcases = testcases.count()
    submission.passed_testcases = 0
    submission.verdict = "PENDING"
    submission.save()

    final_verdict = "AC"

    for index, tc in enumerate(testcases, start=1):
        try:
            token = submit_to_judge0(
                code=submission.code,
                language=submission.language,
                stdin=tc.input_data
            )

            result_data = get_result_from_judge0(token)

            executor_status = map_judge0_status(result_data)
            stdout = result_data.get("stdout") or ""
            stderr = result_data.get("stderr") or ""
            compile_output = result_data.get("compile_output") or ""
            execution_time = float(result_data.get("time") or 0)

            if compile_output:
                status = "CE"
                actual_output = compile_output
                final_verdict = "CE"

            elif executor_status == "TLE":
                status = "TLE"
                actual_output = stderr or "Time limit exceeded"
                if final_verdict == "AC":
                    final_verdict = "TLE"

            elif executor_status == "RTE":
                status = "RTE"
                actual_output = stderr or "Runtime error"
                if final_verdict == "AC":
                    final_verdict = "RTE"

            elif executor_status == "ERROR":
                status = "ERROR"
                actual_output = stderr or "System error"
                if final_verdict == "AC":
                    final_verdict = "ERROR"

            else:
                if compare_output(stdout, tc.expected_output):
                    status = "AC"
                    actual_output = stdout
                    submission.passed_testcases += 1
                else:
                    status = "WA"
                    actual_output = stdout
                    if final_verdict == "AC":
                        final_verdict = "WA"

            SubmissionResult.objects.create(
                submission=submission,
                testcase_number=index,
                status=status,
                input_data=tc.input_data if tc.is_sample else None,
                expected_output=tc.expected_output if tc.is_sample else None,
                actual_output=actual_output if tc.is_sample else None,
                execution_time=execution_time
            )

        except Exception as e:
            SubmissionResult.objects.create(
                submission=submission,
                testcase_number=index,
                status="ERROR",
                input_data=tc.input_data if tc.is_sample else None,
                expected_output=tc.expected_output if tc.is_sample else None,
                actual_output=str(e),
                execution_time=0
            )
            if final_verdict == "AC":
                final_verdict = "ERROR"

    submission.verdict = final_verdict
    submission.save()

    return submission