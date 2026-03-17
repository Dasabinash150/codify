from rest_framework import serializers
from .models import Submission, SubmissionResult


class SubmissionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionResult
        fields = "__all__"


class SubmissionSerializer(serializers.ModelSerializer):
    results = SubmissionResultSerializer(many=True, read_only=True)

    class Meta:
        model = Submission
        fields = "__all__"