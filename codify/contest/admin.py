from django.contrib import admin
from .models import Problem, TestCase, Submission, Contest, ContestProblem, Leaderboard


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "difficulty", "tags")
    search_fields = ("title", "tags")
    list_filter = ("difficulty",)


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ("id", "problem", "is_sample")
    search_fields = ("problem__title",)


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "problem", "contest", "status", "runtime", "submitted_at")
    list_filter = ("status", "language", "contest")
    search_fields = ("user__email", "problem__title")


@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "start_time", "end_time")
    search_fields = ("name",)


@admin.register(ContestProblem)
class ContestProblemAdmin(admin.ModelAdmin):
    list_display = ("contest", "problem", "order")
    search_fields = ("contest__name", "problem__title")


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ("contest", "user", "score", "solved", "rank", "last_updated")
    search_fields = ("contest__name", "user__email")