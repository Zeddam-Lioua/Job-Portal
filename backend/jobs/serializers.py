from rest_framework import serializers
from .models import JobRequest, JobPost, Resume
from users.serializers import CustomUserSerializer

class JobRequestSerializer(serializers.ModelSerializer):
    district_manager_name = serializers.CharField(source='district_manager.username', read_only=True)

    class Meta:
        model = JobRequest
        fields = ['id', 'field', 'required_employees', 'experience_level', 'education_level', 'workplace', 'status', 'created_at', 'district_manager', 'district_manager_name']
        read_only_fields = ['status', 'district_manager']

class JobPostSerializer(serializers.ModelSerializer):
    human_resources_name = serializers.ReadOnlyField(source='human_resources.get_full_name')

    class Meta:
        model = JobPost
        fields = ['id', 'job_request', 'field', 'required_employees', 'experience_level', 'education_level', 'workplace', 'contract_type', 'created_at', 'human_resources', 'human_resources_name', 'is_active']
        read_only_fields = ['human_resources']

class ResumeSerializer(serializers.ModelSerializer):
    job_post_name = serializers.CharField(source='job_post.field', read_only=True)
    district_manager_name = serializers.CharField(source='job_post.job_request.district_manager.username', read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'applicant', 'email', 'phone', 'job_post', 'job_post_name', 'district_manager_name', 'resume_file', 'status', 'updated_at', 'created_at', 'hired_date']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_created_at(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M:%S")

    def get_updated_at(self, obj):
        return obj.updated_at.strftime("%Y-%m-%d %H:%M:%S")