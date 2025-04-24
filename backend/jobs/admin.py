from django.contrib import admin
from .models import *

@admin.register(JobRequest)
class JobRequestAdmin(admin.ModelAdmin):
    list_display = ['field', 'district_manager', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['field', 'district_manager__email']
    readonly_fields = ['created_at']

@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ['field', 'human_resources', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['field', 'human_resources__email']
    readonly_fields = ['created_at']

@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'email', 'job_post', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['first_name', 'last_name', 'email']
    readonly_fields = ['created_at']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = 'Full Name'

@admin.register(PerformanceEvaluation)
class PerformanceEvaluationAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'created_at']
    list_filter = ['created_at']
    search_fields = ['applicant__first_name', 'applicant__last_name']
    readonly_fields = ['created_at']