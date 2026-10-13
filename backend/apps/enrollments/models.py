"""
Enrollment and Lesson Progress models for Bright Mindz Academy LMS.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.courses.models import Course, Lesson

class Enrollment(models.Model):
    """
    Authorized course access record for an individual learner.
    Granted only after verified payment or administrative grant.
    """
    STATUS_ACTIVE = 'active'
    STATUS_EXPIRED = 'expired'
    STATUS_REVOKED = 'revoked'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, _('Active Access')),
        (STATUS_EXPIRED, _('Expired Access')),
        (STATUS_REVOKED, _('Revoked / Refunded')),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name=_('enrolled student')
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name='enrollments',
        verbose_name=_('course')
    )
    order = models.ForeignKey(
        'payments.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enrollments',
        verbose_name=_('associated payment order')
    )
    status = models.CharField(
        _('enrollment status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE
    )
    enrolled_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(
        _('access expiry date'),
        null=True,
        blank=True,
        help_text=_('Null represents lifetime access.')
    )
    notes = models.CharField(_('administrative notes'), max_length=255, blank=True)

    class Meta:
        verbose_name = _('Course Enrollment')
        verbose_name_plural = _('Course Enrollments')
        ordering = ['-enrolled_at']
        unique_together = [['student', 'course']]

    def __str__(self):
        return f"{self.student.email} -> {self.course.title} ({self.status})"

    @property
    def is_valid(self):
        """Checks if enrollment is active and has not expired."""
        if self.status != self.STATUS_ACTIVE:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        return True

    def calculate_progress_percentage(self):
        """Calculates exact course progress percentage from completed lesson records."""
        total_lessons = Lesson.objects.filter(
            module__course=self.course,
            publication_status=Lesson.STATUS_PUBLISHED
        ).count()

        if total_lessons == 0:
            return 0

        completed_count = LessonProgress.objects.filter(
            student=self.student,
            lesson__module__course=self.course,
            completed=True
        ).count()

        return min(100, round((completed_count / total_lessons) * 100))


class LessonProgress(models.Model):
    """
    Granular per-lesson progress tracking for each student.
    Guarantees isolation: students cannot access or manipulate other students' records.
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lesson_progress_records',
        verbose_name=_('student')
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='progress_records',
        verbose_name=_('lesson')
    )
    completed = models.BooleanField(_('marked completed'), default=False)
    last_position_seconds = models.PositiveIntegerField(
        _('playback bookmark (seconds)'),
        default=0
    )
    completed_at = models.DateTimeField(_('completion timestamp'), null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Lesson Progress')
        verbose_name_plural = _('Lesson Progress Records')
        unique_together = [['student', 'lesson']]
        ordering = ['-updated_at']

    def __str__(self):
        status = "Done" if self.completed else f"{self.last_position_seconds}s"
        return f"{self.student.username} - {self.lesson.title} ({status})"
