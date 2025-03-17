from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import MarketData, MarketDataArchive
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Add dummy market data and history for testing'

    def handle(self, *args, **kwargs):
        # Create sample market data products if they don't exist
        products = [
            {
                'name': 'Sesame',
                'value': 1250.00,
                'port_sudan': 1200.00,
                'dmt_china': 1300.00,
                'dmt_uae': 1280.00,
                'dmt_mersing': 1270.00,
                'dmt_india': 1260.00,
                'status': 'Active',
                'forecast': 'Rising',
                'trend': 1
            },
            {
                'name': 'Cotton',
                'value': 1800.00,
                'port_sudan': 1750.00,
                'dmt_china': 1850.00,
                'dmt_uae': 1820.00,
                'dmt_mersing': 1810.00,
                'dmt_india': 1830.00,
                'status': 'Active',
                'forecast': 'Stable',
                'trend': 0
            },
            {
                'name': 'Gum Arabic',
                'value': 2200.00,
                'port_sudan': 2150.00,
                'dmt_china': 2250.00,
                'dmt_uae': 2220.00,
                'dmt_mersing': 2210.00,
                'dmt_india': 2230.00,
                'status': 'Limited',
                'forecast': 'Rising',
                'trend': 1
            },
            {
                'name': 'Red Sesame',
                'value': 1350.00,
                'port_sudan': 1300.00,
                'dmt_china': 1400.00,
                'dmt_uae': 1380.00,
                'dmt_mersing': 1370.00,
                'dmt_india': 1360.00,
                'status': 'Active',
                'forecast': 'Rising',
                'trend': 1
            }
        ]
        
        # Create or update products
        for product_data in products:
            product, created = MarketData.objects.update_or_create(
                name=product_data['name'],
                defaults=product_data
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created product: {product.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Updated product: {product.name}'))
        
        # Generate historical data for each product
        self.generate_history()
        
        self.stdout.write(self.style.SUCCESS('Successfully added dummy market data'))
    
    def generate_history(self):
        # Get all products
        products = MarketData.objects.all()
        
        # Clear existing archive data
        MarketDataArchive.objects.all().delete()
        
        # Generate 60 days of historical data
        for product in products:
            self.stdout.write(f'Generating history for {product.name}...')
            
            # Start with base values
            value = float(product.value) * 0.9  # Start 10% lower than current
            port_sudan = float(product.port_sudan) * 0.9
            dmt_china = float(product.dmt_china) * 0.9
            dmt_uae = float(product.dmt_uae) * 0.9
            dmt_mersing = float(product.dmt_mersing) * 0.9
            dmt_india = float(product.dmt_india) * 0.9
            
            # Generate data for the past 60 days
            for day in range(60, 0, -1):
                date = timezone.now() - timedelta(days=day)
                
                # Add some random variation (between -2% and +3%)
                value_change = random.uniform(-0.02, 0.03)
                value = value * (1 + value_change)
                
                # Add variations to other values
                port_sudan = port_sudan * (1 + random.uniform(-0.015, 0.025))
                dmt_china = dmt_china * (1 + random.uniform(-0.01, 0.03))
                dmt_uae = dmt_uae * (1 + random.uniform(-0.015, 0.025))
                dmt_mersing = dmt_mersing * (1 + random.uniform(-0.02, 0.02))
                dmt_india = dmt_india * (1 + random.uniform(-0.01, 0.025))
                
                # Determine trend
                if day > 40:
                    trend = 0  # Stable at the beginning
                    forecast = 'Stable'
                elif day > 20:
                    trend = 1  # Rising in the middle
                    forecast = 'Rising'
                else:
                    # For the last 20 days, make product-specific trends
                    if product.name == 'Sesame' or product.name == 'Red Sesame':
                        trend = 1  # Rising
                        forecast = 'Rising'
                    elif product.name == 'Cotton':
                        trend = 0  # Stable
                        forecast = 'Stable'
                    else:
                        trend = -1  # Falling
                        forecast = 'Falling'
                
                # Create archive record
                MarketDataArchive.objects.create(
                    original_id=product.id,
                    name=product.name,
                    value=round(value, 2),
                    port_sudan=round(port_sudan, 2),
                    dmt_china=round(dmt_china, 2),
                    dmt_uae=round(dmt_uae, 2),
                    dmt_mersing=round(dmt_mersing, 2),
                    dmt_india=round(dmt_india, 2),
                    status='Active',
                    forecast=forecast,
                    trend=trend,
                    archived_at=date,
                    last_update=date,
                    created_at=product.created_at
                )
            
            self.stdout.write(self.style.SUCCESS(f'Generated 60 days of history for {product.name}'))
