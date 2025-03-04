from rest_framework import viewsets, permissions, status, generics, serializers
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, F
from urllib.parse import quote

from .models import *
from .serializers import *
from users.models import CustomUser, OTPVerification, Notification
from django.contrib.auth import get_user_model

from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse
from django.utils import timezone
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
        # Save the job request first
        job_request = serializer.save(district_manager=self.request.user)

        # Then create notifications for HR users
        hr_users = get_user_model().objects.filter(user_type='human_resources')
        for hr_user in hr_users:
            Notification.objects.create(
                recipient=hr_user,
                sender_type='user',
                sender_user=self.request.user,
                notification_type='job_request',
                title='New Job Request',
                message=f'New job request received for {job_request.field}',
                link=f'/admin/hr/dashboard/job-requests',
                entity_id=job_request.id
        )
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

class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.user_type == 'human_resources':
            return Applicant.objects.all()
        return Applicant.objects.none()

class ApplicantCreateView(generics.CreateAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        try:
            # Get job post
            job_post_id = self.request.data.get('job_post')
            job_post = JobPost.objects.get(id=job_post_id)
            
            # Get email from request data
            applicant_email = self.request.data.get('email')

            # Save applicant with required fields
            applicant = serializer.save(
                job_post=job_post,
                status='pending'
            )

            # Create notification for HR users
            hr_users = get_user_model().objects.filter(user_type='human_resources')
            for hr_user in hr_users:
                Notification.objects.create(
                    recipient=hr_user,
                    notification_type='application',
                    title='New Application',
                    message=f'New application received from {applicant.first_name} {applicant.last_name}',
                    link=f'/admin/hr/dashboard/applicants/{applicant.id}'
                )
            
            # Check if user exists or create new one
            User = get_user_model()
            user, created = User.objects.get_or_create(
                email=applicant_email,
                defaults={
                    'username': applicant_email,
                    'is_active': False
                }
            )

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
            
            return applicant
                
        except Exception as e:
            logger.error(f"Error creating applicant: {str(e)}")
            raise serializers.ValidationError(f"Failed to create application: {str(e)}")

class HRDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pending_requests_count = JobRequest.objects.filter(status='pending').count()
        active_jobs_count = JobPost.objects.filter(is_active=True).count()
        new_applications_count = Applicant.objects.filter(status='pending').count()

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

class ApplicantDetailView(generics.RetrieveAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    permission_classes = [permissions.IsAuthenticated]

class AnalyticsStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            total_applications = Applicant.objects.count()
            total_job_posts = JobPost.objects.count()
            total_hires = Applicant.objects.filter(status='accepted').count()
            applications_per_job = JobPost.objects.annotate(applications=Count('applicant')).values('field', 'applications')
            average_time_to_hire = Applicant.objects.filter(status='accepted').annotate(time_to_hire=F('hired_date') - F('created_at')).aggregate(Avg('time_to_hire'))['time_to_hire__avg']
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
        applicants = Applicant.objects.values(
            'id',
            'first_name',
            'last_name',
            'email',
            'status',
            'created_at',
            'job_post__field'  # Make sure this is included
        ).filter(status='pending')
        
        # Transform the data to match frontend expectations
        for applicant in applicants:
            applicant['job_post_name'] = applicant.pop('job_post__field', None)
            
        return Response(applicants, status=status.HTTP_200_OK)
    

class TalentPoolView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            candidates = Applicant.objects.filter(status='candidate')
            super_candidates = Applicant.objects.filter(status='super_candidate')
            hirees = Applicant.objects.filter(status='hiree')

            return Response({
                'candidates': ApplicantSerializer(candidates, many=True).data,
                'superCandidates': ApplicantSerializer(super_candidates, many=True).data,
                'hirees': ApplicantSerializer(hirees, many=True).data
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class UpdateApplicantStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, applicant_id):
        try:
            applicant = Applicant.objects.get(id=applicant_id)
            new_status = request.data.get('status')
            
            if new_status not in dict(Applicant.STATUS_CHOICES):
                return Response(
                    {'error': 'Invalid status'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            applicant.status = new_status
            if new_status == 'hiree':
                applicant.hired_date = timezone.now()
            applicant.save()
            
            return Response(ApplicantSerializer(applicant).data)
        except Applicant.DoesNotExist:
            return Response(
                {'error': 'Applicant not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class PerformanceEvaluationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, applicant_id):
        try:
            evaluation = PerformanceEvaluation.objects.get(
                applicant_id=applicant_id
            )
            return Response(PerformanceEvaluationSerializer(evaluation).data)
        except PerformanceEvaluation.DoesNotExist:
            return Response(
                {'error': 'No evaluation found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, applicant_id):
        try:
            # Check if evaluation exists
            evaluation = PerformanceEvaluation.objects.filter(
                applicant_id=applicant_id
            ).first()
            
            serializer = PerformanceEvaluationSerializer(
                evaluation,
                data=request.data,
                partial=True
            ) if evaluation else PerformanceEvaluationSerializer(data={
                **request.data,
                'applicant': applicant_id
            })
            
            if serializer.is_valid():
                serializer.save()
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED if not evaluation 
                    else status.HTTP_200_OK
                )
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )