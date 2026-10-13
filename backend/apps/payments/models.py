"""
Payment and Order models for Bright Mindz Academy.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from apps.courses.models import Course

class Order(models.Model):
    """
    Purchase order created when a student initiates checkout for a course.
    Price is ALWAYS determined by the server from trusted database records.
    """
    STATUS_PENDING = 'pending'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED = 'failed'
    STATUS_REFUNDED = 'refunded'

    STATUS_CHOICES = [
        (STATUS_PENDING, _('Pending Payment')),
        (STATUS_COMPLETED, _('Payment Completed')),
        (STATUS_FAILED, _('Payment Failed')),
        (STATUS_REFUNDED, _('Payment Refunded')),
    ]

    GATEWAY_RAZORPAY = 'razorpay'
    GATEWAY_CASHFREE = 'cashfree'

    GATEWAY_CHOICES = [
        (GATEWAY_RAZORPAY, 'Razorpay Payments (India)'),
        (GATEWAY_CASHFREE, 'Cashfree Payments'),
    ]

    order_reference = models.CharField(
        _('internal order reference'),
        max_length=64,
        unique=True,
        default=uuid.uuid4
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name=_('student')
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name=_('course')
    )
    amount = models.DecimalField(_('order total (INR)'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency code'), max_length=10, default='INR')

    gateway = models.CharField(
        _('payment gateway'),
        max_length=30,
        choices=GATEWAY_CHOICES,
        default=GATEWAY_RAZORPAY
    )
    gateway_order_id = models.CharField(
        _('gateway order ID (e.g., rzp order)'),
        max_length=100,
        blank=True
    )
    status = models.CharField(
        _('order status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_reference[:8]} - {self.student.email} - ₹{self.amount} ({self.status})"

    @property
    def amount_in_subunits(self):
        """Converts INR amount to paise (integer subunits) for Razorpay API."""
        return int(self.amount * 100)


class PaymentTransaction(models.Model):
    """
    Immutable audit record for payment attempts and verified transactions.
    """
    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'
    STATUS_PENDING = 'pending'

    STATUS_CHOICES = [
        (STATUS_SUCCESS, _('Success')),
        (STATUS_FAILED, _('Failed')),
        (STATUS_PENDING, _('Pending')),
    ]

    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
        related_name='transactions',
        verbose_name=_('associated order')
    )
    gateway_payment_id = models.CharField(
        _('gateway payment ID (e.g. pay_29QQoUBi66xm2f)'),
        max_length=100
    )
    gateway_signature = models.CharField(
        _('cryptographic signature received'),
        max_length=255,
        blank=True
    )
    amount = models.DecimalField(_('amount settled (INR)'), max_digits=10, decimal_places=2)
    status = models.CharField(
        _('transaction status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )
    error_code = models.CharField(max_length=100, blank=True)
    error_description = models.TextField(blank=True)
    raw_payload = models.JSONField(
        _('raw gateway payload snapshot'),
        default=dict,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Payment Transaction')
        verbose_name_plural = _('Payment Transactions')
        ordering = ['-created_at']

    def __str__(self):
        return f"Txn: {self.gateway_payment_id} (Order: {self.order.order_reference[:8]}) - {self.status}"
