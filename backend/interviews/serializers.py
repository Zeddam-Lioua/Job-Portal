from rest_framework import serializers
from .models import *

class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = ['meeting_id', 'candidate_email', 'scheduled_time', 'status', 'type']
        read_only_fields = ['meeting_id', 'status']
        extra_kwargs = {
            'candidate_email': {'required': True},
            'scheduled_time': {'required': True},
            'type': {'required': True}
        }

    def validate(self, data):
        print("Validating data:", data)  # Debug log
        return data

class RecordingSerializer(serializers.ModelSerializer):
    video_url = serializers.URLField(required=True)  # Ensure video URL is valid
    chat_log = serializers.CharField(required=False, allow_blank=True)  # Allow empty chat logs

    class Meta:
        model = Recording
        fields = ['id', 'video_url', 'chat_log', 'created_at', 'interviewer', 'interview']
        read_only_fields = ['interviewer', 'interview', 'created_at']  # Prevent modification of these fields

    def validate_video_url(self, value):
        """
        Validate that the video URL is accessible (optional).
        """
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("Invalid video URL format.")
        return value
