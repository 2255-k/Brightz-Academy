"""
Factory to instantiate the configured video streaming adapter.
"""

from django.conf import settings
from apps.video.adapters.cloudflare import CloudflareStreamAdapter
from apps.video.adapters.bunny import BunnyStreamAdapter
from apps.video.adapters.mock import MockVideoAdapter

def get_video_adapter():
    """Returns the adapter matching VIDEO_PROVIDER in settings."""
    provider = getattr(settings, 'VIDEO_PROVIDER', 'mock').lower()
    if provider == 'cloudflare':
        return CloudflareStreamAdapter()
    elif provider == 'bunny':
        return BunnyStreamAdapter()
    return MockVideoAdapter()
