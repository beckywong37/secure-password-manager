"""
Auth Service Login Tests

This module provides tests for auth service token endpoint.

References:
    - Django REST framework testing documentation:
    https://www.django-rest-framework.org/api-guide/testing/
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth import get_user_model
from django_otp.oath import totp

User = get_user_model()


class TokenTests(APITestCase):

    def setUp(self):
        """
        Runs before every test to register and authenticatae a user
        """
        # Define credentials
        self.username = 'bcurley'
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        # Register user
        url = reverse('auth_service:register-api')
        data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "password2": self.password
        }
        register_response = self.client.post(url, data, format='json')
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        # Get setup token from cookie and initialize MFA setup
        setup_token = self.client.cookies.get('mfa-setup-token').value
        self.client.cookies['mfa-setup-token'] = setup_token
        setup_url = reverse('auth_service:mfa-setup-api')
        setup_response = self.client.get(setup_url, format='json')
        self.assertEqual(setup_response.status_code, status.HTTP_200_OK)

        # Simulate confirmed TOTP device
        user = User.objects.get(username=self.username)
        device, _ = TOTPDevice.objects.get_or_create(user=user, name='default')
        device.confirmed = True
        device.save()

        # Step 4: Use MFA verify token to complete verification and obtain JWTs
        verify_token = self.client.cookies.get('mfa-verify-token').value
        self.client.cookies['mfa-verify-token'] = verify_token
        verify_url = reverse('auth_service:mfa-verify-api')
        mfa_code = totp(device.bin_key)
        verify_response = self.client.post(verify_url, {"mfa_code": mfa_code}, format='json')
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)

        # Store tokens for logout tests
        self.access_token = verify_response.data['access']
        self.refresh_token = verify_response.data['refresh']

    def test_refresh_token_valid_token(self):
        """
        Ensure token is refreshed
        """
        # Use refresh token to obtain new token
        url = reverse('auth_service:token-api')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_refresh_token_invalid_token(self):
        """
        Ensure token is refreshed
        """
        url = reverse('auth_service:token-api')
        data = {
            "refresh": "invalid_refresh_token"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {"detail": "Token is invalid", "code": "token_not_valid"})

    def test_logout_refresh_token_blacklisted_token(self):
        # Use refresh token to logout (blacklists token)
        url = reverse('auth_service:logout-api')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempt to refresh token with blacklisted token
        url = reverse('auth_service:token-api')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {"detail": "Token is blacklisted", "code": "token_not_valid"})
