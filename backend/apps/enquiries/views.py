"""
Views for processing student admissions enquiries.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from apps.enquiries.models import ContactEnquiry
from apps.enquiries.serializers import ContactEnquirySerializer

class SubmitEnquiryView(generics.CreateAPIView):
    serializer_class = ContactEnquirySerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        serializer.save(ip_address=ip)

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response({
            'message': 'Thank you! Your message has been received. Our academic counselor will reach out to you shortly.',
            'status': 'received'
        }, status=status.HTTP_201_CREATED)
