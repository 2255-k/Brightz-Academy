"""
Course URL patterns.
"""

from django.urls import path
from apps.courses.views import LanguageListView, CourseListView, CourseDetailView

urlpatterns = [
    path('languages/', LanguageListView.as_view(), name='course_languages'),
    path('', CourseListView.as_view(), name='course_list'),
    path('<slug:slug>/', CourseDetailView.as_view(), name='course_detail'),
]
