"""
Production deployment settings for password_manager project.
Uses Cloud SQL (PostgreSQL) and enforces security settings.
"""

from .base import *

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _get_secret_or_env(name: str) -> str:
    """
    Try Secret Manager first (only if we have a project id and library),
    otherwise fall back to environment variables (for CI).
    """
    project_id = env(
        "GOOGLE_CLOUD_PROJECT", default=env("GCP_PROJECT", default="")
    )

    # Quick exit if we don't have a project id (e.g., CI environment)
    if not project_id:
        logger.info(
            f"No GCP project ID found, using environment variable for {name}"
        )
        return env(name)

    # Try Secret Manager
    try:
        from google.cloud import secretmanager

        client = secretmanager.SecretManagerServiceClient()
        resource = f"projects/{project_id}/secrets/{name}/versions/latest"
        logger.info(
            f"Attempting to fetch {name} from Secret Manager: {resource}"
        )
        resp = client.access_secret_version(name=resource)
        logger.info(f"Successfully fetched {name} from Secret Manager")
        return resp.payload.data.decode("utf-8")
    except Exception as e:
        logger.error(
            f"Failed to fetch {name} from Secret Manager: {type(e).__name__}: {str(e)}"
        )
        logger.warning(f"Falling back to environment variable for {name}")
        env_value = env(name)
        return env_value


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = _get_secret_or_env("SECRET_KEY")

if not SECRET_KEY:
    error_msg = (
        "CRITICAL ERROR: SECRET_KEY is not set! "
        "Please ensure the SECRET_KEY secret exists in Google Secret Manager "
        "and the App Engine service account has 'roles/secretmanager.secretAccessor' permission."
    )
    logger.error(error_msg)
    raise RuntimeError(error_msg)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Allowed hosts
ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS",
    default=[
        ".appspot.com",
        env("APPENGINE_URL", default="").replace("https://", "").strip("/"),
    ],
)

# Database configuration - Cloud SQL (PostgreSQL)
DB_NAME = env("DB_NAME")
DB_USER = env("DB_USER")
DB_PASSWORD = _get_secret_or_env("DB_PASSWORD")

INSTANCE_CONNECTION_NAME = env("INSTANCE_CONNECTION_NAME")

# Both DB_HOST and DB_PORT are required
# - CI (proxy): DB_HOST=127.0.0.1, DB_PORT=5432
# - App Engine (Unix socket): DB_HOST=/cloudsql/..., DB_PORT=""
HOST = env("DB_HOST")
PORT = env("DB_PORT")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": DB_NAME,
        "USER": DB_USER,
        "PASSWORD": DB_PASSWORD,
        "HOST": HOST,
        "PORT": PORT,
    }
}

# Security settings for production
SECURE_SSL_REDIRECT = env.bool(
    "SECURE_SSL_REDIRECT", default=bool(env("APPENGINE_URL", default=""))
)
SESSION_COOKIE_SECURE = env.bool(
    "SESSION_COOKIE_SECURE", default=bool(env("APPENGINE_URL", default=""))
)
CSRF_COOKIE_SECURE = env.bool(
    "CSRF_COOKIE_SECURE", default=bool(env("APPENGINE_URL", default=""))
)

# CSRF trusted origins for production
APPENGINE_URL = env("APPENGINE_URL", default="")
CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS", default=[APPENGINE_URL.rstrip("/")]
)

# HSTS headers
SECURE_HSTS_SECONDS = env.int(
    "SECURE_HSTS_SECONDS", default=31536000
)  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS", default=True
)
SECURE_HSTS_PRELOAD = env.bool("SECURE_HSTS_PRELOAD", default=True)

# Additional security headers
SECURE_BROWSER_XSS_FILTER = env.bool("SECURE_BROWSER_XSS_FILTER", default=True)
SECURE_CONTENT_TYPE_NOSNIFF = env.bool(
    "SECURE_CONTENT_TYPE_NOSNIFF", default=True
)

# CORS settings for production
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[APPENGINE_URL.rstrip("/")] if APPENGINE_URL else [],
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
_active_settings = env(
    "DJANGO_SETTINGS_MODULE", default="password_manager.settings"
)
if _active_settings in (
    "password_manager.settings",
    "password_manager.settings.deployment",
):
    logger.info("=" * 60)
    logger.info("Django Settings: deployment")
    logger.info("=" * 60)
    logger.info(f"DEBUG: {DEBUG}")
    logger.info(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")
    logger.info(f"SECRET_KEY configured: {'Yes' if SECRET_KEY else 'No'}")
    logger.info(f"Database: PostgreSQL (Cloud SQL)")
    logger.info(f"DB_NAME: {DB_NAME}")
    logger.info(f"DB_USER: {DB_USER}")
    logger.info(f"DB_PASSWORD configured: {'Yes' if DB_PASSWORD else 'No'}")
    logger.info(f"DB_HOST: {HOST}")
    if PORT:
        logger.info(f"DB_PORT: {PORT}")
    logger.info(f"CORS_ALLOW_ALL_ORIGINS: {CORS_ALLOW_ALL_ORIGINS}")
    logger.info(f"CSRF_TRUSTED_ORIGINS: {CSRF_TRUSTED_ORIGINS}")
    logger.info("=" * 60)
