from rest_framework import serializers

from .models import Submission, SubmissionResult


class SubmissionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionResult
        fields = "__all__"


class SubmissionSerializer(serializers.ModelSerializer):
    results = SubmissionResultSerializer(many=True, read_only=True)
    user_display = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = "__all__"

    def get_user_display(self, obj):
        user = getattr(obj, "user", None)
        if not user:
            return None
        return getattr(user, "name", "") or getattr(user, "email", "")