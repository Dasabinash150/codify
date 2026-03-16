import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
# from .models import Problem, TestCase
from contest.models import Problem, TestCase


JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"


def normalize_output(text):
    return (text or "").replace("\r\n", "\n").strip()


@api_view(["POST"])
def run_code_against_testcases(request):
    problem_id = request.data.get("problem_id")
    source_code = request.data.get("source_code")
    language_id = request.data.get("language_id")

    if not problem_id or not source_code or not language_id:
        return Response(
            {
                "error": "problem_id, source_code and language_id are required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        return Response(
            {"error": "Problem not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    testcases = TestCase.objects.filter(problem=problem)

    if not testcases.exists():
        return Response(
            {"error": "No test cases found for this problem"},
            status=status.HTTP_404_NOT_FOUND
        )

    results = []
    passed_count = 0

    for index, testcase in enumerate(testcases, start=1):
        payload = {
            "source_code": source_code,
            "language_id": language_id,
            "stdin": testcase.input
        }

        try:
            judge_response = requests.post(JUDGE0_URL, json=payload, timeout=20)
            judge_data = judge_response.json()
        except Exception as e:
            return Response(
                {"error": f"Judge0 request failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        actual_output = normalize_output(
            judge_data.get("stdout")
            or judge_data.get("stderr")
            or judge_data.get("compile_output")
            or ""
        )

        expected_output = normalize_output(testcase.expected_output)

        passed = actual_output == expected_output
        if passed:
            passed_count += 1

        results.append({
            "testcase_number": index,
            "input": testcase.input,
            "expected_output": testcase.expected_output,
            "actual_output": actual_output,
            "passed": passed,
            "judge_status": judge_data.get("status", {}).get("description", "Unknown")
        })

    return Response({
        "problem_id": problem.id,
        "problem_title": problem.title,
        "total_testcases": len(results),
        "passed_count": passed_count,
        "failed_count": len(results) - passed_count,
        "results": results
    })








# import requests
# from rest_framework.decorators import api_view
# from rest_framework.response import Response

# RAPIDAPI_KEY = "8307801589mshd6761039cd151eep1a493djsn25c419086fc4"

# @api_view(['POST'])
# def run_code(request):

#     source_code = request.data.get("source_code")
#     language_id = request.data.get("language_id")
#     stdin = request.data.get("stdin")

#     url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"

#     payload = {
#         "source_code": source_code,
#         "language_id": language_id,
#         "stdin": stdin
#     }

#     headers = {
#         "Content-Type": "application/json",
#         "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
#         "X-RapidAPI-Key": RAPIDAPI_KEY
#     }

#     response = requests.post(url, json=payload, headers=headers)

#     return Response(response.json())