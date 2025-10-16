"""
Auth Service Login Tests

This module provides tests for auth service utils.
"""

from django.test import TestCase
from auth_service.utils import (
    _to_bytes,
    derive_vault_key,
    derive_auth_key,
    is_auth_key_match
)


class UtilsTests(TestCase):

    def test_to_bytes_converts_string_to_bytes(self):
        """Ensure helper function converts string input to bytes"""
        value = _to_bytes("This is a string")
        self.assertIsInstance(value, bytes)

    def test_to_bytes_leaves_bytes_input_as_bytes(self):
        """Ensure helper function keeps bytes input as bytes"""
        value = _to_bytes(b"This is bytes")
        self.assertIsInstance(value, bytes)

    def test_derived_vault_key_length(self):
        """Ensure derived vault key is returned as 32 bytes"""
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        vault_key = derive_vault_key(self.email, self.password)

        self.assertIsInstance(vault_key, bytes)
        self.assertEqual(len(vault_key), 32)

    def test_derived_vault_key_handles_bytes_inputs(self):
        """Ensure vault key derivation handled bytes inputs"""
        self.email = b'curleyr@oregonstate.edu'
        self.password = b'ThisIsMyStrongPassword123'

        vault_key = derive_vault_key(self.email, self.password)

        self.assertIsInstance(vault_key, bytes)
        self.assertEqual(len(vault_key), 32)

    def test_derived_vault_key_is_deterministic(self):
        """Ensure derived vault key is deterministic with same inputs"""
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        vault_key_1 = derive_vault_key(self.email, self.password)
        vault_key_2 = derive_vault_key(self.email, self.password)

        self.assertEqual(vault_key_1, vault_key_2)

    def test_derived_vault_key_changes_with_different_inputs(self):
        """Ensure derived vault key changes with different inputs"""
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'
        self.password2 = 'ThisIsMyStrongPassword1234'

        vault_key_1 = derive_vault_key(self.email, self.password)
        vault_key_2 = derive_vault_key(self.email, self.password2)

        self.assertNotEqual(vault_key_1, vault_key_2)

    def test_derived_auth_key_length(self):
        """Ensure derived auth key is returned as 32 bytes"""
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        vault_key = derive_vault_key(self.email, self.password)
        auth_key = derive_auth_key(vault_key, self.password)

        self.assertIsInstance(auth_key, bytes)
        self.assertEqual(len(auth_key), 32)

    def test_derived_auth_key_handles_bytes_inputs(self):
        """Ensure auth key derivation handles bytes inputs"""
        self.email = b'curleyr@oregonstate.edu'
        self.password = b'ThisIsMyStrongPassword123'

        vault_key = derive_vault_key(self.email, self.password)
        auth_key = derive_auth_key(vault_key, self.password)

        self.assertIsInstance(auth_key, bytes)
        self.assertEqual(len(auth_key), 32)

    def test_derived_auth_key_handles_string_inputs(self):
        """Ensure auth key derivation handles bytes inputs"""
        self.email = b'curleyr@oregonstate.edu'
        self.password = b'ThisIsMyStrongPassword123'

        vault_key = derive_vault_key(self.email, self.password).hex()
        auth_key = derive_auth_key(vault_key, self.password)

        self.assertIsInstance(auth_key, bytes)
        self.assertEqual(len(auth_key), 32)

    def test_derived_auth_key_is_deterministic(self):
        """Ensure derived auth key is deterministic with same inputs"""
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        vault_key = derive_vault_key(self.email, self.password)
        auth_key_1 = derive_auth_key(vault_key, self.password)
        auth_key_2 = derive_auth_key(vault_key, self.password)

        self.assertEqual(auth_key_1, auth_key_2)

    def test_derived_auth_key_changes_with_different_inputs(self):
        """Ensure derived auth key changes with different inputs"""
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'
        self.password2 = 'ThisIsMyStrongPassword1234'

        vault_key_1 = derive_vault_key(self.email, self.password)
        auth_key_1 = derive_auth_key(vault_key_1, self.password)

        vault_key_2 = derive_vault_key(self.email, self.password2)
        auth_key_2 = derive_auth_key(vault_key_2, self.password2)

        self.assertNotEqual(auth_key_1, auth_key_2)

    def test_is_auth_key_match_returns_true_on_match(self):
        """Ensure auth key matches returns true"""
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        vault_key = derive_vault_key(self.email, self.password)
        auth_key_1 = derive_auth_key(vault_key, self.password)
        auth_key_2 = derive_auth_key(vault_key, self.password)

        self.assertTrue(is_auth_key_match(auth_key_1, auth_key_2))

    def test_is_auth_key_match_returns_false_on_mismatch(self):
        """Ensure auth key mismatches returns false"""
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'
        self.password2 = 'ThisIsMyStrongPassword1234'

        vault_key_1 = derive_vault_key(self.email, self.password)
        auth_key_1 = derive_auth_key(vault_key_1, self.password)

        vault_key_2 = derive_vault_key(self.email, self.password2)
        auth_key_2 = derive_auth_key(vault_key_2, self.password2)

        self.assertFalse(is_auth_key_match(auth_key_1, auth_key_2))

    def test_is_auth_key_match_handles_mismatches_input_types(self):
        """
        Ensure auth key matching check handles
        mismatched string and bytes inputs
        """
        self.email = 'curleyr@oregonstate.edu'
        self.password = 'ThisIsMyStrongPassword123'

        vault_key = derive_vault_key(self.email, self.password)
        auth_key_1 = derive_auth_key(vault_key, self.password).hex()
        auth_key_2 = derive_auth_key(vault_key, self.password)

        self.assertTrue(is_auth_key_match(auth_key_1, auth_key_2))
