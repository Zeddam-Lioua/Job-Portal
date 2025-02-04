from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'job-requests', JobRequestViewSet, basename='job-requests')
router.register(r'job-posts', JobPostViewSet, basename='job-posts')
router.register(r'resumes', ResumeViewSet, basename='resumes')

urlpatterns = [
    path('', include(router.urls)),
    path('resume-submit/', ResumeCreateView.as_view(), name='resume-submit'),
    path('hr/dashboard-stats/', HRDashboardStatsView.as_view(), name='hr-dashboard-stats'),
    path('hr/job-requests/<int:pk>/', JobRequestDetailView.as_view(), name='job-request-detail'),
    path('hr/job-posts/<int:pk>/', JobPostDetailView.as_view(), name='job-post-detail'),
    path('hr/resumes/<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('analytics-stats/', AnalyticsStatsView.as_view(), name='analytics-stats'),
    path('applicants/', ApplicantListView.as_view(), name='applicants'),


    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.authtoken')),
    
]