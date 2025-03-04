from django.db import models
from users.models import CustomUser
from jobs.models import Applicant

class Interview(models.Model):
    meeting_id = models.CharField(max_length=100, unique=True)
    guest_id = models.CharField(max_length=255, blank=True, null=True)
    interviewer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='interviews')
    candidate = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='interviews')
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=20, default='scheduled') 
    
    class Meta:
        ordering = ['-scheduled_time']

    def __str__(self):
        return f"Interview {self.meeting_id} with {self.candidate_email}"
    
    @property
    def candidate_email(self):
        return self.candidate.email

    @property
    def candidate_name(self):
        return f"{self.candidate.first_name} {self.candidate.last_name}"


class Recording(models.Model):
    interviewer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='recordings')
    interview = models.ForeignKey('Interview', on_delete=models.CASCADE, related_name='recordings')
    video_url = models.URLField(max_length=200)
    chat_log = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def candidate_name(self):
        return self.interview.candidate_name

    def __str__(self):
        return f"Recording for {self.interview.meeting_id} by {self.interviewer.email}"
    
