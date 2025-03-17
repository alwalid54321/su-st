"""
URL configuration for sudastock project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.contrib.auth import views as auth_views
from core.views import (
    LoginView, RegisterView, LogoutView, VerifyEmailView,
    SendOTPAPIView, ResendOTPAPIView, VerifyOTPAPIView,
    home_view, products_view, about_view, contact_view, sample_view, quote_view,
    user_dashboard, market_data_view, currencies_view, announcements_view,
    admin_dashboard, admin_market_data, admin_currencies, admin_announcements, admin_users,
    profile_view, settings_view,
    ForgotPasswordView, VerifyResetCodeView, ResetPasswordView,
    sample_submit, quote_submit,
)
from core.views_social import social_connections_view, disconnect_social_account
from django.views import defaults as django_defaults
from django.http import HttpResponse

# Simple test view to verify HTTP connection
def test_connection(request):
    return HttpResponse("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SudaStock Connection Test</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                color: #333;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #1B1464; /* Primary dark blue from logo */
                border-bottom: 2px solid #786D3C; /* Gold accent from logo */
                padding-bottom: 10px;
            }
            .success {
                background-color: #e7f3e8;
                border-left: 4px solid #28a745;
                padding: 15px;
                margin-bottom: 20px;
            }
            .info {
                background-color: #e7f1f9;
                border-left: 4px solid #1B1464;
                padding: 15px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>SudaStock Connection Test</h1>
            
            <div class="success">
                <h2>HTTP Connection Successful!</h2>
                <p>You have successfully connected to the SudaStock development server using HTTP.</p>
            </div>
            
            <div class="info">
                <h3>Connection Details:</h3>
                <p>Protocol: HTTP</p>
                <p>Server: Django Development Server</p>
                <p>Path: /test/</p>
            </div>
            
            <p>This confirms your browser can correctly connect to the Django development server using HTTP.</p>
        </div>
    </body>
    </html>
    """)

urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    
    # Authentication
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    
    # Password Reset URLs
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-reset-code/', VerifyResetCodeView.as_view(), name='verify_reset_code'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    
    # Django's built-in password reset views
    path('account/password_reset/', 
         auth_views.PasswordResetView.as_view(), 
         name='password_reset'),
    path('account/password_reset/done/', 
         auth_views.PasswordResetDoneView.as_view(), 
         name='password_reset_done'),
    path('account/reset/<uidb64>/<token>/', 
         auth_views.PasswordResetConfirmView.as_view(), 
         name='password_reset_confirm'),
    path('account/reset/done/', 
         auth_views.PasswordResetCompleteView.as_view(), 
         name='password_reset_complete'),
    
    # OTP API Endpoints
    path('api/send-otp/', SendOTPAPIView.as_view(), name='send_otp'),
    path('api/resend-otp/', ResendOTPAPIView.as_view(), name='resend_otp'),
    path('api/verify-otp/', VerifyOTPAPIView.as_view(), name='verify_otp'),
    
    # Social Authentication
    path('social-auth/', include('social_django.urls', namespace='social')),
    
    # Include allauth URLs but redirect /accounts/login to our custom login view
    path('accounts/login/', RedirectView.as_view(url='/login/', query_string=True), name='account_login_redirect'),
    path('accounts/', include('allauth.urls')),
    
    # Main pages
    path('', home_view, name='home'),
    path('products/', products_view, name='products'),
    path('about/', about_view, name='about'),
    path('contact/', contact_view, name='contact'),
    path('sample/', sample_view, name='sample'),
    path('quote/', quote_view, name='quote'),
    
    # Form submission endpoints
    path('sample-submit/', sample_submit, name='sample_submit'),
    path('quote-submit/', quote_submit, name='quote_submit'),
    
    # Dashboard
    path('dashboard/', user_dashboard, name='dashboard'),
    path('data/', market_data_view, name='market_data'),
    path('currencies/', currencies_view, name='currencies'),
    path('announcements/', announcements_view, name='announcements'),
    
    # User profile and settings
    path('profile/', profile_view, name='profile'),
    path('settings/', settings_view, name='settings'),
    path('social-connections/', social_connections_view, name='social_connections'),
    path('social-connections/disconnect/<int:account_id>/', disconnect_social_account, name='disconnect_social_account'),
    
    # Admin Dashboard
    path('admin-dashboard/', admin_dashboard, name='admin_dashboard'),
    path('admin-market-data/', admin_market_data, name='admin_market_data'),
    path('admin-currencies/', admin_currencies, name='admin_currencies'),
    path('admin-announcements/', admin_announcements, name='admin_announcements'),
    path('admin-users/', admin_users, name='admin_users'),
    
    # Include all core app URLs
    path('', include('core.urls')),
    
    # Test connection view
    path('test/', test_connection, name='test_connection'),
    
    # Catch-all for non-existent URLs - must be last
    path('<path:path>', lambda request, path: django_defaults.page_not_found(request, None), name='catch_all'),
]

# Serve static and media files
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Serve static files even in production for development purposes
    # In a real production environment, this should be handled by a web server like Nginx
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Register custom error handlers
handler404 = 'core.views.handler404'
