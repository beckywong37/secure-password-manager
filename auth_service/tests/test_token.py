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
        url = reverse('register')
        data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "password2": self.password
        }
        self.client.post(url, data, format='json')

        # Authenticate user
        url = reverse('login')
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.refresh_token = response.data['refresh']

    def test_refresh_token_valid_token(self):
        """
        Ensure token is refreshed
        """
        # Use refresh token to obtain new token
        url = reverse('token')
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
        url = reverse('token')
        data = {
            "refresh": "invalid_refresh_token"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.data,
            {"detail": "Token is invalid", "code": "token_not_valid"}
        )

    def test_logout_refresh_token_blacklisted_token(self):
        # Use refresh token to logout (blacklists token)
        url = reverse('logout')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempt to refresh token with blacklisted token
        url = reverse('token')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.data,
            {"detail": "Token is blacklisted", "code": "token_not_valid"}
        )
