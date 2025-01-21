# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
import random
from django.core.validators import MinLengthValidator

class CustomUser(AbstractUser):
    # Custom user model extending Django's built-in user
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
    REQUIRED_FIELDS=["username"]

    is_active = models.BooleanField(
        default=False,  # Changed from True to False
        help_text='Designates whether this user should be treated as active.'
    )

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
