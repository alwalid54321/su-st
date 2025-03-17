from decimal import Decimal
from django.utils import timezone
from .models_cnf import (
    Product, CurrencyExchange, OperationCost, GovernmentCost, 
    LocalTransport, InternationalTransport, CNFPriceCalculation
)

def calculate_cnf_price(product_id, destination):
    """
    Calculate CNF price for a product to a specific destination
    
    Args:
        product_id (int): ID of the product
        destination (str): Destination country
        
    Returns:
        dict: Dictionary containing all calculated values
    """
    try:
        product = Product.objects.get(id=product_id)
        currency_rate = CurrencyExchange.objects.latest('date')
        operation_cost = OperationCost.objects.get(product=product)
        government_cost = GovernmentCost.objects.get(product=product)
        local_transport = LocalTransport.objects.get(product=product)
        international_freight = InternationalTransport.objects.get(
            product=product, destination=destination
        )

        # Step 1: Waste Adjustment
        waste_percentage = Decimal(product.waste_percentage) / Decimal(100)
        waste_amount = (product.cost_per_unit_sdg / (1 - waste_percentage)) * waste_percentage

        # Step 2: Total Cost in SDG
        total_cost_sdg = (
            product.cost_per_unit_sdg + waste_amount +
            operation_cost.cleaning + operation_cost.empty_bags +
            operation_cost.printing + operation_cost.handling +
            government_cost.paperwork + government_cost.customs_duty + government_cost.clearance +
            local_transport.transport_to_port
        )

        # Step 3: Convert to USD
        total_cost_usd = total_cost_sdg / currency_rate.usd_to_sdg

        # Step 4: Calculate FOB Port Sudan
        fob_price = total_cost_usd

        # Step 5: Calculate CNF Price
        cnf_price = fob_price + international_freight.freight_cost_usd

        # Store calculation for audit purposes
        CNFPriceCalculation.objects.create(
            product=product,
            destination=destination,
            total_cost_sdg=total_cost_sdg,
            total_cost_usd=total_cost_usd,
            fob_price=fob_price,
            cnf_price=cnf_price,
            exchange_rate=currency_rate.usd_to_sdg
        )

        return {
            "product": product.name,
            "destination": destination,
            "total_cost_sdg": round(total_cost_sdg, 2),
            "total_cost_usd": round(total_cost_usd, 2),
            "fob_price": round(fob_price, 2),
            "cnf_price": round(cnf_price, 2),
            "exchange_rate": round(currency_rate.usd_to_sdg, 2),
            "calculation_date": timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Product.DoesNotExist:
        return {"error": f"Product with ID {product_id} does not exist"}
    except CurrencyExchange.DoesNotExist:
        return {"error": "No currency exchange rate available"}
    except OperationCost.DoesNotExist:
        return {"error": f"Operation costs not defined for product {product.name}"}
    except GovernmentCost.DoesNotExist:
        return {"error": f"Government costs not defined for product {product.name}"}
    except LocalTransport.DoesNotExist:
        return {"error": f"Local transport costs not defined for product {product.name}"}
    except InternationalTransport.DoesNotExist:
        return {"error": f"International freight costs not defined for product {product.name} to {destination}"}
    except Exception as e:
        return {"error": str(e)}


def get_product_destinations(product_id):
    """
    Get all available destinations for a product
    
    Args:
        product_id (int): ID of the product
        
    Returns:
        list: List of available destinations
    """
    try:
        product = Product.objects.get(id=product_id)
        destinations = InternationalTransport.objects.filter(
            product=product
        ).values_list('destination', flat=True)
        return list(destinations)
    except Product.DoesNotExist:
        return []
    except Exception:
        return []


def get_all_products():
    """
    Get all products with their available destinations
    
    Returns:
        list: List of products with their destinations
    """
    products = []
    for product in Product.objects.all():
        destinations = get_product_destinations(product.id)
        products.append({
            "id": product.id,
            "name": product.name,
            "destinations": destinations
        })
    return products


def calculate_cnf_price_for_market_data(product_id, destination, exchange_rate=None):
    """
    Calculate CNF price specifically for market data integration
    
    Args:
        product_id: ID of the product
        destination: Destination country
        exchange_rate: Optional exchange rate object (to avoid multiple DB queries)
        
    Returns:
        Dictionary with calculation results or None if calculation fails
    """
    try:
        # Get the product
        product = Product.objects.get(id=product_id)
        
        # Get the latest exchange rate if not provided
        if not exchange_rate:
            exchange_rate = CurrencyExchange.objects.latest('date')
            
        # Get operation costs
        try:
            operation_costs = OperationCost.objects.get(product=product)
        except OperationCost.DoesNotExist:
            operation_costs = None
            
        # Get government costs
        try:
            government_costs = GovernmentCost.objects.get(product=product)
        except GovernmentCost.DoesNotExist:
            government_costs = None
            
        # Get local transport costs
        try:
            local_transport = LocalTransport.objects.get(product=product)
        except LocalTransport.DoesNotExist:
            local_transport = None
            
        # Get international transport costs
        try:
            international_transport = InternationalTransport.objects.get(product=product, destination=destination)
        except InternationalTransport.DoesNotExist:
            # For Port Sudan, we don't need international transport
            if destination != 'Port Sudan':
                return None
            international_transport = None
            
        # Calculate base cost with waste adjustment
        waste_multiplier = Decimal('1') + (product.waste_percentage / Decimal('100'))
        base_cost_with_waste = product.cost_per_unit_sdg * waste_multiplier
        
        # Sum up all costs in SDG
        total_cost_sdg = base_cost_with_waste
        
        if operation_costs:
            total_cost_sdg += operation_costs.cleaning + operation_costs.empty_bags + operation_costs.printing + operation_costs.handling
            
        if government_costs:
            total_cost_sdg += government_costs.paperwork + government_costs.customs_duty + government_costs.clearance
            
        if local_transport:
            total_cost_sdg += local_transport.transport_to_port
            
        # Convert to USD for FOB price
        total_cost_usd = total_cost_sdg / exchange_rate.usd_to_sdg
        
        # FOB price is the price at Port Sudan
        fob_price = total_cost_usd
        
        # For destinations other than Port Sudan, add international transport
        if destination != 'Port Sudan' and international_transport:
            cnf_price = fob_price + international_transport.freight_cost_usd
        else:
            cnf_price = fob_price
            
        # Return the results without creating a calculation record
        # This is to avoid creating too many records when updating market data
        return {
            'product_name': product.name,
            'destination': destination,
            'total_cost_sdg': float(total_cost_sdg),
            'total_cost_usd': float(total_cost_usd),
            'fob_price': float(fob_price),
            'cnf_price': float(cnf_price),
            'exchange_rate': float(exchange_rate.usd_to_sdg)
        }
    except Exception as e:
        print(f"Error calculating CNF price for market data: {str(e)}")
        return None
