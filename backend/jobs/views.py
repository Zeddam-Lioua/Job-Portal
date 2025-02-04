from rest_framework import viewsets, permissions, status, generics, serializers
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, F

from .models import *
from .serializers import *
from users.models import CustomUser, OTPVerification

from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse
import logging


logger = logging.getLogger(__name__)

class JobRequestViewSet(viewsets.ModelViewSet):
    serializer_class = JobRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'district_manager':
            return JobRequest.objects.filter(district_manager=user)
        elif user.user_type == 'human_resources':
            return JobRequest.objects.all()
        return JobRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(district_manager=self.request.user)

    @action(detail=True, methods=['post'])
    def process_request(self, request, pk=None):
        if request.user.user_type != 'human_resources':
            return Response(
                {'error': 'Only Human Resources can process requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        action = request.data.get('action')
        job_request = self.get_object()
        
        if action == 'approve':
            job_request.status = 'approved'
            job_request.save()
            JobPost.objects.create(
                job_request=job_request,
                field=job_request.field,
                required_employees=job_request.required_employees,
                experience_level=job_request.experience_level,
                education_level=job_request.education_level,
                workplace=job_request.workplace,
                contract_type=request.data.get('contract_type', 'indifferent'),
                human_resources=request.user
            )
        elif action == 'reject':
            job_request.status = 'rejected'
            job_request.save()
        
        return Response({'status': job_request.status})

class JobPostViewSet(viewsets.ModelViewSet):
    queryset = JobPost.objects.filter(is_active=True)
    serializer_class = JobPostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return JobPost.objects.filter(is_active=True)

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.user_type == 'human_resources':
            return Resume.objects.all()
        return Resume.objects.none()

class ResumeCreateView(generics.CreateAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        try:
            applicant_email = self.request.data.get('email')
            if not applicant_email:
                raise serializers.ValidationError("Email is required")

            # Try to get existing user or create inactive user
            user, created = CustomUser.objects.get_or_create(
                email=applicant_email,
                defaults={'is_active': False}
            )
            
            # Save resume
            resume = serializer.save(applicant=self.request.data.get('applicant'))
            
            # Send OTP if user is not active
            if not user.is_active:
                otp = OTPVerification.generate_otp()
                OTPVerification.objects.create(user=user, otp=otp)
                
                send_mail(
                    'Verify your email',
                    f'Your verification code is: {otp}',
                    settings.DEFAULT_FROM_EMAIL,
                    [applicant_email],
                    fail_silently=False,
                )
            
            return resume
                
        except Exception as e:
            logger.error(f"Error creating resume: {str(e)}")
            raise serializers.ValidationError(f"Failed to create resume: {str(e)}")

class HRDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pending_requests_count = JobRequest.objects.filter(status='pending').count()
        active_jobs_count = JobPost.objects.filter(is_active=True).count()
        new_applications_count = Resume.objects.filter(status='pending').count()

        stats = {
            'pendingRequests': pending_requests_count,
            'activeJobs': active_jobs_count,
            'newApplications': new_applications_count
        }

        return Response(stats)

class JobRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobRequest.objects.all()
    serializer_class = JobRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

class JobPostDetailView(generics.RetrieveAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

class ResumeDetailView(generics.RetrieveAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

class AnalyticsStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            total_applications = Resume.objects.count()
            total_job_posts = JobPost.objects.count()
            total_hires = Resume.objects.filter(status='accepted').count()
            applications_per_job = JobPost.objects.annotate(applications=Count('resume')).values('field', 'applications')
            average_time_to_hire = Resume.objects.filter(status='accepted').annotate(time_to_hire=F('hired_date') - F('created_at')).aggregate(Avg('time_to_hire'))['time_to_hire__avg']
            application_conversion_rate = (total_hires / total_applications) * 100 if total_applications > 0 else 0

            stats = {
                'totalApplications': total_applications,
                'totalJobPosts': total_job_posts,
                'totalHires': total_hires,
                'applicationsPerJob': list(applications_per_job),
                'averageTimeToHire': average_time_to_hire,
                'applicationConversionRate': application_conversion_rate,
            }

            return Response(stats)
        except Exception as e:
            print(f"Error: {e}")
            return Response({'error': str(e)}, status=500)


class ApplicantListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applicants = Resume.objects.values(
            'id',
            'applicant',
            'email',
            'status'
        ).filter(status='pending')
        return Response(applicants, status=status.HTTP_200_OK)
    
