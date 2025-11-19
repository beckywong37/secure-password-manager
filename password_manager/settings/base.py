"""
** GenAI Citation for April: **
Portions of this code related to Databases and Google Cloud were generated with
the help of ChatGPT-5 and Cursor with the Claude-4.5-sonnet model.
The conversation transcript [ChatGPT-5linked here](https://chatgpt.com/share/68fec1e7-10fc-8009-9bda-bdffef8ebea6)
and [Cursor linked here](../GenAI_transcripts/2025_10_26_CursorReview.md)
documents the GenAI Interaction that led to my code.
See Pull Request here: https://github.com/beckywong37/secure-password-manager/pull/6

Additionally, portions of this code related to logging, secret validation, and static file serving were generated with the help of Cursor with
Claude-4.5-sonnet model.
The conversation transcript linked below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2025_11_15_Cursor_automated_deploy_debugging.md
../GenAI_transcripts/2025_11_16_Cursor_fixing_deploy_issues.md

Additionally, the settings refactor was generated with the help of Cursor with the Claude-4.5-sonnet model.
The conversation transcript linked below documents the GenAI Interaction that led to my code.
../GenAI_transcripts/2025_11_19_Cursor_refactor_django_settings_env.md
../GenAI_transcripts/2025_11_19_Cursor_cloud_sql_proxy_connection_issue.md

** GenAI Citation for Becky: **
Portions of this code related to CORS settings and configurations were
generated with the help of ChatGPT-5.
The conversation transcript [ChatGPT-5 linked here](https://chatgpt.com/c/69045b2c-e3f4-832b-bd71-d59fcef093c6)
documents the GenAI Interaction that led to my code.

Django base settings for password_manager project.
Common settings shared across all environments.
"""

from pathlib import Path
from datetime import timedelta
import os
import environ


# Initialize environ
env = environ.Env(
    # set casting, default value
    DEBUG=(bool, False)
)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Take environment variables from .env file
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# Application definition
INSTALLED_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "corsheaders",
    "django_otp",
    "django_otp.plugins.otp_static",
    "django_otp.plugins.otp_totp",
    "two_factor",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "password_manager",
    "auth_service",
    "generator",
    "vault",
]

# DRF configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "auth_service.utils.authentication.CookieJWTAuthentication",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# DRF Simple JWT configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# drf-spectacular configuration
SPECTACULAR_SETTINGS = {
    "TITLE": "Secure Password Manager API",
    "DESCRIPTION": "API for managing secure password records and user authentication",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_PATH_PREFIX": r"/api/",
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django_otp.middleware.OTPMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "password_manager.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "password_manager" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "password_manager.wsgi.application"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "static"
STATICFILES_DIRS = [
    BASE_DIR / "frontend" / "web" / "dist",
]

# WhiteNoise configuration for serving static files
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Custom User model for authentication
AUTH_USER_MODEL = "auth_service.User"
