"""
Password Generator: Generates secure password based on user defined critiera.

Features of Password Generator:
- User selections includes uppercase, lowercase, numbers, and/or special characters
- Default password length is 15 characters if length not specified by user (NIST recommended)
- Ensures at least one character type is included in password IF selected
- Uses secrets module for a password that is more cryptographically secure
- Shuffles the password for additional unpredicability with secrets SystemRandom shuffle

Password Strength Calculator: Calculates strength of password based on length, character types,
and uniqueness against a common passwords list.

Features of Password Strength Calculator:
- Scores password out of 10 based on length
- Scoring system:
    - Length: 1 point for 8+ characters, additional 1 point for 15+ characters
    - Character Types: 1 point each for uppercase, lowercase, numbers, special characters
    - Uniqueness: 4 points if not found in common passwords list.
- Provides notes on how to improve password strength

References:
- NIST Password Guidelines: https://sprinto.com/blog/nist-password-guidelines/
- Secrets Module: https://docs.python.org/3/library/secrets.html
- 100k Most Common Passwords:
    - https://github.com/danielmiessler/SecLists/tree/master/Passwords
"""

import secrets
import string
from django.conf import settings
import os
from generator.misc.common_passwords import COMMON_PASSWORDS
SPECIAL_CHAR = set('!@#$%^&*()-_=+[]{}|;:,.<>?/~')


def generate_password(length=15, uppercase=False, lowercase=False, numbers=False, special=False):
    """Generate a secure password based on user defined criteria.
    Default length is 15 characters per NIST guidelines"""
    password = []
    pool = ''

    # Ensure add least one character type is included in password if selected
    # Create pool of characters to choose from
    if uppercase is True:
        password.append(secrets.choice(string.ascii_uppercase))
        pool += string.ascii_uppercase
    if lowercase is True:
        password.append(secrets.choice(string.ascii_lowercase))
        pool += string.ascii_lowercase
    if numbers is True:
        password.append(secrets.choice(string.digits))
        pool += string.digits
    if special is True:
        password.append(secrets.choice(string.punctuation))
        pool += string.punctuation

    # Check pool is not empty
    if len(pool) != 0:
        length_left = length - len(password)
        # Generate remaining password using secrets
        for _ in range(length_left):
            password.append(secrets.choice(pool))
        # Shuffle password to ensure randomness
        secrets.SystemRandom().shuffle(password)
        password = ''.join(password)
    else:
        password = 'Check at least one option!'

    return password


def password_strength(password):
    """Calculates the strength of a password based on length, character types,
    and uniqueness against a common passwords list.
    Returns: Score, strength, and notes on how to improve password strength in dictionary format"""
    if not password:
        return "No password provided."
    score = 0
    strength = None
    notes = []
    length = len(password)
    contains_upper, contains_lower = False, False
    contains_number, contains_special = False, False

    for c in password:
        if c in string.ascii_uppercase:
            contains_upper = True
        elif c in string.ascii_lowercase:
            contains_lower = True
        elif c in string.digits:
            contains_number = True
        elif c in string.punctuation:
            contains_special = True

    # Scoring system for length and character types
    if length >= 8:
        score += 1
    else:
        notes.append("Password length is less than 8 characters.")
    if length >= 15:
        score += 1
    else:
        notes.append("NIST recommends 15 characters to increase password strength.")
    if contains_upper:
        score += 1
    else:
        notes.append("Password does not contain uppercase letters.")
    if contains_lower:
        score += 1
    else:
        notes.append("Password does not contain lowercase letters.")
    if contains_number:
        score += 1
    else:
        notes.append("Password does not contain numbers.")
    if contains_special:
        score += 1
    else:
        notes.append("Password does not contain special characters.")

    # Check uniquess against common passwords list
    file = os.path.join(settings.BASE_DIR, 'generator', 'misc', '100k-most-used-passwords-NCSC.txt')

    if not os.path.exists(file):
        raise FileNotFoundError(f"Common passwords file not found at: {file}")

    if password in COMMON_PASSWORDS:
        notes.append("Password is found in common passwords list.")
    else:
        score += 4

    # Total score
    if score == 10:
        strength = "Strong"
    elif 7 <= score < 10:
        strength = "Moderate"
    else:
        strength = "Weak"

    data = {
        "score": score,
        "strength": strength,
        "notes": notes
    }

    return data
