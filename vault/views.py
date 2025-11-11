from rest_framework import viewsets
from vault.models import Record
from vault.serializers import RecordSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


class RecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Record model, which handles CRUD operations for the Record model

    Permissions:
        - IsAuthenticated: Only authenticated users can access the vault endpoints
        - JWTAuthentication: Authenticates the user using JWT tokens

    References:
        - https://www.django-rest-framework.org/api-guide/filtering/#filtering-against-the-current-user
    """

    serializer_class = RecordSerializer
    # Enforces that only authenticated users can access the vault endpoints
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        """
        Return the records for the currently authenticated user.
        This is a security measure to ensure that only the user can access their own records.
        """
        return Record.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Create a new record for the currently authenticated user
        This is a security measure to ensure that only the user can create records for themselves.
        """
        serializer.save(user=self.request.user)
