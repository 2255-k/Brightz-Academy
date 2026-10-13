"""
Development Mock Video Adapter for Bright Mindz Academy.
Allows full end-to-end testing of video authorization, progress tracking,
and UI playback without requiring live third-party cloud streaming subscriptions.
"""

import time
import hmac
import hashlib
from django.conf import settings
from apps.video.adapters.base import BaseVideoAdapter

class MockVideoAdapter(BaseVideoAdapter):
    """
    Mock adapter with secure HMAC-signed token generation.
    Clearly distinguishes mock streams from production CDN endpoints.
    """

    def generate_playback_token(self, lesson, user=None, expires_in_seconds=3600) -> dict:
        video_id = lesson.provider_video_id
        exp_time = int(time.time()) + expires_in_seconds
        user_identifier = str(user.id) if user and user.is_authenticated else 'public_preview'

        # Generate HMAC signed token
        secret = getattr(settings, 'SECRET_KEY', 'bma_mock_secret')
        msg = f"{lesson.id}|{video_id}|{user_identifier}|{exp_time}".encode('utf-8')
        signed_token = hmac.new(secret.encode('utf-8'), msg, hashlib.sha256).hexdigest()

        # Reliable educational stream for development player
        sample_stream_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

        return {
            'provider': 'mock',
            'video_id': video_id,
            'signed_token': signed_token,
            'stream_url': sample_stream_url,
            'iframe_url': None,
            'expires_at': exp_time,
            'is_mock_stream': True,
            'note': 'Development mock stream. Authorization verified server-side.',
        }
