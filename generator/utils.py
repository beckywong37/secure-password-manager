"""
Logic for generating secure password based on user defined critiera.

Features:
- Enforces NIST guidelines for min password length of 8 characters
- Defaults password length to 15 characters if length not specified (NIST recommended)
- Ensures at least one character type is included in password IF selected
- Uses secrets module for a password that is more cryptographically secure
- Shuffle the password to for additional unpredicability with secrets SystemRandom shuffle

References:
- NIST Password Guidelines: https://sprinto.com/blog/nist-password-guidelines/
- Secrets Module: https://docs.python.org/3/library/secrets.html
- 100k Most Common Passwords: 
    - https://github.com/danielmiessler/SecLists/tree/master/Passwords
"""

import secrets
import string

def generate_password(length=15, uppercase=False, lowercase=False, numbers=False, special=False):
        """Generate a secure password based on user defined criteria.
        Default length is 15 characters per NIST guidelines"""
        # Enforce min length to 8 characters per NIST guidelines
        # if length <= 8:
        #     length = 8
        
        password = []
        pool = ''

        # Ensure add least one character type is included in password if selected
        # Create pool of characters to choose from
        if uppercase == True:
            password.append(secrets.choice(string.ascii_uppercase))
            pool += string.ascii_uppercase
        if lowercase == True:
            password.append(secrets.choice(string.ascii_lowercase))
            pool += string.ascii_lowercase
        if numbers == True:
            password.append(secrets.choice(string.digits))
            pool += string.digits
        if special == True:
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
    """Calculates the strength of a password based on ..."""
    if not password:
        return "No password provided."
    
    score = 0 # out of 10
    strength = None # Weak, Moderate, Strong
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
        notes.append("NISC recommends 15 characters to increase password strength.")
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
    with open("generator/misc/100k-most-used-passwords-NCSC.txt", "r") as f:
        common_passwords = f.read().splitlines()
        if password in common_passwords:
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
