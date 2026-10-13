"""
Accounts models for Bright Mindz Academy.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom user model for Bright Mindz Academy learners and administrators.
    Uses email as the primary identification field for login and communications.
    """
    ROLE_STUDENT = 'student'
    ROLE_ADMIN = 'admin'
    ROLE_STAFF = 'staff'

    ROLE_CHOICES = [
        (ROLE_STUDENT, _('Student')),
        (ROLE_ADMIN, _('Administrator')),
        (ROLE_STAFF, _('Staff Member')),
    ]

    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True)
    preferred_language = models.CharField(
        _('preferred teaching language'),
        max_length=50,
        default='malayalam',
        help_text=_('Learner preference: malayalam, tamil, hindi, etc.')
    )
    role = models.CharField(
        _('system role'),
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_STUDENT
    )
    bio = models.TextField(_('bio or learning goal'), blank=True)
    avatar = models.ImageField(_('profile picture'), upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(_('verified account'), default=False)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name']

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-date_joined']

    def __str__(self):
        name = self.get_full_name() or self.username
        return f"{name} ({self.email})"

    @property
    def is_student(self):
        return self.role == self.ROLE_STUDENT

    @property
    def is_administrator(self):
        return self.role == self.ROLE_ADMIN or self.is_superuser
