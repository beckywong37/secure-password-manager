from django.contrib import admin
from django.urls import path, include, re_path
from .views import FrontendIndexView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", FrontendIndexView.as_view(), name="index"),
    path("api/auth/", include("auth_service.urls")),
    path("generator/", include("generator.urls")),
    path("api/vault/", include("vault.urls")),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # Catch-all: Serve index.html for any unmatched routes (with client-side routing) to prevent 404 errors on refresh
    re_path(r"^.*$", FrontendIndexView.as_view(), name="frontend-catchall"),
]
