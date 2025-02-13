from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import os

def send_email_with_template(template_name, context, subject, recipient_list):
    try:
        template_path = f'email/{template_name}'
        print(f"Looking for template at: {template_path}")
        
        # Render HTML content
        html_content = render_to_string(template_path, context)
        text_content = strip_tags(html_content)
        
        # Create email message
        email = EmailMultiAlternatives(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list
        )
        
        # Attach HTML version
        email.attach_alternative(html_content, "text/html")
        
        # Send email
        email.send()
        print(f"Email sent successfully to {recipient_list}")
        
    except Exception as e:
        print(f"Error in send_email_with_template: {str(e)}")
        print(f"Template name: {template_name}")
        print(f"Context: {context}")
        raise