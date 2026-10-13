"""
Admin configuration for Enrollments and Progress.
"""

from django.contrib import admin
from apps.enrollments.models import Enrollment, LessonProgress

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'status', 'enrolled_at', 'expires_at', 'order']
    list_filter = ['status', 'course', 'enrolled_at']
    search_fields = ['student__email', 'student__username', 'course__title', 'notes']
    ordering = ['-enrolled_at']

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'lesson', 'completed', 'last_position_seconds', 'updated_at']
    list_filter = ['completed', 'lesson__module__course']
    search_fields = ['student__email', 'student__username', 'lesson__title']
    ordering = ['-updated_at']
