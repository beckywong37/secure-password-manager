"""
Auth Service Utility Functions

This module provides utility functions for string to bytes conversions
and also deterministic vault/auth key derivation and comparison.

References:
    - Python hashlib.pbkdf2_hmac documentation:
    https://docs.python.org/3/library/hashlib.html#hashlib.pbkdf2_hmac

    - Python hmac.compare_digest documentaiton:
    https://docs.python.org/3/library/hmac.html#hmac.compare_digest
"""

import hashlib
import hmac


def _to_bytes(value: str | bytes) -> bytes:
    """Helper to ensure value is in bytes"""
    return value if isinstance(value, bytes) else value.encode('utf-8')


def derive_vault_key(email: str | bytes, master_password: str | bytes) -> bytes:
    """
    Derive a 256-bit (32 byte) AES vault key by hashing/salting
    the master password with the email address.
    Performs 100,000 iterations using PBKDF2 HMAC SHA256.
    """
    return hashlib.pbkdf2_hmac('sha256', _to_bytes(master_password), _to_bytes(email), 100000, 32)


def derive_auth_key(vault_key: str | bytes, master_password: str | bytes) -> bytes:
    """
    Derive a 256-bit (32 byte) AES auth key by hashing/salting
    the vault key with the master password.
    Performs 100,000 iterations using PBKDF2 HMAC SHA256.
    """
    return hashlib.pbkdf2_hmac('sha256', _to_bytes(vault_key), _to_bytes(master_password), 100000, 32)


def is_auth_key_match(stored_auth_key: str | bytes, derived_auth_key: str | bytes) -> bool:
    """Compare stored and derived auth keys"""
    stored_auth_key = bytes.fromhex(stored_auth_key) if isinstance(stored_auth_key, str) else stored_auth_key
    derived_auth_key = bytes.fromhex(derived_auth_key) if isinstance(derived_auth_key, str) else derived_auth_key

    return hmac.compare_digest(stored_auth_key, derived_auth_key)
