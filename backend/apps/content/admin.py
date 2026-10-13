"""
Admin interface for Trainers, Testimonials, and FAQs.
"""

from django.contrib import admin
from apps.content.models import Trainer, Testimonial, FAQ

@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'languages_spoken', 'experience_years', 'is_active', 'display_order']
    list_editable = ['is_active', 'display_order']
    search_fields = ['name', 'title', 'bio', 'languages_spoken']

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'mother_tongue', 'course_name', 'rating', 'is_published', 'is_demo', 'consent_obtained', 'display_order']
    list_editable = ['is_published', 'is_demo', 'display_order']
    list_filter = ['is_published', 'is_demo', 'consent_obtained', 'mother_tongue']
    search_fields = ['student_name', 'quote', 'course_name']

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'is_published', 'display_order']
    list_editable = ['is_published', 'display_order']
    list_filter = ['category', 'is_published']
    search_fields = ['question', 'answer']
