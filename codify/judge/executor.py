# import requests
# import time


# JUDGE0_URL = "http://127.0.0.1:2358/submissions/?base64_encoded=false&wait=false"


# LANGUAGE_MAP = {
#     "python": 71,   # Python 3
#     "cpp": 54,      # C++17
#     "c": 50,        # C
#     "java": 62,     # Java
# }


# def submit_to_judge0(code, language, stdin):
#     payload = {
#         "source_code": code,
#         "language_id": LANGUAGE_MAP[language],
#         "stdin": stdin,
#     }
#     response = requests.post(JUDGE0_URL, json=payload)
#     response.raise_for_status()
#     return response.json()["token"]


# def get_result_from_judge0(token):
#     url = f"http://127.0.0.1:2358/submissions/{token}?base64_encoded=false"
#     for _ in range(20):
#         response = requests.get(url)
#         response.raise_for_status()
#         data = response.json()
#         status_id = data["status"]["id"]

#         # 1/2 => In Queue / Processing
#         if status_id not in [1, 2]:
#             return data

#         time.sleep(0.5)

#     return {
#         "status": {"id": 13, "description": "Internal Error"},
#         "stdout": None,
#         "stderr": "Execution timeout while polling Judge0",
#         "compile_output": None,
#         "time": None,
#     }