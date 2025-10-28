"""
Auth Service Login Tests

This module provides tests for auth service login endpoint.

References:
    - Django REST framework testing documentation:
    https://www.django-rest-framework.org/api-guide/testing/
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice

User = get_user_model()


class LoginTests(APITestCase):

    def setUp(self):
        """
        Runs before every test to register a user in the db
        """
        self.username = 'bcurley'
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:register-api')
        data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "password2": self.password
        }
        self.client.post(url, data, format='json')

    def test_login_existing_user_without_mfa(self):
        """
        Ensure login returns 403 when MFA is not yet configured.
        The response should include a short-lived MFA setup token.
        """
        self.username = 'bcurley'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:login-api')
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(response.cookies.get('mfa-setup-token'))
        self.assertIn('is_mfa_setup', response.data)
        self.assertFalse(response.data['is_mfa_setup'])
        self.assertIn('message', response.data)

    def test_login_existing_user_with_mfa(self):
        """
        Ensure login returns 200 when MFA is configured
        and provides a short-lived MFA verify token.
        """
        self.username = 'bcurley'
        self.password = 'ThisIsMyStrongPassword123'

        self.user = User.objects.get(username=self.username)
        TOTPDevice.objects.create(user=self.user, name='default', confirmed=True)

        url = reverse('auth_service:login-api')
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.cookies.get('mfa-verify-token'))
        self.assertIn('is_mfa_setup', response.data)
        self.assertTrue(response.data['is_mfa_setup'])
        self.assertIn('message', response.data)

    def test_login_invalid_password(self):
        """
        Ensure we get an error when attempting to
        authenticate with an invalid password
        """
        self.username = 'bcurley'
        self.password = 'ThisIsMyStrongPassword12'

        url = reverse('auth_service:login-api')
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_login_non_user(self):
        """
        Ensure we get an error when attempting to
        authenticate a non-existent user
        """
        self.username = 'bcurley2'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:login-api')
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_login_missing_username(self):
        """
        Ensure we get an error when attempting to
        authenticate with a missing username
        """
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:login-api')
        data = {
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('username', response.data['error'])

    def test_login_missing_password(self):
        """
        Ensure we get an error when attempting to
        authenticate with a missing password
        """
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:login-api')
        data = {
            "username": self.username
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('password', response.data['error'])
