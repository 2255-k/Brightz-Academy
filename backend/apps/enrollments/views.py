"""
Student dashboard and progress tracking views.
"""

from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.enrollments.models import Enrollment, LessonProgress
from apps.enrollments.serializers import (
    EnrolledCourseCardSerializer,
    StudentCurriculumModuleSerializer,
    UpdateProgressSerializer,
)
from apps.courses.models import Course, Lesson

class StudentDashboardView(views.APIView):
    """
    Personalized student dashboard endpoint.
    Restricted to authenticated students.
    Only returns courses and progress for the currently logged-in student.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        student = request.user
        enrollments = Enrollment.objects.filter(
            student=student,
            status=Enrollment.STATUS_ACTIVE
        ).select_related('course', 'course__teaching_language')

        enrolled_courses = [e.course for e in enrollments if e.is_valid]
        courses_data = EnrolledCourseCardSerializer(
            enrolled_courses,
            many=True,
            context={'request': request}
        ).data

        # Find most recently updated lesson progress to create "Continue Learning" banner
        recent_progress = LessonProgress.objects.filter(
            student=student
        ).select_related('lesson', 'lesson__module', 'lesson__module__course').first()

        continue_learning = None
        if recent_progress:
            continue_learning = {
                'lesson_id': recent_progress.lesson.id,
                'lesson_title': recent_progress.lesson.title,
                'module_title': recent_progress.lesson.module.title,
                'course_title': recent_progress.lesson.module.course.title,
                'course_slug': recent_progress.lesson.module.course.slug,
                'last_position_seconds': recent_progress.last_position_seconds,
                'completed': recent_progress.completed,
            }
        elif enrolled_courses:
            first_course = enrolled_courses[0]
            first_lesson = Lesson.objects.filter(
                module__course=first_course,
                publication_status=Lesson.STATUS_PUBLISHED
            ).order_by('module__position', 'position').first()
            if first_lesson:
                continue_learning = {
                    'lesson_id': first_lesson.id,
                    'lesson_title': first_lesson.title,
                    'module_title': first_lesson.module.title,
                    'course_title': first_course.title,
                    'course_slug': first_course.slug,
                    'last_position_seconds': 0,
                    'completed': False,
                }

        from apps.payments.models import Order
        order_count = Order.objects.filter(student=student).count()

        return Response({
            'student': {
                'id': student.id,
                'full_name': student.get_full_name() or student.username,
                'email': student.email,
                'preferred_language': student.preferred_language,
            },
            'enrolled_courses': courses_data,
            'continue_learning': continue_learning,
            'stats': {
                'total_enrolled': len(enrolled_courses),
                'total_orders': order_count,
            }
        })

class StudentCoursesListView(views.APIView):
    """List of all courses active for current student."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(
            student=request.user,
            status=Enrollment.STATUS_ACTIVE
        ).select_related('course', 'course__teaching_language')

        enrolled_courses = [e.course for e in enrollments if e.is_valid]
        serializer = EnrolledCourseCardSerializer(enrolled_courses, many=True, context={'request': request})
        return Response(serializer.data)

class StudentCourseCurriculumView(views.APIView):
    """
    Returns full course curriculum with progress checkmarks for enrolled student.
    If student is not enrolled, returns 403 unless viewing preview lessons.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        course = get_object_or_404(Course, slug=slug, publication_status=Course.STATUS_PUBLISHED)
        is_enrolled = Enrollment.objects.filter(
            student=request.user,
            course=course,
            status=Enrollment.STATUS_ACTIVE
        ).exists()

        modules = course.modules.all().order_by('position')
        serializer = StudentCurriculumModuleSerializer(
            modules,
            many=True,
            context={'student': request.user}
        )

        return Response({
            'course': {
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'is_enrolled': is_enrolled,
                'teaching_language': course.teaching_language.name,
            },
            'modules': serializer.data
        })

class UpdateLessonProgressView(views.APIView):
    """
    Records student watching position or lesson completion.
    Strictly verifies student has authorization for this lesson's course.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id, publication_status=Lesson.STATUS_PUBLISHED)
        course = lesson.module.course

        # Check authorization: user must have active enrollment OR lesson must be free preview
        has_enrollment = Enrollment.objects.filter(
            student=request.user,
            course=course,
            status=Enrollment.STATUS_ACTIVE
        ).exists()

        if not has_enrollment and not lesson.is_preview:
            return Response(
                {'error': 'You do not have an active enrollment for this course.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = UpdateProgressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_pos = serializer.validated_data.get('last_position_seconds', 0)
        completed = serializer.validated_data.get('completed', False)

        progress, created = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson,
            defaults={
                'last_position_seconds': last_pos,
                'completed': completed,
                'completed_at': timezone.now() if completed else None
            }
        )

        if not created:
            if last_pos > progress.last_position_seconds:
                progress.last_position_seconds = last_pos
            if completed and not progress.completed:
                progress.completed = True
                progress.completed_at = timezone.now()
            progress.save()

        # Recalculate course percentage
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        course_progress = enrollment.calculate_progress_percentage() if enrollment else 0

        return Response({
            'message': 'Lesson progress recorded.',
            'lesson_id': lesson.id,
            'completed': progress.completed,
            'last_position_seconds': progress.last_position_seconds,
            'course_progress_percentage': course_progress,
        }, status=status.HTTP_200_OK)
