from rest_framework import serializers
from .models import *
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

class ApplicantSerializer(serializers.ModelSerializer):
    job_post_name = serializers.CharField(source='job_post.field', read_only=True)
    district_manager_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    evaluation = serializers.SerializerMethodField()  # Change to SerializerMethodField

    class Meta:
        model = Applicant
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 
                 'job_post', 'job_post_name', 'district_manager_name', 
                 'resume_file', 'status', 'updated_at', 'created_at', 'hired_date',
                 'evaluation']
        read_only_fields = ['created_at', 'updated_at', 'evaluation']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_district_manager_name(self, obj):
        try:
            return obj.job_post.district_manager.get_full_name()
        except AttributeError:
            return None

    def get_evaluation(self, obj):
        # Get or create evaluation for the applicant
        evaluation, created = PerformanceEvaluation.objects.get_or_create(
            applicant=obj,
            defaults={
                'technical_skills': 0,
                'communication': 0,
                'problem_solving': 0,
                'teamwork': 0,
                'leadership': 0,
                'adaptability': 0,
                'work_ethic': 0,
                'creativity': 0
            }
        )
        return PerformanceEvaluationSerializer(evaluation).data
    

class PerformanceEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceEvaluation
        fields = [
            'technical_skills', 'communication',
            'problem_solving', 'teamwork', 'leadership', 
            'adaptability', 'work_ethic', 'creativity'
        ]