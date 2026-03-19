from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from account.serializers import UserLoginSerializer,UserRegistrationSerializer,UserProfileSerializer,UserChangePasswordSerializer,SendPasswordResetEmailSerializer,UserPasswordResetSerializer

from account.renders import UserRenderer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
class UserRegistrationView(APIView):
    renderer_classes = [UserRenderer]
    def post(self, request, format=None):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            token = get_tokens_for_user(user)
            return Response({'token':token,'msg':'Registration Successful'},status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    renderer_classes = [UserRenderer]
    def post(self, request, format=None):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.data.get('email')
            password = serializer.data.get('password')
            user = authenticate(email=email,password=password)
            if user is not None:
                token = get_tokens_for_user(user)
                return Response({'token':token,'msg':"Login Successful"},status=status.HTTP_200_OK)
            return Response({'errors':{'none_field_errors':['Email or Password is not valid']}},status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated] 
    def get(self, request, format=None):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class UserChangePasswordView(APIView):
    renderer_classes = [UserRenderer]
    permission_classes = [IsAuthenticated] 
    def post(self, request, format=None):
        serializer = UserChangePasswordSerializer(data=request.data, context={'user':request.user})
        if serializer.is_valid(raise_exception=True):
            return Response({'msg':'Password Changed successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

#forgot password
class SendPasswordResetEmailView(APIView):
    renderer_classes = [UserRenderer]
    def post(self, request, format=None):
        serializer = SendPasswordResetEmailSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            return Response({'msg':'Password Reset link send. Please check your email'}, status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class UserPasswordResetView(APIView):
    renderer_classes = [UserRenderer]
    def post(self, request, uid, token, format=None):
        serializer = UserPasswordResetSerializer(data=request.data, context={'uid':uid, 'token':token})
        if serializer.is_valid(raise_exception=True):
            return Response({'msg':'Password Reset Successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
# otp regitration
import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import EmailOTP
from .serializers import SendOTPSerializer, RegisterWithOTPSerializer

User = get_user_model()


def generate_otp():
    return str(random.randint(100000, 999999))

class SendOTPView(APIView):
    def post(self, request):
        print("SEND OTP REQUEST:", request.data)

        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            print("EMAIL:", email)

            if User.objects.filter(email=email).exists():
                print("EMAIL ALREADY REGISTERED")
                return Response(
                    {"error": "Email already registered."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            otp = generate_otp()
            print("GENERATED OTP:", otp)

            deleted_count, _ = EmailOTP.objects.filter(email=email).delete()
            print("OLD OTP DELETED:", deleted_count)

            otp_obj = EmailOTP.objects.create(email=email, otp=otp)
            print("OTP SAVED:", otp_obj.id, otp_obj.email, otp_obj.otp)

            print("DB OTP CHECK:", list(EmailOTP.objects.filter(email=email).values()))

            send_mail(
                subject="Your Registration OTP",
                message=f"Your OTP for registration is: {otp}. It is valid for 10 minutes.",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )

            return Response(
                {"message": "OTP sent successfully to email."},
                status=status.HTTP_200_OK
            )

        print("SEND OTP SERIALIZER ERRORS:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    

class UserRegistrationOtpView(APIView):
    renderer_classes = [UserRenderer]

    def post(self, request, format=None):
        try:
            print("REQUEST DATA:", request.data)

            serializer = RegisterWithOTPSerializer(data=request.data)

            if not serializer.is_valid():
                print("SERIALIZER ERRORS:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]

            print("OTP TYPE:", type(otp), otp)
            # debuging
            print("INPUT OTP:", otp, type(otp))
            print("DB OTPs:", list(EmailOTP.objects.filter(email=email).values()))
            # otp_obj = EmailOTP.objects.filter(email=email, otp=str(otp)).order_by('-created_at').first()
            otp_obj = EmailOTP.objects.filter(email=email, otp=otp).order_by('-created_at').first()

            if not otp_obj:
                return Response(
                    {"errors": {"otp": ["Invalid OTP"]}},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if otp_obj.is_expired():
                otp_obj.delete()
                return Response(
                    {"errors": {"otp": ["OTP expired"]}},
                    status=status.HTTP_400_BAD_REQUEST
                )


            user = serializer.save()
            otp_obj.delete()

            token = get_tokens_for_user(user)

            return Response(
                {
                    "token": token,
                    "msg": "Registration Successful"
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            print("SERVER ERROR:", str(e))
            return Response(
                {"errors": {"server": [str(e)]}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )