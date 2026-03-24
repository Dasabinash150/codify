import time
import requests
from django.conf import settings

def submit_code_to_judge0(source_code, language_id, stdin=""):
    url = f"{settings.JUDGE0_BASE_URL}/submissions/?base64_encoded=false&wait=false"

    headers = {}
    if getattr(settings, "JUDGE0_API_KEY", None):
        headers["X-RapidAPI-Key"] = settings.JUDGE0_API_KEY
    if getattr(settings, "JUDGE0_API_HOST", None):
        headers["X-RapidAPI-Host"] = settings.JUDGE0_API_HOST

    payload = {
        "source_code": source_code,
        "language_id": language_id,
        "stdin": stdin,
    }

    response = requests.post(url, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    return response.json()["token"]


def get_submission_result(token):
    url = f"{settings.JUDGE0_BASE_URL}/submissions/{token}?base64_encoded=false"
    headers = {}

    if getattr(settings, "JUDGE0_API_KEY", None):
        headers["X-RapidAPI-Key"] = settings.JUDGE0_API_KEY
    if getattr(settings, "JUDGE0_API_HOST", None):
        headers["X-RapidAPI-Host"] = settings.JUDGE0_API_HOST

    for _ in range(20):
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()

        status_id = data.get("status", {}).get("id")
        if status_id not in [1, 2]:  # in queue / processing
            return data

        time.sleep(1)

    return {"error": "Timeout while waiting for Judge0 result"}