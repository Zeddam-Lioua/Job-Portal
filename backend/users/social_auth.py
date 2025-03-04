from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class GoogleOAuth2View(APIView):
    def post(self, request, *args, **kwargs):
        try:
            id_token_jwt = request.data.get('id_token')
            if not id_token_jwt:
                return Response(
                    {'error': 'No token provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                id_token_jwt,
                requests.Request(),
                settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
            )

            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            # Get user data from token
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            picture = idinfo.get('picture', '')  # Get Google profile picture

            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'user_type': 'human_resources',
                    'phone': '',  # Add default empty phone
                }
            )

            # Update profile picture if user was created or doesn't have one
            if created or not user.profile_picture:
                if picture:
                    # Download and save Google profile picture
                    response = requests.get(picture)
                    if response.status_code == 200:
                        from django.core.files.base import ContentFile
                        from django.core.files.storage import default_storage
                        import os

                        # Save the image with a unique name
                        file_name = f'profile_pictures/{user.id}_google_profile.jpg'
                        path = default_storage.save(file_name, ContentFile(response.content))
                        user.profile_picture = path
                        user.save()

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': user.user_type,
                    'phone': user.phone,
                    'profile_picture': user.profile_picture.url if user.profile_picture else None
                }
            })

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Error details:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)