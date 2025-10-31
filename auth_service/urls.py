"""
Auth Service URL Configuration

This module defines URL patterns for the authentication service, including
user registration, login, MFA setup/verification, and supporting UI pages
for testing the MFA flow.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from auth_service.views import (
    RegisterView,
    LoginView,
    MFASetupView,
    MFAVerifyView,
    RegisterPageView,
    LoginPageView,
    MFASetupPageView,
    MFAVerifyPageView,
)

app_name = 'auth_service'

urlpatterns = [
    # API paths
    path('api/register/', RegisterView.as_view(), name='register-api'),
    path('api/login/', LoginView.as_view(), name='login-api'),
    path('api/mfa-setup/', MFASetupView.as_view(), name='mfa-setup-api'),
    path('api/mfa-verify/', MFAVerifyView.as_view(), name='mfa-verify-api'),
    path('api/token/', TokenRefreshView.as_view(), name='token-api'),
    path('api/logout/', TokenBlacklistView.as_view(), name='logout-api'),

    # Template (UI) paths
    # TODO:
    # These template routes are provided primarily for local testing of the MFA flow
    # and short-lived HTTP-only cookies that support it. They can be removed or
    # replaced once the production frontend integration is complete.
    path('register/', RegisterPageView.as_view(), name='register-page'),
    path('login/', LoginPageView.as_view(), name='login-page'),
    path('mfa-setup/', MFASetupPageView.as_view(), name='mfa-setup-page'),
    path('mfa-verify/', MFAVerifyPageView.as_view(), name='mfa-verify-page')

]
