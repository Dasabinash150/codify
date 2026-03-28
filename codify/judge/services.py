# judge/services.py
import requests
from django.conf import settings


JUDGE0_SUBMIT_URL = f"{settings.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true"


def normalize_output(text):
    if text is None:
        return ""
    return str(text).strip()


def compare_output(actual, expected):
    return normalize_output(actual) == normalize_output(expected)


def run_code_with_judge0(source_code, language_id, stdin=""):
    headers = {
        "Content-Type": "application/json",
    }

    if getattr(settings, "RAPIDAPI_KEY", None):
        headers["X-RapidAPI-Key"] = settings.RAPIDAPI_KEY

    if getattr(settings, "RAPIDAPI_HOST", None):
        headers["X-RapidAPI-Host"] = settings.RAPIDAPI_HOST

    payload = {
        "source_code": source_code,
        "language_id": language_id,
        "stdin": stdin,
    }

    response = requests.post(
        JUDGE0_SUBMIT_URL,
        json=payload,
        headers=headers,
        timeout=30,
    )

    try:
        data = response.json()
    except Exception:
        return {
            "success": False,
            "error": f"Judge0 invalid response: {response.text}"
        }

    if response.status_code >= 400:
        return {
            "success": False,
            "error": f"Judge0 error {response.status_code}: {data}"
        }

    return {
        "success": True,
        "data": data,
    }


def judge_problem_submission(problem, source_code, language_id, use_sample=False):
    """
    use_sample=True  -> only sample testcases, return testcase details
    use_sample=False -> full judge, hide testcase details except summary
    """

    # Assumption:
    # TestCase model has:
    #   problem, input_data, expected_output, is_sample
    testcases = problem.testcases.all().order_by("id")

    if use_sample:
        testcases = testcases.filter(is_sample=True)

    total = testcases.count()
    passed = 0
    testcase_results = []
    final_status = "AC"
    runtime = None

    if total == 0:
        return {
            "status": "ERROR",
            "message": "No testcases found for this problem.",
            "passed_count": 0,
            "total_count": 0,
            "runtime": None,
            "testcase_results": [],
        }

    for tc in testcases:
        result = run_code_with_judge0(
            source_code=source_code,
            language_id=language_id,
            stdin=tc.input_data or "",
        )

        if not result["success"]:
            return {
                "status": "ERROR",
                "message": result["error"],
                "passed_count": passed,
                "total_count": total,
                "runtime": runtime,
                "testcase_results": testcase_results if use_sample else [],
            }

        judge_data = result["data"]

        stdout = judge_data.get("stdout")
        stderr = judge_data.get("stderr")
        compile_output = judge_data.get("compile_output")
        time_taken = judge_data.get("time")
        status_obj = judge_data.get("status", {})
        judge_status = status_obj.get("description", "Unknown")

        runtime = time_taken

        if compile_output:
            final_status = "CE"
            if use_sample:
                testcase_results.append({
                    "input": tc.input_data,
                    "expected_output": tc.expected_output,
                    "actual_output": compile_output,
                    "passed": False,
                    "judge_status": "Compilation Error",
                })
            break

        if stderr:
            final_status = "RE"
            if use_sample:
                testcase_results.append({
                    "input": tc.input_data,
                    "expected_output": tc.expected_output,
                    "actual_output": stderr,
                    "passed": False,
                    "judge_status": judge_status,
                })
            break

        is_passed = compare_output(stdout, tc.expected_output)

        if is_passed:
            passed += 1
        else:
            if final_status == "AC":
                final_status = "WA"

        if use_sample:
            testcase_results.append({
                "input": tc.input_data,
                "expected_output": tc.expected_output,
                "actual_output": stdout,
                "passed": is_passed,
                "judge_status": judge_status,
            })

        if not is_passed and not use_sample:
            # stop early for hidden judge
            break

    if final_status == "AC" and passed != total:
        final_status = "WA"

    return {
        "status": final_status,
        "message": "Judging completed",
        "passed_count": passed,
        "total_count": total,
        "runtime": runtime,
        "testcase_results": testcase_results if use_sample else [],
    }