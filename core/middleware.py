from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware(MiddlewareMixin):
    """Middleware for handling exceptions and providing consistent error responses"""
    
    def process_exception(self, request, exception):
        """Process exceptions and return a JSON response"""
        logger.error(f"Server Error: {str(exception)}")
        
        return JsonResponse({
            'success': False,
            'message': 'Something went wrong!',
            'error': str(exception) if request.META.get('DEBUG', False) else None
        }, status=500)


class ThemeMiddleware(MiddlewareMixin):
    """Middleware for adding theme colors to all responses"""
    
    def process_response(self, request, response):
        """Add theme colors to JSON responses"""
        if hasattr(response, 'data') and isinstance(response.data, dict) and 'theme' not in response.data:
            from django.conf import settings
            
            response.data['theme'] = {
                'primaryDark': settings.THEME['PRIMARY_DARK'],
                'accent': settings.THEME['ACCENT']
            }
        
        return response
