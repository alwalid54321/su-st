from django.shortcuts import render
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.shortcuts import redirect
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from .models import User, MarketData, Currency, Announcement, MarketDataArchive, EmailOTP
from .models_cnf import Product
from .serializers import (
    UserSerializer, 
    MarketDataSerializer, 
    CurrencySerializer, 
    AnnouncementSerializer,
    LoginSerializer,
    RegisterSerializer
)
from django.utils import timezone
from django.contrib.auth.decorators import login_required
import json
import random
import string
from datetime import timedelta
from django.core.mail import send_mail
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.utils.decorators import method_decorator
from .utils.email_otp import EmailOTPService
import logging

# Set up logger
logger = logging.getLogger(__name__)

# Authentication Views
class LoginView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard')
        return render(request, 'core/login.html')
    
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember = request.POST.get('remember')
        
        # Validate inputs
        if not username or not password:
            messages.error(request, 'Username and password are required')
            return render(request, 'core/login.html')
        
        # Check if the username is an email
        if '@' in username:
            # Try to get the user by email
            try:
                user = User.objects.get(email=username)
                username = user.username
            except User.DoesNotExist:
                messages.error(request, 'Invalid email or password')
                return render(request, 'core/login.html')
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Check if email is verified
            if not user.email_verified:
                # Generate a 6-digit OTP
                otp = ''.join(random.choices(string.digits, k=6))
                
                # Set expiry time (10 minutes from now)
                expiry_time = timezone.now() + timezone.timedelta(minutes=10)
                
                try:
                    # Mark all existing OTPs as used
                    EmailOTP.objects.filter(
                        email=user.email, 
                        purpose='login', 
                        is_used=False
                    ).update(is_used=True)
                    
                    # Save new OTP to database
                    EmailOTP.objects.create(
                        email=user.email,
                        otp=otp,
                        expires_at=expiry_time,
                        is_used=False,
                        purpose='login'
                    )
                    
                    # For development: Print OTP to console instead of sending email
                    print(f"\n==== VERIFICATION CODE for {user.email} ====")
                    print(f"OTP: {otp}")
                    print(f"Valid until: {expiry_time}")
                    print("====================================\n")
                    
                    # Store user info in session for verification
                    request.session['pending_login_user_id'] = user.id
                    request.session['pending_login_remember'] = remember == 'on'
                    
                    return render(request, 'core/verify_email.html', {'email': user.email})
                except Exception as e:
                    # Log the error for debugging
                    print(f"Failed to send email: {str(e)}")
                    print(f"Email settings: Host={settings.EMAIL_HOST}, Port={settings.EMAIL_PORT}, User={settings.EMAIL_HOST_USER}")
                    messages.error(request, f'Failed to send verification code: {str(e)}')
                    return render(request, 'core/login.html')
            
            # Log the user in
            login(request, user)
            
            # Set session expiry if remember me is not checked
            if remember != 'on':
                request.session.set_expiry(0)  # Session expires when browser is closed
            
            messages.success(request, f'Welcome back, {user.first_name}!')
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password')
            return render(request, 'core/login.html')


class VerifyEmailView(View):
    """
    View for verifying email with OTP during login
    """
    def get(self, request):
        if not request.session.get('pending_login_user_id'):
            return redirect('login')
        
        try:
            user = User.objects.get(id=request.session.get('pending_login_user_id'))
            return render(request, 'core/verify_email.html', {'email': user.email})
        except User.DoesNotExist:
            return redirect('login')
    
    def post(self, request):
        otp = request.POST.get('otp')
        
        if not otp:
            messages.error(request, 'Verification code is required')
            return render(request, 'core/verify_email.html')
        
        # Get user from session
        try:
            user = User.objects.get(id=request.session.get('pending_login_user_id'))
        except User.DoesNotExist:
            messages.error(request, 'Session expired. Please login again.')
            return redirect('login')
        
        # Verify OTP
        try:
            # Get the most recent OTP for this email and purpose
            otp_record = EmailOTP.objects.filter(
                email=user.email, 
                purpose='login',
                is_used=False,
                expires_at__gt=timezone.now()
            ).order_by('-created_at').first()
            
            if not otp_record:
                messages.error(request, 'No valid verification code found. Please login again to request a new one.')
                return redirect('login')
            
            # Check if OTP matches
            if otp_record.otp != otp:
                messages.error(request, 'Invalid verification code')
                return render(request, 'core/verify_email.html', {'email': user.email})
            
            # Mark OTP as verified
            otp_record.is_used = True
            otp_record.save()
            
            # Mark all other OTPs for this email as used
            EmailOTP.objects.filter(email=user.email).exclude(id=otp_record.id).update(is_used=True)
            
            # Mark user email as verified
            user.email_verified = True
            user.save()
            
            # Log the user in with the default ModelBackend
            from django.contrib.auth import authenticate
            from django.contrib.auth.backends import ModelBackend
            authenticated_user = authenticate(request, username=user.username, password=None, backend='django.contrib.auth.backends.ModelBackend')
            if authenticated_user is None:
                # If authentication fails, manually set the backend
                user.backend = 'django.contrib.auth.backends.ModelBackend'
                login(request, user)
            else:
                login(request, authenticated_user)
            
            # Set session expiry if remember me is not checked
            if not request.session.get('pending_login_remember'):
                request.session.set_expiry(0)  # Session expires when browser is closed
            
            # Clean up session
            if 'pending_login_user_id' in request.session:
                del request.session['pending_login_user_id']
            if 'pending_login_remember' in request.session:
                del request.session['pending_login_remember']
            
            messages.success(request, f'Email verified successfully. Welcome back, {user.first_name}!')
            return redirect('dashboard')
        except Exception as e:
            messages.error(request, f'Error verifying code: {str(e)}')
            return redirect('login')


class SendOTPAPIView(APIView):
    """
    API endpoint for sending OTP to user's email
    """
    permission_classes = []  # Allow unauthenticated access
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email')
            purpose = data.get('purpose', 'login')  # Default purpose is login
            
            if not email:
                return Response({'success': False, 'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate email format
            if '@' not in email or '.' not in email:
                return Response({'success': False, 'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Use Email OTP service to send verification code
            email_service = EmailOTPService()
            result = email_service.send_verification_code(email, purpose=purpose)
            
            if result['success']:
                return Response({'success': True, 'message': 'Verification code sent successfully'}, status=status.HTTP_200_OK)
            else:
                logger.error(f"Failed to send OTP: {result['message']}")
                return Response({'success': False, 'message': result['message']}, status=status.HTTP_400_BAD_REQUEST)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return Response({'success': False, 'message': 'Invalid request format'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Unexpected error in SendOTPAPIView: {str(e)}")
            return Response({'success': False, 'message': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendOTPAPIView(APIView):
    """
    API endpoint for resending OTP to user's email
    """
    permission_classes = []  # Allow unauthenticated access
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email')
            purpose = data.get('purpose', 'login')  # Default purpose is login
            
            if not email:
                return Response({'success': False, 'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate email format
            if '@' not in email or '.' not in email:
                return Response({'success': False, 'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Use Email OTP service to send verification code
            email_service = EmailOTPService()
            result = email_service.send_verification_code(email, purpose=purpose)
            
            if result['success']:
                return Response({'success': True, 'message': 'Verification code resent successfully'}, status=status.HTTP_200_OK)
            else:
                logger.error(f"Failed to resend OTP: {result['message']}")
                return Response({'success': False, 'message': result['message']}, status=status.HTTP_400_BAD_REQUEST)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return Response({'success': False, 'message': 'Invalid request format'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Unexpected error in ResendOTPAPIView: {str(e)}")
            return Response({'success': False, 'message': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPAPIView(APIView):
    """
    API endpoint for verifying OTP
    """
    permission_classes = []  # Allow unauthenticated access
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email')
            otp = data.get('otp')
            purpose = data.get('purpose', 'login')  # Default purpose is login
            
            if not email or not otp:
                return Response({'success': False, 'message': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate email format
            if '@' not in email or '.' not in email:
                return Response({'success': False, 'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate OTP format (should be 6 digits)
            if not otp.isdigit() or len(otp) != 6:
                return Response({'success': False, 'message': 'OTP should be 6 digits'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Use Email OTP service to verify code
            email_service = EmailOTPService()
            result = email_service.verify_code(email, otp, purpose=purpose)
            
            if result['success']:
                return Response({'success': True, 'message': 'Verification successful'}, status=status.HTTP_200_OK)
            else:
                logger.warning(f"OTP verification failed: {result['message']} for email: {email}")
                return Response({'success': False, 'message': result['message']}, status=status.HTTP_400_BAD_REQUEST)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return Response({'success': False, 'message': 'Invalid request format'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Unexpected error in VerifyOTPAPIView: {str(e)}")
            return Response({'success': False, 'message': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard')
        return render(request, 'core/register.html')
    
    def post(self, request):
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')
        otp = request.POST.get('otp')
        
        # Validate inputs
        if not all([first_name, last_name, username, email, password, password_confirm, otp]):
            messages.error(request, 'All fields are required')
            return render(request, 'core/register.html')
        
        if password != password_confirm:
            messages.error(request, 'Passwords do not match')
            return render(request, 'core/register.html')
        
        # Check if username or email already exists
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return render(request, 'core/register.html')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists')
            return render(request, 'core/register.html')
        
        # Verify OTP
        try:
            # Get the most recent OTP for this email and purpose
            otp_record = EmailOTP.objects.filter(
                email=email, 
                purpose='login',
                is_used=False,
                expires_at__gt=timezone.now()
            ).order_by('-created_at').first()
            
            if not otp_record:
                messages.error(request, 'No valid OTP found for this email. Please request a new one.')
                return render(request, 'core/register.html')
            
            # Check if OTP matches
            if otp_record.otp != otp:
                messages.error(request, 'Invalid OTP')
                return render(request, 'core/register.html')
            
            # Mark OTP as verified
            otp_record.is_used = True
            otp_record.save()
            
            # Mark all other OTPs for this email as used
            EmailOTP.objects.filter(email=email).exclude(id=otp_record.id).update(is_used=True)
            
        except Exception as e:
            messages.error(request, f'Error verifying OTP: {str(e)}')
            return render(request, 'core/register.html')
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email_verified=True  # Since OTP is verified
        )
        
        # Create token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        # Log the user in with the default ModelBackend
        from django.contrib.auth.backends import ModelBackend
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)
        
        messages.success(request, 'Registration successful! Welcome to SudaStock.')
        return redirect('dashboard')


class LogoutView(View):
    def post(self, request):
        logout(request)
        messages.success(request, 'You have been successfully logged out.')
        return redirect('home')
    
    def get(self, request):
        logout(request)
        messages.success(request, 'You have been successfully logged out.')
        return redirect('home')


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Validate input fields
        if not username:
            messages.error(request, 'Username is required.')
            return render(request, 'core/login.html')
        
        if not password:
            messages.error(request, 'Password is required.')
            return render(request, 'core/login.html')
        
        # Attempt to authenticate the user
        try:
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {username}!')
                
                # Redirect staff users to admin dashboard, regular users to user dashboard
                if user.is_staff:
                    return redirect('admin_dashboard')
                else:
                    return redirect('user_dashboard')
            else:
                messages.error(request, 'Invalid username or password. Please try again.')
        except Exception as e:
            # Log the error for debugging
            print(f"Login error: {str(e)}")
            messages.error(request, 'An error occurred during login. Please try again later.')
    
    return render(request, 'core/login.html')

def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')
        
        if password != password_confirm:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'core/register.html')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            return render(request, 'core/register.html')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists.')
            return render(request, 'core/register.html')
        
        user = User.objects.create_user(username=username, email=email, password=password)
        messages.success(request, 'Account created successfully. You can now log in.')
        return redirect('login')
    
    return render(request, 'core/register.html')

def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('login')

@login_required
def user_dashboard(request):
    """User dashboard view for regular users"""
    # Get counts for dashboard stats
    market_data_count = MarketData.objects.count()
    currency_count = Currency.objects.count()
    announcement_count = Announcement.objects.count()
    
    # Get product data (all market data items)
    products = MarketData.objects.all().order_by('name')
    
    # Get selected product (default to first product if none selected)
    selected_product_id = request.GET.get('product_id')
    if selected_product_id:
        selected_product = MarketData.objects.filter(id=selected_product_id).first()
    else:
        selected_product = products.first()
    
    # Get historical data for the selected product
    historical_data = []
    if selected_product:
        # Get archive data for the selected product - limit to last 30 data points for better visualization
        archives = MarketDataArchive.objects.filter(original_id=selected_product.id).order_by('-archived_at')[:30]
        
        # Process archive data in chronological order
        for archive in reversed(list(archives)):
            historical_data.append({
                'date': archive.archived_at.strftime('%Y-%m-%d'),
                'value': float(archive.value),
                'port_sudan': float(archive.port_sudan),
                'dmt_china': float(archive.dmt_china),
                'dmt_uae': float(archive.dmt_uae),
                'dmt_mersing': float(archive.dmt_mersing),
                'dmt_india': float(archive.dmt_india),
                'status': archive.status if hasattr(archive, 'status') else '',
                'trend': float(archive.trend) if hasattr(archive, 'trend') and archive.trend is not None else 0,
            })
        
        # Add current data point
        historical_data.append({
            'date': selected_product.last_update.strftime('%Y-%m-%d'),
            'value': float(selected_product.value),
            'port_sudan': float(selected_product.port_sudan),
            'dmt_china': float(selected_product.dmt_china),
            'dmt_uae': float(selected_product.dmt_uae),
            'dmt_mersing': float(selected_product.dmt_mersing),
            'dmt_india': float(selected_product.dmt_india),
            'status': selected_product.status if hasattr(selected_product, 'status') else '',
            'trend': float(selected_product.trend) if hasattr(selected_product, 'trend') and selected_product.trend is not None else 0,
        })
    
    # Get recent market data
    recent_market_data = MarketData.objects.all().order_by('-last_update')[:5]
    
    # Get recent announcements
    recent_announcements = Announcement.objects.all().order_by('-created_at')[:5]
    
    # Serialize historical data to JSON
    import json
    serialized_historical_data = json.dumps(historical_data)
    
    context = {
        'market_data_count': market_data_count,
        'currency_count': currency_count,
        'announcement_count': announcement_count,
        'recent_market_data': recent_market_data,
        'recent_announcements': recent_announcements,
        'products': products,
        'selected_product': selected_product,
        'historical_data': serialized_historical_data,
    }
    
    return render(request, 'core/dashboard.html', context)


# Market Data Views
class MarketDataViewSet(viewsets.ModelViewSet):
    queryset = MarketData.objects.all().order_by('name')
    serializer_class = MarketDataSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """
        Get all market data
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """
        Get a specific market data item
        """
        try:
            item = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(item)
            return Response(serializer.data)
        except MarketData.DoesNotExist:
            return Response({"error": "Market data not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Get historical data for a specific market data item
        """
        try:
            # Get date range from query parameters
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            # Convert string dates to datetime objects
            if start_date:
                start_date = timezone.datetime.strptime(start_date, '%Y-%m-%d').date()
                start_date = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
            else:
                # Default to 10 days ago
                start_date = timezone.now() - timezone.timedelta(days=10)
            
            if end_date:
                end_date = timezone.datetime.strptime(end_date, '%Y-%m-%d').date()
                end_date = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.max.time()))
            else:
                # Default to today
                end_date = timezone.now()
            
            # Get the market data item
            market_item = MarketData.objects.get(pk=pk)
            
            # Get historical data from archive
            history = MarketDataArchive.objects.filter(
                original_id=pk,
                archived_at__gte=start_date,
                archived_at__lte=end_date
            ).order_by('archived_at')
            
            # Prepare response data
            response_data = {
                'product': {
                    'id': market_item.id,
                    'name': market_item.name,
                    'current_value': float(market_item.value),
                    'current_port_sudan': float(market_item.port_sudan),
                    'current_dmt_china': float(market_item.dmt_china),
                    'current_dmt_uae': float(market_item.dmt_uae),
                    'current_dmt_mersing': float(market_item.dmt_mersing),
                    'current_dmt_india': float(market_item.dmt_india),
                    'status': market_item.status,
                    'forecast': market_item.forecast,
                    'trend': market_item.trend,
                },
                'history': []
            }
            
            # Add historical data points
            for item in history:
                response_data['history'].append({
                    'date': item.archived_at.strftime('%Y-%m-%d'),
                    'value': float(item.value),
                    'port_sudan': float(item.port_sudan),
                    'dmt_china': float(item.dmt_china),
                    'dmt_uae': float(item.dmt_uae),
                    'dmt_mersing': float(item.dmt_mersing),
                    'dmt_india': float(item.dmt_india),
                    'status': item.status,
                    'forecast': item.forecast,
                    'trend': item.trend,
                })
            
            return Response(response_data)
        except MarketData.DoesNotExist:
            return Response({"error": "Market data not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Currency Views
class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all().order_by('code')
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'timestamp': serializer.data[0]['last_update'] if serializer.data else None,
            'theme': {
                'primaryDark': settings.THEME['PRIMARY_DARK'],
                'accent': settings.THEME['ACCENT']
            },
            'data': serializer.data
        })


# Announcement Views
class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().order_by('-created_at')
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'timestamp': serializer.data[0]['updated_at'] if serializer.data else None,
            'theme': {
                'primaryDark': settings.THEME['PRIMARY_DARK'],
                'accent': settings.THEME['ACCENT']
            },
            'data': serializer.data
        })


# Template Views
def home_view(request):
    market_data = MarketData.objects.all().order_by('name')
    announcements = Announcement.objects.all().order_by('-created_at')
    
    # Update RUB to INR if it exists
    try:
        rub = Currency.objects.get(code='RUB')
        rub.code = 'INR'
        rub.name = 'Indian Rupee'
        rub.save()
    except Currency.DoesNotExist:
        # If RUB doesn't exist, check if INR already exists
        try:
            Currency.objects.get(code='INR')
        except Currency.DoesNotExist:
            # Create INR if neither exists
            Currency.objects.create(
                code='INR',
                name='Indian Rupee',
                rate=22.50,
                last_update=timezone.now()
            )
    
    currencies = Currency.objects.all().order_by('code')
    context = {
        'market_data': market_data,
        'announcements': announcements,
        'currencies': currencies
    }
    return render(request, 'core/home.html', context)

@login_required
def market_data_view(request):
    # Get all market data items to populate the dropdown
    market_data = MarketData.objects.all().order_by('name')
    
    # Use market_data for the dropdown instead of products
    # products = Product.objects.all().order_by('name')
    
    # Get the latest market data update timestamp
    latest_update = MarketData.objects.order_by('-last_update').first()
    latest_update_time = latest_update.last_update if latest_update else None
    
    # Get market data archive count for stats
    archive_count = MarketDataArchive.objects.count()
    
    # Get product count for stats - don't filter by is_active since it doesn't exist
    active_product_count = MarketData.objects.count()
    
    # Set default date range (last 30 days)
    default_end_date = timezone.now()
    default_start_date = default_end_date - timezone.timedelta(days=30)
    
    context = {
        'market_data': market_data,
        'products': market_data,  # Use market_data for the products dropdown
        'latest_update_time': latest_update_time,
        'archive_count': archive_count,
        'active_product_count': active_product_count,
        'default_start_date': default_start_date,
        'default_end_date': default_end_date,
        'theme': {
            'primary_dark': settings.THEME['PRIMARY_DARK'],
            'accent': settings.THEME['ACCENT']
        }
    }
    
    return render(request, 'core/market_data.html', context)

@login_required
def currencies_view(request):
    return render(request, 'core/currencies.html')

@login_required
def announcements_view(request):
    return render(request, 'core/announcements.html')

def products_view(request):
    # Define product data
    products = [
        {
            'id': 'sesame-gad',
            'name': 'SESAME GADADREF',
            'category': 'sesame',
            'description': 'Premium quality sesame seeds from the Gadadref region of Sudan.',
            'specifications': {
                'class': '98%',
                'oilContent': '52% MIN',
                'ffa': '1.2% MAX',
            },
            'image': 'images/sesame-gad.jpg',
            'details': [
                'Origin: Gadaref Region, Sudan',
                'Harvesting Season: October - December',
                'Processing: Machine cleaned and sorted',
                'Packaging: 50kg PP bags or as per request',
                'Certifications: ISO 22000, HACCP'
            ],
            'trend': 0
        },
        {
            'id': 'sesame-com',
            'name': 'SESAME COMMERCIAL',
            'category': 'sesame',
            'description': 'High-quality commercial grade sesame seeds for industrial applications.',
            'specifications': {
                'class': '95%',
                'oilContent': '48% MIN',
                'ffa': '1.8% MAX',
            },
            'image': 'images/sesame-com.jpg',
            'details': [
                'Origin: Various regions, Sudan',
                'Harvesting Season: October - December',
                'Processing: Machine cleaned',
                'Packaging: 50kg PP bags',
                'Usage: Industrial and food processing'
            ],
            'trend': 0
        },
        {
            'id': 'red-sesame',
            'name': 'RED SESAME',
            'category': 'sesame',
            'description': 'Vibrant red sesame seeds with high iron content and rich nutritional value.',
            'specifications': {
                'class': '99%',
                'oilContent': '50% MIN',
                'ffa': '1.5% MAX',
            },
            'image': 'images/red-sesame.jpg',
            'details': [
                'Origin: Northern Sudan',
                'Harvesting Season: September - November',
                'Processing: Premium grade sorting',
                'Packaging: 25kg or 50kg PP bags',
                'Special Features: High iron content'
            ],
            'trend': 0
        },
        {
            'id': 'acacia-sen',
            'name': 'ACACIA SENEGAL',
            'category': 'gum',
            'description': 'Premium grade Acacia Senegal gum with superior quality.',
            'specifications': {
                'grade': 'Premium',
                'moisture': '13% MAX',
                'ash': '4% MAX',
            },
            'image': 'images/acacia-sen.jpg',
            'trend': 0
        },
        {
            'id': 'acacia-sey',
            'name': 'ACACIA SEYAL',
            'category': 'gum',
            'description': 'High-quality Acacia Seyal gum for industrial applications.',
            'specifications': {
                'grade': 'Standard',
                'moisture': '13% MAX',
                'ash': '4% MAX',
            },
            'image': 'images/acacia-sey.jpg',
            'trend': 0
        },
        {
            'id': 'cotton',
            'name': 'COTTON',
            'category': 'cotton',
            'description': 'Premium quality Sudanese cotton, renowned worldwide for its exceptional length, strength, and uniformity.',
            'specifications': {
                'grade': 'Premium',
                'length': '1-3/8" MIN',
                'strength': '30 g/tex MIN',
                'micronaire': '3.8-4.6',
                'uniformity': '84% MIN'
            },
            'image': 'images/cotton.jpg',
            'trend': 0
        },
        {
            'id': 'watermelon',
            'name': 'WATERMELON SEEDS',
            'category': 'others',
            'description': 'High-quality watermelon seeds from Sudan, perfect for both planting and consumption.',
            'specifications': {
                'purity': '99%',
                'germination': '85% MIN',
                'moisture': '8% MAX',
                'damage': '0.5% MAX',
                'size': '≥ 5mm'
            },
            'image': 'images/watermelon.jpg',
            'trend': 0
        },
        {
            'id': 'peanuts',
            'name': 'PEANUTS GAVA 80/90',
            'category': 'others',
            'description': 'Premium grade Sudanese peanuts, specifically the GAVA 80/90 variety, known for their consistent size, flavor, and quality.',
            'specifications': {
                'count': '80/90 per ounce',
                'moisture': '6% MAX',
                'splits': '1% MAX',
                'damage': '0.5% MAX',
                'aflatoxin': '4 ppb MAX'
            },
            'image': 'images/peanuts.jpg',
            'trend': 0
        },
        {
            'id': 'chickpeas',
            'name': 'CHICKPEAS',
            'category': 'others',
            'description': 'High-quality Sudanese chickpeas, carefully selected and processed to meet international standards.',
            'specifications': {
                'size': '8-9 mm',
                'moisture': '12% MAX',
                'purity': '98% MIN',
                'damage': '1% MAX',
                'foreignMatter': '0.5% MAX'
            },
            'image': 'images/chickpeas.jpg',
            'trend': 0
        }
    ]
    
    return render(request, 'core/products.html', {'products': products})

def about_view(request):
    return render(request, 'core/about.html')

@login_required
def quote_view(request):
    return render(request, 'core/quote.html')

@login_required
def sample_view(request):
    return render(request, 'core/sample.html')

def contact_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone', '')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        
        # Create email content
        from .utils.simple_email import SimpleEmailService
        email_service = SimpleEmailService()
        result = email_service.send_contact_email(
            name=name,
            email=email,
            phone=phone,
            subject=subject,
            message=message
        )
        
        if result.get('success'):
            messages.success(request, 'Your message has been sent successfully! We will get back to you soon.')
        else:
            messages.error(request, 'There was an error sending your message. Please try again later.')
            
    return render(request, 'core/contact.html')

# API endpoints for form submissions
@api_view(['POST'])
@permission_classes([AllowAny])
def quote_submit(request):
    try:
        # Get form data
        data = request.data
        
        # Use SimpleEmailService to send the email
        from .utils.simple_email import SimpleEmailService
        
        email_service = SimpleEmailService()
        email_service.send_quote_email(
            name=data.get('name', 'Not provided'),
            email=data.get('email', 'Not provided'),
            contact_number=data.get('contactNumber', 'Not provided'),
            company=data.get('companyName', 'Not provided'),
            country=data.get('country', 'Not provided'),
            product=data.get('product', 'Not provided'),
            quantity=data.get('quantity', 'Not provided'),
            purpose=data.get('purpose', 'Not provided'),
            specifications=data.get('specifications', 'Not provided'),
            note=data.get('note', 'Not provided')
        )
        
        return Response({
            'success': True,
            'message': 'Quote request submitted successfully'
        })
    except Exception as e:
        print(f"Error in quote_submit: {str(e)}")
        return Response({
            'success': False,
            'message': 'Something went wrong!',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def sample_submit(request):
    try:
        # Get form data
        data = request.data
        
        # Use SimpleEmailService to send the email
        from .utils.simple_email import SimpleEmailService
        
        email_service = SimpleEmailService()
        email_service.send_sample_email(
            name=data.get('name', 'Not provided'),
            email=data.get('email', 'Not provided'),
            phone=data.get('phone', 'Not provided'),
            company=data.get('companyName', 'Not provided'),
            country=data.get('country', 'Not provided'),
            product=data.get('product', 'Not provided'),
            shipping_method=data.get('shippingMethod', 'Not provided'),
            note=data.get('note', 'Not provided')
        )
        
        return Response({
            'success': True,
            'message': 'Sample request submitted successfully'
        })
    except Exception as e:
        print(f"Error in sample_submit: {str(e)}")
        return Response({
            'success': False,
            'message': 'Something went wrong!',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def data_insights_request(request):
    """
    API endpoint for submitting data insights requests
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['product_id', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return Response({"error": f"Missing required field: {field}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Log the request (in a real application, you would save this to a database)
        logger.info(f"Data insights request received: {data}")
        
        # Here you would typically save the request to a database
        # For now, we'll just return a success response
        
        return Response({"success": True, "message": "Data insights request submitted successfully"})
    except Exception as e:
        logger.error(f"Error processing data insights request: {str(e)}")
        return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from django.contrib.auth.decorators import login_required, user_passes_test

# Admin check function
def is_admin(user):
    return user.is_authenticated and user.is_staff

# Admin Views
@login_required
@user_passes_test(is_admin)
def admin_dashboard(request):
    market_data_count = MarketData.objects.count()
    currency_count = Currency.objects.count()
    announcement_count = Announcement.objects.count()
    user_count = User.objects.count()
    
    recent_market_data = MarketData.objects.all().order_by('-updated_at')[:5]
    recent_announcements = Announcement.objects.all().order_by('-created_at')[:5]
    
    context = {
        'market_data_count': market_data_count,
        'currency_count': currency_count,
        'announcement_count': announcement_count,
        'user_count': user_count,
        'recent_market_data': recent_market_data,
        'recent_announcements': recent_announcements
    }
    
    return render(request, 'admin/dashboard.html', context)

@login_required
@user_passes_test(is_admin)
def admin_market_data(request):
    market_data = MarketData.objects.all().order_by('-updated_at')
    return render(request, 'admin/market_data.html', {'market_data': market_data})

@login_required
@user_passes_test(is_admin)
def admin_currencies(request):
    currencies = Currency.objects.all().order_by('-last_update')
    return render(request, 'admin/currencies.html', {'currencies': currencies})

@login_required
@user_passes_test(is_admin)
def admin_announcements(request):
    announcements = Announcement.objects.all().order_by('-created_at')
    return render(request, 'admin/announcements.html', {'announcements': announcements})

@login_required
@user_passes_test(is_admin)
def admin_users(request):
    users = User.objects.all().order_by('-date_joined')
    return render(request, 'admin/users.html', {'users': users})

@login_required
def profile_view(request):
    """
    View for user profile page.
    """
    # Get user's connected social accounts
    social_accounts = None
    try:
        from allauth.socialaccount.models import SocialAccount
        social_accounts = SocialAccount.objects.filter(user=request.user)
    except:
        # If allauth is not available or there's an error
        pass
    
    context = {
        'user': request.user,
        'social_accounts': social_accounts,
    }
    return render(request, 'core/profile.html', context)

@login_required
def settings_view(request):
    """
    View for user settings page.
    """
    # Handle form submission for updating settings
    if request.method == 'POST':
        # Get form data
        email_notifications = request.POST.get('email_notifications') == 'on'
        dark_mode = request.POST.get('dark_mode') == 'on'
        language = request.POST.get('language', 'en')
        
        # Get or create user settings
        try:
            from core.models import UserSettings
            settings, created = UserSettings.objects.get_or_create(
                user=request.user,
                defaults={
                    'email_notifications': email_notifications,
                    'dark_mode': dark_mode,
                    'language': language,
                }
            )
            
            if not created:
                # Update existing settings
                settings.email_notifications = email_notifications
                settings.dark_mode = dark_mode
                settings.language = language
                settings.save()
                
            messages.success(request, 'Settings updated successfully.')
        except:
            # If UserSettings model doesn't exist or there's an error
            messages.error(request, 'Failed to update settings. Please try again.')
    
    # Get user settings
    user_settings = None
    try:
        from core.models import UserSettings
        user_settings, created = UserSettings.objects.get_or_create(
            user=request.user,
            defaults={
                'email_notifications': True,
                'dark_mode': False,
                'language': 'en',
            }
        )
    except:
        # If UserSettings model doesn't exist or there's an error
        pass
    
    context = {
        'user': request.user,
        'settings': user_settings,
        'languages': [
            {'code': 'en', 'name': 'English'},
            {'code': 'ar', 'name': 'Arabic'},
            {'code': 'fr', 'name': 'French'},
        ],
    }
    return render(request, 'core/settings.html', context)

# Password Reset Views
class ForgotPasswordView(View):
    """
    View for handling forgot password requests
    """
    def get(self, request):
        return render(request, 'core/forgot_password.html')
    
    def post(self, request):
        try:
            email = request.POST.get('email')
            
            if not email:
                messages.error(request, 'Please enter your email address')
                return render(request, 'core/forgot_password.html')
            
            # Validate email format
            if '@' not in email or '.' not in email:
                messages.error(request, 'Please enter a valid email address')
                return render(request, 'core/forgot_password.html')
            
            # Check if user exists with this email
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Don't reveal if email exists or not for security reasons
                # Still send success message to prevent email enumeration
                messages.success(request, 'If your email exists in our system, you will receive a verification code shortly.')
                return render(request, 'core/forgot_password.html')
            
            # Send verification code using Email OTP service
            email_service = EmailOTPService()
            result = email_service.send_verification_code(email, purpose='password_reset')
            
            if result['success']:
                # Store email in session for verification
                request.session['reset_email'] = email
                return redirect('verify_reset_code')
            else:
                logger.error(f"Failed to send password reset code: {result['message']} for email: {email}")
                messages.error(request, 'Failed to send verification code. Please try again later.')
                return render(request, 'core/forgot_password.html')
        except Exception as e:
            logger.exception(f"Unexpected error in ForgotPasswordView: {str(e)}")
            messages.error(request, 'An unexpected error occurred. Please try again later.')
            return render(request, 'core/forgot_password.html')


class VerifyResetCodeView(View):
    """
    View for verifying reset code
    """
    def get(self, request):
        # Check if email is in session
        if 'reset_email' not in request.session:
            messages.error(request, 'Please start the password reset process again')
            return redirect('forgot_password')
        
        return render(request, 'core/verify_reset_code.html')
    
    def post(self, request):
        try:
            # Check if email is in session
            if 'reset_email' not in request.session:
                messages.error(request, 'Please start the password reset process again')
                return redirect('forgot_password')
            
            email = request.session['reset_email']
            code = request.POST.get('code')
            
            if not code:
                messages.error(request, 'Please enter the verification code')
                return render(request, 'core/verify_reset_code.html')
            
            # Validate code format (should be 6 digits)
            if not code.isdigit() or len(code) != 6:
                messages.error(request, 'Verification code should be 6 digits')
                return render(request, 'core/verify_reset_code.html')
            
            # Verify code using Email OTP service
            email_service = EmailOTPService()
            result = email_service.verify_code(email, code, purpose='password_reset')
            
            if result['success']:
                # Mark email as verified in session
                request.session['email_verified'] = True
                return redirect('reset_password')
            else:
                messages.error(request, result['message'])
                return render(request, 'core/verify_reset_code.html')
        except Exception as e:
            logger.exception(f"Unexpected error in VerifyResetCodeView: {str(e)}")
            messages.error(request, 'An unexpected error occurred. Please try again later.')
            return render(request, 'core/verify_reset_code.html')


class ResetPasswordView(View):
    """
    View for resetting password
    """
    def get(self, request):
        # Check if email is verified
        if 'reset_email' not in request.session or 'email_verified' not in request.session:
            messages.error(request, 'Please verify your email first')
            return redirect('forgot_password')
        
        return render(request, 'core/reset_password.html')
    
    def post(self, request):
        try:
            # Check if email is verified
            if 'reset_email' not in request.session or 'email_verified' not in request.session:
                messages.error(request, 'Please verify your email first')
                return redirect('forgot_password')
            
            email = request.session['reset_email']
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')
            
            if not password or not confirm_password:
                messages.error(request, 'Please enter both password fields')
                return render(request, 'core/reset_password.html')
            
            if password != confirm_password:
                messages.error(request, 'Passwords do not match')
                return render(request, 'core/reset_password.html')
            
            # Validate password strength
            if len(password) < 8:
                messages.error(request, 'Password must be at least 8 characters long')
                return render(request, 'core/reset_password.html')
            
            # Update user's password
            try:
                user = User.objects.get(email=email)
                user.set_password(password)
                user.save()
                
                # Clear session data
                if 'reset_email' in request.session:
                    del request.session['reset_email']
                if 'email_verified' in request.session:
                    del request.session['email_verified']
                
                messages.success(request, 'Your password has been reset successfully. You can now log in with your new password.')
                return redirect('login')
            except User.DoesNotExist:
                messages.error(request, 'User not found. Please try the password reset process again.')
                return redirect('forgot_password')
        except Exception as e:
            logger.exception(f"Unexpected error in ResetPasswordView: {str(e)}")
            messages.error(request, 'An unexpected error occurred. Please try again later.')
            return render(request, 'core/reset_password.html')


# Health Check Endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'ok',
        'timestamp': None,
        'theme': {
            'primaryDark': settings.THEME['PRIMARY_DARK'],
            'accent': settings.THEME['ACCENT']
        },
    })

# Custom error handlers
def handler404(request, exception=None):
    """
    Custom 404 handler to ensure all non-existent URLs show our custom 404 page
    """
    return render(request, '404.html', status=404)
