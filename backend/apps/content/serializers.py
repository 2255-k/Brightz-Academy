"""
Serializers for Trainers, Testimonials, and FAQs.
"""

from rest_framework import serializers
from apps.content.models import Trainer, Testimonial, FAQ

class TrainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer
        fields = [
            'id', 'name', 'title', 'bio', 'languages_spoken',
            'experience_years', 'photo_url', 'display_order'
        ]

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = [
            'id', 'student_name', 'role_or_location', 'mother_tongue',
            'course_name', 'quote', 'rating', 'is_demo'
        ]

class FAQSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'category_display', 'display_order']
