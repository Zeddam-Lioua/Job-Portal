from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import *
from .serializers import *

from stream_chat import StreamChat
from getstream import Stream
from getstream.models import UserRequest, CallRequest, MemberRequest
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from users.models import CustomUser
import time
import uuid

class GenerateStreamTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            room_id = request.query_params.get('room_id')
            clean_user_id = user_id.replace('@', '_').replace('.', '_')
            
            client = StreamChat(
                api_key=settings.STREAM_API_KEY,
                api_secret=settings.STREAM_API_SECRET
            )

            # Add HR-specific permissions
            hr_permissions = {
                "call_permissions": [
                    "send-audio",
                    "send-video",
                    "screenshare",
                    "join-call",
                    "create-call",
                    "end-call",
                    "remove-call-member",
                    "mute-users"
                ],
                "role": "admin"
            }

            token = client.create_token(clean_user_id, **hr_permissions)

            return Response({
                "token": token,
                "call_cid": f"default:{room_id}" if room_id else None,
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

            # Validate inputs
            if not user_id.startswith('guest_'):
                return Response(
                    {"error": "Invalid guest user"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not room_id:
                return Response(
                    {"error": "Room ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            clean_user_id = user_id.replace('@', '_').replace('.', '_')

            client = StreamChat(
                api_key=settings.STREAM_API_KEY,
                api_secret=settings.STREAM_API_SECRET
            )

            # Register the guest user with the 'call-member' role
            try:
                client.upsert_users([
                    UserRequest(
                        id=clean_user_id,
                        role="call-member",
                        name=f"Guest {clean_user_id}",
                    )
                ])
            except Exception as e:
                print(f"Error registering guest user: {str(e)}")
                raise

            # Generate token for the guest
            guest_permissions = {
                "permissions": ["join-call", "send-audio", "send-video", "screenshare"],
                "call_permissions": [
                    "send-audio",
                    "send-video",
                    "screenshare",
                    "join-call"
                ],
                "role": "call-member"
            }
            exp = int(time.time()) + (24 * 60 * 60)
            token = client.create_token(clean_user_id, exp=exp, **guest_permissions)

            return Response({
                "token": token,
                "call_cid": f"default:{room_id}",
                "room_id": room_id,
                "role": "call-member"
            })
        except Exception as e:
            print(f"Error generating guest token: {str(e)}")
            return Response(
                {"error": f"Failed to generate guest token: {str(e)}"},
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
        
class CreateMeetingView(APIView):
    def post(self, request):
        room_name = request.data.get('roomName')
        if not room_name:
            return Response({"error": "Room name is required"}, status=status.HTTP_400_BAD_REQUEST)

        meeting_link = f"{settings.FRONTEND_URL}/interview/{room_name}"
        return Response({"meeting_link": meeting_link}, status=status.HTTP_201_CREATED)
    
class ViewRecordingsView(APIView):
    def get(self, request):
        recordings = Recording.objects.filter(interviewer=request.user)
        serializer = RecordingSerializer(recordings, many=True)
        return Response(serializer.data)
    

class ViewUpcomingMeetingsView(APIView):
    def get(self, request):
        upcoming_meetings = Interview.objects.filter(interviewer=request.user, scheduled_time__gte=timezone.now())
        serializer = InterviewSerializer(upcoming_meetings, many=True)
        return Response(serializer.data)
    
class PersonalRoomView(APIView):
    def get(self, request):
        # Assuming each user has a personal room
        personal_room = f"{settings.FRONTEND_URL}/interview/{request.user.id}"
        return Response({"personal_room": personal_room})
    
class ScheduleInterviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        email = request.data.get('email')
        meeting_date = request.data.get('meetingDate')
        room_name = request.data.get('roomName')
        
        if not all([email, meeting_date, room_name]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Generate a unique guest user ID
            guest_user_id = f"guest_{uuid.uuid4()}"
            
            # Create the interview object with the guest user ID
            interview = Interview.objects.create(
                meeting_id=room_name,
                interviewer=request.user,
                candidate_email=email,
                scheduled_time=meeting_date,
                guest_user_id=guest_user_id  # Store the guest user ID
            )
            
            # Generate the meeting link for HR
            meeting_link = f"{settings.FRONTEND_URL}/interview/{room_name}"
            
            return Response({
                "message": "Interview scheduled successfully", 
                "meeting_link": meeting_link,
                "meeting_id": room_name,
                "guest_user_id": guest_user_id  # Return the guest user ID for reference
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {"error": f"Failed to schedule interview: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class SendInvitationView(APIView):
    def post(self, request):
        email = request.data.get('email')
        meeting_id = request.data.get('meetingId')
        
        try:
            interview = Interview.objects.get(meeting_id=meeting_id)
            
            # Ensure the guest user ID exists
            if not interview.guest_user_id:
                return Response({"error": "Guest user ID is missing"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Construct the guest meeting link with the guest user ID
            guest_meeting_link = f"{settings.FRONTEND_URL}/guest/interview/{interview.meeting_id}?guest_id={interview.guest_user_id}"
            
            # Email subject and body
            email_subject = "Interview Schedule"
            email_body = f"""Dear Candidate,
You have been scheduled for a remote interview on {interview.scheduled_time}.
Please join the meeting using the following link:
{guest_meeting_link}
Best regards,
HR Team"""
            
            send_mail(
                email_subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False
            )
            
            return Response({
                "message": "Invitation sent successfully",
                "meeting_link": guest_meeting_link
            }, status=status.HTTP_200_OK)
        
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=status.HTTP_404_NOT_FOUND)
        
