"""
Serializers for Courses and Curriculum.
"""

from rest_framework import serializers
from apps.courses.models import TeachingLanguage, Course, Module, Lesson

class TeachingLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeachingLanguage
        fields = ['id', 'name', 'native_name', 'code', 'is_active', 'display_order']

class PublicLessonSerializer(serializers.ModelSerializer):
    formatted_duration = serializers.ReadOnlyField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'position',
            'duration_seconds', 'formatted_duration', 'is_preview'
        ]

class PublicModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'position', 'lessons']

    def get_lessons(self, obj):
        published_lessons = obj.lessons.filter(publication_status=Lesson.STATUS_PUBLISHED).order_by('position')
        return PublicLessonSerializer(published_lessons, many=True).data

class CourseListSerializer(serializers.ModelSerializer):
    teaching_language = TeachingLanguageSerializer(read_only=True)
    effective_price = serializers.ReadOnlyField()
    total_lessons_count = serializers.ReadOnlyField()
    total_duration_minutes = serializers.ReadOnlyField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'subtitle', 'proficiency_level',
            'teaching_language', 'price', 'discount_price', 'effective_price',
            'estimated_duration_hours', 'access_duration_days',
            'thumbnail_url', 'trainer_name', 'trainer_title',
            'is_featured', 'total_lessons_count', 'total_duration_minutes',
            'created_at'
        ]

class CourseDetailSerializer(serializers.ModelSerializer):
    teaching_language = TeachingLanguageSerializer(read_only=True)
    effective_price = serializers.ReadOnlyField()
    total_lessons_count = serializers.ReadOnlyField()
    total_duration_minutes = serializers.ReadOnlyField()
    modules = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'subtitle', 'description',
            'learning_objectives', 'target_audience', 'proficiency_level',
            'teaching_language', 'price', 'discount_price', 'effective_price',
            'estimated_duration_hours', 'access_duration_days',
            'thumbnail_url', 'trainer_name', 'trainer_title',
            'is_featured', 'total_lessons_count', 'total_duration_minutes',
            'modules', 'is_enrolled', 'created_at', 'updated_at'
        ]

    def get_modules(self, obj):
        modules = obj.modules.all().order_by('position')
        return PublicModuleSerializer(modules, many=True).data

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.enrollments.models import Enrollment
            return Enrollment.objects.filter(
                student=request.user,
                course=obj,
                status=Enrollment.STATUS_ACTIVE
            ).exists()
        return False
