from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'job-posts', JobPostViewSet, basename='job-posts')
router.register(r'resumes', ApplicantViewSet, basename='resumes')

urlpatterns = [
    path('', include(router.urls)),
    path('hr/dashboard-stats/', HRDashboardStatsView.as_view(), name='hr-dashboard-stats'),
    path('hr/job-posts/<int:pk>/', JobPostDetailView.as_view(), name='job-post-detail'),
    path('hr/applicant/<int:pk>/', ApplicantDetailView.as_view(), name='applicant-detail'),
    path('analytics-stats/', AnalyticsStatsView.as_view(), name='analytics-stats'),
    path('applicants/', ApplicantListView.as_view(), name='applicants'),
    path('applicants/<int:pk>/', ApplicantDetailView.as_view(), name='applicant-detail'),
    path('talent-pool/', TalentPoolView.as_view(), name='talent-pool'),
    
    path(
        'applicants/<int:applicant_id>/evaluation/',
        PerformanceEvaluationView.as_view(),
        name='performance-evaluation'
    ),
    
    path(
        'applicants/<int:applicant_id>/status/',
        UpdateApplicantStatusView.as_view(),
        name='update-applicant-status'
    ),

    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.authtoken')),
    
]