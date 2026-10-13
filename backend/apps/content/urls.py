"""
Content URL patterns.
"""

from django.urls import path
from apps.content.views import TrainerListView, TestimonialListView, FAQListView

urlpatterns = [
    path('trainers/', TrainerListView.as_view(), name='content_trainers'),
    path('testimonials/', TestimonialListView.as_view(), name='content_testimonials'),
    path('faqs/', FAQListView.as_view(), name='content_faqs'),
]
