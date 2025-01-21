from twilio.rest import Client
from django.conf import settings
import logging #for developement

class SMSService:
    def __init__(self):
        try:
            self.client = Client(
                settings.TWILIO_ACCOUNT_SID,
                settings.TWILIO_AUTH_TOKEN
            )
            print("Twilio client initialized successfully")
        except Exception as e:
            print(f"Error initializing Twilio client: {str(e)}")
            self.client = None

    def send_otp(self, phone_number, otp):
        if not settings.SMS_ENABLED:
            print("SMS is disabled in settings")
            return None

        try:
            if not self.client:
                raise Exception("Twilio client not initialized")

            # Format phone number if needed
            formatted_phone = phone_number if phone_number.startswith('+') else f'+{phone_number}'

            message = self.client.messages.create(
                body=f'Your Job Portal verification code is: {otp}',
                from_=settings.TWILIO_PHONE_NUMBER,
                to=formatted_phone
            )
            print(f"SMS sent successfully: {message.sid}")
            return message.sid
        except Exception as e:
            print(f"Error sending SMS: {str(e)}")
            return None


# For development, use a dummy SMS service that logs the OTP

logger = logging.getLogger(__name__)

class DevelopmentSMSService:
    def send_otp(self, phone_number, otp):
        """Development SMS service that just logs the OTP"""
        logger.info(f"DEVELOPMENT MODE: SMS would be sent to {phone_number}")
        logger.info(f"OTP Code: {otp}")
        # In development, always return success
        return "DEV_MSG_ID"