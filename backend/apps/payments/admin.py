"""
Admin configuration for Orders and Payment Transactions.
"""

from django.contrib import admin
from apps.payments.models import Order, PaymentTransaction

class PaymentTransactionInline(admin.TabularInline):
    model = PaymentTransaction
    extra = 0
    readonly_fields = ['gateway_payment_id', 'gateway_signature', 'amount', 'status', 'created_at']
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_reference', 'student', 'course', 'amount', 'currency', 'gateway', 'status', 'created_at']
    list_filter = ['status', 'gateway', 'currency', 'created_at']
    search_fields = ['order_reference', 'gateway_order_id', 'student__email', 'course__title']
    readonly_fields = ['order_reference', 'created_at', 'updated_at']
    inlines = [PaymentTransactionInline]
    ordering = ['-created_at']

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ['gateway_payment_id', 'order', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['gateway_payment_id', 'order__order_reference', 'order__student__email']
    readonly_fields = ['created_at', 'raw_payload']
    ordering = ['-created_at']
