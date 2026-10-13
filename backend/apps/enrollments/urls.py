"""
Student Enrollments URL patterns.
"""

from django.urls import path
from apps.enrollments.views import (
    StudentDashboardView,
    StudentCoursesListView,
    StudentCourseCurriculumView,
    UpdateLessonProgressView,
)

urlpatterns = [
    path('dashboard/', StudentDashboardView.as_view(), name='student_dashboard'),
    path('courses/', StudentCoursesListView.as_view(), name='student_courses'),
    path('courses/<slug:slug>/curriculum/', StudentCourseCurriculumView.as_view(), name='student_course_curriculum'),
    path('lessons/<int:lesson_id>/progress/', UpdateLessonProgressView.as_view(), name='update_lesson_progress'),
]
