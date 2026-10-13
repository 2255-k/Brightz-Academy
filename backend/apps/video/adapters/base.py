"""
Base abstract adapter for video streaming services.
"""

from abc import ABC, abstractmethod

class BaseVideoAdapter(ABC):
    """
    Abstract interface for video streaming providers.
    """

    @abstractmethod
    def generate_playback_token(self, lesson, user=None, expires_in_seconds=3600) -> dict:
        """
        Generates a short-lived signed token or playback URL for the authorized user.
        Returns a dict containing player_type, stream_url or video_id, and signed_token.
        """
        pass
