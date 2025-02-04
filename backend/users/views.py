from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone

from .models import OTPVerification, PhoneVerification, CustomUser
from django.core.mail import send_mail
from django.conf import settings
import logging
from .serializers import CustomUserSerializer


from backend.utils import DevelopmentSMSService

logger = logging.getLogger(__name__)


class UserRegistrationAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            user.is_active = False
            user.save()
            
            # Generate and send OTP
            otp = OTPVerification.generate_otp()
            OTPVerification.objects.create(user=user, otp=otp)
            
            # Send OTP Email
            try:
                send_mail(
                    'Verify your email',
                    f'Your verification code is: {otp}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                logging.error(f"Error sending email: {str(e)}")
                return Response({'error': 'Failed to send verification email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response(
                {'detail': 'Please check your email for verification code.'},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logging.error(f"Error during user registration: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPhoneView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')

        try:
            verification = PhoneVerification.objects.get(
                phone=phone,
                otp=otp,
                created_at__gte=timezone.now() - timezone.timedelta(minutes=10)
            )
            verification.verified = True
            verification.save()

            # Update user's phone number after verification
            user = verification.user
            user.phone = phone
            user.save()

            return Response({'message': 'Phone verified successfully'})
        except PhoneVerification.DoesNotExist:
            return Response({'error': 'Invalid or expired OTP'}, status=400)

class SendPhoneOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        email = request.data.get('email')
        
        print(f"Received phone verification request for: {email}")
        
        if not phone or not email:
            return Response(
                {'error': 'Phone and email are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(email=email)
            otp = PhoneVerification.generate_otp()
            
            phone_verification, _ = PhoneVerification.objects.update_or_create(
                user=user,
                defaults={
                    'phone': phone,
                    'otp': otp,
                    'verified': False
                }
            )

            sms_service = DevelopmentSMSService()
            message_sid = sms_service.send_otp(phone, otp)
            
            print(f"Phone: {phone}")
            print(f"Generated OTP: {otp}")

            if settings.DEBUG:
                return Response({
                    'message': 'OTP sent successfully',
                    'debug_otp': otp
                })
            return Response({'message': 'OTP sent successfully'})

        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error sending OTP: {str(e)}")
            return Response(
                {'error': f'Failed to send OTP: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )



class SendEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email is required'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
            otp = OTPVerification.generate_otp()

            # Create or update email verification
            otp_verification, created = OTPVerification.objects.update_or_create(
                user=user,
                defaults={
                    'otp': otp,
                    'verified': False
                }
            )

            # Send OTP email using Django's send_mail
            send_mail(
                'Verify your email',
                f'Your verification code is: {otp}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return Response({'message': 'OTP sent successfully'})

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        try:
            verification = OTPVerification.objects.get(
                user__email=email,
                otp=otp,
                created_at__gte=timezone.now() - timezone.timedelta(minutes=10)
            )
            verification.verified = True
            verification.save()

            # Update user's email verification status
            user = verification.user
            user.is_active = True
            user.save()

            return Response({'message': 'Email verified successfully'})
        except OTPVerification.DoesNotExist:
            return Response({'error': 'Invalid or expired OTP'}, status=400)

class UploadProfilePictureView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        try:
            email = request.data.get('email')
            profile_picture = request.FILES.get('profile_picture')
            
            if not email or not profile_picture:
                return Response(
                    {'error': 'Email and profile picture are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            user = CustomUser.objects.get(email=email)
            user.profile_picture = profile_picture
            user.save()
            
            return Response(
                {'message': 'Profile picture uploaded successfully'},
                status=status.HTTP_200_OK
            )
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class UserLoginAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data= request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer = CustomUserSerializer(user)
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh":str(token),  
                          "access": str(token.access_token)}
        return Response(data, status=status.HTTP_200_OK)
    
class UserInfoAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CustomUserSerializer
    queryset = CustomUser.objects.all()

    def get_object(self):
        try:
            return self.request.user
        except Exception as e:
            logger.error(f"Error retrieving user info: {str(e)}")
            raise

    def get_queryset(self):
        return CustomUser.objects.filter(id=self.request.user.id)
    
class UserLogoutAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status= status.HTTP_400_BAD_REQUEST)


class SendPasswordChangeEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        email = user.email
        try:
            send_mail(
                'Password Change Request',
                'Click the link below to change your password:',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'Password change email sent successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TeamMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.filter(
            user_type__in=['human_resources', 'district_manager']
        ).values('id', 'first_name', 'last_name', 'email', 'user_type', 'profile_picture')
        
        # Normalize profile picture paths
        for user in users:
            if user['profile_picture']:
                user['profile_picture'] = settings.MEDIA_URL + str(user['profile_picture'])
        
        return Response(users)