"""
Password Generator Utils Tests

This module contains tests for the password generator utils

References:
- https://www.django-rest-framework.org/api-guide/testing/

To run test locally: python manage.py test generator.tests
"""

from django.test import TestCase
from generator.utils import generate_password, password_strength, SPECIAL_CHAR


class PasswordGeneratorTest(TestCase):
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
        """
        password = generate_password(length=7, uppercase=True)
        self.assertEqual(len(password), 7)

    def test_includes_symbols(self):
        """Generates password including special characters"""
        password = generate_password(length=17, special=True)
        self.assertTrue(any(character in SPECIAL_CHAR for character in password))
        self.assertEqual(len(password), 17)


class PasswordStrengthTest(TestCase):
    def test_strong_password(self):
        """Tests a strong password"""
        password = generate_password(15, True, True, True, True)
        data = password_strength(password)
        self.assertEqual(data['notes'], [])
        self.assertEqual(data['strength'], "Strong")
        self.assertEqual(data['score'], 10)

    def test_moderate_password(self):
        """Tests a moderate password"""
        password = generate_password(8, True, True, False, False)
        data = password_strength(password)
        self.assertEqual(data['strength'], "Moderate")
        self.assertEqual(data['score'], 7)
        self.assertIn("NIST recommends 15 characters to increase password strength.", data['notes'])
        self.assertIn("Password does not contain numbers.", data['notes'])
        self.assertIn("Password does not contain special characters.", data['notes'])

    def test_weak_password(self):
        """Tests a weak password"""
        password = generate_password(6, False, True, False, False)
        data = password_strength(password)
        self.assertEqual(data['strength'], "Weak")
        self.assertEqual(data['score'], 5)
        self.assertIn("Password length is less than 8 characters.", data['notes'])
        self.assertIn("NIST recommends 15 characters to increase password strength.", data['notes'])
        self.assertIn("Password does not contain uppercase letters.", data['notes'])
        self.assertIn("Password does not contain numbers.", data['notes'])
        self.assertIn("Password does not contain special characters.", data['notes'])

    def test_common_password(self):
        """Tests a common password"""
        password = "password1"
        data = password_strength(password)
        self.assertEqual(data['strength'], "Weak")
        self.assertEqual(data['score'], 3)
        self.assertIn("Password is found in common passwords list.", data['notes'])

    def test_no_password(self):
        """Tests an empty password"""
        password = ""
        data = password_strength(password)
        self.assertEqual("No password provided.", data)
