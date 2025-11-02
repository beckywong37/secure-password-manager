"""
Password Generator Views

This module calls utils.py to create a
secure password based on criteria defined by the user.

It also calculates the strength of the password based on the criteria defined by the user.

It can be generated for HTML form submission or as a REST API endpoint.

** GenAI Citation for Becky: **
Portions of this code related to error handling for the API endpoints were generated with
the help of ChatGPT-5.
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/69045b2c-e3f4-832b-bd71-d59fcef093c6)
documents the GenAI Interaction that led to my code.
References:
- NIST Password Guidelines: https://sprinto.com/blog/nist-password-guidelines/
- HTML render: https://www.geeksforgeeks.org/python/how-to-render-data-in-django/
"""
from django.shortcuts import render
from .utils import generate_password, password_strength
from .serializers import PasswordOptionsSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.views import View


class PasswordGeneratorHTMLView(View):
    """Renders HTML form with password generated"""

    def get(self, request):
        """Loads page"""
        return render(request, 'generator/generator.html')

    def post(self, request):
        """Generates secure password based on user criteria and handles form submission.
        Returns: Generated password to HTML template"""
        # Save user selections in variables
        try:
            length = int(request.POST.get('length', 15))
            if length < 4 or length > 128:
                raise ValueError("Length must be between 4 and 128")
        except (ValueError, TypeError):
            return render(request, 'generator/generator.html', {
                'error': 'Invalid password length. Enter a number between 4 and 128.'
            })
        uppercase = "uppercase" in request.POST
        lowercase = "lowercase" in request.POST
        numbers = "numbers" in request.POST
        special = "special" in request.POST

        # Generate password based on user selections
        password = generate_password(length, uppercase, lowercase, numbers, special)
        if len(password) == 0:
            password = 'Check at least one option to generate password!'

        # Send data to use in HTML template
        data = {
            'password': password,
            'length': length,
        }

        return render(request, 'generator/generator.html', data)


class PasswordGeneratorAPIView(APIView):
    """REST API endpoint for generating secure password based on user input"""
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        """REST API endpoint for generating secure password
        Returns: Generated password or error message in JSON format"""
        serializer = PasswordOptionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        opts = serializer.validated_data  # {'length': ..., 'uppercase': ..., ...}
        password = generate_password(**opts)

        # Check if password generation failed (shouldn't happen after validation, but just in case)
        if password == 'Check at least one option!':
            return Response(
                {'error': 'Check at least one option to generate password!'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'password': password}, status=status.HTTP_200_OK)


class PasswordStrengthAPIView(APIView):
    """REST API endpoint for calculating password strength"""
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        """REST API endpoint for calculating password strength
        Returns: Password strength analysis (score, strength, notes) in JSON format"""
        try:
            # Get password from request
            password = request.data.get('password', '')

            # Validate that password is provided
            if not password:
                return Response(
                    {'error': 'Password is required. Please provide a password to analyze.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Calculate password strength using utils function
            result = password_strength(password)

            # Handle case where password_strength returns a string (empty password case)
            if isinstance(result, str):
                return Response(
                    {'error': result},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Return strength analysis in JSON format
            return Response(result, status=status.HTTP_200_OK)

        except FileNotFoundError as e:
            return Response(
                {'error': f'Password strength analysis unavailable: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred while calculating password strength: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
