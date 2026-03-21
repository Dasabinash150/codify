from django.urls import path, include
from account.views import UserRegistrationView,UserLoginView,UserProfileView,UserChangePasswordView,SendPasswordResetEmailView,UserPasswordResetView
from .views import SendOTPView, UserRegistrationOtpView,google_login
urlpatterns = [

    # path('', home,name='home'),
    path('register/', UserRegistrationView.as_view(),name='register'),
    path('login/', UserLoginView.as_view(),name='login'),
    path('profile/', UserProfileView.as_view(),name='profile'),
    path('changepassword/', UserChangePasswordView.as_view(),name='changepassword'),
    path('send-reset-password-email/',SendPasswordResetEmailView.as_view(), name='send-reset-password-email'),
    path('reset-password/<uid>/<token>/', UserPasswordResetView.as_view(), name='reset-password'),
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("registerotp/", UserRegistrationOtpView.as_view(), name="register-with-otp"),
    path("google-login/", google_login, name="google_login"),
    # path("api/google-login/", google_login, name="google_login"),

]   

