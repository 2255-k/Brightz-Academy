"""
Protected Lesson Playback views for Bright Mindz Academy.
"""

from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.courses.models import Course, Lesson
from apps.enrollments.models import Enrollment, LessonProgress
from apps.video.adapters.factory import get_video_adapter
from apps.audit.models import AuditEvent

class LessonPlaybackView(views.APIView):
    """
    Authorizes and returns short-lived streaming credentials for a video lesson.
    Enforces server-side authorization:
    - Free preview lessons are accessible to all visitors.
    - Paid lessons strictly require an active, unexpired course enrollment.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson,
            id=lesson_id,
            publication_status=Lesson.STATUS_PUBLISHED,
            module__course__publication_status=Course.STATUS_PUBLISHED
        )
        course = lesson.module.course

        # Case 1: Preview lesson
        if lesson.is_preview:
            adapter = get_video_adapter()
            token_data = adapter.generate_playback_token(lesson, user=request.user)
            last_position = 0
            if request.user.is_authenticated:
                rec = LessonProgress.objects.filter(student=request.user, lesson=lesson).first()
                if rec:
                    last_position = rec.last_position_seconds

            return Response({
                'is_authorized': True,
                'is_preview': True,
                'lesson': {
                    'id': lesson.id,
                    'title': lesson.title,
                    'description': lesson.description,
                    'duration_seconds': lesson.duration_seconds,
                    'module_id': lesson.module.id,
                    'module_title': lesson.module.title,
                    'course_id': course.id,
                    'course_title': course.title,
                    'course_slug': course.slug,
                },
                'last_position_seconds': last_position,
                'playback': token_data,
            }, status=status.HTTP_200_OK)

        # Case 2: Paid lesson - requires student authentication
        if not request.user.is_authenticated:
            return Response(
                {
                    'is_authorized': False,
                    'error': 'Authentication required. Please log in to access this lesson.',
                    'course_slug': course.slug,
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Verify active, unexpired enrollment
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=course,
            status=Enrollment.STATUS_ACTIVE
        ).first()

        if not enrollment or not enrollment.is_valid:
            AuditEvent.log_event(
                user=request.user,
                action='UNAUTHORIZED_VIDEO_ACCESS_ATTEMPT',
                details={'lesson_id': lesson.id, 'course_id': course.id},
                request=request
            )
            return Response(
                {
                    'is_authorized': False,
                    'error': 'Active enrollment required. Please purchase this course to access protected lessons.',
                    'course_id': course.id,
                    'course_slug': course.slug,
                    'course_title': course.title,
                    'course_price': float(course.effective_price),
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Authorized! Generate signed token
        adapter = get_video_adapter()
        token_data = adapter.generate_playback_token(lesson, user=request.user)

        # Retrieve saved playback bookmark
        rec = LessonProgress.objects.filter(student=request.user, lesson=lesson).first()
        last_position = rec.last_position_seconds if rec else 0

        AuditEvent.log_event(
            user=request.user,
            action='VIDEO_PLAYBACK_AUTHORIZED',
            details={'lesson_id': lesson.id, 'course_id': course.id},
            request=request
        )

        return Response({
            'is_authorized': True,
            'is_preview': False,
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
                'description': lesson.description,
                'duration_seconds': lesson.duration_seconds,
                'module_id': lesson.module.id,
                'module_title': lesson.module.title,
                'course_id': course.id,
                'course_title': course.title,
                'course_slug': course.slug,
            },
            'last_position_seconds': last_position,
            'playback': token_data,
        }, status=status.HTTP_200_OK)
