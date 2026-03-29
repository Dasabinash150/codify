from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Problem,
    TestCase,
    Submission,
    Contest,
    ContestProblem,
    Leaderboard,
    ContestRegistration,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "email", "display_name"]

    def get_display_name(self, obj):
        return obj.name or obj.email


class ProblemSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = "__all__"

    def get_tags(self, obj):
        if not obj.tags:
            return []

        if isinstance(obj.tags, list):
            return obj.tags

        return [tag.strip() for tag in str(obj.tags).split(",") if tag.strip()]


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ["id", "problem", "input", "expected_output", "is_sample"]


class SubmissionSerializer(serializers.ModelSerializer):
    user_display = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = "__all__"

    def get_user_display(self, obj):
        user = getattr(obj, "user", None)
        if not user:
            return None
        return getattr(user, "name", "") or getattr(user, "email", "")


class ContestProblemSerializer(serializers.ModelSerializer):
    problem_id = serializers.IntegerField(source="problem.id", read_only=True)
    title = serializers.CharField(source="problem.title", read_only=True)
    difficulty = serializers.CharField(source="problem.difficulty", read_only=True)
    tags = serializers.SerializerMethodField()

    class Meta:
        model = ContestProblem
        fields = ["id", "order", "problem_id", "title", "difficulty", "tags"]

    def get_tags(self, obj):
        tags = getattr(obj.problem, "tags", "")
        if not tags:
            return []
        if isinstance(tags, list):
            return tags
        return [tag.strip() for tag in str(tags).split(",") if tag.strip()]


class ContestSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()
    problems_count = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    problems = serializers.SerializerMethodField()
    joined = serializers.SerializerMethodField()

    class Meta:
        model = Contest
        fields = [
            "id",
            "name",
            "description",
            "start_time",
            "end_time",
            "status",
            "duration_minutes",
            "problems_count",
            "participants_count",
            "problems",
            "joined",
        ]

    def get_problems_count(self, obj):
        return getattr(obj, "problems_count_db", obj.contest_problems.count())

    def get_participants_count(self, obj):
        return getattr(obj, "participants_count_db", obj.registrations.count())

    def get_problems(self, obj):
        contest_problems = (
            obj.contest_problems.select_related("problem")
            .all()
            .order_by("order")
        )
        return ContestProblemSerializer(contest_problems, many=True).data

    def get_joined(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False

        return ContestRegistration.objects.filter(
            contest=obj,
            user=request.user,
        ).exists()


class LeaderboardSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Leaderboard
        fields = [
            "id",
            "contest",
            "user",
            "user_name",
            "score",
            "solved",
            "penalty",
            "rank",
            "last_updated",
        ]

    def get_user_name(self, obj):
        return getattr(obj.user, "name", "") or getattr(obj.user, "email", "")