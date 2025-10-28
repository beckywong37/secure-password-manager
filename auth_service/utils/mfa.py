"""
Auth Service TOTP MFA Utility Functions

This module provides helper functions for handling signed tokens used
in the MFA (Multi-Factor Authentication) flow. These short-lived tokens
are stored in HTTP-only cookies to securely maintain state between
registration/login, MFA setup, and MFA verification steps.

Handles:
    - Creating signed tokens using Django's SECRET_KEY
    - Validating signed tokens and enforcing short expiration windows

References:
    - Django signing framework documentation:
      https://docs.djangoproject.com/en/5.2/topics/signing/
"""

from django.core.signing import dumps, loads, BadSignature, SignatureExpired


def create_signed_token(data: dict, salt: str) -> str:
    """
    Create a signed token using Django's SECRET_KEY.

    Handles:
        - Serializes and cryptographically signs the given data using Django's signing utilities.
        - Adds a salt value for token namespace separation (e.g., different salts for MFA setup and verification).

    Receives:
        - data (dict): Data payload to encode (e.g., {'user_id': 1})
        - salt (str): Unique salt used to differentiate signing contexts

    Returns:
        - str: Base64-encoded signed token string
    """
    return dumps(data, salt=salt)


def validate_signed_token(token: str, salt: str, max_age: int) -> dict:
    """
    Validate and decode a signed token and ensure it is authentic and hasn't expired.

    Handles:
        - Verifies the cryptographic signature using Django's SECRET_KEY.
        - Enforces expiration via the max_age parameter (in seconds).
        - Raises appropriate errors for invalid or expired tokens.

    Receives:
        - token (str): Signed token string from cookie or header
        - salt (str): Salt used during token creation
        - max_age (int): Token validity duration in seconds

    Returns:
        - dict: Original data payload contained in the token

    Raises:
        - ValueError: If token is invalid, tampered, or expired
    """
    try:
        return loads(token, salt=salt, max_age=max_age)
    except SignatureExpired:
        raise ValueError("Token expired")
    except BadSignature:
        raise ValueError("Invalid token")
