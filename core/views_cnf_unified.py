from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from decimal import Decimal
import json
import logging

from .models_cnf import (
    Product, CurrencyExchange, OperationCost, GovernmentCost, 
    LocalTransport, InternationalTransport, CNFPriceCalculation
)

# Set up logger
logger = logging.getLogger(__name__)

def is_admin(user):
    """Check if user is admin"""
    return user.is_staff or user.is_superuser

@login_required
@user_passes_test(is_admin)
def admin_cnf_unified_view(request):
    """Admin view for unified CNF products and calculations management"""
    products = Product.objects.all().order_by('name')
    
    context = {
        'products': products
    }
    
    return render(request, 'core/admin_cnf_unified.html', context)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_product_api(request, product_id):
    """API endpoint to get a specific product details"""
    product = get_object_or_404(Product, id=product_id)
    
    # Get the product details
    product_data = {
        'id': product.id,
        'name': product.name,
        'cost_per_unit_sdg': float(product.cost_per_unit_sdg),
        'waste_percentage': float(product.waste_percentage),
        'created_at': product.created_at,
        'updated_at': product.updated_at,
    }
    
    # Get operation costs if they exist
    try:
        operation_costs = product.operation_costs
        product_data['operation_costs'] = {
            'cleaning': float(operation_costs.cleaning),
            'empty_bags': float(operation_costs.empty_bags),
            'printing': float(operation_costs.printing),
            'handling': float(operation_costs.handling),
        }
    except:
        product_data['operation_costs'] = None
    
    # Get government costs if they exist
    try:
        government_costs = product.government_costs
        product_data['government_costs'] = {
            'paperwork': float(government_costs.paperwork),
            'customs_duty': float(government_costs.customs_duty),
            'clearance': float(government_costs.clearance),
        }
    except:
        product_data['government_costs'] = None
    
    # Get local transport costs if they exist
    try:
        local_transport = product.local_transports
        product_data['local_transport'] = {
            'transport_to_port': float(local_transport.transport_to_port),
        }
    except:
        product_data['local_transport'] = None
    
    # Get international transport costs
    international_transports = product.international_transports.all()
    product_data['international_transports'] = [
        {
            'destination': transport.destination,
            'freight_cost_usd': float(transport.freight_cost_usd),
        }
        for transport in international_transports
    ]
    
    return Response(product_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_calculations_api(request):
    """API endpoint to get CNF price calculations for a product"""
    product_id = request.GET.get('product_id')
    
    if not product_id:
        return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    product = get_object_or_404(Product, id=product_id)
    
    # Get all calculations for this product
    calculations = CNFPriceCalculation.objects.filter(product=product).order_by('-calculation_date')
    
    calculations_data = []
    for calc in calculations:
        calculations_data.append({
            'id': calc.id,
            'product_id': calc.product.id,
            'product_name': calc.product.name,
            'destination': calc.destination,
            'total_cost_sdg': float(calc.total_cost_sdg),
            'total_cost_usd': float(calc.total_cost_usd),
            'fob_price': float(calc.fob_price),
            'cnf_price': float(calc.cnf_price),
            'exchange_rate': float(calc.exchange_rate),
            'calculation_date': calc.calculation_date,
            'is_current': calc.is_current,
            'is_manual_override': calc.is_manual_override,
        })
    
    return Response(calculations_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_calculation_api(request, calculation_id):
    """API endpoint to get a specific CNF price calculation"""
    calculation = get_object_or_404(CNFPriceCalculation, id=calculation_id)
    
    calculation_data = {
        'id': calculation.id,
        'product_id': calculation.product.id,
        'product_name': calculation.product.name,
        'destination': calculation.destination,
        'total_cost_sdg': float(calculation.total_cost_sdg),
        'total_cost_usd': float(calculation.total_cost_usd),
        'fob_price': float(calculation.fob_price),
        'cnf_price': float(calculation.cnf_price),
        'exchange_rate': float(calculation.exchange_rate),
        'calculation_date': calculation.calculation_date,
        'is_current': calculation.is_current,
        'is_manual_override': calculation.is_manual_override,
        # Cost components
        'cleaning_cost': float(calculation.cleaning_cost) if calculation.cleaning_cost else None,
        'empty_bags_cost': float(calculation.empty_bags_cost) if calculation.empty_bags_cost else None,
        'printing_cost': float(calculation.printing_cost) if calculation.printing_cost else None,
        'handling_cost': float(calculation.handling_cost) if calculation.handling_cost else None,
        'paperwork_cost': float(calculation.paperwork_cost) if calculation.paperwork_cost else None,
        'customs_duty_cost': float(calculation.customs_duty_cost) if calculation.customs_duty_cost else None,
        'clearance_cost': float(calculation.clearance_cost) if calculation.clearance_cost else None,
        'local_transport_cost': float(calculation.local_transport_cost) if calculation.local_transport_cost else None,
        'international_transport_cost': float(calculation.international_transport_cost) if calculation.international_transport_cost else None,
    }
    
    return Response(calculation_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_calculation_history_api(request):
    """API endpoint to get CNF price calculation history with market data integration"""
    product_id = request.GET.get('product_id')
    destination = request.GET.get('destination')
    limit = int(request.GET.get('limit', 20))
    
    if not product_id or not destination:
        return Response({'error': 'Product ID and destination are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    product = get_object_or_404(Product, id=product_id)
    
    # Get calculations for this product and destination
    calculations = CNFPriceCalculation.objects.filter(
        product=product,
        destination=destination
    ).order_by('-calculation_date')[:limit]
    
    # Check if product has market data
    has_market_data = product.market_data is not None
    
    # Get market data history if available
    market_data_history = []
    if has_market_data and product.market_data:
        # Import MarketDataArchive model
        from django.apps import apps
        MarketDataArchive = apps.get_model('core', 'MarketDataArchive')
        
        # Get market data archives for this product
        archives = MarketDataArchive.objects.filter(
            original_id=product.market_data.id
        ).order_by('-archived_at')[:limit]
        
        # Map destination to corresponding market data field
        field_map = {
            'China': 'dmt_china',
            'UAE': 'dmt_uae',
            'Mersing': 'dmt_mersing',
            'India': 'dmt_india',
            'Port Sudan': 'port_sudan'
        }
        
        field_name = field_map.get(destination)
        if field_name:
            for archive in archives:
                market_data_history.append({
                    'date': archive.archived_at.strftime('%Y-%m-%d %H:%M:%S'),
                    'value': float(getattr(archive, field_name)),
                    'status': archive.status,
                    'forecast': archive.forecast,
                    'trend': archive.trend
                })
    
    # Prepare calculation history
    calculation_history = []
    for calc in calculations:
        calculation_history.append({
            'id': calc.id,
            'product_id': calc.product.id,
            'product_name': calc.product.name,
            'destination': calc.destination,
            'total_cost_sdg': float(calc.total_cost_sdg),
            'total_cost_usd': float(calc.total_cost_usd),
            'fob_price': float(calc.fob_price),
            'cnf_price': float(calc.cnf_price),
            'exchange_rate': float(calc.exchange_rate),
            'calculation_date': calc.calculation_date.strftime('%Y-%m-%d %H:%M:%S'),
            'is_current': calc.is_current,
            'is_manual_override': calc.is_manual_override,
        })
    
    response_data = {
        'product': {
            'id': product.id,
            'name': product.name,
            'has_market_data': has_market_data
        },
        'calculation_history': calculation_history,
        'market_data_history': market_data_history
    }
    
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_calculation_api(request):
    """API endpoint to update a CNF price calculation with overridden values"""
    data = request.data
    
    calculation_id = data.get('calculation_id')
    if not calculation_id:
        return Response({'error': 'Calculation ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    calculation = get_object_or_404(CNFPriceCalculation, id=calculation_id)
    
    # Check if this is the current calculation
    if not calculation.is_current:
        return Response({'error': 'Only current calculations can be updated'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get overrides
    overrides = data.get('overrides', {})
    if not overrides:
        return Response({'error': 'No override values provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create a new derived calculation with overrides
    override_fields = {}
    
    if 'cnf_price' in overrides:
        override_fields['cnf_price'] = Decimal(str(overrides['cnf_price']))
    
    if 'fob_price' in overrides:
        override_fields['fob_price'] = Decimal(str(overrides['fob_price']))
    
    if 'total_cost_sdg' in overrides:
        override_fields['total_cost_sdg'] = Decimal(str(overrides['total_cost_sdg']))
    
    if 'total_cost_usd' in overrides:
        override_fields['total_cost_usd'] = Decimal(str(overrides['total_cost_usd']))
    
    try:
        new_calculation = calculation.create_derived_calculation(**override_fields)
        return Response({
            'success': True,
            'message': 'Calculation updated successfully',
            'calculation_id': new_calculation.id
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
