from django.contrib import admin
from .models import *
from django.contrib.auth.admin import UserAdmin


class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'user_type', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'user_type')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'first_name', 'last_name', 'password', 'profile_picture')}),
        ('Personal info', {'fields': ('user_type', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'user_type', 'password1', 'password2'),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(OTPVerification)

@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'preferred_occupation', 'preferred_industry', 'created_at']
    search_fields = ['first_name', 'last_name', 'email']

@admin.register(ApplicantEducation)
class ApplicantEducationAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'title', 'degree_level', 'school', 'start_date', 'end_date']
    search_fields = ['title', 'school']

@admin.register(ApplicantExperience)
class ApplicantExperienceAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'company', 'occupation', 'industry', 'start_date', 'end_date']
    search_fields = ['company', 'occupation__title']

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'size', 'is_verified', 'created_at']
    search_fields = ['name', 'industry']
    list_filter = ['is_verified', 'industry']
