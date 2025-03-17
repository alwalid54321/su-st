from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal
from django.apps import apps
from django.utils import timezone

from .models_cnf import (
    Product, CurrencyExchange, OperationCost, GovernmentCost, 
    LocalTransport, InternationalTransport, CNFPriceCalculation
)
from .services_cnf import calculate_cnf_price, get_product_destinations, get_all_products
import logging
import json

# Set up logger
logger = logging.getLogger(__name__)

def is_admin(user):
    """Check if user is admin"""
    return user.is_staff or user.is_superuser

# API Views
@api_view(['GET'])
def get_cnf_price_api(request):
    """API endpoint to calculate CNF price"""
    product_id = request.GET.get('product_id')
    destination = request.GET.get('destination')
    
    if not product_id or not destination:
        return Response({"error": "Missing product_id or destination"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = calculate_cnf_price(product_id, destination)
        if "error" in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        return Response(result)
    except Exception as e:
        logger.error(f"Error calculating CNF price: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_products_api(request):
    """API endpoint to get all products with their destinations"""
    try:
        products = get_all_products()
        return Response(products)
    except Exception as e:
        logger.error(f"Error getting products: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_product_destinations_api(request, product_id):
    """API endpoint to get destinations for a specific product"""
    try:
        destinations = get_product_destinations(product_id)
        return Response(destinations)
    except Exception as e:
        logger.error(f"Error getting product destinations: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_exchange_rate_api(request):
    """API endpoint to get the latest exchange rate"""
    try:
        exchange_rate = CurrencyExchange.objects.latest('date')
        return Response({
            'date': exchange_rate.date,
            'usd_to_sdg': exchange_rate.usd_to_sdg
        })
    except CurrencyExchange.DoesNotExist:
        return Response({"error": "No exchange rate found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error getting exchange rate: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Template Views
@login_required
@user_passes_test(is_admin)
def cnf_calculator_view(request):
    """View for CNF price calculator page"""
    try:
        products = Product.objects.all().order_by('name')
        exchange_rate = CurrencyExchange.objects.latest('date')
        
        context = {
            'products': products,
            'exchange_rate': exchange_rate
        }
        
        return render(request, 'core/cnf_calculator.html', context)
    except Exception as e:
        logger.error(f"Error loading CNF calculator: {str(e)}")
        messages.error(request, f"Error loading calculator: {str(e)}")
        return redirect('home')

@login_required
def cnf_history_view(request):
    """View for CNF price calculation history"""
    calculations = CNFPriceCalculation.objects.all().order_by('-calculation_date')[:50]
    
    context = {
        'calculations': calculations
    }
    
    return render(request, 'core/cnf_history.html', context)

# Admin Views
@login_required
@user_passes_test(is_admin)
def admin_products_view(request):
    """Admin view for managing products"""
    products = Product.objects.all().order_by('name')
    
    context = {
        'products': products
    }
    
    return render(request, 'core/admin_products.html', context)

@login_required
@user_passes_test(is_admin)
def admin_exchange_rates_view(request):
    """Admin view for managing exchange rates"""
    exchange_rates = CurrencyExchange.objects.all().order_by('-date')[:20]
    
    context = {
        'exchange_rates': exchange_rates
    }
    return render(request, 'core/admin_exchange_rates.html', context)

@login_required
@user_passes_test(is_admin)
def admin_cnf_products_view(request):
    """Admin view for managing CNF products and linking them to market data"""
    products = Product.objects.all().order_by('name')
    MarketData = apps.get_model('core', 'MarketData')
    available_market_data = MarketData.objects.filter(cnf_product__isnull=True).order_by('name')
    linked_products = Product.objects.filter(market_data__isnull=False).select_related('market_data')
    
    # Get the latest exchange rate
    try:
        exchange_rate = CurrencyExchange.objects.latest('date')
    except CurrencyExchange.DoesNotExist:
        exchange_rate = None
    
    context = {
        'products': products,
        'available_market_data': available_market_data,
        'linked_products': linked_products,
        'exchange_rate': exchange_rate
    }
    
    return render(request, 'core/admin_cnf_products.html', context)

@login_required
@user_passes_test(is_admin)
def admin_cnf_products_save(request):
    """Save a CNF product (create or update) and handle market data linking"""
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        name = request.POST.get('name')
        cost_per_unit_sdg = request.POST.get('cost_per_unit_sdg')
        waste_percentage = request.POST.get('waste_percentage')
        market_data_id = request.POST.get('market_data')
        
        # Validate inputs
        if not name or not cost_per_unit_sdg or not waste_percentage:
            messages.error(request, "All fields are required.")
            return redirect('admin_cnf_products')
        
        try:
            # Convert to decimal
            cost_per_unit_sdg = Decimal(cost_per_unit_sdg)
            waste_percentage = Decimal(waste_percentage)
            
            if product_id:  # Update existing product
                product = get_object_or_404(Product, id=product_id)
                product.name = name
                product.cost_per_unit_sdg = cost_per_unit_sdg
                product.waste_percentage = waste_percentage
                
                # Handle market data linking
                if market_data_id:
                    MarketData = apps.get_model('core', 'MarketData')
                    market_data = get_object_or_404(MarketData, id=market_data_id)
                    # Check if market data is already linked to another product
                    if hasattr(market_data, 'cnf_product') and market_data.cnf_product and market_data.cnf_product.id != product.id:
                        messages.error(request, f"Market data '{market_data.name}' is already linked to another product.")
                        return redirect('admin_cnf_products')
                    product.market_data = market_data
                else:
                    # If previously linked but now unlinked
                    product.market_data = None
                
                product.save()
                messages.success(request, f"Product '{name}' updated successfully.")
            else:  # Create new product
                product = Product(
                    name=name,
                    cost_per_unit_sdg=cost_per_unit_sdg,
                    waste_percentage=waste_percentage
                )
                
                # Handle market data linking
                if market_data_id:
                    MarketData = apps.get_model('core', 'MarketData')
                    market_data = get_object_or_404(MarketData, id=market_data_id)
                    # Check if market data is already linked to another product
                    if hasattr(market_data, 'cnf_product') and market_data.cnf_product:
                        messages.error(request, f"Market data '{market_data.name}' is already linked to another product.")
                        return redirect('admin_cnf_products')
                    product.market_data = market_data
                
                product.save()
                messages.success(request, f"Product '{name}' created successfully.")
                
            return redirect('admin_cnf_products')
        except ValueError as e:
            logger.error(f"Invalid input data: {str(e)}")
            messages.error(request, f"Invalid input data: Please ensure cost and waste percentage are valid numbers.")
            return redirect('admin_cnf_products')
        except Exception as e:
            logger.error(f"Error saving product: {str(e)}")
            messages.error(request, f"Error saving product: {str(e)}")
            return redirect('admin_cnf_products')
    
    return redirect('admin_cnf_products')

@login_required
@user_passes_test(is_admin)
def admin_cnf_products_delete(request):
    """Delete a CNF product"""
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        
        try:
            product = get_object_or_404(Product, id=product_id)
            name = product.name
            
            # Check if product has market data linked
            had_market_data = False
            market_data_name = ""
            if product.market_data:
                had_market_data = True
                market_data_name = product.market_data.name
            
            product.delete()
            
            if had_market_data:
                messages.success(request, f"Product '{name}' deleted successfully. Market data '{market_data_name}' is now available for linking.")
            else:
                messages.success(request, f"Product '{name}' deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting product: {str(e)}")
            messages.error(request, f"Error deleting product: {str(e)}")
    
    return redirect('admin_cnf_products')

@login_required
@user_passes_test(is_admin)
def admin_cnf_products_link(request):
    """Link a CNF product to market data"""
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        market_data_id = request.POST.get('market_data_id')
        
        if not product_id or not market_data_id:
            messages.error(request, "Both product and market data must be selected.")
            return redirect('admin_cnf_products')
        
        try:
            product = get_object_or_404(Product, id=product_id)
            MarketData = apps.get_model('core', 'MarketData')
            market_data = get_object_or_404(MarketData, id=market_data_id)
            
            # Check if market data is already linked to another product
            if hasattr(market_data, 'cnf_product') and market_data.cnf_product and market_data.cnf_product.id != product.id:
                messages.error(request, f"Market data '{market_data.name}' is already linked to another product.")
                return redirect('admin_cnf_products')
            
            # Check if product is already linked to another market data
            if product.market_data and product.market_data.id != market_data.id:
                old_market_data_name = product.market_data.name
                product.market_data = market_data
                product.save()
                messages.success(request, f"Product '{product.name}' unlinked from '{old_market_data_name}' and linked to '{market_data.name}' successfully.")
            else:
                product.market_data = market_data
                product.save()
                messages.success(request, f"Product '{product.name}' linked to market data '{market_data.name}' successfully.")
            
            # Update market data prices immediately
            product.update_market_data_prices()
        except Exception as e:
            logger.error(f"Error linking product to market data: {str(e)}")
            messages.error(request, f"Error linking product to market data: {str(e)}")
    
    return redirect('admin_cnf_products')

@login_required
@csrf_exempt
def calculate_cnf_ajax(request):
    """AJAX endpoint for calculating CNF price"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            product_id = data.get('product_id')
            destination = data.get('destination')
            
            # Get the product
            product = Product.objects.get(id=product_id)
            
            # Get all international transports for this product
            int_transport = product.international_transports.filter(destination=destination).first()
            
            if not int_transport:
                return JsonResponse({'error': f'No international transport found for {destination}'}, status=400)
            
            # Get the latest exchange rate
            try:
                exchange_rate = CurrencyExchange.objects.latest('date')
            except CurrencyExchange.DoesNotExist:
                return JsonResponse({'error': 'No currency exchange rate available'}, status=400)
            
            # Calculate the base cost with waste
            base_cost_with_waste = product.cost_per_unit_sdg * (1 + (product.waste_percentage / Decimal('100.0')))
            
            # Get operation costs
            try:
                op_costs = product.operation_costs
                cleaning_cost = op_costs.cleaning
                empty_bags_cost = op_costs.empty_bags
                printing_cost = op_costs.printing
                handling_cost = op_costs.handling
            except OperationCost.DoesNotExist:
                cleaning_cost = Decimal('0.00')
                empty_bags_cost = Decimal('0.00')
                printing_cost = Decimal('0.00')
                handling_cost = Decimal('0.00')
            
            # Get government costs
            try:
                gov_costs = product.government_costs
                paperwork_cost = gov_costs.paperwork
                customs_duty_cost = gov_costs.customs_duty
                clearance_cost = gov_costs.clearance
            except GovernmentCost.DoesNotExist:
                paperwork_cost = Decimal('0.00')
                customs_duty_cost = Decimal('0.00')
                clearance_cost = Decimal('0.00')
            
            # Get local transport costs
            try:
                local_transport = product.local_transports
                local_transport_cost = local_transport.transport_to_port
            except LocalTransport.DoesNotExist:
                local_transport_cost = Decimal('0.00')
            
            # Calculate freight cost in SDG
            freight_cost_sdg = int_transport.freight_cost_usd * exchange_rate.usd_to_sdg
            
            # Calculate total cost in SDG (including all costs)
            operation_costs_total = cleaning_cost + empty_bags_cost + printing_cost + handling_cost
            government_costs_total = paperwork_cost + customs_duty_cost + clearance_cost
            
            total_cost_sdg = (
                base_cost_with_waste + 
                operation_costs_total + 
                government_costs_total + 
                local_transport_cost + 
                freight_cost_sdg
            )
            
            # Calculate total cost in USD
            total_cost_usd = total_cost_sdg / exchange_rate.usd_to_sdg
            
            # Calculate FOB price (without international transport)
            fob_price = (total_cost_sdg - freight_cost_sdg) / exchange_rate.usd_to_sdg
            
            # CNF price is the total cost in USD
            cnf_price = total_cost_usd
            
            # Mark any existing current calculations for this product/destination as not current
            CNFPriceCalculation.objects.filter(
                product=product,
                destination=destination,
                is_current=True
            ).update(is_current=False)
            
            # Create a new CNF price calculation record
            CNFPriceCalculation.objects.create(
                product=product,
                destination=destination,
                total_cost_sdg=total_cost_sdg,
                total_cost_usd=total_cost_usd,
                fob_price=fob_price,
                cnf_price=cnf_price,
                exchange_rate=exchange_rate.usd_to_sdg,
                is_current=True,
                is_manual_override=False,
                cleaning_cost=cleaning_cost,
                empty_bags_cost=empty_bags_cost,
                printing_cost=printing_cost,
                handling_cost=handling_cost,
                paperwork_cost=paperwork_cost,
                customs_duty_cost=customs_duty_cost,
                clearance_cost=clearance_cost,
                local_transport_cost=local_transport_cost,
                international_transport_cost=freight_cost_sdg
            )
            
            # Update market data if available
            market_data_updated = False
            market_data_archived = False
            market_data_error = None
            
            if product.market_data:
                try:
                    # Get the current archive count
                    from core.models import MarketDataArchive
                    initial_archive_count = MarketDataArchive.objects.filter(
                        original_id=product.market_data.id
                    ).count()
                    
                    # Update market data prices
                    product.update_market_data_prices()
                    
                    # Check if a new archive was created
                    new_archive_count = MarketDataArchive.objects.filter(
                        original_id=product.market_data.id
                    ).count()
                    
                    market_data_updated = True
                    market_data_archived = new_archive_count > initial_archive_count
                    
                    # Log the update
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.info(f"Market data updated via CNF calculator for product {product.name} (ID: {product.id})")
                    logger.info(f"Market data archived: {market_data_archived}")
                    
                except Exception as e:
                    market_data_error = str(e)
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error updating market data: {e}")
            
            # Return the calculation results
            response_data = {
                'product_name': product.name,
                'destination': destination,
                'base_cost_with_waste': float(base_cost_with_waste),
                'operation_costs': float(operation_costs_total),
                'government_costs': float(government_costs_total),
                'local_transport': float(local_transport_cost),
                'international_transport': float(freight_cost_sdg),
                'total_cost_sdg': float(total_cost_sdg),
                'total_cost_usd': float(total_cost_usd),
                'fob_price': float(fob_price),
                'cnf_price': float(cnf_price),
                'exchange_rate': float(exchange_rate.usd_to_sdg),
                'market_data_updated': market_data_updated,
                'market_data_archived': market_data_archived
            }
            
            if market_data_error:
                response_data['market_data_error'] = market_data_error
            
            return JsonResponse(response_data)
            
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)

# Additional API Views
@api_view(['GET'])
def get_products_with_destinations_api(request):
    """API endpoint to get all products with available destinations"""
    products = get_all_products()
    return Response(products)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_cnf_price_api(request):
    """API endpoint to calculate CNF price and save the calculation"""
    try:
        data = request.data
        product_id = data.get('product_id')
        destination = data.get('destination')
        
        if not product_id or not destination:
            return Response({'error': 'Product ID and destination are required'}, status=400)
        
        # Calculate CNF price
        result = calculate_cnf_price(product_id, destination)
        
        if "error" in result:
            return Response({'error': result["error"]}, status=400)
        
        # Save the calculation for history
        product = get_object_or_404(Product, id=product_id)
        exchange_rate = CurrencyExchange.objects.latest('date')
        
        CNFPriceCalculation.objects.create(
            product=product,
            destination=destination,
            total_cost_sdg=result['total_cost_sdg'],
            total_cost_usd=result['total_cost_usd'],
            fob_price=result['fob_price'],
            cnf_price=result['cnf_price'],
            exchange_rate=exchange_rate.usd_to_sdg
        )
        
        return Response(result)
    except Exception as e:
        logger.error(f"Error calculating CNF price: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cnf_history_api(request):
    """API endpoint to get CNF calculation history"""
    try:
        product_id = request.GET.get('product_id')
        destination = request.GET.get('destination')
        limit = int(request.GET.get('limit', 10))
        
        # Build query based on filters
        query = CNFPriceCalculation.objects.all()
        
        if product_id:
            query = query.filter(product_id=product_id)
        
        if destination:
            query = query.filter(destination=destination)
        
        # Get the latest calculations
        calculations = query.order_by('-calculation_date')[:limit]
        
        result = []
        for calc in calculations:
            result.append({
                'id': calc.id,
                'product': calc.product.name,
                'destination': calc.destination,
                'total_cost_sdg': float(calc.total_cost_sdg),
                'total_cost_usd': float(calc.total_cost_usd),
                'fob_price': float(calc.fob_price),
                'cnf_price': float(calc.cnf_price),
                'exchange_rate': float(calc.exchange_rate),
                'calculation_date': calc.calculation_date.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return Response(result)
    except Exception as e:
        logger.error(f"Error getting CNF history: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin)
def update_market_data_prices_api(request):
    """API endpoint to manually update market data prices from CNF calculations"""
    try:
        data = request.data
        product_id = data.get('product_id')
        
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=400)
        
        product = get_object_or_404(Product, id=product_id)
        
        if not product.market_data:
            return Response({'error': 'Product is not linked to any market data'}, status=400)
        
        # Update market data prices
        product.update_market_data_prices()
        
        # Return the updated market data values
        MarketData = apps.get_model('core', 'MarketData')
        market_data = product.market_data
        return Response({
            'success': True,
            'message': f'Market data prices for {product.name} updated successfully',
            'market_data': {
                'id': market_data.id,
                'name': market_data.name,
                'port_sudan': float(market_data.port_sudan),
                'dmt_china': float(market_data.dmt_china),
                'dmt_uae': float(market_data.dmt_uae),
                'dmt_mersing': float(market_data.dmt_mersing),
                'dmt_india': float(market_data.dmt_india),
                'last_update': market_data.last_update.strftime('%Y-%m-%d %H:%M:%S')
            }
        })
    except Exception as e:
        logger.error(f"Error updating market data prices: {str(e)}")
        return Response({'error': str(e)}, status=500)
