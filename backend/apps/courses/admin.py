"""
Course admin interface with curriculum inlines.
"""

from django.contrib import admin
from apps.courses.models import TeachingLanguage, Course, Module, Lesson

@admin.register(TeachingLanguage)
class TeachingLanguageAdmin(admin.ModelAdmin):
    list_display = ['name', 'native_name', 'code', 'is_active', 'display_order']
    list_editable = ['is_active', 'display_order']
    search_fields = ['name', 'native_name', 'code']

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ['position', 'title', 'duration_seconds', 'is_preview', 'video_provider', 'provider_video_id', 'publication_status']
    ordering = ['position']

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['course', 'position', 'title', 'created_at']
    list_filter = ['course']
    search_fields = ['title', 'course__title']
    inlines = [LessonInline]
    ordering = ['course', 'position']

class ModuleInline(admin.StackedInline):
    model = Module
    extra = 0
    show_change_link = True
    fields = ['position', 'title', 'description']
    ordering = ['position']

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'teaching_language', 'proficiency_level',
        'price', 'discount_price', 'publication_status',
        'is_featured', 'created_at'
    ]
    list_filter = ['teaching_language', 'proficiency_level', 'publication_status', 'is_featured']
    search_fields = ['title', 'subtitle', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]
    ordering = ['-created_at']

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'position', 'duration_seconds', 'is_preview', 'video_provider', 'publication_status']
    list_filter = ['video_provider', 'is_preview', 'publication_status', 'module__course']
    search_fields = ['title', 'provider_video_id', 'module__title', 'module__course__title']
    ordering = ['module', 'position']
