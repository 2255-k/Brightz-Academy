"""
Bunny Stream video adapter with token authentication.
"""

import time
import hashlib
from django.conf import settings
from apps.video.adapters.base import BaseVideoAdapter

class BunnyStreamAdapter(BaseVideoAdapter):
    """
    Bunny Stream provider implementation.
    Generates SHA256 token-authenticated URLs.
    """

    def __init__(self):
        self.library_id = getattr(settings, 'BUNNY_STREAM_LIBRARY_ID', '')
        self.api_key = getattr(settings, 'BUNNY_STREAM_API_KEY', '')
        self.token_auth_key = getattr(settings, 'BUNNY_STREAM_TOKEN_AUTH_KEY', '')

    def generate_playback_token(self, lesson, user=None, expires_in_seconds=3600) -> dict:
        video_id = lesson.provider_video_id
        exp_time = int(time.time()) + expires_in_seconds

        token = ""
        if self.token_auth_key:
            # SHA256(token_key + video_id + expires)
            hashable = f"{self.token_auth_key}{video_id}{exp_time}"
            token = hashlib.sha256(hashable.encode('utf-8')).hexdigest()

        stream_url = f"https://iframe.mediadelivery.net/play/{self.library_id}/{video_id}?token={token}&expires={exp_time}"
        return {
            'provider': 'bunny',
            'video_id': video_id,
            'signed_token': token,
            'iframe_url': stream_url,
            'stream_url': stream_url,
            'expires_at': exp_time,
        }
