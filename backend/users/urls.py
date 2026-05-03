"""
URL routing for authentication endpoints.
Provides REST API endpoints for user registration, login, profile, and token management.
"""

from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    UserProfileAPIView,
    refresh_token_view,
    ProfileUpdateAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    VerifyEmailAPIView,
    SendVerificationEmailAPIView
)

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('refresh/', refresh_token_view, name='token_refresh'),
    
    # Email verification endpoints
    path('verify-email/', VerifyEmailAPIView.as_view(), name='verify_email'),
    path('send-verification-email/', SendVerificationEmailAPIView.as_view(), name='send_verification_email'),
    
    # Password reset endpoints
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='reset_password'),
    
    # Protected endpoints
    path('me/', UserProfileAPIView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateAPIView.as_view(), name='profile_update'),
]

