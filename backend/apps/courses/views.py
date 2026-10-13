"""
Course views and public discovery endpoints.
"""

from rest_framework import generics, permissions
from django.db.models import Q
from apps.courses.models import TeachingLanguage, Course
from apps.courses.serializers import (
    TeachingLanguageSerializer,
    CourseListSerializer,
    CourseDetailSerializer,
)

class LanguageListView(generics.ListAPIView):
    """List active teaching languages for mother-tongue selection."""
    queryset = TeachingLanguage.objects.filter(is_active=True).order_by('display_order', 'name')
    serializer_class = TeachingLanguageSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class CourseListView(generics.ListAPIView):
    """
    Public catalog of published Spoken English courses.
    Supports filtering by:
    - language (code, e.g. ?language=ml or ?language=malayalam)
    - level (proficiency_level, e.g. ?level=foundation)
    - search (title, subtitle, description)
    - featured (?featured=true)
    """
    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Course.objects.filter(
            publication_status=Course.STATUS_PUBLISHED
        ).select_related('teaching_language').prefetch_related('modules__lessons')

        # Filter by language
        lang = self.request.query_params.get('language')
        if lang:
            queryset = queryset.filter(
                Q(teaching_language__code__iexact=lang) |
                Q(teaching_language__name__iexact=lang)
            )

        # Filter by proficiency level
        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(proficiency_level=level)

        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() in ('true', '1'):
            queryset = queryset.filter(is_featured=True)

        # Search query
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(subtitle__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset.order_by('-is_featured', 'teaching_language__display_order', '-created_at')

class CourseDetailView(generics.RetrieveAPIView):
    """
    Public course overview with syllabus modules.
    Lookup by unique URL slug.
    """
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Course.objects.filter(
            publication_status=Course.STATUS_PUBLISHED
        ).select_related('teaching_language').prefetch_related('modules__lessons')
