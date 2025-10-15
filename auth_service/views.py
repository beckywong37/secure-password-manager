"""
Auth Service Views

This module provides API views for user registration and login, 
handling JWT token issance and refresh.

References:
    - Django REST framework documentation: https://www.django-rest-framework.org
    - Django REST framework Simple JTW documentation: https://django-rest-framework-simplejwt.readthedocs.io/en/latest/
"""

from rest_framework import status, generics
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from auth_service.serializers import RegisterSerializer, LoginSerializer


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for registering a new user.

    Inherits from DRF's CreateAPIView for POST method handling to
    create a new User model instance using RegisterSerializer.

    Permissions:
        - AllowAny: Anyone can call the register endpoint without authentication
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(generics.CreateAPIView):
    """
    API endpoint for authenticating an existing user.

    Inherits from DRF's CreateAPIView for POST method handling to
    authenticate an existing user using LoginSerializer and returns 
    JWT access and refresh tokens.

    Permissions:
        - AllowAny: Anyone can call the login endpoint without authentication
    """
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        # Generate JWT Bearer token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return Response({
            "access": access_token,
            "refresh": refresh_token,
            "type": "Bearer",
            "expires_in": 900
        }, status=status.HTTP_200_OK)
