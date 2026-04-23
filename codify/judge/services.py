import time
import requests
from django.conf import settings
from django.utils import timezone

from contest.models import Leaderboard, Submission


JUDGE0_BASE_URL = (getattr(settings, "JUDGE0_BASE_URL", "") or "").rstrip("/")

if not JUDGE0_BASE_URL:
    raise ValueError("JUDGE0_BASE_URL is missing in settings/.env.local")

JUDGE0_SUBMIT_URL = f"{JUDGE0_BASE_URL}/submissions/?base64_encoded=false&wait=true"

# JUDGE0_SUBMIT_URL = f"{JUDGE0_BASE_URL}/submissions/?base64_encoded=false&wait=false"
# JUDGE0_RESULT_URL = f"{JUDGE0_BASE_URL}/submissions"

def normalize_output(text):
    if text is None:
        return ""
    return "\n".join(line.rstrip() for line in str(text).strip().splitlines())


def compare_output(actual, expected):
    return normalize_output(actual) == normalize_output(expected)


def build_judge0_headers():
    headers = {
        "Content-Type": "application/json",
    }

    rapidapi_key = getattr(settings, "RAPIDAPI_KEY", None)
    rapidapi_host = getattr(settings, "RAPIDAPI_HOST", None)

    # Add RapidAPI headers only when using RapidAPI
    if "rapidapi.com" in JUDGE0_BASE_URL:
        if not rapidapi_key:
            raise ValueError("RAPIDAPI_KEY is missing in settings/.env.local")
        if not rapidapi_host:
            raise ValueError("RAPIDAPI_HOST is missing in settings/.env.local")

        headers["X-RapidAPI-Key"] = rapidapi_key
        headers["X-RapidAPI-Host"] = rapidapi_host

    return headers


def run_code_with_judge0(source_code, language_id, stdin=""):
    payload = {
        "source_code": source_code,
        "language_id": int(language_id),
        "stdin": stdin or "",
    }

    try:
        headers = build_judge0_headers()
    except ValueError as exc:
        return {
            "success": False,
            "error": str(exc),
        }

    print("JUDGE0 URL =", JUDGE0_SUBMIT_URL)
    print("PAYLOAD =", payload)

    last_error = None

    for attempt in range(3):
        try:
            response = requests.post(
                JUDGE0_SUBMIT_URL,
                json=payload,
                headers=headers,
                timeout=30,
            )
        except requests.RequestException as exc:
            last_error = f"Judge0 connection failed: {str(exc)}"
            time.sleep(1)
            continue

        print("STATUS CODE =", response.status_code)
        print("RAW RESPONSE =", response.text)

        if response.status_code >= 500:
            last_error = (
                f"Judge0 server error {response.status_code}: "
                f"{response.text[:300]}"
            )
            time.sleep(1)
            continue

        try:
            data = response.json()
        except Exception:
            return {
                "success": False,
                "error": f"Judge0 invalid response: {response.text}",
            }

        if response.status_code >= 400:
            return {
                "success": False,
                "error": f"Judge0 error {response.status_code}: {data}",
            }

        return {
            "success": True,
            "data": data,
        }

    return {
        "success": False,
        "error": last_error or "Judge0 request failed after retries.",
    }


def run_single_testcase(source_code, language_id, stdin=""):
    result = run_code_with_judge0(
        source_code=source_code,
        language_id=language_id,
        stdin=stdin,
    )

    if not result["success"]:
        raise Exception(result["error"])

    return result["data"]


def get_submission_status(result):
    compile_output = result.get("compile_output")
    stderr = result.get("stderr")
    status_obj = result.get("status", {}) or {}
    status_id = status_obj.get("id")
    status_desc = status_obj.get("description", "Unknown")

    if compile_output:
        return "CE", compile_output

    if status_id == 5:
        return "TLE", status_desc

    if stderr:
        return "RE", stderr

    if status_id in [6, 13]:
        return "CE", status_desc

    if status_id in [7, 8, 9, 10, 11, 12, 14]:
        return "RE", status_desc

    return "OK", ""


def judge_problem_submission(problem, source_code, language_id, use_sample=False):
    testcases = problem.testcases.all().order_by("id")

    if use_sample:
        sample_testcases = testcases.filter(is_sample=True)
        testcases = sample_testcases if sample_testcases.exists() else testcases

    total = testcases.count()
    passed = 0
    testcase_results = []
    final_status = "AC"
    runtime = 0.0

    if total == 0:
        return {
            "status": "ERROR",
            "message": "No testcases found for this problem.",
            "passed_count": 0,
            "total_count": 0,
            "runtime": 0.0,
            "testcase_results": [],
        }

    for index, tc in enumerate(testcases, start=1):
        result = run_code_with_judge0(
            source_code=source_code,
            language_id=language_id,
            stdin=tc.input or "",
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
        status_obj = judge_data.get("status", {}) or {}
        judge_status = status_obj.get("description", "Unknown")

        try:
            runtime += float(time_taken or 0)
        except Exception:
            pass

        if compile_output:
            final_status = "CE"
            if use_sample:
                testcase_results.append({
                    "testcase": index,
                    "input": tc.input,
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
                    "testcase": index,
                    "input": tc.input,
                    "expected_output": tc.expected_output,
                    "actual_output": stderr,
                    "passed": False,
                    "judge_status": judge_status,
                })
            break

        is_passed = compare_output(stdout, tc.expected_output)

        if is_passed:
            passed += 1
        elif final_status == "AC":
            final_status = "WA"

        if use_sample:
            testcase_results.append({
                "testcase": index,
                "input": tc.input,
                "expected_output": tc.expected_output,
                "actual_output": stdout,
                "passed": is_passed,
                "judge_status": judge_status,
            })

        if not is_passed and not use_sample:
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


def rebuild_contest_leaderboard(contest):
    submissions = (
        Submission.objects.filter(contest=contest)
        .select_related("user", "problem")
        .order_by("submitted_at", "id")
    )

    best_by_user_problem = {}

    for sub in submissions:
        key = (sub.user_id, sub.problem_id)
        existing = best_by_user_problem.get(key)

        if existing is None:
            best_by_user_problem[key] = sub
            continue

        if existing.status != "AC" and sub.status == "AC":
            best_by_user_problem[key] = sub
            continue

        if existing.status == "AC" and sub.status == "AC":
            if sub.submitted_at < existing.submitted_at:
                best_by_user_problem[key] = sub

    leaderboard_data = {}

    for (_, _), sub in best_by_user_problem.items():
        user_id = sub.user_id

        if user_id not in leaderboard_data:
            leaderboard_data[user_id] = {
                "user": sub.user,
                "score": 0,
                "solved": 0,
                "penalty": 0,
            }

        if sub.status == "AC":
            leaderboard_data[user_id]["score"] += sub.problem.points
            leaderboard_data[user_id]["solved"] += 1

            if contest.start_time and sub.submitted_at:
                delta = sub.submitted_at - contest.start_time
                penalty_minutes = max(int(delta.total_seconds() // 60), 0)
                leaderboard_data[user_id]["penalty"] += penalty_minutes

    existing_rows = {
        row.user_id: row
        for row in Leaderboard.objects.filter(contest=contest)
    }

    rows_to_create = []
    rows_to_update = []

    for user_id, data in leaderboard_data.items():
        row = existing_rows.get(user_id)

        if row:
            row.score = data["score"]
            row.solved = data["solved"]
            row.penalty = data["penalty"]
            row.last_updated = timezone.now()
            rows_to_update.append(row)
        else:
            rows_to_create.append(
                Leaderboard(
                    contest=contest,
                    user=data["user"],
                    score=data["score"],
                    solved=data["solved"],
                    penalty=data["penalty"],
                    last_updated=timezone.now(),
                )
            )

    if rows_to_create:
        Leaderboard.objects.bulk_create(rows_to_create)

    if rows_to_update:
        Leaderboard.objects.bulk_update(
            rows_to_update,
            ["score", "solved", "penalty", "last_updated"],
        )

    valid_user_ids = set(leaderboard_data.keys())
    Leaderboard.objects.filter(contest=contest).exclude(
        user_id__in=valid_user_ids
    ).delete()

    ranked_rows = list(
        Leaderboard.objects.filter(contest=contest).order_by(
            "-score",
            "-solved",
            "penalty",
            "last_updated",
            "id",
        )
    )

    changed_rank_rows = []
    for index, row in enumerate(ranked_rows, start=1):
        if row.rank != index:
            row.rank = index
            changed_rank_rows.append(row)

    if changed_rank_rows:
        Leaderboard.objects.bulk_update(changed_rank_rows, ["rank"])