from django.db import models
from core.models import *
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
import random
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError
from langcodes import Language as LangCode
from core.esco.local import ESCOLocal
from django.conf import settings

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
        ('admin', 'Admin'),
        ('company', 'Company'),
        ('applicant', 'Applicant'),
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

# Add these choices at the top level
INDUSTRY_CHOICES = [
    ('manufacturing', 'Manufacturing'),
    ('technology', 'Technology'),
    ('healthcare', 'Healthcare'),
    ('retail', 'Retail'),
    ('finance', 'Finance'),
    ('education', 'Education'),
    ('services', 'Services'),
    ('other', 'Other'),
]

COMPANY_SIZE_CHOICES = [
    ('1-10', '1-10 employees'),
    ('11-50', '11-50 employees'),
    ('51-200', '51-200 employees'),
    ('201-500', '201-500 employees'),
    ('501+', '500+ employees'),
]

def validate_pdf_extension(value):
        if not value.name.endswith('.pdf'):
            raise ValidationError('Only PDF files are allowed.')
        

class Company(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    logo = models.ImageField(upload_to='company_logos/')
    industry = models.CharField(max_length=100, choices=INDUSTRY_CHOICES)
    size = models.CharField(max_length=50, choices=COMPANY_SIZE_CHOICES)
    location = models.CharField(max_length=200)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=15)
    website = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ApplicantExperience(models.Model):
    applicant = models.ForeignKey('Applicant', on_delete=models.CASCADE, related_name='experiences')
    occupation = models.ForeignKey(
        Occupation,
        on_delete=models.SET_NULL,
        null=True,
        related_name='experiences'
    )
    company = models.CharField(max_length=100)
    industry = models.CharField(max_length=100, choices=INDUSTRY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField()
    
    class Meta:
        ordering = ['-start_date']

class ApplicantEducation(models.Model):
    DEGREE_CHOICES = [
        ('secondary', 'Secondary'),
        ('terminal', 'Terminal'),
        ('bac', 'Bac'),
        ('ts', 'TS (Bac + 2)'),
        ('bac_3', 'Bac + 3'),
        ('bachelors', 'Bachelors'),
        ('master_1', 'Master 1'),
        ('master_2', 'Master 2'),
        ('phd', 'PhD'),
        ('certificate', 'Certificate'),
        ('no_degree', 'No Degree'),
        ('university_no_degree', 'University without Degree')
    ]
    
    SCHOOL_TYPE_CHOICES = [
        ('university', 'University'),
        ('institute', 'Institute'),
        ('vocational', 'Vocational School'),
        ('high_school', 'High School'),
        ('other', 'Other')
    ]

    applicant = models.ForeignKey('Applicant', on_delete=models.CASCADE, related_name='education')
    title = models.CharField(max_length=100)
    degree_level = models.CharField(max_length=50, choices=DEGREE_CHOICES)
    school = models.CharField(max_length=100)
    school_type = models.CharField(max_length=50, choices=SCHOOL_TYPE_CHOICES)
    location = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-end_date']





class Applicant(models.Model):
    # Basic Info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    
    # Preferences
    SITUATION_CHOICES = [
        ('employed', 'Currently Employed'),
        ('open', 'Open for Jobs'),
        ('not_open', 'Not Open to Opportunities')
    ]
    
    LEVEL_CHOICES = [
        ('intern', 'Intern'),
        ('apprentice', 'Apprentice'),
        ('junior', 'Junior'),
        ('mid', 'Mid-Level'),
        ('senior', 'Senior'),
        ('lead', 'Team Lead'),
        ('manager', 'Manager')
    ]
    
    MOBILITY_CHOICES = [
        ('international', 'International'),
        ('national', 'National'),
        ('regional', 'Regional')
    ]
    
    WORKPLACE_CHOICES = [
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid'),
        ('onsite', 'On Site')
    ]

    preferred_occupation = models.ForeignKey(
        Occupation,
        on_delete=models.SET_NULL,
        null=True,
        related_name='interested_applicants'
    )
    preferred_industry = models.CharField(max_length=100, choices=INDUSTRY_CHOICES)
    current_situation = models.CharField(max_length=20, choices=SITUATION_CHOICES)
    post_level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    expected_salary = models.IntegerField()
    availability_days = models.IntegerField(default=0, help_text="0 means immediate availability")
    mobility = models.CharField(max_length=20, choices=MOBILITY_CHOICES)
    preferred_workplace = models.CharField(max_length=20, choices=WORKPLACE_CHOICES)
    years_of_experience = models.DecimalField(max_digits=4, decimal_places=1)
    
    # Location
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, related_name='applicants')
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, related_name='applicants')
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, related_name='applicants')
    
    # Skills
    skills = models.ManyToManyField(Skill, related_name='applicants')

    # Languages
    languages = models.ManyToManyField(Language, related_name='applicants', blank=True)
    
    # Documents
    resume_file = models.FileField(upload_to='resumes/', validators=[validate_pdf_extension])
    
    # Additional Info
    military_service = models.BooleanField(default=False)
    driving_license = models.BooleanField(default=False)
    valid_passport = models.BooleanField(default=False)
    
    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    


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