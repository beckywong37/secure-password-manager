"""
Auth Service Logout Tests

This module provides tests for auth service logout endpoint.

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


class LogoutTests(APITestCase):

    def setUp(self):
        """
        Runs before every test to register and authenticate a user
        """
        # Get csrf token
        csrf_response = self.client.get(reverse('auth_service:csrf-token-api'))
        csrf = csrf_response.cookies.get('csrftoken').value
        self.client.cookies['csrftoken'] = csrf

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
        register_response = self.client.post(url, data, format='json', HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value)
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        # Get setup token from cookie and initialize MFA setup
        setup_token = self.client.cookies.get('mfa-setup-token').value
        self.client.cookies['mfa-setup-token'] = setup_token
        setup_url = reverse('auth_service:mfa-setup-api')
        setup_response = self.client.post(
            setup_url,
            HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value
        )
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
        verify_response = self.client.post(
            verify_url,
            {'mfa_code': mfa_code},
            format='json',
            HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)

        # Store tokens for logout tests
        self.access_token = verify_response.data['access']
        self.refresh_token = verify_response.data['refresh']

    def tearDown(self):
        """
        Runs after every test to clear cookies and ensure
        no tokens persist between requests.
        """
        self.client.cookies.clear()

    def test_logout_valid_token(self):
        url = reverse('auth_service:logout-api')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json', HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempt to refresh token after logging out
        url = reverse('auth_service:token-api')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json', HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {"detail": "Token is blacklisted", "code": "token_not_valid"})

    def test_logout_invalid_token(self):
        url = reverse('auth_service:logout-api')
        data = {
            "refresh": "This is an invalid token"
        }
        response = self.client.post(url, data, format='json', HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {"detail": "Token is invalid", "code": "token_not_valid"})

    def test_logout_blacklisted_token(self):
        url = reverse('auth_service:logout-api')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json', HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value)

        # Attempt to refresh token after logging out
        url = reverse('auth_service:token-api')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json', HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {"detail": "Token is blacklisted", "code": "token_not_valid"})

    def test_logout_missing_refresh_token(self):
        """
        Ensure error response for missing refresh token
        """
        self.client.cookies.pop('refreshtoken', None)
        url = reverse('auth_service:logout-api')
        data = {}
        response = self.client.post(url, data, format='json', HTTP_X_CSRFTOKEN=self.client.cookies['csrftoken'].value)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "Missing refresh token"})
