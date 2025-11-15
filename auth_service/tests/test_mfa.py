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
from unittest.mock import patch

User = get_user_model()


class MFASetupTests(APITestCase):

    def setUp(self):
        """Runs before every test to initialize reusable attributes"""
        # Get csrf token
        csrf_response = self.client.get(reverse('auth_service:csrf-token-api'))
        csrf = csrf_response.cookies.get('csrftoken').value
        self.client.cookies['csrftoken'] = csrf

        self.factory = APIRequestFactory()

    def tearDown(self):
        """
        Runs after every test to clear cookies and ensure
        no tokens persist between requests.
        """
        self.client.cookies.clear()

    def test_mfa_setup_view_missing_cookie(self):
        """Ensure MFASetupView returns 400 if MFA cookie is missing."""
        request = self.factory.post(
            reverse('auth_service:mfa-setup-api'),
            HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value
        )
        response = MFASetupView.as_view()(request)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {"error": "Missing MFA token."})

    def test_mfa_setup_view_invalid_token(self):
        """Ensure MFASetupView returns 400 on invalid token."""
        request = self.factory.post(
            reverse('auth_service:mfa-setup-api'),
            HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value
        )
        request.COOKIES['mfa-setup-token'] = 'tampered.invalid.token'
        response = MFASetupView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_mfa_setup_raises_if_user_not_found(self):
        """Ensure MFASetupSerializer raises ValidationError if user does not exist."""
        vault_key = '06cf04db65c36c16cacc92a657de6bc0729da9e6b73c4342bf842bf58c434b46'
        fake_token = create_signed_token({"user_id": 999999, "vault_key": vault_key}, "mfa-setup")
        serializer = MFASetupSerializer(data={"mfa_token": fake_token})
        with self.assertRaisesMessage(serializers.ValidationError, 'User not found'):
            serializer.is_valid(raise_exception=True)


class MFAVerifyTests(APITestCase):

    def setUp(self):
        """Runs before every test to initialize reusable attributes"""
        # Get csrf token
        csrf_response = self.client.get(reverse('auth_service:csrf-token-api'))
        csrf = csrf_response.cookies.get('csrftoken').value
        self.client.cookies['csrftoken'] = csrf

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
        vault_key = '06cf04db65c36c16cacc92a657de6bc0729da9e6b73c4342bf842bf58c434b46'
        fake_token = create_signed_token({"user_id": 999999, "vault_key": vault_key}, "mfa-verify")
        serializer = MFAVerifySerializer(data={"mfa_token": fake_token, 'mfa_code': '123456'})
        with self.assertRaisesMessage(serializers.ValidationError, 'User not found.'):
            serializer.is_valid(raise_exception=True)

    def test_invalid_mfa_code(self):
        """Ensure serializer raises when MFA code is invalid."""
        vault_key = '06cf04db65c36c16cacc92a657de6bc0729da9e6b73c4342bf842bf58c434b46'
        valid_token = create_signed_token({"user_id": self.user.id, "vault_key": vault_key}, 'mfa-verify')
        serializer = MFAVerifySerializer(data={"mfa_token": valid_token, 'mfa_code': '000000'})
        with self.assertRaisesMessage(serializers.ValidationError, 'Invalid MFA code.'):
            serializer.is_valid(raise_exception=True)

    def test_mfa_verify_view_missing_cookie(self):
        """Ensure MFAVerifyView returns 400 if MFA verify cookie is missing."""
        request = self.factory.post(
            reverse("auth_service:mfa-verify-api"),
            {"mfa_code": "123456"},
            HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value
        )
        response = MFAVerifyView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "Missing MFA token."})

    def test_mfa_verify_view_invalid_token(self):
        """Ensure MFAVerifyView returns 400 on invalid verification token."""
        request = self.factory.post(
            reverse("auth_service:mfa-verify-api"),
            {"mfa_code": "123456"},
            HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value
        )
        request.COOKIES['mfa-verify-token'] = 'tampered.invalid.token'
        response = MFAVerifyView.as_view()(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_valid_mfa_verification_returns_vault_key_and_tokens(self):
        """Ensure MFAVerifyView returns access, refresh, and JWT tokens on success"""
        vault_key = '06cf04db65c36c16cacc92a657de6bc0729da9e6b73c4342bf842bf58c434b46'
        valid_token = create_signed_token({"user_id": self.user.id, "vault_key": vault_key}, 'mfa-verify')

        with patch.object(TOTPDevice, "verify_token", return_value=True):
            serializer = MFAVerifySerializer(data={"mfa_token": valid_token, "mfa_code": "123456"})
            serializer.is_valid()
            result = serializer.save()

        self.assertIn('access', result)
        self.assertIn('refresh', result)
        self.assertIn('vault_key', result)
        self.assertEqual(result['vault_key'], vault_key)
