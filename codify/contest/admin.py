from django.contrib import admin
from .models import User, Problem, TestCase, Submission, Contest, ContestProblem, Leaderboard

# Show User model in Admin
# @admin.register(User)
# class UserAdmin(admin.ModelAdmin):
#     list_display = ("id", "username", "email", "role", "rank", "badges")
#     search_fields = ("username", "email")
#     list_filter = ("role",)


# Show Problem model in Admin
@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "difficulty", "tags")
    search_fields = ("title", "tags")
    list_filter = ("difficulty",)


# Show TestCase model in Admin
@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ("id", "problem", "input", "expected_output")
    search_fields = ("problem__title",)


# Show Submission model in Admin
@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "problem", "status", "runtime", "created_at")
    list_filter = ("status", "language")
    search_fields = ("user__username", "problem__title")


# Show Contest model in Admin
@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "start_time", "end_time")
    search_fields = ("name",)


# Show ContestProblem model in Admin
@admin.register(ContestProblem)
class ContestProblemAdmin(admin.ModelAdmin):
    list_display = ("contest", "problem")
    search_fields = ("contest__name", "problem__title")


# Show Leaderboard model in Admin
@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ("contest", "user", "score", "rank")
    search_fields = ("contest__name", "user__username")
