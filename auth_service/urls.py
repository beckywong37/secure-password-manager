"""
Auth Service URL Configuration

This module defines URL patterns for the authentication service, including
user registration, login, MFA setup/verification, and token refresh/blacklisting.
"""

from django.urls import path
from auth_service.views import (
    get_csrf_token,
    RegisterView,
    LoginView,
    MFASetupView,
    MFAVerifyView,
    JWTTokenRefreshView,
    LogoutView
)

app_name = 'auth_service'

urlpatterns = [
    path('csrf/', get_csrf_token, name='csrf-token-api'),
    path('register/', RegisterView.as_view(), name='register-api'),
    path('login/', LoginView.as_view(), name='login-api'),
    path('mfa-setup/', MFASetupView.as_view(), name='mfa-setup-api'),
    path('mfa-verify/', MFAVerifyView.as_view(), name='mfa-verify-api'),
    path('token/', JWTTokenRefreshView.as_view(), name='token-api'),
    path('logout/', LogoutView.as_view(), name='logout-api'),
]
