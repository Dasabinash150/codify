import requests
from django.conf import settings


def get_judge0_headers():
    if not settings.JUDGE0_API_KEY:
        raise ValueError("Judge0 API key is missing. Set JUDGE0_API_KEY in environment variables.")

    return {
        "X-RapidAPI-Key": settings.JUDGE0_API_KEY,
        "X-RapidAPI-Host": settings.JUDGE0_API_HOST,
        "Content-Type": "application/json",
    }


def submit_code_to_judge0(source_code, language_id, stdin=""):
    url = f"{settings.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false"

    payload = {
        "source_code": source_code,
        "language_id": language_id,
        "stdin": stdin,
    }

    response = requests.post(url, json=payload, headers=get_judge0_headers(), timeout=30)
    response.raise_for_status()

    data = response.json()
    return data["token"]


def get_submission_result(token):
    url = f"{settings.JUDGE0_BASE_URL}/submissions/{token}?base64_encoded=false"

    response = requests.get(url, headers=get_judge0_headers(), timeout=30)
    response.raise_for_status()

    return response.json()