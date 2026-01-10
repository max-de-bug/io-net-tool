"""
Custom exception handlers for DRF API.
Provides consistent error responses across all endpoints.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that provides consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # If response is None, it's an unhandled exception
    if response is None:
        logger.exception(f"Unhandled exception: {exc}", exc_info=True)
        response = Response(
            {
                'error': 'Internal server error',
                'detail': str(exc) if str(exc) else 'An unexpected error occurred',
                'type': exc.__class__.__name__,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    else:
        # Customize the response data structure
        custom_response_data = {
            'error': 'Request failed',
            'detail': response.data,
        }
        
        # Add more context if available
        if hasattr(exc, 'get_codes'):
            custom_response_data['error_code'] = exc.get_codes()
        
        response.data = custom_response_data

    return response
