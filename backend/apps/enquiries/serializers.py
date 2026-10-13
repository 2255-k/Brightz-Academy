"""
Serializers for Contact Enquiries with spam protection.
"""

from rest_framework import serializers
from apps.enquiries.models import ContactEnquiry

class ContactEnquirySerializer(serializers.ModelSerializer):
    # Honeypot field for bot filtering
    website_hp = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = ContactEnquiry
        fields = [
            'id', 'name', 'email', 'phone', 'mother_tongue_interest',
            'subject', 'message', 'website_hp', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        # If honeypot is filled, silent reject
        if attrs.get('website_hp'):
            raise serializers.ValidationError("Invalid submission.")
        attrs.pop('website_hp', None)

        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError("Please provide at least a phone number or an email.")
        return attrs
