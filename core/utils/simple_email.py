import random
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from django.utils import timezone
from core.models import EmailOTP

logger = logging.getLogger(__name__)

class SimpleEmailService:
    """A simple and direct email service using Python's built-in smtplib"""
    
    def __init__(self):
        # Email configuration
        self.smtp_server = settings.EMAIL_HOST
        self.smtp_port = settings.EMAIL_PORT
        self.from_email = settings.EMAIL_HOST_USER
        self.password = settings.EMAIL_HOST_PASSWORD
        
        # Brand colors
        self.primary_dark = settings.THEME['PRIMARY_DARK']  # Dark blue from logo
        self.accent = settings.THEME['ACCENT']        # Gold accent from logo
        self.light_bg = '#f8f9fa'
        self.text_dark = '#333333'
        self.text_light = '#ffffff'
        
        # OTP settings
        self.otp_length = 6
        self.otp_expiry_minutes = 10
    
    def generate_otp(self):
        """Generate a random 6-digit OTP"""
        otp = ""
        for i in range(self.otp_length):
            otp += str(random.randint(0, 9))
        return otp
    
    def send_otp_email(self, to_email, purpose='login'):
        """
        Send OTP email with SudaStock branding
        
        Args:
            to_email (str): Recipient email address
            purpose (str): Purpose of the OTP (login, registration, etc.)
            
        Returns:
            dict: Result of the email sending operation
        """
        try:
            # Generate OTP
            otp = self.generate_otp()
            
            # Set expiry time
            expires_at = timezone.now() + timezone.timedelta(minutes=self.otp_expiry_minutes)
            
            # Create OTP record in database
            EmailOTP.objects.create(
                email=to_email,
                otp=otp,
                expires_at=expires_at,
                is_used=False,
                verification_attempts=0,
                purpose=purpose
            )
            
            # For development, log OTP to console
            if settings.DEBUG:
                logger.info("\n====================================")
                logger.info("DEVELOPMENT MODE: OTP DETAILS")
                logger.info("====================================")
                logger.info(f"Email: {to_email}")
                logger.info(f"OTP: {otp}")
                logger.info(f"Purpose: {purpose}")
                logger.info(f"Valid until: {expires_at}")
                logger.info("====================================\n")
            
            # Create email message
            msg = MIMEMultipart('alternative')
            
            # Set email headers
            purpose_map = {
                'login': 'Login',
                'registration': 'Registration',
                'password_reset': 'Password Reset',
                'email_change': 'Email Change',
                'security_action': 'Security Action'
            }
            purpose_text = purpose_map.get(purpose, 'Verification')
            
            msg['Subject'] = f"SudaStock - {purpose_text} Verification Code"
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Plain text version
            text_content = f"""
            Your verification code for {purpose} is: {otp}
            
            This code will expire in {self.otp_expiry_minutes} minutes.
            
            - SudaStock Team
            """
            
            # HTML version with SudaStock branding
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SudaStock Verification</title>
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: {self.text_dark};
                        margin: 0;
                        padding: 0;
                        background-color: {self.light_bg};
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        background-color: {self.primary_dark};
                        color: {self.text_light};
                        padding: 25px;
                        text-align: center;
                        border-bottom: 3px solid {self.accent};
                    }}
                    .header h1 {{
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }}
                    .content {{
                        padding: 35px;
                    }}
                    .verification-code {{
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        text-align: center;
                        margin: 30px 0;
                        color: {self.primary_dark};
                        background-color: {self.light_bg};
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid {self.accent};
                    }}
                    .footer {{
                        background-color: {self.light_bg};
                        padding: 20px;
                        text-align: center;
                        font-size: 14px;
                        color: #666;
                        border-top: 3px solid {self.accent};
                    }}
                    .security-notice {{
                        margin-top: 25px;
                        padding: 15px;
                        background-color: #fff8e1;
                        border-radius: 8px;
                        border-left: 4px solid {self.accent};
                        font-size: 14px;
                    }}
                    @media only screen and (max-width: 600px) {{
                        .container {{
                            width: 100%;
                            margin: 0;
                            border-radius: 0;
                        }}
                        .content {{
                            padding: 20px;
                        }}
                        .verification-code {{
                            font-size: 24px;
                            letter-spacing: 5px;
                        }}
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SudaStock Verification</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>You requested a verification code for <strong>{purpose}</strong>. Please use the following code to complete your verification:</p>
                        <div class="verification-code">{otp}</div>
                        <p>This code will expire in <strong>{self.otp_expiry_minutes} minutes</strong> for your security.</p>
                        <div class="security-notice">
                            <strong>Security Notice:</strong> If you did not request this code, please ignore this email.
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; {timezone.now().year} SudaStock. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Attach parts
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.from_email, self.password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"OTP email sent successfully to {to_email}")
            return {
                'success': True,
                'message': 'Verification code sent successfully',
                'status': 'sent',
                'expires_at': expires_at
            }
            
        except Exception as e:
            logger.error(f"Error sending OTP email: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to send verification code: {str(e)}',
                'status': 'failed'
            }
    
    def send_contact_email(self, name, email, phone, subject, message):
        """
        Send contact form submission to the admin email with unique templates based on subject
        
        Args:
            name (str): Name of the person contacting
            email (str): Email of the person contacting
            phone (str): Phone number of the person contacting
            subject (str): Subject of the message
            message (str): Content of the message
            
        Returns:
            dict: Result of the email sending operation
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            
            # Map subject values to human-readable titles
            subject_titles = {
                'general': 'General Inquiry',
                'products': 'Product Information Request',
                'pricing': 'Pricing & Quote Request',
                'support': 'Technical Support Request',
                'other': 'Other Inquiry'
            }
            
            subject_title = subject_titles.get(subject, 'Contact Form Submission')
            
            msg['Subject'] = f"SudaStock Contact: {subject_title}"
            msg['From'] = self.from_email
            msg['To'] = self.from_email  # Send to admin email
            msg['Reply-To'] = email  # Set reply-to as the sender's email
            
            # Different header colors and icons based on subject type
            subject_styles = {
                'general': {
                    'header_bg': self.primary_dark,
                    'icon': '📝',
                    'accent_color': self.accent
                },
                'products': {
                    'header_bg': '#1a4d80',  # Slightly different blue
                    'icon': '📦',
                    'accent_color': self.accent
                },
                'pricing': {
                    'header_bg': '#2c5e1a',  # Green
                    'icon': '💰',
                    'accent_color': self.accent
                },
                'support': {
                    'header_bg': '#7d3c98',  # Purple
                    'icon': '🔧',
                    'accent_color': self.accent
                },
                'other': {
                    'header_bg': '#d35400',  # Orange
                    'icon': '❓',
                    'accent_color': self.accent
                }
            }
            
            # Get style for this subject, default to general style
            style = subject_styles.get(subject, subject_styles['general'])
            
            # Create HTML content with brand colors and subject-specific styling
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }}
                    .container {{ max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }}
                    .header {{ background-color: {style['header_bg']}; color: white; padding: 25px; text-align: center; border-bottom: 3px solid {style['accent_color']}; }}
                    .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
                    .icon {{ font-size: 48px; margin-bottom: 15px; }}
                    .content {{ padding: 35px; }}
                    .footer {{ background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 3px solid {style['accent_color']}; }}
                    .info-item {{ margin-bottom: 15px; }}
                    .info-label {{ font-weight: bold; color: {self.primary_dark}; }}
                    .message-box {{ background-color: #f8f9fa; padding: 20px; border-left: 4px solid {style['accent_color']}; margin: 20px 0; }}
                    .priority-tag {{ display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; margin-top: 10px; }}
                    .reply-btn {{ display: inline-block; background-color: {self.primary_dark}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin-top: 20px; font-weight: bold; }}
                    .reply-btn:hover {{ background-color: {style['accent_color']}; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="icon">{style['icon']}</div>
                        <h1>New {subject_title}</h1>
                    </div>
                    <div class="content">
                        <p>You have received a new message from the SudaStock contact form:</p>
                        
                        <div class="info-item">
                            <span class="info-label">Name:</span> {name}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span> <a href="mailto:{email}">{email}</a>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone:</span> {phone if phone else 'Not provided'}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Subject Type:</span> {subject_title}
                            <span class="priority-tag" style="background-color: {style['header_bg']}; color: white;">{subject_title}</span>
                        </div>
                        
                        <div class="message-box">
                            <h3>Message:</h3>
                            <p>{message.replace(chr(10), '<br>')}</p>
                        </div>
                        
                        <p>You can reply directly to this email to respond to {name}.</p>
                        <a href="mailto:{email}?subject=Re: {subject_title}" class="reply-btn">Reply Now</a>
                    </div>
                    <div class="footer">
                        <p>&copy; {timezone.now().year} SudaStock. All rights reserved.</p>
                        <p>This email was sent from the SudaStock contact form.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create plain text version
            text_content = f"""
            New {subject_title} from SudaStock Contact Form
            
            Name: {name}
            Email: {email}
            Phone: {phone if phone else 'Not provided'}
            Subject Type: {subject_title}
            
            Message:
            {message}
            
            This email was sent from the SudaStock contact form.
            You can reply directly to this email to respond to {name}.
            """
            
            # Attach parts
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Connect to server and send
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.from_email, self.password)
                server.sendmail(self.from_email, self.from_email, msg.as_string())
            
            # Also send a confirmation email to the user
            self.send_contact_confirmation_email(name, email, subject, message)
            
            logger.info(f"Contact form email sent successfully from {email}")
            return {'success': True, 'message': 'Email sent successfully'}
            
        except Exception as e:
            logger.error(f"Error sending contact form email: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def send_contact_confirmation_email(self, name, email, subject, message):
        """
        Send a confirmation email to the user who submitted the contact form
        
        Args:
            name (str): Name of the person contacting
            email (str): Email of the person contacting
            subject (str): Subject of the message
            message (str): Content of the message
            
        Returns:
            dict: Result of the email sending operation
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            
            # Map subject values to human-readable titles
            subject_titles = {
                'general': 'General Inquiry',
                'products': 'Product Information Request',
                'pricing': 'Pricing & Quote Request',
                'support': 'Technical Support Request',
                'other': 'Other Inquiry'
            }
            
            subject_title = subject_titles.get(subject, 'Contact Form Submission')
            
            msg['Subject'] = f"Thank you for contacting SudaStock"
            msg['From'] = self.from_email
            msg['To'] = email
            
            # Create HTML content with brand colors
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }}
                    .container {{ max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }}
                    .header {{ background-color: {self.primary_dark}; color: white; padding: 25px; text-align: center; border-bottom: 3px solid {self.accent}; }}
                    .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
                    .content {{ padding: 35px; }}
                    .footer {{ background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 3px solid {self.accent}; }}
                    .message-box {{ background-color: #f8f9fa; padding: 20px; border-left: 4px solid {self.accent}; margin: 20px 0; }}
                    .contact-info {{ margin-top: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; }}
                    .contact-item {{ margin-bottom: 10px; }}
                    .contact-label {{ font-weight: bold; color: {self.primary_dark}; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Thank You for Contacting SudaStock</h1>
                    </div>
                    <div class="content">
                        <p>Dear {name},</p>
                        
                        <p>Thank you for reaching out to us. We have received your {subject_title.lower()} and will get back to you as soon as possible.</p>
                        
                        <div class="message-box">
                            <h3>Your Message:</h3>
                            <p>{message.replace(chr(10), '<br>')}</p>
                        </div>
                        
                        <p>Our team is reviewing your inquiry and will respond within 24-48 business hours.</p>
                        
                        <div class="contact-info">
                            <h3>SudaStock Contact Information</h3>
                            <div class="contact-item">
                                <span class="contact-label">Office:</span> Office No.7, 12th Floor, The Bayswater Tower, Business Bay, Dubai, United Arab Emirates
                            </div>
                            <div class="contact-item">
                                <span class="contact-label">Phone:</span> +971 502 330 481
                            </div>
                            <div class="contact-item">
                                <span class="contact-label">Email:</span> info@sudastock.com
                            </div>
                            <div class="contact-item">
                                <span class="contact-label">Business Hours:</span> Mon-Fri: 9:00 AM - 5:00 PM
                            </div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; {timezone.now().year} SudaStock. All rights reserved.</p>
                        <p>This is an automated confirmation email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create plain text version
            text_content = f"""
            Thank You for Contacting SudaStock
            
            Dear {name},
            
            Thank you for reaching out to us. We have received your {subject_title.lower()} and will get back to you as soon as possible.
            
            Your Message:
            {message}
            
            Our team is reviewing your inquiry and will respond within 24-48 business hours.
            
            SudaStock Contact Information:
            Office: Office No.7, 12th Floor, The Bayswater Tower, Business Bay, Dubai, United Arab Emirates
            Phone: +971 502 330 481
            Email: info@sudastock.com
            Business Hours: Mon-Fri: 9:00 AM - 5:00 PM
            
            This is an automated confirmation email. Please do not reply to this message.
            """
            
            # Attach parts
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Connect to server and send
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.from_email, self.password)
                server.sendmail(self.from_email, email, msg.as_string())
            
            logger.info(f"Contact confirmation email sent successfully to {email}")
            return {'success': True, 'message': 'Confirmation email sent successfully'}
            
        except Exception as e:
            logger.error(f"Error sending contact confirmation email: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def send_sample_email(self, name, email, phone, company, country, product, shipping_method, note):
        """
        Send sample request email to the admin
        
        Args:
            name (str): Name of the requester
            email (str): Email of the requester
            phone (str): Phone number of the requester
            company (str): Company name
            country (str): Country
            product (str): Product requested
            shipping_method (str): Shipping method
            note (str): Additional notes
            
        Returns:
            dict: Result of the email sending operation
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"New Sample Request: {product}"
            msg['From'] = self.from_email
            msg['To'] = 'SudaStock249@gmail.com'  # Send to admin email
            
            # Create HTML content with brand colors
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: {self.primary_dark}; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background-color: {self.light_bg}; }}
                    .footer {{ text-align: center; margin-top: 20px; padding: 10px; font-size: 12px; color: #777; }}
                    .info-item {{ margin-bottom: 10px; }}
                    .info-label {{ font-weight: bold; color: {self.primary_dark}; }}
                    .message-box {{ background-color: white; padding: 15px; border-left: 4px solid {self.accent}; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Sample Request</h1>
                    </div>
                    <div class="content">
                        <p>You have received a new sample request from the SudaStock website:</p>
                        
                        <div class="info-item">
                            <span class="info-label">Name:</span> {name}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span> {email}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone:</span> {phone}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Company:</span> {company}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Country:</span> {country}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Product:</span> {product}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Shipping Method:</span> {shipping_method}
                        </div>
                        
                        <div class="message-box">
                            <h3>Additional Notes:</h3>
                            <p>{note.replace(chr(10), '<br>') if note else 'No additional notes provided.'}</p>
                        </div>
                        
                        <p>This request was submitted on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    <div class="footer">
                        <p>This email was sent from the SudaStock sample request form.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create plain text version
            text_content = f"""
            New Sample Request
            
            Name: {name}
            Email: {email}
            Phone: {phone}
            Company: {company}
            Country: {country}
            Product: {product}
            Shipping Method: {shipping_method}
            
            Additional Notes:
            {note if note else 'No additional notes provided.'}
            
            This request was submitted on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            # Attach parts
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Connect to server and send
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.from_email, self.password)
                server.sendmail(self.from_email, 'SudaStock249@gmail.com', msg.as_string())
            
            logger.info(f"Sample request email sent successfully from {email}")
            return {'success': True, 'message': 'Email sent successfully'}
            
        except Exception as e:
            logger.error(f"Error sending sample request email: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def send_quote_email(self, name, email, contact_number, company, country, product, quantity, purpose, specifications, note):
        """
        Send quote request email to the admin
        
        Args:
            name (str): Name of the requester
            email (str): Email of the requester
            contact_number (str): Phone number of the requester
            company (str): Company name
            country (str): Country
            product (str): Product requested
            quantity (str): Quantity requested
            purpose (str): Purpose/Port
            specifications (str): Product specifications
            note (str): Additional notes
            
        Returns:
            dict: Result of the email sending operation
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"New Quote Request: {product}"
            msg['From'] = self.from_email
            msg['To'] = 'SudaStock249@gmail.com'  # Send to admin email
            
            # Create HTML content with brand colors
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: {self.primary_dark}; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background-color: {self.light_bg}; }}
                    .footer {{ text-align: center; margin-top: 20px; padding: 10px; font-size: 12px; color: #777; }}
                    .info-item {{ margin-bottom: 10px; }}
                    .info-label {{ font-weight: bold; color: {self.primary_dark}; }}
                    .message-box {{ background-color: white; padding: 15px; border-left: 4px solid {self.accent}; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Quote Request</h1>
                    </div>
                    <div class="content">
                        <p>You have received a new quote request from the SudaStock website:</p>
                        
                        <div class="info-item">
                            <span class="info-label">Name:</span> {name}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span> {email}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone:</span> {contact_number}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Company:</span> {company}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Country:</span> {country}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Product:</span> {product}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Quantity:</span> {quantity}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Purpose/Port:</span> {purpose}
                        </div>
                        <div class="info-item">
                            <span class="info-label">Specifications:</span> {specifications}
                        </div>
                        
                        <div class="message-box">
                            <h3>Additional Notes:</h3>
                            <p>{note.replace(chr(10), '<br>') if note else 'No additional notes provided.'}</p>
                        </div>
                        
                        <p>This request was submitted on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    <div class="footer">
                        <p>This email was sent from the SudaStock quote request form.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create plain text version
            text_content = f"""
            New Quote Request
            
            Name: {name}
            Email: {email}
            Phone: {contact_number}
            Company: {company}
            Country: {country}
            Product: {product}
            Quantity: {quantity}
            Purpose/Port: {purpose}
            Specifications: {specifications}
            
            Additional Notes:
            {note if note else 'No additional notes provided.'}
            
            This request was submitted on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            # Attach parts
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Connect to server and send
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.from_email, self.password)
                server.sendmail(self.from_email, 'SudaStock249@gmail.com', msg.as_string())
            
            logger.info(f"Quote request email sent successfully from {email}")
            return {'success': True, 'message': 'Email sent successfully'}
            
        except Exception as e:
            logger.error(f"Error sending quote request email: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def verify_otp(self, email, code, purpose='login'):
        """
        Verify OTP code
        
        Args:
            email (str): Email address
            code (str): OTP code to verify
            purpose (str): Purpose of verification (login, registration, etc.)
            
        Returns:
            dict: Result of verification
        """
        try:
            # Sanitize inputs
            email = email.strip().lower()
            code = code.strip()
            
            if not email or not code:
                logger.warning("Invalid email or code format")
                return {
                    'success': False,
                    'message': 'Invalid email or code format',
                    'status': 'invalid_format'
                }
            
            try:
                # Get the most recent non-used OTP for this email and purpose
                otp_record = EmailOTP.objects.filter(
                    email=email,
                    purpose=purpose,
                    is_used=False,
                    expires_at__gt=timezone.now()
                ).order_by('-created_at').first()
                
                if not otp_record:
                    logger.warning(f"No active OTP found for {email} with purpose {purpose}")
                    return {
                        'success': False,
                        'message': 'No active verification code found',
                        'status': 'not_found'
                    }
                
                # Increment verification attempts
                otp_record.verification_attempts += 1
                otp_record.save(update_fields=['verification_attempts'])
                
                # Check if too many verification attempts
                if otp_record.verification_attempts >= 5:
                    logger.warning(f"Too many verification attempts for {email}")
                    return {
                        'success': False,
                        'message': 'Too many verification attempts',
                        'status': 'max_attempts'
                    }
                
                # Check if the code matches
                if otp_record.otp != code:
                    logger.warning(f"Invalid OTP entered for {email}")
                    return {
                        'success': False,
                        'message': 'Invalid verification code',
                        'status': 'invalid'
                    }
                
                # Mark OTP as used
                otp_record.is_used = True
                otp_record.save(update_fields=['is_used'])
                
                # Mark all other OTPs for this email and purpose as used
                EmailOTP.objects.filter(
                    email=email, 
                    purpose=purpose
                ).exclude(id=otp_record.id).update(is_used=True)
                
                logger.info(f"OTP verified successfully for {email}")
                return {
                    'success': True,
                    'message': 'Verification successful',
                    'status': 'verified'
                }
                
            except Exception as e:
                logger.warning(f"Error verifying OTP for {email}: {str(e)}")
                return {
                    'success': False,
                    'message': 'Error verifying code',
                    'status': 'error'
                }
                
        except Exception as e:
            logger.error(f"Unexpected error in verify_otp: {str(e)}")
            return {
                'success': False,
                'message': 'An unexpected error occurred',
                'status': 'error'
            }
