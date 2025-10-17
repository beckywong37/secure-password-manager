"""
Auth Service Serializers

This module provides serializers for user registration and login,
handling vault key and auth key derivation for secure authentication.

References:
    - Django REST framework serializers documentation:
    https://www.django-rest-framework.org/api-guide/serializers/

    - Django authentication documentation:
    https://docs.djangoproject.com/en/5.2/topics/auth/customizing/#django.contrib.auth
"""

from typing import Any, Dict
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import AbstractUser
from auth_service.utils import derive_vault_key, derive_auth_key, is_auth_key_match


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new user

    Handles:
        - Validate passwords
        - Derive vault/auth keys
        - Create and returning a new User instance
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'auth_key')

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensure both password fields match

        Raises:
            - serializers.ValidationError: Password fields don't match
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> AbstractUser:
        """"
        Create and save a new user with a derived auth key

        Handles:
            - Extract credentials from validated_data
            - Derive determinstic 256 bit AES auth and vault keys using PBKDF2
            - Create a new User instance with the derived auth key

        Receives:
            - validated_data (dict): Validated registration data

        Returns:
            - User: New User instance created in registration
        """
        username = validated_data['username']
        email = validated_data['email']
        master_password = validated_data['password']

        # Derive vault key and auth key
        vault_key = derive_vault_key(email, master_password)
        auth_key = derive_auth_key(vault_key, master_password)

        # Create user with auth key
        user = User.objects.create(
            username=username,
            email=email,
            auth_key=auth_key.hex()
        )
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for authenticating an existing user

    Handles:
        - Validating user credentials against stored auth key
        - Deriving and comparing deterministic keys
    """
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate user credentials by comparing derived and stored auth keys

        Raises:
            - serializers.ValidationError:
                - If the user doesn't exist
                - If the the provided credentials are invalid

        Returns:
            - attrs(dict): Validated data with the authenticated User instance
        """
        username = attrs.get('username')
        master_password = attrs.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError('User does not exist')

        # Derive the auth key and compared with the stored auth key
        vault_key = derive_vault_key(user.email, master_password)
        auth_key = derive_auth_key(vault_key, master_password)

        if not is_auth_key_match(user.auth_key, auth_key):
            raise serializers.ValidationError('Invalid username or password.')

        attrs['user'] = user

        return attrs
