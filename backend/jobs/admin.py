from django.contrib import admin
from .models import JobPost, JobRequest, Resume

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'user_type', 'department', 'phone']
    search_fields = ['username', 'email']
    list_filter = ['user_type']  # Allows filtering by user_type (District Manager, HR)

# Register the User model just once
admin.site.register(JobRequest, )
admin.site.register(JobPost, )
admin.site.register(Resume, )