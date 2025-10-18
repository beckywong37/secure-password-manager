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
"""

import secrets
import string

def generate_password(length=15, uppercase=False, lowercase=False, numbers=False, special=False):
        """Generate a secure password based on user defined criteria.
        Default length is 15 characters per NIST guidelines"""
        # Enforce min length to 8 characters per NIST guidelines
        if length <= 8:
            length = 8
        
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
