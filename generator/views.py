"""
Password Generator Views

This module calls utils.py to create a
secure password based on criteria defined by the user.

It can be generated for HTML form submission or as a REST API endpoint.

References:
- NIST Password Guidelines: https://sprinto.com/blog/nist-password-guidelines/
- HTML render: https://www.geeksforgeeks.org/python/how-to-render-data-in-django/
"""
from django.shortcuts import render
from .utils import generate_password
from rest_framework.views import APIView
from rest_framework.response import Response
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
    """REST API endpoint for generating secure passsword based on user input"""

    def post(self, request):
        """REST API endpoint for generating secure password
        Returns: Generated password or error message in JSON format"""
        # Get user selection for password, defaults set if not provided
        length = int(request.data.get('length', 15))
        uppercase = request.data.get('uppercase', False)
        lowercase = request.data.get('lowercase', False)
        numbers = request.data.get('numbers', False)
        special = request.data.get('special', False)

        password = generate_password(length, uppercase, lowercase, numbers, special)

        if len(password) == 0:
            return Response({'error': 'Check at least one option to generate password!'}, status=400)

        # Return password in JSON format
        return Response({'password': password})


class PasswordStrengthHTMLView(View):
    """Renders HTML form with password strength analysis"""

    def get(self, request):
        """Loads page"""
        return render(request, 'generator/strength.html')

    def post(self, request):
        """Scores password strength """
