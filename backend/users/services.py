# backend/jobs/services.py
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

def create_notification(recipient, notification_type, message, link=''):
    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        message=message,
        link=link
    )

# Example notification triggers:
def notify_new_application(application):
    hr_users = User.objects.filter(user_type='human_resources')
    message = f"New application received for {application.job_post.field}"
    link = f"/admin/hr/dashboard/resumes/{application.id}"
    
    for hr_user in hr_users:
        create_notification(
            recipient=hr_user,
            notification_type='application',
            message=message,
            link=link
        )

def notify_interview_scheduled(interview):
    message = f"Interview scheduled with {interview.candidate_name}"
    link = f"/admin/hr/dashboard/interviews"
    create_notification(
        recipient=interview.hr_user,
        notification_type='interview',
        message=message,
        link=link
    )