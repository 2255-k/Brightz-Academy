"""
Cloudflare Stream video adapter with signed playback tokens.
"""

import time
import jwt
from django.conf import settings
from apps.video.adapters.base import BaseVideoAdapter

class CloudflareStreamAdapter(BaseVideoAdapter):
    """
    Cloudflare Stream provider implementation.
    Generates signed JSON Web Tokens (JWT) for restricted videos.
    """

    def __init__(self):
        self.account_id = getattr(settings, 'CLOUDFLARE_STREAM_ACCOUNT_ID', '')
        self.api_token = getattr(settings, 'CLOUDFLARE_STREAM_API_TOKEN', '')
        self.subdomain = getattr(settings, 'CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN', '')
        self.pem_key_id = getattr(settings, 'CLOUDFLARE_STREAM_PEM_KEY_ID', '')
        self.jwk_key = getattr(settings, 'CLOUDFLARE_STREAM_JWK_KEY', '')

    def generate_playback_token(self, lesson, user=None, expires_in_seconds=3600) -> dict:
        video_id = lesson.provider_video_id
        exp_time = int(time.time()) + expires_in_seconds

        # If RSA private key is configured, sign Cloudflare Stream JWT
        if self.pem_key_id and self.jwk_key:
            payload = {
                'sub': video_id,
                'kid': self.pem_key_id,
                'exp': exp_time,
                'nbf': int(time.time()) - 10,
                'accessRules': [
                    {'type': 'any'}
                ]
            }
            token = jwt.encode(payload, self.jwk_key, algorithm='RS256')
            stream_url = f"https://customer-{self.subdomain}.cloudflarestream.com/{token}/manifest/video.m3u8"
            iframe_url = f"https://customer-{self.subdomain}.cloudflarestream.com/{token}/iframe"
            return {
                'provider': 'cloudflare',
                'video_id': video_id,
                'signed_token': token,
                'stream_url': stream_url,
                'iframe_url': iframe_url,
                'expires_at': exp_time,
            }

        # Fallback to direct token if signing key is not yet set
        return {
            'provider': 'cloudflare',
            'video_id': video_id,
            'signed_token': None,
            'iframe_url': f"https://iframe.videodelivery.net/{video_id}",
            'stream_url': f"https://videodelivery.net/{video_id}/manifest/video.m3u8",
            'expires_at': exp_time,
        }
