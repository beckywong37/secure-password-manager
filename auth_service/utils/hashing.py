"""
Auth Service Hashing Utility Functions

This module provides helper functions for deterministic key derivation
and secure comparison operations used throughout the authentication flow.
These are used to derive AES-compatible keys for both vault encryption
and authentication verification.

Handles:
    - Converting string inputs to bytes for cryptographic functions
    - Deriving 256-bit AES keys using PBKDF2-HMAC-SHA256
    - Securely comparing derived authentication keys

References:
    - Python hashlib.pbkdf2_hmac documentation:
    https://docs.python.org/3/library/hashlib.html#hashlib.pbkdf2_hmac

    - Python hmac.compare_digest documentaiton:
    https://docs.python.org/3/library/hmac.html#hmac.compare_digest
"""

import hashlib
import hmac


def _to_bytes(value: str | bytes) -> bytes:
    """
    Helper to ensure input values are safely converted to bytes.

    Handles:
        - String encoding using UTF-8 when input is a str.
        - Returns input as-is if already in bytes.

    Receives:
        - value (str | bytes): Input value to normalize

    Returns:
        - bytes: UTF-8 encoded byte sequence
    """
    return value if isinstance(value, bytes) else value.encode('utf-8')


def derive_vault_key(email: str | bytes, master_password: str | bytes) -> bytes:
    """
    Derive a deterministic 256-bit (32-byte) AES vault key.

    Handles:
        - Uses PBKDF2-HMAC-SHA256 to derive a cryptographic key
          from the master password, salted with the user's email.
        - Performs 100,000 iterations to resist brute-force attacks.

    Receives:
        - email (str | bytes): Email address to serve as a unique salt
        - master_password (str | bytes): User's master password

    Returns:
        - bytes: 32-byte derived vault key suitable for AES encryption
    """
    return hashlib.pbkdf2_hmac('sha256', _to_bytes(master_password), _to_bytes(email), 100000, 32)


def derive_auth_key(vault_key: str | bytes, master_password: str | bytes) -> bytes:
    """
    Derive a deterministic 256-bit (32-byte) AES authentication key.

    Handles:
        - Uses PBKDF2-HMAC-SHA256 to derive a secondary key
          from the vault key and master password.
        - Performs 100,000 iterations to resist brute-force attacks.

    Receives:
        - vault_key (str | bytes): Previously derived vault key
        - master_password (str | bytes): User's master password

    Returns:
        - bytes: 32-byte derived authentication key
    """
    return hashlib.pbkdf2_hmac('sha256', _to_bytes(vault_key), _to_bytes(master_password), 100000, 32)


def is_auth_key_match(stored_auth_key: str | bytes, derived_auth_key: str | bytes) -> bool:
    """
    Securely compare the stored authentication key with the derived one.

    Handles:
        - Converts both inputs to bytes if provided as hex strings.
        - Uses `hmac.compare_digest` to avoid timing attacks.

    Receives:
        - stored_auth_key (str | bytes): Auth key retrieved from the database
        - derived_auth_key (str | bytes): Auth key derived during login

    Returns:
        - bool: True if both keys match, False otherwise
    """
    stored_auth_key = bytes.fromhex(stored_auth_key) if isinstance(stored_auth_key, str) else stored_auth_key
    derived_auth_key = bytes.fromhex(derived_auth_key) if isinstance(derived_auth_key, str) else derived_auth_key

    return hmac.compare_digest(stored_auth_key, derived_auth_key)
