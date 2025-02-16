from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", UserRegistrationAPIView.as_view(), name="register-user"),
    path("login/", UserLoginAPIView.as_view(), name="login-user"),
    path('verify-phone/', VerifyPhoneView.as_view(), name='verify-phone'),
    path('send-phone-otp/', SendPhoneOTPView.as_view(), name='send-phone-otp'),
    path('send-email-otp/', SendEmailOTPView.as_view(), name='send-email-otp'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('upload-profile-picture/', UploadProfilePictureView.as_view(), name='upload-profile-picture'),
    path("logout/", UserLogoutAPIView.as_view(), name="logout-user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("user/", UserInfoAPIView.as_view(), name="user-profile"),
    path('send-password-change-email/', SendPasswordChangeEmailView.as_view(), name='send-password-change-email'),
    path('team/', TeamMembersView.as_view(), name='team-members'),
    path('auth/google/login/', GoogleLoginView.as_view(), name='google_login'),
]
