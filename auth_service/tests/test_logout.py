"""
Auth Service Login Tests

This module provides tests for auth service logout endpoint.

References:
    - Django REST framework testing documentation: https://www.django-rest-framework.org/api-guide/testing/
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class LogoutTests(APITestCase):

    def setUp(self):
        """
        Runs before every test to register and authenticate a user
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

    def test_logout_valid_token(self):
        url = reverse('logout')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempt to refresh token after logging out
        url = reverse('token')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {"detail": "Token is blacklisted", "code": "token_not_valid"})

    def test_logout_invalid_token(self):
        url = reverse('logout')
        data = {
            "refresh": "This is an invalid token"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {"detail": "Token is invalid", "code": "token_not_valid"})

    def test_logout_blacklisted_token(self):
        url = reverse('logout')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json')

        # Attempt to refresh token after logging out (token has been blacklisted)
        url = reverse('token')
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {"detail": "Token is blacklisted", "code": "token_not_valid"})