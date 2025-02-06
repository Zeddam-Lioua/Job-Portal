from django.db import models
from users.models import CustomUser
import uuid

class Interview(models.Model):
    meeting_id = models.CharField(max_length=100, unique=True)
    guest_id = models.CharField(max_length=255, blank=True, null=True)
    interviewer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='interviews')
    candidate_email = models.EmailField()
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-scheduled_time']

    def __str__(self):
        return f"Interview {self.meeting_id} with {self.candidate_email}"


class Recording(models.Model):
    interviewer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='recordings')
    interview = models.ForeignKey('Interview', on_delete=models.CASCADE, related_name='recordings')
    video_url = models.URLField(max_length=200)
    chat_log = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recording for {self.interview.meeting_id} by {self.interviewer.email}"
    
