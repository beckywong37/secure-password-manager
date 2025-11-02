"""
Auth Service Login Tests

This module provides tests for auth service register endpoint.

References:
    - Django REST framework testing documentation:
    https://www.django-rest-framework.org/api-guide/testing/
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterTests(APITestCase):

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

    def tearDown(self):
        """
        Runs after every test to clear cookies and ensure
        no tokens persist between requests.
        """
        self.client.cookies.clear()

    def test_user_mode_str_returns_username(self):
        """
        Ensure the __str__ method of the User model returns the username.
        """
        user = User.objects.create_user(
            username='bcurley2',
            email='curleyr@oregonstate.edu',
            password='ThisIsMyStrongPassword123'
        )

        self.assertEqual(str(user), 'bcurley2')

    def test_register_new_user(self):
        """
        Ensure we can register a new user
        """
        self.username = 'bcurley2'
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:register-api')
        data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "password2": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)
        self.assertIn('message', response.data)
        self.assertTrue(User.objects.filter(username='bcurley2').exists())
        self.assertTrue(response.cookies.get('mfa-setup-token'))

    def test_register_duplicate_user(self):
        """
        Ensure we get an error when attempting to register a duplicate user
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
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_register_mismatched_passwords(self):
        """
        Ensure we get an error when attempting to register
        with mismatching passwords
        """
        self.username = 'bcurley2'
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'
        self.password2 = 'ThisIsMyStrongPassword1234'

        url = reverse('auth_service:register-api')
        data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "password2": self.password2
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_register_missing_username(self):
        """
        Ensure we get an error when attempting to register
        with a missing username
        """
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:register-api')
        data = {
            "email": self.email,
            "password": self.password,
            "password2": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('username', response.data['error'])

    def test_register_missing_email(self):
        """
        Ensure we get an error when attempting to register with a missing email
        """
        self.username = 'bcurley2'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:register-api')
        data = {
            "username": self.username,
            "password": self.password,
            "password2": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertIn('error', response.data)
        self.assertIn('email', response.data['error'])

    def test_register_missing_password(self):
        """
        Ensure we get an error when attempting to register
        with a missing password
        """
        self.username = 'bcurley2'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:register-api')
        data = {
            "username": self.username,
            "email": self.email,
            "password2": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertIn('error', response.data)
        self.assertIn('password', response.data['error'])

    def test_register_missing_password2(self):
        """
        Ensure we get an error when attempting to register with
        a missing password2 (password re-entry)
        """
        self.username = 'bcurley2'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:register-api')
        data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
        }
        response = self.client.post(url, data, format='json')
        self.assertIn('error', response.data)
        self.assertIn('password2', response.data['error'])

    def test_register_invalid_email(self):
        """
        Ensure we get an error when attempting to register with an inalid email
        """
        self.username = 'bcurley2'
        self.email = 'curleyroregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        url = reverse('auth_service:register-api')
        data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "password2": self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertIn('error', response.data)
        self.assertIn('email', response.data['error'])
