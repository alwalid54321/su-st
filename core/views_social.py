from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from allauth.socialaccount.models import SocialAccount
from django.urls import reverse

@login_required
def social_connections_view(request):
    """
    View for managing social account connections.
    Shows connected accounts and options to connect new ones.
    """
    # Get user's connected social accounts
    social_accounts = SocialAccount.objects.filter(user=request.user)
    
    # Check which providers are already connected
    connected_providers = [account.provider for account in social_accounts]
    
    context = {
        'social_accounts': social_accounts,
        'has_google': 'google' in connected_providers,
        'has_facebook': 'facebook' in connected_providers,
        'has_apple': 'apple' in connected_providers,
        'has_microsoft': 'microsoft' in connected_providers,
    }
    
    return render(request, 'core/social_connections.html', context)

@login_required
def disconnect_social_account(request, account_id):
    """
    View for disconnecting a social account.
    Requires POST method for security.
    """
    if request.method != 'POST':
        messages.error(request, 'Invalid request method')
        return redirect('social_connections')
    
    # Get the social account and verify it belongs to the user
    account = get_object_or_404(SocialAccount, id=account_id, user=request.user)
    
    # Store provider name for the success message
    provider_name = account.provider.capitalize()
    
    # Delete the account
    account.delete()
    
    messages.success(request, f'Your {provider_name} account has been disconnected.')
    return redirect('social_connections')
