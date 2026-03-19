from rest_framework import serializers
from .models import User, Problem, TestCase, Submission, Contest, ContestProblem, Leaderboard

from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'rank', 'badges']


class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = '__all__'


class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = '__all__'


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'





class ContestProblemSerializer(serializers.ModelSerializer):
    problem = ProblemSerializer(read_only=True)

    class Meta:
        model = ContestProblem
        fields = ['id', 'problem']

class ContestSerializer(serializers.ModelSerializer):
    contest_problems = ContestProblemSerializer(many=True, read_only=True)

    class Meta:
        model = Contest
        fields = ['id', 'name', 'start_time', 'end_time', 'contest_problems']

# class LeaderboardSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Leaderboard
#         fields = '__all__'


class LeaderboardSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Leaderboard
        fields = ["id", "contest", "user", "user_name", "score", "solved", "rank", "submitted_at"]

    def get_user_name(self, obj):
        return (
            getattr(obj.user, "username", None)
            or getattr(obj.user, "email", None)
            or getattr(obj.user, "name", None)
            or str(obj.user)
        )