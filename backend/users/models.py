# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.db import models
import random
from django.core.validators import MinLengthValidator

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    USER_TYPES = (
        ('district_manager', 'District Manager'),
        ('human_resources', 'Human Resources'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    phone = models.CharField(max_length=10, null=True, blank=True)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True
    )

    USERNAME_FIELD="email"
    REQUIRED_FIELDS=["first_name", "last_name"]

    is_active = models.BooleanField(
        default=False,  # Changed from True to False
        help_text='Designates whether this user should be treated as active.'
    )

    objects = CustomUserManager()

    def __str__(self):
        return self.email
    


class OTPVerification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)

    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))
    

    
class PhoneVerification(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    carrier = models.CharField(max_length=10)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))
    
    def get_carrier_name(self):
        carrier_prefixes = {
            '7': 'Djezzy',
            '5': 'Ooredoo',
            '6': 'Mobilis'
        }
        prefix = self.phone.replace('+213', '')[0]  # Extract first digit after +213
        return carrier_prefixes.get(prefix, 'Unknown')


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('application', 'New Application'),
        ('interview', 'Interview Related'),
        ('job_post', 'Job Post Update'),
        ('job_request', 'Job Request'),
        ('system', 'System Notification')
    )

    SENDER_TYPES = (
        ('user', 'Authenticated User'),
        ('applicant', 'Job Applicant'),
        ('system', 'System')
    )

    recipient = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    # Replace the sender ForeignKey with these fields
    sender_type = models.CharField(
        max_length=20,
        choices=SENDER_TYPES,
        default='system'
    )
    sender_user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        related_name='sent_notifications',
        null=True,
        blank=True
    )
    sender_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Name of the sender when not an authenticated user"
    )
    sender_email = models.EmailField(
        blank=True,
        null=True,
        help_text="Email of the sender when not an authenticated user"
    )

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    entity_id = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} notification for {self.recipient.email}"