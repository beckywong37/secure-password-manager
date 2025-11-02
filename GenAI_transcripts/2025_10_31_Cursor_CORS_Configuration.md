## Configuring CORS settings for React frontend (Vite) to communicate with Django backend API  

**User**

"I have a React frontend running on Vite (typically port 5173) and a Django REST Framework backend running on port 8000. When my React app tries to make API calls to Django, I'm getting CORS errors. How do I configure CORS in Django to allow my React frontend to make requests?"

**Cursor**
To configure CORS for your React-Django setup, you'll need to use `django-cors-headers`. Here's how:

1. **Install the package:**
   ```bash
   pip install django-cors-headers
   ```

2. **Add to INSTALLED_APPS** in `settings.py`:
   ```python
   INSTALLED_APPS = [
       # ... other apps
       "corsheaders",
       # ...
   ]
   ```

3. **Add CORS middleware** (must be before CommonMiddleware):
   ```python
   MIDDLEWARE = [
       "django.middleware.security.SecurityMiddleware",
       "django.contrib.sessions.middleware.SessionMiddleware",
       "corsheaders.middleware.CorsMiddleware",  # Must be before CommonMiddleware
       "django.middleware.common.CommonMiddleware",
       # ... rest of middleware
   ]
   ```

4. **Configure CORS settings** in `settings.py`:
   ```python
   # For development
   CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
   
   # Or more securely, specify allowed origins:
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:5173",  # Vite default
       "http://localhost:3000",  # React default
   ]
   ```

---

**User**
"Can you help me set up CORS settings that work for both development and production? I want it to allow all origins in development (DEBUG=True) but only specific origins in production."

**Cursor**
Here's a configuration that adapts based on your DEBUG setting:

```python
# CORS settings for frontend-backend communication
# Allow all origins in development (DEBUG=True)
# In production, specify exact origins
CORS_ALLOW_ALL_ORIGINS = DEBUG

# If not allowing all origins, specify allowed origins
if not DEBUG:
    CORS_ALLOWED_ORIGINS = [
        APPENGINE_URL.rstrip("/") if APPENGINE_URL else "",
        # Add your production frontend URL here
    ]
else:
    # In development, allow common frontend ports
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",  # Vite default port
        "http://localhost:3000",  # React default port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

# Allow credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

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
```

This configuration:
- Allows all origins when `DEBUG=True` (development)
- Restricts to specific origins in production
- Includes common frontend development ports
- Allows credentials for authenticated requests
- Includes necessary headers for API communication

---

**User**
"What headers do I need to allow for my Django REST Framework API to work properly with React? I'm using JWT authentication."

**Cursor**
For Django REST Framework with JWT authentication, you should allow these headers:

```python
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",  # Needed for JWT tokens (Bearer token)
    "content-type",   # For JSON requests
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",    # For CSRF protection if needed
    "x-requested-with",
]
```

The `authorization` header is crucial for JWT authentication, as your React app will send requests with:
```
Authorization: Bearer <your-jwt-token>
```

Also make sure to set:
```python
CORS_ALLOW_CREDENTIALS = True
```
This allows cookies and authorization headers to be sent in cross-origin requests.


## Files Modified

- `password_manager/settings.py` - Added CORS configuration
- `requirements.txt` - Added `django-cors-headers==4.6.0`
