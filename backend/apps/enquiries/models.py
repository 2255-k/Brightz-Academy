"""
Contact Enquiry models for student admissions and inquiries.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _

class ContactEnquiry(models.Model):
    STATUS_NEW = 'new'
    STATUS_CONTACTED = 'contacted'
    STATUS_RESOLVED = 'resolved'

    STATUS_CHOICES = [
        (STATUS_NEW, _('New / Pending Response')),
        (STATUS_CONTACTED, _('Contacted Learner')),
        (STATUS_RESOLVED, _('Resolved / Admitted')),
    ]

    name = models.CharField(_('full name'), max_length=150)
    email = models.EmailField(_('email address'), blank=True)
    phone = models.CharField(_('phone / WhatsApp number'), max_length=25)
    mother_tongue_interest = models.CharField(_('preferred mother tongue'), max_length=50, default='Malayalam')
    subject = models.CharField(_('subject'), max_length=200, default='Course Enquiry')
    message = models.TextField(_('inquiry message / questions'))

    status = models.CharField(_('lead status'), max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    admin_notes = models.TextField(_('internal notes'), blank=True)
    ip_address = models.GenericIPAddressField(_('source IP address'), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Contact Enquiry')
        verbose_name_plural = _('Contact Enquiries')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.subject} [{self.status}]"
