"""
Test settings for password_manager project.
Used by CI pipelines for running tests against PostgreSQL.
"""

from .deployment import *

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Override DEBUG for testing
DEBUG = True

# CI: run tests against a local Postgres service container
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("PGHOST"),
        "PORT": env("PGPORT"),
    }
}

# Log configuration only if this is the active settings module
_active_settings = env(
    "DJANGO_SETTINGS_MODULE", default="password_manager.settings"
)
if _active_settings == "password_manager.settings.test":
    logger.info("=" * 60)
    logger.info("Django Settings: test")
    logger.info("=" * 60)
    logger.info(f"DEBUG: {DEBUG}")
    logger.info(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")
    logger.info(f"SECRET_KEY configured: {'Yes' if SECRET_KEY else 'No'}")
    logger.info(f"Database: PostgreSQL (CI Test Container)")
    logger.info(f"DB_NAME: {DATABASES['default']['NAME']}")
    logger.info(f"DB_USER: {DATABASES['default']['USER']}")
    logger.info(
        f"DB_PASSWORD configured: {'Yes' if DATABASES['default']['PASSWORD'] else 'No'}"
    )
    logger.info(f"DB_HOST: {DATABASES['default']['HOST']}")
    logger.info(f"DB_PORT: {DATABASES['default']['PORT']}")
    logger.info(f"CORS_ALLOW_ALL_ORIGINS: {CORS_ALLOW_ALL_ORIGINS}")
    logger.info(f"CSRF_TRUSTED_ORIGINS: {CSRF_TRUSTED_ORIGINS}")
    logger.info("=" * 60)
