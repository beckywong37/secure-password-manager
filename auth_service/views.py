"""
Auth Service Views

This module provides API views for user registration/login,
and MFA setup/verification, handling JWT token issance and refresh.

References:
    - Django REST framework documentation:
    https://www.django-rest-framework.org

    - Django REST framework Simple JTW documentation:
    https://django-rest-framework-simplejwt.readthedocs.io/en/latest/

    - Decorating Class Based Views:
    https://docs.djangoproject.com/en/5.2/topics/class-based-views/intro/

    - CSRF Protection:
    https://docs.djangoproject.com/en/5.2/howto/csrf/
"""

from rest_framework import serializers
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken, TokenError
from auth_service.serializers import RegisterSerializer, LoginSerializer, MFASetupSerializer, MFAVerifySerializer
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_GET
from django.utils.decorators import method_decorator
from django.contrib.auth import get_user_model
from two_factor.utils import default_device
from auth_service.utils.mfa import create_signed_token

User = get_user_model()


# API Views
@require_GET
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    API endpoing for CSRF initialization

    This endpoint should be called from React frontend before any POST requests
    to ensure the browser has a valid CSRF cookie set.
    """
    csrf_token = get_token(request)
    return JsonResponse({"csrftoken": csrf_token})


@api_view(['GET'])
def get_auth_status(request):
    """
    API endpoint for user sessions

    Determines the user's session state based on HttpOnly cookies.
    The frontend cannot read HttpOnly cookies, so this API supports
    the frontend routing decisions.

    Returns:
        {
            "is_authenticated": bool,
            "has_refresh_token": bool,
            "has_mfa_setup_token": bool,
            "has_mfa_verify_token": bool
        }
    """
    access_token = request.COOKIES.get('accesstoken')
    refresh_token = request.COOKIES.get('refreshtoken')
    mfa_setup_token = request.COOKIES.get('mfa-setup-token')
    mfa_verify_token = request.COOKIES.get('mfa-verify-token')

    auth_status = {
        "is_authenticated": False,
        "has_refresh_token": False,
        "has_mfa_setup_token": False,
        "has_mfa_verify_token": False,
    }

    # Check if valid JWT access token exists
    if access_token:
        try:
            # Validate signature and expiration
            AccessToken(access_token)
            auth_status['is_authenticated'] = True
        except TokenError:
            # Token is invalid or expired
            pass

    # Check if valid JWT access token exists
    elif refresh_token:
        try:
            # Validate signature and expiration
            RefreshToken(refresh_token)
            auth_status['has_refresh_token'] = True
        except TokenError:
            # Token is invalid or expired
            pass

    # Check if user is in MFA verification stage
    elif mfa_verify_token:
        auth_status['has_mfa_verify_token'] = True

    # Check if user is in MFA setup stage
    elif mfa_setup_token:
        auth_status['has_mfa_setup_token'] = True

    return Response(auth_status)


@method_decorator(csrf_protect, name='dispatch')
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
        vault_key = serializer.validated_data['vault_key']

        # Set short lived HTTP-only cookie for MFA flow
        setup_token = create_signed_token(data={'user_id': user.id, 'vault_key': vault_key.hex()}, salt='mfa-setup')
        response = Response(serializer.data, status=status.HTTP_201_CREATED)
        response.set_cookie(
            'mfa-setup-token',
            setup_token,
            max_age=300,
            httponly=True,
            samesite='Strict'
        )

        return response


@method_decorator(csrf_protect, name='dispatch')
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
        vault_key = serializer.validated_data['vault_key']

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
        mfa_token = create_signed_token(data={'user_id': user.id, 'vault_key': vault_key.hex()}, salt=mfa_token_salt)
        response.set_cookie(
            cookie_name,
            mfa_token,
            max_age=300,
            httponly=True,
            samesite='Strict'
        )

        return response


@method_decorator(csrf_protect, name='dispatch')
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

    def post(self, request: Request, *args, **kwargs):
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


@method_decorator(csrf_protect, name='dispatch')
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
        response = Response(jwt_tokens, status=status.HTTP_200_OK)
        response.delete_cookie('mfa-setup-token')
        response.delete_cookie('mfa-verify-token')

        response.set_cookie(
            'accesstoken',
            jwt_tokens['access'],
            max_age=900,  # 15 minutes
            httponly=True,
            samesite='Strict'
        )

        response.set_cookie(
            'refreshtoken',
            jwt_tokens['refresh'],
            max_age=86400,  # 1 day
            httponly=True,
            samesite='Strict'
        )

        return response


@method_decorator(csrf_protect, name='dispatch')
class JWTTokenRefreshView(APIView):
    """
    API endpoint for refreshing JWT tokens.

    Permissions:
        - AllowAny: Anyone can call the endpoint without authentication
    """
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        """
        Refresh access token to authenticate user.

        Raises:
            serializers.ValidationError: If request is invalid.

        Returns:
            - Response:
                - 200 OK: Token refresh successful
                - 400 Bad Response: invalid request
                Includes refresh and access token cookies
        """
        refresh_token = request.data.get('refresh') or request.COOKIES.get('refreshtoken')

        if not refresh_token:
            return Response({"error": "Missing refresh token"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            _ = refresh.payload  # Force validation

            access = str(refresh.access_token)

            response = Response({"access": access, "refresh": str(refresh)}, status=status.HTTP_200_OK)

            response.set_cookie(
                'accesstoken',
                access,
                max_age=900,  # 15 minutes
                httponly=True,
                samesite='Strict'
            )

            response.set_cookie(
                'refreshtoken',
                str(refresh),
                max_age=86400,  # 1 day
                httponly=True,
                samesite='Strict'
            )

            return response

        except TokenError as e:
            return Response(
                {
                    "detail": str(e)
                },
                status=status.HTTP_401_UNAUTHORIZED
            )


@method_decorator(csrf_protect, name='dispatch')
class LogoutView(APIView):
    """
    API endpoint for logging out user by blacklisting refresh token.

    Permissions:
        - AllowAny: Anyone can call the endpoint without authentication
    """
    permission_classes = [AllowAny]

    def _logout_response(self, data, status):
        """
        Helper to construct logout response and clear cookies from browser
        """
        response = Response(data, status)
        response.delete_cookie('accesstoken')
        response.delete_cookie('refreshtoken')
        response.delete_cookie('csrftoken')

        return response

    def post(self, request: Request) -> Response:
        """
        Blacklist refresh token to log out user.

        Raises:
            - serializers.ValidationError: If token is missing or invalid.

        Returns:
            - Response:
                - 200 OK: Logout successful
                - 400 Bad Request: missing token
        """
        refresh_token = request.data.get('refresh') or request.COOKIES.get('refreshtoken')
        access_token = request.data.get('access') or request.COOKIES.get('accesstoken')

        if not refresh_token and not access_token:
            return self._logout_response(
                data={"error": "Missing token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Blacklist refresh token
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError as e:
                return self._logout_response(
                    data={"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return self._logout_response(
            data='',
            status=status.HTTP_200_OK
        )
