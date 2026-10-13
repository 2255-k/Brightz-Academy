"""
Video playback URL patterns.
"""

from django.urls import path
from apps.video.views import LessonPlaybackView

urlpatterns = [
    path('<int:lesson_id>/playback/', LessonPlaybackView.as_view(), name='lesson_playback'),
]
