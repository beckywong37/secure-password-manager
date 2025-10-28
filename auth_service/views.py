"""
Auth Service Views

This module provides API views for user registration/login,
and MFA setup/verification, handling JWT token issance and refresh.

References:
    - Django REST framework documentation:
    https://www.django-rest-framework.org

    - Django REST framework Simple JTW documentation:
    https://django-rest-framework-simplejwt.readthedocs.io/en/latest/
"""
from rest_framework import serializers
from rest_framework import status, generics
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from auth_service.serializers import RegisterSerializer, LoginSerializer, MFASetupSerializer, MFAVerifySerializer
from django.views.generic import TemplateView
from django.contrib.auth import get_user_model
from two_factor.utils import default_device
from auth_service.utils.mfa import create_signed_token


User = get_user_model()


# API Views
class RegisterView(generics.CreateAPIView):
    """
    API endpoint for registering a new user.

    Inherits from DRF's CreateAPIView for POST method handling to
    create a new User model instance using RegisterSerializer.

    Handles:
        - User registration and account creation
        - Derivation of vault/auth keys via serializer logic
        - Issuance of short-lived HTTP-only cookie for MFA setup

    Permissions:
        - AllowAny: Anyone can call the endpoint without authtication
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        """
        Handle user registration and initialize MFA setup token.

        Raises:
            serializers.ValidationError: If serializer validation fails.

        Returns:
            Response: HTTP 201 with user registration details and
            short-lived MFA setup token cookie.
        """
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        # Set short lived HTTP-only cookie for MFA flow
        setup_token = create_signed_token(data={'user_id': user.id}, salt='mfa-setup')
        response = Response(serializer.data, status=status.HTTP_201_CREATED)
        response.set_cookie(
            'mfa-setup-token',
            setup_token,
            max_age=300,
            httponly=True,
            samesite='Strict'
        )

        return response


class LoginView(generics.CreateAPIView):
    """
    API endpoint for authenticating an existing user.

    Inherits from DRF's CreateAPIView for POST method handling to
    authenticate an existing user using LoginSerializer.

    Handles:
        - Credential validation using deterministic key comparison
        - MFA status detection and flow initiation
        - Generation of short-lived signed cookies for MFA setup/verification

    Permissions:
        - AllowAny: Anyone can call the endpoint without authentication
    """
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        """
        Authenticate user and determine MFA state (setup or verification).

        Raises:
            serializers.ValidationError: If credentials are invalid.

        Returns:
            - Response:
                - 200 OK: User requires MFA verification.
                - 403 Forbidden: MFA setup required.
                Includes a signed short-lived cookie for the next step.
        """
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']

        # Check if user has a confirmed TOTP device
        device = default_device(user)

        if device:
            # MFA verification required
            response = Response(serializer.data, status=status.HTTP_200_OK)
            response.data.update({
                "is_mfa_setup": True,
                "message": "MFA configured. Proceed to verification."
            })
            mfa_token_salt, cookie_name = 'mfa-verify', 'mfa-verify-token'

        else:
            # MFA setup required
            response = Response(serializer.data, status=status.HTTP_403_FORBIDDEN)
            response.data.update({
                "is_mfa_setup": False,
                "message": "MFA setup required. Proceed to enrollment."
            })
            mfa_token_salt, cookie_name = 'mfa-setup', 'mfa-setup-token'

        # Set short lived HTTP-only cookie for MFA flow
        mfa_token = create_signed_token(data={'user_id': user.id}, salt=mfa_token_salt)
        response.set_cookie(
            cookie_name,
            mfa_token,
            max_age=300,
            httponly=True,
            samesite='Strict'
        )

        return response


class MFASetupView(generics.CreateAPIView):
    """
    API endpoint for initializing MFA setup (TOTP device and QR generation).

    Handles:
        - Validation of short-lived MFA setup token from cookie
        - Creation/reset of TOTP device
        - QR code generation for user enrollment in authenticator app

    Permissions:
        - AllowAny: MFA setup can be performed by any user post-registration
    """
    serializer_class = MFASetupSerializer
    permission_classes = [AllowAny]

    def get(self, request: Request, *args, **kwargs):
        """
        Validate MFA setup token, create TOTP device, and return QR code.

        Raises:
            - serializers.ValidationError: If token is missing or invalid.

        Returns:
            - Response:
                - 200 OK: Base64-encoded QR code for MFA enrollment.
                - Sets 'mfa-verify-token' cookie for subsequent verification.
        """
        # Get token from cookie
        mfa_token = request.COOKIES.get('mfa-setup-token')
        if not mfa_token:
            return Response({"error": "Missing MFA token."}, status=400)

        # Prepare data and send to serializer
        data = {'mfa_token': mfa_token}
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.save()

        # Successful qr code retrieval for setup
        response = Response({"qr_code": data['qr_code']}, status=status.HTTP_200_OK)
        response.set_cookie(
            'mfa-verify-token',
            data['mfa_token'],
            max_age=300,
            httponly=True,
            samesite='Strict'
        )

        return response


class MFAVerifyView(generics.CreateAPIView):
    """
    API endpoint for verifying MFA codes (TOTP) and issuing JWT tokens.

    Handles:
        - Validation of MFA verification token from cookie
        - Verification of the user's TOTP code
        - JWT access/refresh token issuance after successful verification

    Permissions:
        - AllowAny: Allows unauthenticated requests with valid MFA tokens
    """
    serializer_class = MFAVerifySerializer
    permission_classes = [AllowAny]

    def post(self, request: Request, *args, **kwargs) -> Response:
        """
        Verify the submitted TOTP code and issue JWT tokens upon success.

        Raises:
            - serializers.ValidationError: If token is missing, expired, or code invalid.

        Returns:
            - Response:
                - 200 OK: JWT access and refresh tokens on successful verification.
                - 400 Bad Request: Invalid or missing MFA code/token.
        """
        # Get token from cookie
        mfa_token = request.COOKIES.get('mfa-verify-token')
        if not mfa_token:
            return Response({"error": "Missing MFA token."}, status=status.HTTP_400_BAD_REQUEST)

        # Prepare data and send to serializer
        data = {
            'mfa_token': mfa_token,
            'mfa_code': request.data.get('mfa_code')
        }
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)

        # Successful validation
        jwt_tokens = serializer.save()
        return Response(jwt_tokens, status=status.HTTP_200_OK)


# Template Views
# TODO:
# Similar to comment in urls.py. These are to support the current auth_service templates that were created primarily
# for local testing. Once the frontend integration is complete, these can be removed.
class RegisterPageView(TemplateView):
    """Render registration page for local UI testing."""
    template_name = 'auth_service/register.html'


class LoginPageView(TemplateView):
    """Render login page for local UI testing."""
    template_name = 'auth_service/login.html'


class MFASetupPageView(TemplateView):
    """Render MFA setup page for local UI testing."""
    template_name = 'auth_service/mfa_setup.html'


class MFAVerifyPageView(TemplateView):
    """Render MFA verification page for local UI testing."""
    template_name = 'auth_service/mfa_verify.html'
