from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import random
import string

class User(AbstractUser):
    """Custom user model extending Django's AbstractUser"""
    last_login = models.DateTimeField(auto_now=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.username

class MarketData(models.Model):
    """Model for market data"""
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Limited', 'Limited'),
        ('Inactive', 'Inactive'),
    )
    FORECAST_CHOICES = (
        ('Rising', 'Rising'),
        ('Stable', 'Stable'),
        ('Falling', 'Falling'),
    )
    
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    port_sudan = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    dmt_china = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    dmt_uae = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    dmt_mersing = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    dmt_india = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')
    forecast = models.CharField(max_length=50, choices=FORECAST_CHOICES, default='Stable')
    trend = models.IntegerField(default=0)  # -1 for down, 0 for stable, 1 for up
    image_url = models.CharField(max_length=255, null=True, blank=True)
    last_update = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Check if this is an update (object already exists)
        if self.pk:
            # Get the old instance before saving
            old_instance = MarketData.objects.get(pk=self.pk)
            # Save the current instance
            super(MarketData, self).save(*args, **kwargs)
            # Create archive record
            MarketDataArchive.objects.create(
                original_id=self.pk,
                name=old_instance.name,
                value=old_instance.value,
                port_sudan=old_instance.port_sudan,
                dmt_china=old_instance.dmt_china,
                dmt_uae=old_instance.dmt_uae,
                dmt_mersing=old_instance.dmt_mersing,
                dmt_india=old_instance.dmt_india,
                status=old_instance.status,
                forecast=old_instance.forecast,
                trend=old_instance.trend,
                image_url=old_instance.image_url,
                archived_at=timezone.now(),
                last_update=old_instance.last_update,
                created_at=old_instance.created_at
            )
        else:
            # This is a new instance, just save it
            super(MarketData, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Market Data'
        verbose_name_plural = 'Market Data'

class MarketDataArchive(models.Model):
    """Archive model for market data history"""
    original_id = models.IntegerField()
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    port_sudan = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    dmt_china = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    dmt_uae = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    dmt_mersing = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    dmt_india = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    status = models.CharField(max_length=50, default='Active')
    forecast = models.CharField(max_length=50, default='Stable')
    trend = models.IntegerField(default=0)
    image_url = models.CharField(max_length=255, null=True, blank=True)
    archived_at = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField()
    created_at = models.DateTimeField()
    
    def __str__(self):
        return f"{self.name} (Archived: {self.archived_at.strftime('%Y-%m-%d %H:%M')})"
    
    class Meta:
        verbose_name = 'Market Data Archive'
        verbose_name_plural = 'Market Data Archives'
        ordering = ['-archived_at']

class EmailOTP(models.Model):
    """Model for email OTP verification with enhanced security"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    verification_attempts = models.IntegerField(default=0)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    purpose = models.CharField(max_length=20, default='login', choices=[
        ('login', 'Login Verification'),
        ('registration', 'Registration Verification'),
        ('password_reset', 'Password Reset'),
        ('email_change', 'Email Change Verification'),
        ('security_action', 'Security Action Verification')
    ])
    
    class Meta:
        verbose_name = 'Email OTP'
        verbose_name_plural = 'Email OTPs'
        indexes = [
            models.Index(fields=['email', 'purpose']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.otp} ({self.purpose})"
    
    @classmethod
    def generate_otp(cls, length=6):
        """Generate a cryptographically secure OTP"""
        import secrets
        return ''.join(secrets.choice(string.digits) for _ in range(length))
    
    @classmethod
    def create_otp_for_user(cls, user, purpose='login', ip_address=None, user_agent=None):
        """Create a new OTP for a user with enhanced security"""
        # Expire any existing OTPs
        cls.objects.filter(user=user, purpose=purpose, is_used=False).update(is_used=True)
        
        # Create new OTP
        otp = cls.generate_otp()
        expires_at = timezone.now() + timezone.timedelta(minutes=10)  # OTP valid for 10 minutes
        
        return cls.objects.create(
            user=user,
            email=user.email,
            otp=otp,
            expires_at=expires_at,
            purpose=purpose,
            ip_address=ip_address,
            user_agent=user_agent,
            verification_attempts=0
        )
    
    def is_valid(self):
        """Check if OTP is valid (not expired, not used, and not too many attempts)"""
        max_attempts = 5  # Maximum number of verification attempts
        return (
            not self.is_used and 
            timezone.now() <= self.expires_at and 
            self.verification_attempts < max_attempts
        )
    
    def increment_attempts(self):
        """Increment the number of verification attempts"""
        self.verification_attempts += 1
        self.save(update_fields=['verification_attempts'])
        return self.verification_attempts

class Currency(models.Model):
    """Model for currency data"""
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100, default='Currency')
    rate = models.DecimalField(max_digits=10, decimal_places=4, default=1.0)
    last_update = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def save(self, *args, **kwargs):
        # Check if this is an update (object already exists)
        if self.pk:
            # Get the old instance before saving
            old_instance = Currency.objects.get(pk=self.pk)
            # Save the current instance
            super(Currency, self).save(*args, **kwargs)
            # Create archive record
            CurrencyArchive.objects.create(
                original_id=self.pk,
                code=old_instance.code,
                name=old_instance.name,
                rate=old_instance.rate,
                archived_at=timezone.now(),
                last_update=old_instance.last_update
            )
        else:
            # This is a new instance, just save it
            super(Currency, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Currency'
        verbose_name_plural = 'Currencies'

class CurrencyArchive(models.Model):
    """Archive model for currency history"""
    original_id = models.IntegerField()
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=10, decimal_places=4)
    archived_at = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField()
    
    def __str__(self):
        return f"{self.code} - {self.name} (Archived: {self.archived_at.strftime('%Y-%m-%d %H:%M')})"
    
    class Meta:
        verbose_name = 'Currency Archive'
        verbose_name_plural = 'Currency Archives'
        ordering = ['-archived_at']

class Announcement(models.Model):
    """Model for announcements"""
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    
    title = models.CharField(max_length=200)
    content = models.TextField(default='')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Check if this is an update (object already exists)
        if self.pk:
            # Get the old instance before saving
            old_instance = Announcement.objects.get(pk=self.pk)
            # Save the current instance
            super(Announcement, self).save(*args, **kwargs)
            # Create archive record
            AnnouncementArchive.objects.create(
                original_id=self.pk,
                title=old_instance.title,
                content=old_instance.content,
                priority=old_instance.priority,
                archived_at=timezone.now(),
                created_at=old_instance.created_at,
                updated_at=old_instance.updated_at
            )
        else:
            # This is a new instance, just save it
            super(Announcement, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'

class AnnouncementArchive(models.Model):
    """Archive model for announcement history"""
    original_id = models.IntegerField()
    title = models.CharField(max_length=200)
    content = models.TextField(default='')
    priority = models.CharField(max_length=10, default='medium')
    archived_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    
    def __str__(self):
        return f"{self.title} (Archived: {self.archived_at.strftime('%Y-%m-%d %H:%M')})"
    
    class Meta:
        verbose_name = 'Announcement Archive'
        verbose_name_plural = 'Announcement Archives'
        ordering = ['-archived_at']

class UserSettings(models.Model):
    """
    Model for storing user settings and preferences.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    email_notifications = models.BooleanField(default=True)
    dark_mode = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default='en')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'
    
    def __str__(self):
        return f"{self.user.username}'s Settings"
