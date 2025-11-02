"""
Auth Service MFA Utils Tests

This module provides unit tests for auth_service.utils.mfa.
"""

import time
from django.test import TestCase
from auth_service.utils.mfa import create_signed_token, validate_signed_token


class MFAUtilsTests(TestCase):

    def setUp(self):
        """
        Runs before every test to set up reusable data
        """
        self.data = {"user_id": 123}
        self.salt = 'mfa-test-salt'

    def test_create_signed_token_returns_string(self):
        """Ensure create_signed_token returns a string token."""
        token = create_signed_token(self.data, self.salt)
        self.assertIsInstance(token, str)
        self.assertGreater(len(token), 0)

    def test_create_signed_token_is_deterministic_with_same_inputs(self):
        """Ensure token creation is deterministic given same data and salt."""
        token_1 = create_signed_token(self.data, self.salt)
        token_2 = create_signed_token(self.data, self.salt)
        self.assertEqual(token_1, token_2)

    def test_create_signed_token_changes_with_different_salt(self):
        """Ensure token changes when using a different salt."""
        token_1 = create_signed_token(self.data, 'salt-one')
        token_2 = create_signed_token(self.data, 'salt-two')
        self.assertNotEqual(token_1, token_2)

    def test_validate_signed_token_returns_original_data(self):
        """Ensure validate_signed_token returns the original data."""
        token = create_signed_token(self.data, self.salt)
        decoded = validate_signed_token(token, self.salt, max_age=10)
        self.assertEqual(decoded, self.data)

    def test_validate_signed_token_raises_for_invalid_token(self):
        """Ensure ValueError is raised for tampered or invalid tokens."""
        token = create_signed_token(self.data, self.salt)
        tampered_token = token + 'invalid'
        with self.assertRaises(ValueError) as ctx:
            validate_signed_token(tampered_token, self.salt, max_age=10)
        self.assertEqual(str(ctx.exception), 'Invalid token')

    def test_validate_signed_token_raises_for_expired_token(self):
        """Ensure ValueError is raised when token exceeds its max age."""
        token = create_signed_token(self.data, self.salt)
        # Short expiration for test
        time.sleep(1)
        with self.assertRaises(ValueError) as ctx:
            validate_signed_token(token, self.salt, max_age=0)
        self.assertEqual(str(ctx.exception), 'Token expired')

    def test_validate_signed_token_works_with_different_payloads(self):
        """Ensure different payloads can be encoded and validated independently."""
        payload_1 = {"user_id": 1}
        payload_2 = {"user_id": 2}

        token_1 = create_signed_token(payload_1, self.salt)
        token_2 = create_signed_token(payload_2, self.salt)

        decoded_1 = validate_signed_token(token_1, self.salt, max_age=10)
        decoded_2 = validate_signed_token(token_2, self.salt, max_age=10)

        self.assertEqual(decoded_1['user_id'], 1)
        self.assertEqual(decoded_2['user_id'], 2)
        self.assertNotEqual(decoded_1, decoded_2)
