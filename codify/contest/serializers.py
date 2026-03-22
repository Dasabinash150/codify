from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Problem, TestCase, Submission, Contest, ContestProblem, Leaderboard

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email"]


class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = "__all__"


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = "__all__"


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = "__all__"


class ContestProblemSerializer(serializers.ModelSerializer):
    problem = ProblemSerializer(read_only=True)

    class Meta:
        model = ContestProblem
        fields = ["id", "order", "problem"]


class ContestSerializer(serializers.ModelSerializer):
    contest_problems = ContestProblemSerializer(many=True, read_only=True)
    status = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()

    problems = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()

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
            "problems",
            "participants",
            "contest_problems",
        ]
            
    def get_problems(self, obj):
        return obj.contest_problems.count()

    def get_participants(self, obj):
        return obj.submissions.values("user").distinct().count()


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
        return getattr(obj.user, "name", None) or getattr(obj.user, "email", "")