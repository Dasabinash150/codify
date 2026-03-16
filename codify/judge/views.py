import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

RAPIDAPI_KEY = "8307801589mshd6761039cd151eep1a493djsn25c419086fc4"

@api_view(['POST'])
def run_code(request):

    source_code = request.data.get("source_code")
    language_id = request.data.get("language_id")
    stdin = request.data.get("stdin")

    url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"

    payload = {
        "source_code": source_code,
        "language_id": language_id,
        "stdin": stdin
    }

    headers = {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY
    }

    response = requests.post(url, json=payload, headers=headers)

    return Response(response.json())