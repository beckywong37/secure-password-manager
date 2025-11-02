"""
Vault URLs

This module provides URL patterns for the vault app using Django's Rest Framework's DefaultRouter.

Endpoints created:
    GET /records/ - List all records for authenticated user
    POST /records/ - Create a new record
    GET /records/<id>/ - Retrieve a specific record
    PUT /records/<id>/ - Full update of a record
    PATCH /records/<id>/ - Partial update of a record
    DELETE /records/<id>/ - Delete a record

Note: These are mounted at /vault/ in the main urls.py

References:
    - https://python.plainenglish.io/django-rest-framework-routers-and-url-patterns-explained-a-comprehensive-guide-for-developers-87851ab52920
"""

from rest_framework.routers import DefaultRouter
from vault.views import RecordViewSet

router = DefaultRouter()
router.register(r"records", RecordViewSet, basename="record")

urlpatterns = router.urls
