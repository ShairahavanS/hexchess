"""
Django settings for beesweeper project.
"""

import os
from pathlib import Path
import dj_database_url


BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME")

ALLOWED_HOSTS = [
    ".onrender.com",
    ".vercel.app",
    ".netlify.app",
    "ShairahavanS.github.io",  
    "localhost",
    "127.0.0.1",
]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "beesweeper_api",
    "hexchess",
    "hexcheckers",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "beesweeper.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "beesweeper.wsgi.application"

# Database
DATABASES = {
    "default": dj_database_url.config(default=os.getenv("DATABASE_URL"))
}

# If you want PostgreSQL on Render later, replace with:
# DATABASES = {
#     "default": dj_database_url.config(default=os.getenv("DATABASE_URL"))
# }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS / CSRF
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://hexchess-ten.vercel.app",
    "https://ShairahavanS.github.io",
]

CSRF_TRUSTED_ORIGINS = [
    "https://hexagonal-games-backend.onrender.com",
    "https://hexchess-ten.vercel.app/",
    "https://ShairahavanS.github.io",
]
