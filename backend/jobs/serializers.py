from rest_framework import serializers
from users.models import Applicant
from .models import JobPost, PerformanceEvaluation

class JobPostSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = JobPost
        fields = [
            'id', 'field', 'required_employees', 'experience_level', 'education_level',
            'workplace', 'contract_type', 'status', 'created_at', 'updated_at',
            'company', 'company_name', 'is_active'
        ]
        read_only_fields = ['company', 'company_name']

class PerformanceEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceEvaluation
        fields = [
            'technical_skills', 'communication',
            'problem_solving', 'teamwork', 'leadership', 
            'adaptability', 'work_ethic', 'creativity'
        ]

class ApplicantSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    evaluation = serializers.SerializerMethodField()
    job_post_name = serializers.CharField(source='job_post.field', read_only=True)

    class Meta:
        model = Applicant
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'profile_picture', 'preferred_occupation', 'preferred_industry',
            'current_situation', 'post_level', 'expected_salary', 'availability_days',
            'mobility', 'preferred_workplace', 'years_of_experience', 'location',
            'skills', 'resume_file', 'military_service', 'driving_license',
            'valid_passport', 'created_at', 'updated_at', 'evaluation', 'job_post_name',
            'status', 'hired_date'
        ]
        read_only_fields = ['created_at', 'updated_at', 'evaluation', 'job_post_name']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_evaluation(self, obj):
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