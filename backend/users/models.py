from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from datetime import timedelta
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    income = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Email verification fields
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, unique=True, null=True, blank=True)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Password reset fields
    password_reset_token = models.CharField(max_length=255, unique=True, null=True, blank=True)
    password_reset_token_expires_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
    
    def generate_email_verification_token(self):
        """Generate a unique email verification token"""
        self.email_verification_token = str(uuid.uuid4())
        self.email_verification_sent_at = timezone.now()
        self.save()
        return self.email_verification_token
    
    def generate_password_reset_token(self):
        """Generate a password reset token with 1-hour expiration"""
        self.password_reset_token = str(uuid.uuid4())
        self.password_reset_token_expires_at = timezone.now() + timedelta(hours=1)
        self.save()
        return self.password_reset_token
    
    def is_password_reset_token_valid(self):
        """Check if password reset token is valid and not expired"""
        if not self.password_reset_token or not self.password_reset_token_expires_at:
            return False
        return timezone.now() <= self.password_reset_token_expires_at
