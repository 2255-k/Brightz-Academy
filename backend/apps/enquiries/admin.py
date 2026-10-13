"""
Admin interface for Contact Enquiries.
"""

from django.contrib import admin
from apps.enquiries.models import ContactEnquiry

@admin.register(ContactEnquiry)
class ContactEnquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'mother_tongue_interest', 'subject', 'status', 'created_at']
    list_filter = ['status', 'mother_tongue_interest', 'created_at']
    list_editable = ['status']
    search_fields = ['name', 'phone', 'email', 'message', 'subject']
    readonly_fields = ['created_at', 'ip_address']
    ordering = ['-created_at']
