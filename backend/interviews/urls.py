from django.urls import path, include
from .views import *


urlpatterns = [
    path('schedule/', ScheduleInterviewView.as_view(), name='schedule-interview'),
    path('join/<str:meeting_id>/', JoinMeetingView.as_view(), name='join-meeting'),
    path('create/', CreateMeetingView.as_view(), name='create-meeting'),
    path('recordings/', ViewRecordingsView.as_view(), name='view-recordings'),
    path('save-recording', SaveRecordingView.as_view(), name='save-recording'),
    path('upcoming/', ViewUpcomingMeetingsView.as_view(), name='view-upcoming-meetings'),
    path('personal-room/', PersonalRoomView.as_view(), name='personal-room'),
    path('send-invitation/', SendInvitationView.as_view(), name='send-invitation'),
    path('notify-schedule/', NotifyScheduleView.as_view(), name='notify-schedule'),
    path('cancel-meeting/<str:meeting_id>/', CancelMeetingView.as_view(), name='cancel-meeting'),
    path('generate_stream_token/<str:user_id>/', GenerateStreamTokenView.as_view(), name='generate-stream-token'),
    path('generate_guest_token/<str:user_id>/', GuestStreamTokenView.as_view(), name='generate-guest-token'),
]