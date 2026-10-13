"""
Public content views for Trainers, Testimonials, and FAQs.
"""

from rest_framework import generics, permissions
from apps.content.models import Trainer, Testimonial, FAQ
from apps.content.serializers import TrainerSerializer, TestimonialSerializer, FAQSerializer

class TrainerListView(generics.ListAPIView):
    queryset = Trainer.objects.filter(is_active=True).order_by('display_order', 'id')
    serializer_class = TrainerSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class TestimonialListView(generics.ListAPIView):
    queryset = Testimonial.objects.filter(is_published=True).order_by('display_order', '-created_at')
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class FAQListView(generics.ListAPIView):
    serializer_class = FAQSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        queryset = FAQ.objects.filter(is_published=True).order_by('display_order', 'id')
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset
