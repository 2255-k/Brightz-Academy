"""
Payments URL patterns.
"""

from django.urls import path
from apps.payments.views import (
    CreatePaymentOrderView,
    VerifyPaymentView,
    RazorpayWebhookView,
    StudentOrderHistoryView,
)

urlpatterns = [
    path('create-order/', CreatePaymentOrderView.as_view(), name='payment_create_order'),
    path('verify/', VerifyPaymentView.as_view(), name='payment_verify'),
    path('webhook/', RazorpayWebhookView.as_view(), name='payment_webhook'),
    path('history/', StudentOrderHistoryView.as_view(), name='payment_history'),
]
