"""
Auth MFA Tests

This module provides tests for auth service logout endpoint.

References:
    - Django REST framework testing documentation:
    https://www.django-rest-framework.org/api-guide/testing/
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework import serializers
from auth_service.serializers import MFAVerifySerializer, MFASetupSerializer
from auth_service.utils.mfa import create_signed_token
from rest_framework.test import APIRequestFactory
from auth_service.views import MFASetupView, MFAVerifyView

User = get_user_model()


class MFASetupTests(APITestCase):

    def setUp(self):
        """Runs before every test to initialize reusable attributes"""
        self.factory = APIRequestFactory()

    def test_mfa_setup_view_missing_cookie(self):
        """Ensure MFASetupView returns 400 if MFA cookie is missing."""
        request = self.factory.get(reverse('auth_service:mfa-setup-api'))
        response = MFASetupView.as_view()(request)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {"error": "Missing MFA token."})

    def test_mfa_setup_view_invalid_token(self):
        """Ensure MFASetupView returns 400 on invalid token."""
        request = self.factory.get(reverse('auth_service:mfa-setup-api'))
        request.COOKIES['mfa-setup-token'] = 'tampered.invalid.token'
        response = MFASetupView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_mfa_setup_raises_if_user_not_found(self):
        """Ensure MFASetupSerializer raises ValidationError if user does not exist."""
        fake_token = create_signed_token({"user_id": 999999}, "mfa-setup")
        serializer = MFASetupSerializer(data={"mfa_token": fake_token})
        with self.assertRaisesMessage(serializers.ValidationError, 'User not found'):
            serializer.is_valid(raise_exception=True)


class MFAVerifyTests(APITestCase):

    def setUp(self):
        """Runs before every test to initialize reusable attributes"""
        self.username = 'bcurley'
        self.email = 'curleyr@oregonstate.edu'
        self.factory = APIRequestFactory()
        self.user = User.objects.create(username=self.username, email=self.email)
        self.device = TOTPDevice.objects.create(user=self.user, name='default', confirmed=True)

    def test_invalid_or_tampered_token(self):
        """Ensure serializer raises when token is tampered or invalid."""
        serializer = MFAVerifySerializer(data={"mfa_token": "tampered.token", "mfa_code": "123456"})
        with self.assertRaisesMessage(serializers.ValidationError, 'Invalid or expired MFA token.'):
            serializer.is_valid(raise_exception=True)

    def test_missing_user_id_in_token(self):
        """Ensure serializer raises when token lacks user_id."""
        bad_token = create_signed_token({}, 'mfa-verify')
        serializer = MFAVerifySerializer(data={"mfa_token": bad_token, "mfa_code": "123456"})
        with self.assertRaisesMessage(serializers.ValidationError, 'Invalid MFA token data.'):
            serializer.is_valid(raise_exception=True)

    def test_user_does_not_exist_in_token(self):
        """Ensure serializer raises when user in token doesn't exist."""
        fake_token = create_signed_token({"user_id": 999999}, "mfa-verify")
        serializer = MFAVerifySerializer(data={"mfa_token": fake_token, 'mfa_code': '123456'})
        with self.assertRaisesMessage(serializers.ValidationError, 'User not found.'):
            serializer.is_valid(raise_exception=True)

    def test_invalid_mfa_code(self):
        """Ensure serializer raises when MFA code is invalid."""
        valid_token = create_signed_token({"user_id": self.user.id}, 'mfa-verify')
        serializer = MFAVerifySerializer(data={"mfa_token": valid_token, 'mfa_code': '000000'})
        with self.assertRaisesMessage(serializers.ValidationError, 'Invalid MFA code.'):
            serializer.is_valid(raise_exception=True)

    def test_mfa_verify_view_missing_cookie(self):
        """Ensure MFAVerifyView returns 400 if MFA verify cookie is missing."""
        request = self.factory.post(reverse("auth_service:mfa-verify-api"), {"mfa_code": "123456"})
        response = MFAVerifyView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "Missing MFA token."})

    def test_mfa_verify_view_invalid_token(self):
        """Ensure MFAVerifyView returns 400 on invalid verification token."""
        request = self.factory.post(reverse("auth_service:mfa-verify-api"), {"mfa_code": "123456"})
        request.COOKIES['mfa-verify-token'] = 'tampered.invalid.token'
        response = MFAVerifyView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
