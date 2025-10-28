"""
Auth Service Serializers

This module provides serializers for user registration/login and MFA setup/verification,
handling vault key and auth key derivation for secure authentication.

References:
    - Django REST framework serializers documentation:
    https://www.django-rest-framework.org/api-guide/serializers/

    - Django authentication documentation:
    https://docs.djangoproject.com/en/5.2/topics/auth/customizing/#django.contrib.auth
"""

from typing import Any, Dict
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import AbstractUser
from django_otp.plugins.otp_totp.models import TOTPDevice
from auth_service.utils.hashing import derive_vault_key, derive_auth_key, is_auth_key_match
from auth_service.utils.mfa import create_signed_token, validate_signed_token
import qrcode
import io
import base64

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

    def to_representation(self, instance: AbstractUser) -> Dict[str, Any]:
        """
        Control what's returned when the user object is serialized.

        Returns:
            - dict: Serialized representation of the created user.
        """
        return {
            "username": instance.username,
            "email": instance.email,
            "message": "Registration successful. Proceed to MFA setup."
        }


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

        user = User.objects.filter(username=username).first()
        if not user:
            raise serializers.ValidationError('Invalid username or password')

        # Derive the auth key and compared with the stored auth key
        vault_key = derive_vault_key(user.email, master_password)
        auth_key = derive_auth_key(vault_key, master_password)

        if not is_auth_key_match(user.auth_key, auth_key):
            raise serializers.ValidationError('Invalid username or password.')

        attrs['user'] = user

        return attrs

    def to_representation(self, instance: AbstractUser) -> Dict[str, Any]:
        """
        Control what's returned when the user object is serialized.

        Returns:
            - dict: Serialized representation of the authenticated user.
        """
        user = instance.get('user', None) if isinstance(instance, dict) else instance
        return {
            "username": user.username,
            "email": user.email,
            "user_id": user.id
        }


class MFASetupSerializer(serializers.Serializer):
    """
    Serializer for initializing MFA setup.

    Handles:
        - Validating the setup token
        - Creating or resetting a TOTP device
        - Generating a QR code for use in an authenticator app
    """
    mfa_token = serializers.CharField(required=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate the MFA setup token and fetch the corresponding user.

        Raises:
            - serializers.ValidationError: If token is invalid or user is not found.

        Returns:
            - dict: Validated data containing user instance and ID.
        """
        mfa_token = attrs.get('mfa_token')

        # Validate signed token
        try:
            data = validate_signed_token(token=mfa_token, salt='mfa-setup', max_age=300)  # 5 min expiry
        except Exception:
            raise serializers.ValidationError({"mfa_token": "Invalid or expired MFA token."})
        attrs['user_id'] = data['user_id']

        try:
            user = User.objects.get(id=attrs['user_id'])
        except User.DoesNotExist:
            raise serializers.ValidationError({"user": "User not found"})

        attrs['user'] = user
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create or reset a TOTP device for the user and return a QR code.

        Receives:
            - validated_data (dict): Validated data including the user.

        Returns:
            - dict: Base64-encoded QR code image and MFA verify token.
        """
        user = validated_data['user']

        # Create or reset TOTP device
        device, _ = TOTPDevice.objects.get_or_create(user=user, name='default')
        device.confirmed = False
        device.save()

        # Generate QR code in memory
        buffer = io.BytesIO()   # Create an in-memory buffer
        qrcode.make(device.config_url).save(buffer, format='png')    # Save QR code image to memory
        qr_code = base64.b64encode(buffer.getvalue()).decode()    # Converts binary bytes to ASCII then into plain text

        # Create MFA verify token
        mfa_token = create_signed_token(data={'user_id': user.id}, salt='mfa-verify')

        return {
            "qr_code": f"data:image/png;base64,{qr_code}",
            "mfa_token": mfa_token
        }


class MFAVerifySerializer(serializers.Serializer):
    """
    Serializer for verifying an MFA code. Verification can occur after MFA setup during registration or during login.

    Handles:
        - Validating the signed MFA verification token
        - Checking the TOTP code from the authenticator app
        - Confirming the device and issuing JWT tokens
    """
    mfa_token = serializers.CharField(required=True)
    mfa_code = serializers.CharField(required=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate the MFA token and verify the provided TOTP code.

        Raises:
            - serializers.ValidationError:
                - If the MFA token is invalid or expired.
                - If the user does not exist.
                - If the TOTP code is invalid.

        Returns:
            dict: Validated data containing the user and device instances.
        """
        mfa_token = attrs.get('mfa_token')
        mfa_code = attrs.get('mfa_code')

        # Validate signed token
        try:
            data = validate_signed_token(token=mfa_token, salt='mfa-verify', max_age=300)  # 5 min expiry
        except Exception:
            raise serializers.ValidationError({"mfa_token": "Invalid or expired MFA token."})

        user_id = data.get('user_id')
        if not user_id:
            raise serializers.ValidationError({"mfa_token": "Invalid MFA token data."})

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({"user": "User not found."})

        device = TOTPDevice.objects.filter(user=user, name='default').first()
        if not device or not device.verify_token(mfa_code):
            raise serializers.ValidationError({"mfa_code": "Invalid MFA code."})

        attrs['user'] = user
        attrs['device'] = device
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Confirm the MFA device and issue JWT tokens for the authenticated user.

        Receives:
            - validated_data (dict): Validated data containing user and device.

        Returns:
            - dict: Dictionary containing access and refresh tokens.
        """
        user = validated_data['user']
        device = validated_data['device']

        # Confirm MFA device
        device.confirmed = True
        device.save()

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "type": "Bearer",
            "expires_in": 900
        }
