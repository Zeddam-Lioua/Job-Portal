from django.urls import path, include
from .views import *


urlpatterns = [
    path('schedule/', ScheduleInterviewView.as_view(), name='schedule-interview'),
    path('join/<str:meeting_id>/', JoinMeetingView.as_view(), name='join-meeting'),
    path('create/', CreateMeetingView.as_view(), name='create-meeting'),
    path('recordings/', ViewRecordingsView.as_view(), name='view-recordings'),
    path('upcoming/', ViewUpcomingMeetingsView.as_view(), name='view-upcoming-meetings'),
    path('personal-room/', PersonalRoomView.as_view(), name='personal-room'),
    path('send-invitation/', SendInvitationView.as_view(), name='send-invitation'),
    path('generate_stream_token/<str:user_id>/', GenerateStreamTokenView.as_view(), name='generate-stream-token'),
    path('generate_guest_token/<str:user_id>/', GuestStreamTokenView.as_view(), name='generate-guest-token'),
]