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


class LoginTests(APITestCase):

    def setUp(self):
        """
        Runs before every test to register a user in the db
        """
        self.username = 'bcurley'
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('register')
        data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "password2": self.password
        }
        self.client.post(url, data, format='json')

    def test_login_existing_user(self):
        """
        Ensure we can authenticate an existing user
        """
        self.username = 'bcurley'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('login')
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('type', response.data)
        self.assertIn('expires_in', response.data)

    def test_login_non_user(self):
        """
        Ensure we get an error when attempting to
        authenticate a non-existent user
        """
        self.username = 'bcurley2'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('login')
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {"non_field_errors": ["User does not exist"]}
        )

    def test_login_missing_username(self):
        """
        Ensure we get an error when attempting to
        authenticate with a missing username
        """
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('login')
        data = {
            "password": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {"username": ["This field is required."]}
        )

    def test_login_missing_password(self):
        """
        Ensure we get an error when attempting to
        authenticate with a missing password
        """
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('login')
        data = {
            "username": self.username
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {"password": ["This field is required."]}
        )
