"""
Accounts admin configuration.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from apps.accounts.models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'preferred_language', 'is_active', 'date_joined']
    list_filter = ['role', 'preferred_language', 'is_active', 'is_staff']
    search_fields = ['email', 'username', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Bright Mindz Learner Details', {
            'fields': ('phone_number', 'preferred_language', 'role', 'bio', 'is_verified'),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Bright Mindz Learner Details', {
            'fields': ('email', 'phone_number', 'preferred_language', 'role'),
        }),
    )
