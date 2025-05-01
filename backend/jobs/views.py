from rest_framework import viewsets, permissions, status, generics, serializers
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import ExpressionWrapper, DurationField, Avg, F, Count
from django.db.models.functions import TruncDate
from datetime import timedelta, datetime

from .models import *
from .serializers import *
from users.models import CustomUser, OTPVerification, Notification
from django.contrib.auth import get_user_model

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
import logging


logger = logging.getLogger(__name__)

class JobPostViewSet(viewsets.ModelViewSet):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer

    def perform_create(self, serializer):
        company = self.request.user.company
        serializer.save(company=company, status='pending')

    @action(detail=True, methods=['post'])
    def process_post(self, request, pk=None):
        # Only admin can process
        if not request.user.is_authenticated or request.user.user_type != 'admin':
            return Response(
                {'error': 'Only Admin can process job posts'},
                status=status.HTTP_403_FORBIDDEN
            )

        action_type = request.data.get('action')
        job_post = self.get_object()

        if action_type == 'approve':
            job_post.status = 'published'
            job_post.is_active = True
            job_post.verified_by = request.user
            job_post.save()
        elif action_type == 'reject':
            job_post.status = 'fix'
            job_post.is_active = False
            job_post.verified_by = request.user
            job_post.save()
        else:
            return Response(
                {'error': 'Invalid action'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'status': job_post.status})

class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.user_type == 'admin':
            return Applicant.objects.all()
        return Applicant.objects.none()


class HRDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        active_jobs_count = JobPost.objects.filter(is_active=True).count()
        new_applications_count = Applicant.objects.filter(status='pending').count()

        stats = {
            'activeJobs': active_jobs_count,
            'newApplications': new_applications_count
        }

        return Response(stats)



class JobPostDetailView(generics.RetrieveAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

class ApplicantDetailView(generics.RetrieveDestroyAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class AnalyticsStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            total_applications = Applicant.objects.count()
            total_job_posts = JobPost.objects.count()
            total_hires = Applicant.objects.filter(status='hired').count()
            applications_per_job = JobPost.objects.annotate(
                applications=Count('applicant')
            ).values('field', 'applications')

            # Fix for average time to hire calculation
            hired_applicants = Applicant.objects.filter(status='hired').annotate(
                time_to_hire=ExpressionWrapper(
                    F('hired_date') - F('created_at'),
                    output_field=DurationField()
                )
            )
            
            if hired_applicants.exists():
                total_days = sum(
                    (applicant.time_to_hire.days 
                     for applicant in hired_applicants 
                     if applicant.time_to_hire)
                )
                average_days = total_days / hired_applicants.count()
            else:
                average_days = 0

            application_conversion_rate = (total_hires / total_applications * 100) if total_applications > 0 else 0

            stats = {
                'totalApplications': total_applications,
                'totalJobPosts': total_job_posts,
                'totalHires': total_hires,
                'applicationsPerJob': list(applications_per_job),
                'averageTimeToHire': round(average_days, 1),  # Round to 1 decimal place
                'applicationConversionRate': round(application_conversion_rate, 2),  # Round to 2 decimal places
            }

            time_range = request.query_params.get('time_range', 'all')
            
            # Calculate date range
            if time_range == 'week':
                start_date = timezone.now() - timedelta(days=7)
            elif time_range == 'month':
                start_date = timezone.now() - timedelta(days=30)
            else:
                start_date = None

            # Base queryset filters
            date_filter = {'created_at__gte': start_date} if start_date else {}
            
            # Add new analytics
            applications_per_day = (
                Applicant.objects.filter(**date_filter)
                .annotate(date=TruncDate('created_at'))
                .values('date')
                .annotate(count=Count('id'))
                .order_by('date')
            )

            job_posts_per_day = (
                JobPost.objects.filter(**date_filter)
                .annotate(date=TruncDate('created_at'))
                .values('date')
                .annotate(count=Count('id'))
                .order_by('date')
            )

            # Add new stats to existing response
            stats.update({
                # ... existing stats remain unchanged ...
                'applicationsPerDay': list(applications_per_day),
                'jobPostsPerDay': list(job_posts_per_day),
            })
        

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
            hired = Applicant.objects.filter(status='hired')

            return Response({
                'candidates': ApplicantSerializer(candidates, many=True).data,
                'superCandidates': ApplicantSerializer(super_candidates, many=True).data,
                'hired': ApplicantSerializer(hired, many=True).data
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
            if new_status == 'hired':
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