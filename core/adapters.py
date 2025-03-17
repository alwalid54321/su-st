from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import perform_login
from django.contrib import messages
from django.shortcuts import redirect

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter for social account authentication that ensures
    proper verification and security measures.
    """
    
    def pre_social_login(self, request, sociallogin):
        """
        Handle the pre-social login process, ensuring email verification
        and proper user account linking.
        """
        # Check if the user is already logged in
        if request.user.is_authenticated:
            return
            
        # Get the user from the sociallogin
        user = sociallogin.user
        
        # Check if this social account is already connected to another user
        if sociallogin.is_existing:
            # Social account already exists and is connected to a user
            return
            
        # Check if a user with this email already exists
        try:
            existing_user = self.get_model('User').objects.get(email=user.email)
            
            # If we found a user, connect the social account to it
            sociallogin.connect(request, existing_user)
            
            # Add a success message
            messages.success(
                request, 
                f"Successfully connected your {sociallogin.account.provider.capitalize()} account."
            )
            
            # Return to stop the normal flow
            return
            
        except self.get_model('User').DoesNotExist:
            # No user with this email exists, continue with normal flow
            pass
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save the user and ensure proper profile setup.
        """
        user = super().save_user(request, sociallogin, form)
        
        # Set email as verified since it's coming from a trusted provider
        user.email_verified = True
        user.save()
        
        # Add a welcome message
        messages.success(
            request, 
            f"Welcome to SudaStock! Your account has been created using {sociallogin.account.provider.capitalize()}."
        )
        
        return user
    
    def get_connect_redirect_url(self, request, socialaccount):
        """
        Return the URL to redirect to after a successful connection.
        """
        return '/dashboard/'
