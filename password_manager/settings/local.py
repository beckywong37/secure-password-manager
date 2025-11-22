"""
Local development settings for password_manager project.
Uses SQLite database and relaxed security settings.
"""

from .base import *

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env(
    "SECRET_KEY",
    default="django-insecure-dev-key-change-in-production-do-not-use-in-production",
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool("DEBUG", default=True)

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# Database - SQLite for local development
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# CORS settings - allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# CORS allowed origins for local development
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
)

# CSRF trusted origins
CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
)

# Allowed headers
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# Log configuration only if this is the active settings module
_active_settings = env("DJANGO_SETTINGS_MODULE", default="")
if _active_settings == "password_manager.settings.local":
    logger.info("=" * 60)
    logger.info("Django Settings: local")
    logger.info("=" * 60)
    logger.info(f"DEBUG: {DEBUG}")
    logger.info(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")
    logger.info(f"SECRET_KEY configured: {'Yes' if SECRET_KEY else 'No'}")
    logger.info(f"Database: SQLite")
    logger.info(f"DB_PATH: {DATABASES['default']['NAME']}")
    logger.info(f"CORS_ALLOW_ALL_ORIGINS: {CORS_ALLOW_ALL_ORIGINS}")
    logger.info(f"CSRF_TRUSTED_ORIGINS: {CSRF_TRUSTED_ORIGINS}")
    logger.info("=" * 60)
