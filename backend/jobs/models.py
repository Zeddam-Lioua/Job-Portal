from django.db import models
from users.models import Applicant, Company, CustomUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

class JobPost(models.Model):
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
    EDUCATION_LEVEL_CHOICES = (
        ('indifferent', 'Indifferent'), 
        ('high_school', 'High School'),
        ('bac', 'Bac'),
        ('bac+1', 'Bac +1'),
        ('bac+2', 'Bac +2'),
        ('bac+3', 'Bac +3'),
        ('bachelors', "Bachelor's Degree"),
        ('masters', "Master's Degree"),
        ('phd', 'Ph.D.'),
    )
    WORKPLACE_CHOICES = (
        ('on_site', 'On Site'),
        ('hybrid', 'Hybrid'),
        ('remote', 'Remote'),
    )
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
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('published', 'Published'),
        ('fix', 'Needs Fix'),
        ('closed', 'Closed'),
    )
    field = models.CharField(max_length=100)
    required_employees = models.IntegerField(validators=[MinValueValidator(1)])
    
    experience_level = models.CharField(max_length=50, choices=EXPERIENCE_LEVEL_CHOICES)
    education_level = models.CharField(max_length=50, choices=EDUCATION_LEVEL_CHOICES)
    workplace = models.CharField(max_length=50, choices=WORKPLACE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    contract_type = models.CharField(max_length=50, choices=CONTRACT_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='job_posts'
    )
    verified_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'user_type': 'admin'},
        related_name='verified_job_posts'
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.field


class PerformanceEvaluation(models.Model):
    applicant = models.ForeignKey(
        Applicant, 
        on_delete=models.CASCADE, 
        related_name='evaluations'
    )
    technical_skills = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    communication = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    problem_solving = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    teamwork = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    leadership = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    adaptability = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    work_ethic = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    creativity = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Evaluation for {self.applicant.get_full_name()}"

    def get_average_score(self):
        scores = [
            self.technical_skills,
            self.communication,
            self.problem_solving,
            self.teamwork,
            self.leadership,
            self.adaptability,
            self.work_ethic,
            self.creativity
        ]
        return sum(scores) / len(scores)
    