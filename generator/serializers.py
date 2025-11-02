"""
Serializers for Password Generator API

Features:
- Validates length of password between 4 and 128 characters
- Sets default values for length, uppercase, lowercase, numbers, and special characters
- Error handling
"""

from rest_framework import serializers


class PasswordOptionsSerializer(serializers.Serializer):
    """Serializer for password generation options"""
    length = serializers.IntegerField(
        required=False,
        default=15,
        min_value=4,
        max_value=128,
        error_messages={
            "invalid": "Invalid password length. Must be a number between 4 and 128.",
            "min_value": "Invalid password length. Enter a number between 4 and 128.",
            "max_value": "Invalid password length. Enter a number between 4 and 128.",
        },
    )
    uppercase = serializers.BooleanField(required=False, default=False)
    lowercase = serializers.BooleanField(required=False, default=False)
    numbers = serializers.BooleanField(required=False, default=False)
    special = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        """Ensure at least one character type is selected"""
        if not any([
            attrs.get("uppercase"),
            attrs.get("lowercase"),
            attrs.get("numbers"),
            attrs.get("special")
        ]):
            raise serializers.ValidationError(
                {"non_field_errors": ["Check at least one option to generate password!"]}
            )
        return attrs
