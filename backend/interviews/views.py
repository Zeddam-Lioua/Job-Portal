from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import *
from .serializers import *

from .utils.email_utils import send_email_with_template
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from getstream import Stream
from stream_chat import StreamChat
from getstream.models import UserRequest, CallRequest, MemberRequest
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from users.models import CustomUser
from datetime import datetime
import uuid
from urllib.parse import quote


class GenerateStreamTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            room_id = request.query_params.get('room_id')
            clean_user_id = user_id.replace('@', '_').replace('.', '_')

            # Fetch HR user's first name and last name from the database
            hr_user = CustomUser.objects.get(email=request.user.email)
            display_name = f"{hr_user.first_name} {hr_user.last_name}".strip() or clean_user_id

            client = Stream(
                api_key=settings.STREAM_API_KEY,
                api_secret=settings.STREAM_API_SECRET
            )

            # Step 1: Create/update user with display name
            try:
                client.upsert_users(
                    UserRequest(
                        id=clean_user_id,
                        name=display_name,
                        role="admin"
                    )
                )
            except Exception as e:
                print(f"Error registering HR user: {str(e)}")

            # Step 2: Generate token
            token = client.create_token(clean_user_id)

            # Create call and add HR as host
            try:
                call = client.video.call("default", room_id)
                call.create(
                    data=CallRequest(
                        created_by_id=clean_user_id,
                        members=[
                            MemberRequest(
                                user_id=clean_user_id,
                                role="admin"  # Set HR as admin
                            )
                        ],
                        custom={}
                    )
                )
            except Exception as e:
                print(f"Error creating call: {e}")

            return Response({
                "token": token,
                "call_cid": f"default:{room_id}",
                "room_id": room_id
            })

        except Exception as e:
            return Response(
                {"error": f"Failed to generate token: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GuestStreamTokenView(APIView):
    def get(self, request, user_id):
        try:
            room_id = request.query_params.get('room_id')
            first_name = request.query_params.get('firstName', '')
            last_name = request.query_params.get('lastName', '')

            # Validate guest user ID
            if not user_id.startswith('guest_'):
                return Response({"error": "Invalid guest user"}, status=status.HTTP_400_BAD_REQUEST)

            clean_user_id = user_id.replace('@', '_').replace('.', '_')
            display_name = f"{first_name} {last_name}".strip() or f"Guest {clean_user_id}"

            # Initialize Stream clients
            stream_client = Stream(
                api_key=settings.STREAM_API_KEY,
                api_secret=settings.STREAM_API_SECRET
            )
            chat_client = StreamChat(
                api_key=settings.STREAM_API_KEY,
                api_secret=settings.STREAM_API_SECRET
            )

            # Step 1: Update channel type grants for 'messaging'
            try:
                chat_client.update_channel_type(
                    "messaging",
                    grants={
                        "guest": [
                            "read-channel",
                            "create-message",
                            "create-channel"
                        ]
                    }
                )
            except Exception as e:
                print(f"Error updating channel type grants: {str(e)}")
                return Response(
                    {"error": f"Failed to update channel type grants: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Step 2: Create/update user with display name
            try:
                chat_client.upsert_users([{
                    "id": clean_user_id,
                    "name": display_name,
                    "role": "guest"
                }])
            except Exception as e:
                print(f"Error registering guest user: {str(e)}")
                return Response(
                    {"error": f"Failed to register guest: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Step 3: Generate token
            try:
                exp = 24 * 3600  # Token expiration time (24 hours)
                token = chat_client.create_token(user_id=clean_user_id, expiration=exp)
            except Exception as e:
                print(f"Error generating token: {str(e)}")
                return Response(
                    {"error": f"Failed to generate token: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Step 4: Update interview guest information
            try:
                interview = Interview.objects.get(meeting_id=room_id)
                interview.guest_id = clean_user_id
                interview.save(update_fields=['guest_id'])
            except Interview.DoesNotExist:
                pass
            except Exception as e:
                print(f"Error updating interview: {str(e)}")
                return Response(
                    {"error": f"Failed to update interview: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Step 5: Add guest to call as member
            try:
                call = stream_client.video.call("default", room_id)
                call.update_call_members(
                    update_members=[
                        {
                            "user_id": clean_user_id,
                        }
                    ]
                )
            except Exception as e:
                print(f"Error adding member to call: {e}")

            # Return response
            return Response({
                "token": token,
                "call_cid": f"default:{room_id}",
                "room_id": room_id,
                "display_name": display_name
            })

        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
                
class CreateMeetingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            email = request.data.get('candidate_email')
            try:
                candidate = Applicant.objects.filter(email=email).latest('created_at')
            except Applicant.DoesNotExist:
                return Response(
                    {"error": "Candidate not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            room_name = f"instant-interview-{uuid.uuid4()}"
            interview = Interview.objects.create(
                meeting_id=room_name,
                interviewer=request.user,
                candidate=candidate,
                scheduled_time=timezone.now(),
                status='started'
            )

            return Response({
                "message": "Meeting created successfully",
                "meeting_id": room_name
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("Error creating meeting:", str(e))
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ScheduleInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            print("Schedule Interview - Request data:", request.data)
            print("Schedule Interview - User:", request.user)
            
            # Get the most recent candidate application with this email
            candidate_email = request.data.get('candidate_email')
            try:
                candidate = Applicant.objects.filter(
                    email=candidate_email
                ).order_by('created_at').first()
                
                if not candidate:
                    return Response(
                        {"error": "Candidate not found"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            except Exception as e:
                return Response(
                    {"error": f"Error finding candidate: {str(e)}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Add candidate to request data
            interview_data = {
                **request.data,
                'candidate': candidate.id,
                'interviewer': request.user.id
            }

            serializer = InterviewSerializer(data=interview_data)
            if serializer.is_valid():
                interview = Interview.objects.create(
                    meeting_id=f"scheduled-interview-{uuid.uuid4()}",
                    interviewer=request.user,
                    candidate=candidate,
                    scheduled_time=serializer.validated_data['scheduled_time'],
                    status='scheduled',
                    type=serializer.validated_data['type']
                )
                
                return Response({
                    "message": "Interview scheduled successfully",
                    "meeting_id": interview.meeting_id
                }, status=status.HTTP_201_CREATED)
                
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Error in ScheduleInterviewView:", str(e))
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class JoinMeetingView(APIView):
    def get(self, request, meeting_id):
        try:
            interview = Interview.objects.get(meeting_id=meeting_id)
            serializer = InterviewSerializer(interview)
            return Response(serializer.data)
        except Interview.DoesNotExist:
            return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)
        

class ViewRecordingsView(APIView):
    def get(self, request):
        recordings = Recording.objects.filter(interviewer=request.user)
        serializer = RecordingSerializer(recordings, many=True)
        return Response(serializer.data)
    

class ViewUpcomingMeetingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Add debug prints
            print("Current user:", request.user)
            print("Current time:", timezone.now())
            
            upcoming_meetings = Interview.objects.filter(
                interviewer=request.user,
                scheduled_time__gte=timezone.now(),
                status='scheduled'
            ).order_by('scheduled_time')
            
            # Debug prints
            print("Raw query:", upcoming_meetings.query)
            print("Found meetings count:", upcoming_meetings.count())
            
            serializer = InterviewSerializer(upcoming_meetings, many=True)
            return Response({
                "upcoming": serializer.data
            })
        except Exception as e:
            print("Error in ViewUpcomingMeetingsView:", str(e))
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class PersonalRoomView(APIView):
    def get(self, request):
        # Assuming each user has a personal room
        personal_room = f"{settings.FRONTEND_URL}/interview/{request.user.id}"
        return Response({"personal_room": personal_room})
    

class SendInvitationView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            meeting_id = request.data.get('meetingId')
            scheduled_time = request.data.get('scheduledTime')
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            
            # Generate unique guest ID
            guest_id = f"guest_{uuid.uuid4()}"
            interview = Interview.objects.get(meeting_id=meeting_id)
            interview.guest_id = guest_id
            interview.save()
            
            # Construct guest meeting link with guest ID
            guest_meeting_link = (
                f"{settings.FRONTEND_URL}/guest/interview/{meeting_id}"
                f"?guest_id={guest_id}"
                f"&first_name={quote(first_name)}"
                f"&last_name={quote(last_name)}"
                f"&email={quote(email)}"
            )
            
            
            # Format the time
            formatted_time = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00')).strftime(
                "%B %d, %Y at %I:%M %p"
            )
            
            context = {
                'scheduled_time': formatted_time,
                'meeting_link': guest_meeting_link
            }

            print("Sending email with context:", context)  # Debug log
            print("Using template: email/meeting-invitation.html")  # Debug log
            
            send_email_with_template(
                'meeting-invitation.html',  # Just the template name
                context,
                "Interview Invitation",
                [email]
            )
            
            return Response({
                "message": "Invitation sent successfully",
                "meeting_link": guest_meeting_link,
                "guest_id": guest_id
            })
            
        except Interview.DoesNotExist:
            return Response(
                {"error": "Interview not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in SendInvitationView: {str(e)}")
            import traceback
            print(traceback.format_exc())  # Print full traceback
            return Response(
                {"error": f"Failed to send invitation: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class NotifyScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            email = request.data.get('email')
            scheduled_time = request.data.get('scheduledTime')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            
            if not email or not scheduled_time:
                return Response(
                    {"error": "Email and scheduled time are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Format the time
            formatted_time = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00')).strftime(
                "%B %d, %Y at %I:%M %p"
            )

            # Context for scheduling notification only
            context = {
                'scheduled_time': formatted_time,
                'candidate_name': f"{first_name} {last_name}",
                'interviewer_name': f"{request.user.first_name} {request.user.last_name}"
            }

            # Send scheduling notification without meeting link
            send_email_with_template(
                'schedule-invitation.html',
                context,
                "Interview Scheduled",
                [email]
            )

            return Response(
                {"message": "Schedule notification sent successfully"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print("Error sending schedule notification:", str(e))
            return Response(
                {"error": f"Failed to send notification: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SaveRecordingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            print("Received recording data:", request.data)  # Debug log
            recording_data = {
                'interview_id': request.data.get('interview_id'),
                'recording_url': request.data.get('recording_url'),
                'chat_log': request.data.get('chat_log', ''),
                'interviewer': request.user.id
            }
            
            serializer = RecordingSerializer(data=recording_data)
            if serializer.is_valid():
                serializer.save()
                print("Recording saved successfully")  # Debug log
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            print("Serializer errors:", serializer.errors)  # Debug log
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print("Error saving recording:", str(e))  # Debug log
            return Response(
                {"error": f"Failed to save recording: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class CancelMeetingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, meeting_id):
        try:
            interview = Interview.objects.get(meeting_id=meeting_id)
            
            context = {
                'scheduled_time': interview.scheduled_time.strftime("%B %d, %Y at %I:%M %p")
            }

            send_email_with_template(
                'meeting-cancelled.html',
                context,
                "Interview Cancelled",
                [interview.candidate_email]
            )
            
            # Delete the interview
            interview.delete()
            
            return Response(
                {"message": "Meeting cancelled successfully"},
                status=status.HTTP_200_OK
            )
            
        except Interview.DoesNotExist:
            return Response(
                {"error": "Meeting not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
