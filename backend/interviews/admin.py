from django.contrib import admin
from .models import Interview, Recording

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ('meeting_id', 'interviewer', 'candidate_email', 'candidate_name', 'scheduled_time', 'status')
    list_filter = ('status', 'scheduled_time')
    search_fields = ('meeting_id', 'candidate_email', 'candidate_name', 'interviewer__email')
    readonly_fields = ('created_at',)
    ordering = ('-scheduled_time',)

@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = ('interview', 'interviewer', 'candidate_name', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('interview__meeting_id', 'interviewer__email', 'candidate_name')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)