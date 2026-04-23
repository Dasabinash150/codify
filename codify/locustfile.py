from locust import HttpUser, task, between
import random

CODE_SNIPPETS = [
    {
        "problem_id": 1,
        "source_code": "print(sum(map(int,input().split())))",
        "language_id": 71
    },
    {
        "problem_id": 1,
        "source_code": "print('Hello Codify')",
        "language_id": 71
    }
]

class CodifyUser(HttpUser):
    wait_time = between(2, 4)

    def on_start(self):
        self.login()

    # ✅ LOGIN FIXED
    def login(self):
        res = self.client.post(
            "/api/user/login/",   # ✅ CORRECT
            json={
                "email": "admin@gmail.com",
                "password": "admin"
            }
        )

        print("LOGIN STATUS:", res.status_code)
        print("LOGIN RESPONSE:", res.text)

        if res.status_code == 200:
            data = res.json()
            access = data.get("token", {}).get("access")

            if access:
                self.client.headers.update({
                    "Authorization": f"Bearer {access}"
                })
            else:
                print("No access token found")
        else:
            print("Login failed")

    # ✅ SUBMIT FIXED
    @task(3)
    def submit_code(self):
        payload = random.choice(CODE_SNIPPETS)

        self.client.post(
            "/api/submit-code/",   # ✅ CORRECT
            json=payload,
            name="Submit Code"
        )

    # ❤️ HEALTH (optional)
    @task(1)
    def health(self):
        self.client.get("/", name="Home")