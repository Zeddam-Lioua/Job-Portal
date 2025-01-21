from django.db import models
from users.models import CustomUser
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError

class JobRequest(models.Model):
    # Stores job requests created by District Managers
    field = models.CharField(max_length=100, verbose_name="Job Function", help_text="Enter the job function")
    required_employees = models.IntegerField(validators=[MinValueValidator(1)], verbose_name="Required Employees", help_text="Enter the number of employees needed")
    EXPERIENCE_LEVEL_CHOICES = (
        ('indifferent', 'Indifferent'),
        ('None', 'None'),
        ('Less than 1 year', 'Less than 1 year'),
        ('1-2 years', '1-2 years'),
        ('2-3 years', '2-3 years'),
        ('3-4 years', '3-4 years'),
        ('4-5 years', '4-5 years'),
        ('5-10 years', '5-10 years'),
        ('More than 10 years', 'More than 10 years'),
    )
    experience_level = models.CharField(max_length=50, choices=EXPERIENCE_LEVEL_CHOICES, verbose_name="Experience Level", help_text="Select the required experience level")
    EDUCATION_LEVEL_CHOICES = (
        ('indiffirent', 'Indifferent'),
        ('high_school', 'High School'),
        ('bac', 'Bac'),
        ('bac+1', 'Bac +1'),
        ('bac+2', 'Bac +2'),
        ('bac+3', 'Bac +3'),
        ('bachelors', "Bachelor's Degree"),
        ('masters', "Master's Degree"),
        ('phd', 'Ph.D.'),
    )
    education_level = models.CharField(max_length=50, choices=EDUCATION_LEVEL_CHOICES, verbose_name="Education Level", help_text="Select the required education level")
    WORKPLACE_CHOICES = (
        ('on_site', 'On Site'),
        ('hybrid', 'Hybrid'),
        ('remote', 'Remote'),
    )
    workplace = models.CharField(max_length=50, choices=WORKPLACE_CHOICES, verbose_name="Workplace", help_text="Select the workplace type")
    created_at = models.DateTimeField(auto_now_add=True)
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    district_manager = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'district_manager'}
    )

    def __str__(self):
        return self.field

class JobPost(models.Model):
    # Stores approved job posts created by HR
    job_request = models.OneToOneField(JobRequest, on_delete=models.CASCADE)
    field = models.CharField(max_length=100)
    required_employees = models.IntegerField(validators=[MinValueValidator(1)])
    experience_level = models.CharField(max_length=50, choices=JobRequest.EXPERIENCE_LEVEL_CHOICES)
    education_level = models.CharField(max_length=50, choices=JobRequest.EDUCATION_LEVEL_CHOICES)
    workplace = models.CharField(max_length=50, choices=JobRequest.WORKPLACE_CHOICES)
    CONTRACT_TYPE_CHOICES = (
        ('indifferent', 'Indifferent'),
        ('permanent', 'Permanent'),
        ('fixed_term', 'Fixed Term'),
        ('training', 'Training'),
        ('pre_employment', 'Pre-employment'),
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('freelance', 'Freelance'),
    )
    contract_type = models.CharField(max_length=50, choices=CONTRACT_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    human_resources = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'human_resources'}
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.field

class Resume(models.Model):
    applicant = models.CharField(max_length=255)
    email = models.EmailField(max_length=254)
    phone = models.CharField(max_length=10, blank=True, null=True)
    job_post = models.ForeignKey(JobPost, on_delete=models.CASCADE)
    resume_file = models.FileField(upload_to='resumes/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('reviewed', 'Reviewed'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('contacted', 'Contacted')],
        default='pending'
    )
    hired_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.applicant

    def validate_pdf(file):
        if not file.name.endswith('.pdf'):
            raise ValidationError('Invalid file type. Only PDF files are allowed.')