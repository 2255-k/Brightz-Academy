"""
Enquiries URL patterns.
"""

from django.urls import path
from apps.enquiries.views import SubmitEnquiryView

urlpatterns = [
    path('', SubmitEnquiryView.as_view(), name='submit_enquiry'),
]
