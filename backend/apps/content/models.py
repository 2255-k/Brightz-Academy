"""
Content models for Trainers, Testimonials, and FAQs.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _

class Trainer(models.Model):
    """
    Administrator-managed trainer profile with verified credentials.
    """
    name = models.CharField(_('trainer name'), max_length=150)
    title = models.CharField(_('professional title / role'), max_length=200)
    bio = models.TextField(_('biography & teaching philosophy'))
    languages_spoken = models.CharField(_('languages spoken'), max_length=200, default='Malayalam, English')
    experience_years = models.PositiveIntegerField(_('years of teaching experience'), default=5)
    photo_url = models.CharField(_('photo URL'), max_length=500, blank=True)
    photo = models.ImageField(_('photo upload'), upload_to='trainers/', null=True, blank=True)
    is_active = models.BooleanField(_('is active'), default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Trainer Profile')
        verbose_name_plural = _('Trainer Profiles')
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"{self.name} - {self.title}"


class Testimonial(models.Model):
    """
    Student testimonial with publication status and consent tracking.
    Demo/sample testimonials are explicitly flagged to prevent fabricated claims.
    """
    student_name = models.CharField(_('student name / alias'), max_length=150)
    role_or_location = models.CharField(_('location or profession'), max_length=200, blank=True)
    mother_tongue = models.CharField(_('mother tongue'), max_length=50, default='Malayalam')
    course_name = models.CharField(_('course completed'), max_length=200, blank=True)
    quote = models.TextField(_('testimonial review text'))
    rating = models.PositiveSmallIntegerField(_('star rating (1-5)'), default=5)

    is_published = models.BooleanField(_('is published on website'), default=True)
    is_demo = models.BooleanField(
        _('demonstration content'),
        default=False,
        help_text=_('Check if this is sample demonstration content during development.')
    )
    consent_obtained = models.BooleanField(
        _('student publication consent verified'),
        default=True
    )
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Student Testimonial')
        verbose_name_plural = _('Student Testimonials')
        ordering = ['display_order', '-created_at']

    def __str__(self):
        demo_tag = " [DEMO]" if self.is_demo else ""
        return f"{self.student_name} ({self.mother_tongue}){demo_tag}"


class FAQ(models.Model):
    """
    Editable frequently asked questions covering courses, access, payments, and policy.
    """
    CATEGORY_GENERAL = 'general'
    CATEGORY_COURSES = 'courses'
    CATEGORY_PAYMENTS = 'payments'
    CATEGORY_TECHNICAL = 'technical'

    CATEGORY_CHOICES = [
        (CATEGORY_GENERAL, _('General & Mother Tongue Approach')),
        (CATEGORY_COURSES, _('Course Access & Lessons')),
        (CATEGORY_PAYMENTS, _('Payments & Refunds')),
        (CATEGORY_TECHNICAL, _('Technical & Devices')),
    ]

    question = models.CharField(_('question'), max_length=300)
    answer = models.TextField(_('detailed answer'))
    category = models.CharField(
        _('category'),
        max_length=20,
        choices=CATEGORY_CHOICES,
        default=CATEGORY_GENERAL
    )
    is_published = models.BooleanField(_('is published'), default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('FAQ')
        verbose_name_plural = _('FAQs')
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"[{self.get_category_display()}] {self.question}"
