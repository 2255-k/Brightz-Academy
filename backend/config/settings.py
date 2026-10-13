"""
Django settings for Bright Mindz Academy LMS and Public Portal.
Kochi, Kerala, India | https://www.brightmindzacademy.com
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env if present
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR.parent / '.env')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'django-insecure-brightmindz-academy-secret-key-kochi-kerala-2026-prod-ready'
)

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't', 'yes')

ALLOWED_HOSTS = [
    h.strip()
    for h in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver').split(',')
    if h.strip()
]

# Application definition
INSTALLED_APPS = [
    # Django core apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',

    # Bright Mindz Academy domain apps
    'apps.accounts',
    'apps.courses',
    'apps.enrollments',
    'apps.payments',
    'apps.video',
    'apps.content',
    'apps.enquiries',
    'apps.audit',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database configuration
# Defaults to SQLite for local development, connects to PostgreSQL when DB_ENGINE=postgres or DATABASE_URL is set
DB_ENGINE = os.getenv('DB_ENGINE', 'sqlite').lower()

if DB_ENGINE == 'postgres':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'brightmindz_db'),
            'USER': os.getenv('DB_USER', 'brightmindz_user'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'CONN_MAX_AGE': 60,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files (Course thumbnails, trainer photos)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '120/minute',
        'user': '1000/minute',
        'auth': '15/minute',
    },
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
}

# Simple JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_MINUTES', '120'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_DAYS', '14'))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173,https://www.brightmindzacademy.com'
    ).split(',')
    if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True

# Business & Academy Settings
ACADEMY_NAME = os.getenv('ACADEMY_NAME', 'Bright Mindz Academy')
ACADEMY_LOCATION = os.getenv('ACADEMY_LOCATION', 'Kochi, Kerala, India')
ACADEMY_DOMAIN = os.getenv('ACADEMY_DOMAIN', 'https://www.brightmindzacademy.com')
WHATSAPP_PHONE_NUMBER = os.getenv('WHATSAPP_PHONE_NUMBER', '919846000000')
WHATSAPP_DEFAULT_MESSAGE = os.getenv(
    'WHATSAPP_DEFAULT_MESSAGE',
    'Hello Bright Mindz Academy, I would like to know more about your Spoken English courses.'
)
SUPPORT_EMAIL = os.getenv('SUPPORT_EMAIL', 'info@brightmindzacademy.com')

# Payment Gateway Configuration (Razorpay)
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_placeholder_key_id')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'placeholder_secret')
RAZORPAY_WEBHOOK_SECRET = os.getenv('RAZORPAY_WEBHOOK_SECRET', 'placeholder_webhook_secret')
PAYMENT_CURRENCY = os.getenv('PAYMENT_CURRENCY', 'INR')

# Protected Video Streaming Configuration
VIDEO_PROVIDER = os.getenv('VIDEO_PROVIDER', 'mock').lower()
CLOUDFLARE_STREAM_ACCOUNT_ID = os.getenv('CLOUDFLARE_STREAM_ACCOUNT_ID', '')
CLOUDFLARE_STREAM_API_TOKEN = os.getenv('CLOUDFLARE_STREAM_API_TOKEN', '')
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN = os.getenv('CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN', '')
BUNNY_STREAM_LIBRARY_ID = os.getenv('BUNNY_STREAM_LIBRARY_ID', '')
BUNNY_STREAM_API_KEY = os.getenv('BUNNY_STREAM_API_KEY', '')

# Security Headers (Production-ready toggles)
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
