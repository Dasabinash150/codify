from rest_framework.decorators import api_view,APIView
from rest_framework.response import Response
from rest_framework import status

from contest.models import Problem
from .models import Submission
from .serializers import SubmissionSerializer
from .tasks import evaluate_submission


@api_view(['POST'])
def submit_code(request):
    problem_id = request.data.get("problem_id")
    source_code = request.data.get("source_code")
    language = request.data.get("language")
    user = request.user if request.user.is_authenticated else None

    if not problem_id or not source_code or not language:
        return Response(
            {"error": "problem_id, source_code and language are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        return Response({"error": "Problem not found"}, status=status.HTTP_404_NOT_FOUND)

    submission = Submission.objects.create(
        user=user,
        problem=problem,
        source_code=source_code,
        language=language,
        status="PENDING"
    )

    evaluate_submission.delay(submission.id)

    return Response(
        {
            "message": "Submission created successfully",
            "submission_id": submission.id,
            "status": submission.status
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
def submission_status(request, submission_id):
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = SubmissionSerializer(submission)
    return Response(serializer.data)



class SubmitCodeView(APIView):
    def post(self, request, problem_id):
        code = request.data.get("code")
        language = request.data.get("language")

        if not code or not language:
            return Response(
                {"error": "code and language are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response(
                {"error": "Problem not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        submission = Submission.objects.create(
            problem=problem,
            code=code,
            language=language
        )

        judged_submission = judge_submission(submission)
        serializer = SubmissionSerializer(judged_submission)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


import requests
from django.conf import settings


def get_language_id(language):
    mapping = {
        "python": 71,
        "c": 50,
        "cpp": 54,
        "java": 62,
    }
    return mapping.get(language)


@api_view(['POST'])
def run_code(request):
    source_code = request.data.get("source_code")
    language = request.data.get("language")
    stdin = request.data.get("stdin", "")

    if not source_code or not language:
        return Response(
            {"error": "source_code and language are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    language_id = get_language_id(language)
    if not language_id:
        return Response({"error": "Unsupported language"}, status=status.HTTP_400_BAD_REQUEST)

    payload = {
        "source_code": source_code,
        "language_id": language_id,
        "stdin": stdin,
    }

    try:
        response = requests.post(
            f"{settings.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true",
            json=payload,
            timeout=20
        )
        result = response.json()
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




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