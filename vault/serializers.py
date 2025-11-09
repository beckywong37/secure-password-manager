from rest_framework import serializers
from vault.models import Record


class RecordSerializer(serializers.ModelSerializer):
    """
    Serializer for the Record model

    - Assumes that the user is authenticated
    - Assumes the password was encrypted by the client before storing in the database. Clients must encrypt the passwords
      using the user's vault key before sending.
    - The server stores and returns the encrypted passwords with no way to decrypt them as a zero-knowledge solution.
    """

    class Meta:
        model = Record
        fields = [
            "id",
            "title",
            "username",
            "password",
            "email",
            "url",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "email": {"required": False, "allow_blank": True},
            "url": {"required": False, "allow_blank": True},
            "notes": {"required": False, "allow_blank": True},
        }
