"""
Password Generator Utils Tests

This module contains tests for the password generator utils

References:
- https://www.django-rest-framework.org/api-guide/testing/

To run test locally: python manage.py test generator.tests
"""

from django.test import TestCase
from generator.utils import generate_password

class UtilsTests(TestCase):
    def test_only_characters(self):
        """Generates password containing only upper or lowercase characters
        Also checks default length is 15 characters.
        """
        password = generate_password(uppercase=True, lowercase=True)
        self.assertTrue(all(character.isalpha() for character in password))
        self.assertEqual(len(password), 15)

    def test_only_numbers(self):
        """Generates password containing only numbers
        Also checks custom length is 8 characters.
        """
        password = generate_password(length=8, numbers=True)
        self.assertTrue(all(character.isdigit() for character in password))
        self.assertEqual(len(password), 8)

    def test_length_below_min(self):
        """Generates password with length less than 8 characters
        Should default to minimum length of 8 characters.
        """
        password = generate_password(length=7, uppercase=True)
        self.assertEqual(len(password), 8)