# users/serializers.py
from rest_framework import serializers
from .models import *
from core.models import *
from django.contrib.auth import authenticate
from djoser.serializers import UserCreateSerializer
from .models import OTPVerification
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = CustomUser
        fields = ('id', 'first_name', 'last_name', 'email', 'password', 'user_type', 'phone', 'profile_picture')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_phone(phone):
        if not phone:
            raise serializers.ValidationError("Phone number is required")

        carriers = {
            '07': 'Djezzy',
            '05': 'Ooredoo',
            '06': 'Mobilis'
        }

        prefix = phone[:2]
        if prefix not in carriers:
            raise serializers.ValidationError("Invalid phone carrier prefix")

        if not phone[2:].isdigit() or len(phone[2:]) != 8:
            raise serializers.ValidationError("Phone number must be 8 digits after prefix")
    
        return phone
    

class UserRegistrationSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=[('human_resources', 'Human Resources'), ('district_manager', 'District Manager')])
    otp = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ('id', 'first_name', 'last_name', 'email', 'password1', 'password2', 'user_type', 'phone', 'otp', 'profile_picture')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError("Passwords do not match!")

        password = attrs.get("password1", "")
        if len(password) < 8:
            raise serializers.ValidationError(
                "Passwords must be at least 8 characters!")
            
        return attrs

    def create(self, validated_data):
        try:
            password = validated_data.pop('password1')
            validated_data.pop('password2', None)
            validated_data.pop('otp', None)
            
            # Create user
            user = CustomUser.objects.create_user(
                password=password,
                is_active=False,
                **validated_data
            )

            # Generate OTP
            otp = OTPVerification.generate_otp()
            OTPVerification.objects.create(user=user, otp=otp)

            # Send email
            subject = 'Verify your email - Job Portal'
            html_message = render_to_string('email/otp_verification.html', {
                'otp': otp,
                'user': user
            })
            plain_message = strip_tags(html_message)

            try:
                send_mail(
                    subject,
                    plain_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {str(e)}")
                raise serializers.ValidationError(f"Failed to send verification email: {str(e)}")

            return user
            
        except Exception as e:
            print(f"Error in create: {str(e)}")
            raise serializers.ValidationError(f"Failed to create user: {str(e)}")

    def create(self, validated_data):
        password = validated_data.pop("password1")
        validated_data.pop("password2")

        return CustomUser.objects.create_user(password=password, **validated_data)

class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials!")    
    
class NotificationSerializer(serializers.ModelSerializer):
    sender_user = CustomUserSerializer(read_only=True)  # Add this line
    
    class Meta:
        model = Notification
        fields = ['id', 'sender_type', 'sender_user', 'notification_type', 
                 'title', 'message', 'link', 'is_read', 'created_at', 'entity_id']
        
class ApplicantEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicantEducation
        fields = '__all__'

class ApplicantExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicantExperience
        fields = '__all__'

class ApplicantSerializer(serializers.ModelSerializer):
    education = ApplicantEducationSerializer(many=True, read_only=True)
    experiences = ApplicantExperienceSerializer(many=True, read_only=True)
    skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True)
    languages = serializers.PrimaryKeyRelatedField(queryset=Language.objects.all(), many=True)
    preferred_occupation = serializers.PrimaryKeyRelatedField(queryset=Occupation.objects.all(), allow_null=True)

    class Meta:
        model = Applicant
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'