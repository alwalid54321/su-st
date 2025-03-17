from django.conf import settings
from django.utils import timezone
import logging
import re
from django.utils.html import strip_tags
from core.models import EmailOTP
from core.utils.simple_email import SimpleEmailService

logger = logging.getLogger(__name__)

class EmailOTPService:
    """Service for handling email OTP verification with enhanced security"""
    
    def __init__(self):
        self.email_service = SimpleEmailService()
        
        # Set OTP expiry time in minutes
        self.otp_expiry_minutes = 10
    
    def sanitize_email(self, email):
        """
        Sanitize email to prevent injection attacks
        
        Args:
            email (str): Email to sanitize
            
        Returns:
            str: Sanitized email
        """
        if not email:
            return None
            
        # Remove any potentially dangerous characters
        return strip_tags(email.strip().lower())
    
    def send_verification_code(self, email, channel='email', purpose='login', ip_address=None, user_agent=None):
        """
        Send verification code to email with enhanced security
        
        Args:
            email (str): Email to send verification code to
            channel (str): Channel to send verification code through (email, sms)
            purpose (str): Purpose of verification (login, registration, etc.)
            ip_address (str): IP address of the requester
            user_agent (str): User agent of the requester
            
        Returns:
            dict: Result of the operation
        """
        try:
            # Sanitize email
            email = self.sanitize_email(email)
            if not email:
                raise ValueError("Invalid email format")
                
            # Validate email format
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                raise ValueError("Invalid email format")
            
            # Send OTP email using the simple email service
            result = self.email_service.send_otp_email(
                to_email=email,
                purpose=purpose
            )
            
            return result
                
        except ValueError as ve:
            logger.error(f"Validation error: {str(ve)}")
            return {
                'success': False,
                'message': str(ve),
                'status': 'failed'
            }
        except Exception as e:
            logger.error(f"Error sending verification code: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to send verification code: {str(e)}',
                'status': 'failed'
            }
    
    def verify_code(self, email, code, purpose='login'):
        """
        Verify OTP code
        
        Args:
            email (str): Email address
            code (str): OTP code to verify
            purpose (str): Purpose of verification (login, registration, etc.)
            
        Returns:
            dict: Result of verification
        """
        return self.email_service.verify_otp(email, code, purpose=purpose)
