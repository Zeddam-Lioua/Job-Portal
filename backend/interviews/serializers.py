from rest_framework import serializers
from .models import *
from jobs.models import Applicant

class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(read_only=True)
    candidate_email = serializers.EmailField(read_only=True)

    class Meta:
        model = Interview
        fields = [
            'meeting_id', 
            'candidate', 
            'candidate_name', 
            'candidate_email', 
            'scheduled_time', 
            'status', 
            'type'
        ]
        read_only_fields = ['meeting_id', 'status', 'candidate_name', 'candidate_email']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['candidate_name'] = instance.candidate_name
        representation['candidate_email'] = instance.candidate_email
        return representation

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
