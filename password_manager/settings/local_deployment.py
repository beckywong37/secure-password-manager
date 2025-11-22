from .local import *

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Override DEBUG for local deployment
DEBUG = False

# Log configuration only if this is the active settings module
_active_settings = env("DJANGO_SETTINGS_MODULE", default="")
if _active_settings == "password_manager.settings.local_deployment":
    logger.info("=" * 60)
    logger.info("Django Settings: local_deployment")
    logger.info("=" * 60)
    logger.info(f"DEBUG: {DEBUG}")
    logger.info(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")
    logger.info(f"SECRET_KEY configured: {'Yes' if SECRET_KEY else 'No'}")
    logger.info(f"Database: SQLite")
    logger.info(f"DB_PATH: {DATABASES['default']['NAME']}")
    logger.info(f"CORS_ALLOW_ALL_ORIGINS: {CORS_ALLOW_ALL_ORIGINS}")
    logger.info(f"CSRF_TRUSTED_ORIGINS: {CSRF_TRUSTED_ORIGINS}")
    logger.info("=" * 60)
