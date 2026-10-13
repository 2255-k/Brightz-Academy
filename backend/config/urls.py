"""
URL configuration for Bright Mindz Academy.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.utils import timezone

def health_check(request):
    """System health check endpoint for monitoring & uptime bots."""
    return JsonResponse({
        'status': 'healthy',
        'academy': settings.ACADEMY_NAME,
        'location': settings.ACADEMY_LOCATION,
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
    })

def business_config(request):
    """Public business parameters (WhatsApp number, domain, contact email)."""
    return JsonResponse({
        'academy_name': settings.ACADEMY_NAME,
        'academy_domain': settings.ACADEMY_DOMAIN,
        'academy_location': settings.ACADEMY_LOCATION,
        'whatsapp_phone_number': settings.WHATSAPP_PHONE_NUMBER,
        'whatsapp_default_message': settings.WHATSAPP_DEFAULT_MESSAGE,
        'support_email': settings.SUPPORT_EMAIL,
        'razorpay_key_id': settings.RAZORPAY_KEY_ID,
        'currency': settings.PAYMENT_CURRENCY,
    })

urlpatterns = [
    # Health and config
    path('api/health/', health_check, name='health_check'),
    path('api/config/', business_config, name='business_config'),

    # Django Admin
    path('admin/', admin.site.urls),

    # Domain APIs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/student/', include('apps.enrollments.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/lessons/', include('apps.video.urls')),
    path('api/content/', include('apps.content.urls')),
    path('api/enquiries/', include('apps.enquiries.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Custom Admin branding
admin.site.site_header = "Bright Mindz Academy Administration"
admin.site.site_title = "Bright Mindz Academy Admin Portal"
admin.site.index_title = "LMS Management & Academic Operations"
