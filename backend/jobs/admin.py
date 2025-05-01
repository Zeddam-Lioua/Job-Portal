from django.contrib import admin
from .models import *

@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ['field', 'company', 'status', 'is_active', 'created_at']
    list_filter = ['status', 'is_active', 'created_at', 'company']
    search_fields = ['field', 'company__name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(PerformanceEvaluation)
class PerformanceEvaluationAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'created_at']
    list_filter = ['created_at']
    search_fields = ['applicant__first_name', 'applicant__last_name']
    readonly_fields = ['created_at']