from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import DjangoUnicodeDecodeError, force_bytes, smart_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers

from account.models import EmailOTP
from account.utils import Util

from contest.models import Submission
from datetime import date, timedelta

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(style={"input_type": "password"}, write_only=True)
    password2 = serializers.CharField(style={"input_type": "password"}, write_only=True)

    class Meta:
        model = User
        fields = ["email", "name", "password", "password2", "tc"]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")

        if password != password2:
            raise serializers.ValidationError(
                {"password2": "Password and confirm password do not match."}
            )

        validate_password(password)
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2", None)
        return User.objects.create_user(**validated_data)


class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        model = User
        fields = ["email", "password"]


# class UserProfileSerializer(serializers.ModelSerializer):
#     display_name = serializers.SerializerMethodField()

#     class Meta:
#         model = User
#         fields = ["id", "email", "name", "display_name"]

#     def get_display_name(self, obj):
#         return obj.name or obj.email
class UserProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    streak = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "display_name",
            "streak",
        ]

    def get_display_name(self, obj):
        return obj.name or obj.email

    def get_streak(self, obj):
        submissions = Submission.objects.filter(
            user=obj,
            status="AC"
        ).order_by("-submitted_at")

        print("========== STREAK DEBUG ==========")
        print("USER:", obj.email)
        print("TOTAL ACCEPTED SUBMISSIONS:", submissions.count())

        if not submissions.exists():
            return 0

        streak = 0
        checked_days = set()

        latest_day = submissions.first().submitted_at.date()
        today = date.today()

        # allow yesterday as active streak start
        if latest_day == today:
            current_day = today
        elif latest_day == today - timedelta(days=1):
            current_day = latest_day
        else:
            return 0

        print("START FROM:", current_day)

        for submission in submissions:
            submission_day = submission.submitted_at.date()

            print(
                "SUBMISSION ID:", submission.id,
                "| STATUS:", submission.status,
                "| DATE:", submission_day
            )

            if submission_day in checked_days:
                continue

            if submission_day == current_day:
                streak += 1
                checked_days.add(submission_day)
                current_day -= timedelta(days=1)
                print("COUNTED → streak =", streak)

            elif submission_day < current_day:
                print("BREAK")
                break

        print("FINAL STREAK:", streak)
        print("=================================")

        return streak

class UserChangePasswordSerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=255,
        style={"input_type": "password"},
        write_only=True,
    )
    password2 = serializers.CharField(
        max_length=255,
        style={"input_type": "password"},
        write_only=True,
    )

    class Meta:
        fields = ["password", "password2"]

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        user = self.context.get("user")

        if password != password2:
            raise serializers.ValidationError(
                {"password2": "Password and confirm password do not match."}
            )

        validate_password(password, user=user)
        user.set_password(password)
        user.save()
        return attrs


class SendPasswordResetEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        fields = ["email"]

    def validate(self, attrs):
        email = attrs.get("email")

        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError("You are not a registered user.")

        user = User.objects.get(email=email)
        uid = urlsafe_base64_encode(force_bytes(user.id))
        token = PasswordResetTokenGenerator().make_token(user)

        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        body = f"Click the following link to reset your password: {reset_link}"
        data = {
            "subject": "Reset Your Password",
            "body": body,
            "to_email": user.email,
        }
        Util.send_email(data)
        return attrs


class UserPasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=255,
        style={"input_type": "password"},
        write_only=True,
    )
    password2 = serializers.CharField(
        max_length=255,
        style={"input_type": "password"},
        write_only=True,
    )

    class Meta:
        fields = ["password", "password2"]

    def validate(self, attrs):
        try:
            password = attrs.get("password")
            password2 = attrs.get("password2")
            uid = self.context.get("uid")
            token = self.context.get("token")

            if password != password2:
                raise serializers.ValidationError(
                    {"password2": "Password and confirm password do not match."}
                )

            user_id = smart_str(urlsafe_base64_decode(uid))
            user = User.objects.get(id=user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                raise serializers.ValidationError("Token is not valid or expired.")

            validate_password(password, user=user)
            user.set_password(password)
            user.save()
            return attrs

        except (DjangoUnicodeDecodeError, User.DoesNotExist):
            raise serializers.ValidationError("Token is not valid or expired.")


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value


class RegisterWithOTPSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "name", "password", "password2", "tc", "otp"]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        email = attrs.get("email")
        otp = attrs.get("otp")

        if password != password2:
            raise serializers.ValidationError(
                {"password2": "Password and confirm password do not match."}
            )

        validate_password(password)

        otp_record = (
            EmailOTP.objects.filter(email=email, otp=otp, is_verified=True)
            .order_by("-created_at")
            .first()
        )

        if not otp_record:
            raise serializers.ValidationError({"otp": "Invalid or unverified OTP."})

        if otp_record.is_expired():
            raise serializers.ValidationError({"otp": "OTP has expired."})

        return attrs

    def create(self, validated_data):
        validated_data.pop("otp", None)
        validated_data.pop("password2", None)

        return User.objects.create_user(**validated_data)