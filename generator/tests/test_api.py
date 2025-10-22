"""
Password Generator API Call Tests

This module contains tests for the password generator API endpoint

References:
- https://www.django-rest-framework.org/api-guide/testing/

To run test locally: python manage.py test generator.tests
"""

from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse

class APITests(TestCase):
    def setUp(self):
        """Runs before each test to set up API client"""
        self.client = APIClient()

    def test_generate_password_api(self):
        """Tests password generation via API call with all characters enabled.
        Length is custom set to 20 characters"""
        url = reverse('password_generator_api')
        data = {
            'length': 20,
            'uppercase': True,
            'lowercase': True,
            'numbers': True,
            'special': True,
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('password', response.data)
        self.assertEqual(len(response.data['password']), 20)


    def test_default_options_api(self):
        """Tests password generation via API call with default options.
        Default length is 15, everything else set to False"""
        url = reverse('password_generator_api')
        data = {}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('password', response.data)
        self.assertEqual(response.data['password'], 'Check at least one option!')