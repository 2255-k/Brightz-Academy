"""
Audit logging models for security and financial integrity.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class AuditEvent(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_events',
        verbose_name=_('actor')
    )
    action = models.CharField(_('audit action'), max_length=100)
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)
    user_agent = models.CharField(_('browser user agent'), max_length=255, blank=True)
    details = models.JSONField(_('structured metadata'), default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Audit Event')
        verbose_name_plural = _('Audit Events')
        ordering = ['-created_at']

    def __str__(self):
        actor = self.user.email if self.user else 'Anonymous'
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.action} by {actor}"

    @classmethod
    def log_event(cls, user=None, action="", details=None, request=None):
        """Helper utility to cleanly capture an audit record."""
        ip = None
        user_agent = ""
        if request:
            x_fwd = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_fwd.split(',')[0].strip() if x_fwd else request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')[:250]

        return cls.objects.create(
            user=user if (user and user.is_authenticated) else None,
            action=action,
            ip_address=ip,
            user_agent=user_agent,
            details=details or {}
        )
