"""
Serializers for Student Enrollments and Progress.
"""

from rest_framework import serializers
from apps.enrollments.models import Enrollment, LessonProgress
from apps.courses.models import Course, Module, Lesson
from apps.courses.serializers import TeachingLanguageSerializer

class EnrolledCourseCardSerializer(serializers.ModelSerializer):
    teaching_language = TeachingLanguageSerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    next_lesson = serializers.SerializerMethodField()
    total_lessons_count = serializers.ReadOnlyField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'subtitle', 'thumbnail_url',
            'teaching_language', 'proficiency_level', 'progress_percentage',
            'next_lesson', 'total_lessons_count'
        ]

    def get_progress_percentage(self, obj):
        student = self.context['request'].user
        try:
            enrollment = Enrollment.objects.get(student=student, course=obj, status=Enrollment.STATUS_ACTIVE)
            return enrollment.calculate_progress_percentage()
        except Enrollment.DoesNotExist:
            return 0

    def get_next_lesson(self, obj):
        student = self.context['request'].user
        # Find first incomplete lesson in course
        completed_ids = set(
            LessonProgress.objects.filter(
                student=student,
                lesson__module__course=obj,
                completed=True
            ).values_list('lesson_id', flat=True)
        )
        first_incomplete = Lesson.objects.filter(
            module__course=obj,
            publication_status=Lesson.STATUS_PUBLISHED
        ).exclude(id__in=completed_ids).order_by('module__position', 'position').first()

        if first_incomplete:
            return {
                'id': first_incomplete.id,
                'title': first_incomplete.title,
                'module_title': first_incomplete.module.title,
            }

        first_lesson = Lesson.objects.filter(
            module__course=obj,
            publication_status=Lesson.STATUS_PUBLISHED
        ).order_by('module__position', 'position').first()

        if first_lesson:
            return {
                'id': first_lesson.id,
                'title': first_lesson.title,
                'module_title': first_lesson.module.title,
            }
        return None

class StudentLessonItemSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    formatted_duration = serializers.ReadOnlyField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'position',
            'duration_seconds', 'formatted_duration', 'is_preview',
            'progress'
        ]

    def get_progress(self, obj):
        student = self.context.get('student')
        if not student:
            return {'completed': False, 'last_position_seconds': 0}
        record = LessonProgress.objects.filter(student=student, lesson=obj).first()
        if record:
            return {
                'completed': record.completed,
                'last_position_seconds': record.last_position_seconds,
            }
        return {'completed': False, 'last_position_seconds': 0}

class StudentCurriculumModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'position', 'lessons']

    def get_lessons(self, obj):
        student = self.context.get('student')
        lessons = obj.lessons.filter(publication_status=Lesson.STATUS_PUBLISHED).order_by('position')
        return StudentLessonItemSerializer(lessons, many=True, context={'student': student}).data

class UpdateProgressSerializer(serializers.Serializer):
    last_position_seconds = serializers.IntegerField(min_value=0, required=False, default=0)
    completed = serializers.BooleanField(required=False, default=False)
