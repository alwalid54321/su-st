import json
import os
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from core.models import User, MarketData, Currency, Announcement

class Command(BaseCommand):
    help = 'Import sample data into the database'

    def handle(self, *args, **options):
        self.stdout.write('Importing sample data...')
        
        # Create superuser if no users exist
        if not User.objects.exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@sudastock.com',
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS('Created default superuser: admin/admin123'))
        
        # Import sample market data
        self.import_sample_market_data()
        
        # Import sample currencies
        self.import_sample_currencies()
        
        # Import sample announcements
        self.import_sample_announcements()
        
        self.stdout.write(self.style.SUCCESS('Data import completed successfully'))
    
    def import_sample_market_data(self):
        self.stdout.write('Importing sample market data...')
        
        sample_data = [
            {
                'name': 'GADAREF SESAME',
                'value': 2850.00,
                'port_sudan': 2900.00,
                'dmt_china': 2800.00,
                'dmt_uae': 2825.00,
                'dmt_mersing': 2815.00,
                'dmt_india': 2835.00,
                'status': 'Active',
                'forecast': 'Rising',
                'trend': 1,
                'image_url': '/images/products/sesame-gad.jpg'
            },
            {
                'name': 'COMMERCIAL SESAME',
                'value': 2750.00,
                'port_sudan': 2800.00,
                'dmt_china': 2700.00,
                'dmt_uae': 2725.00,
                'dmt_mersing': 2715.00,
                'dmt_india': 2735.00,
                'status': 'Active',
                'forecast': 'Stable',
                'trend': 0,
                'image_url': '/images/products/sesame-com.jpg'
            },
            {
                'name': 'RED SESAME',
                'value': 2650.00,
                'port_sudan': 2700.00,
                'dmt_china': 2600.00,
                'dmt_uae': 2625.00,
                'dmt_mersing': 2615.00,
                'dmt_india': 2635.00,
                'status': 'Limited',
                'forecast': 'Falling',
                'trend': -1,
                'image_url': '/images/products/red-sesame.jpg'
            },
            {
                'name': 'ACACIA SENEGAL',
                'value': 3200.00,
                'port_sudan': 3250.00,
                'dmt_china': 3150.00,
                'dmt_uae': 3175.00,
                'dmt_mersing': 3165.00,
                'dmt_india': 3185.00,
                'status': 'Active',
                'forecast': 'Rising',
                'trend': 1,
                'image_url': '/images/products/acacia-sen.jpg'
            },
            {
                'name': 'ACACIA SEYAL',
                'value': 2950.00,
                'port_sudan': 3000.00,
                'dmt_china': 2900.00,
                'dmt_uae': 2925.00,
                'dmt_mersing': 2915.00,
                'dmt_india': 2935.00,
                'status': 'Active',
                'forecast': 'Stable',
                'trend': 0,
                'image_url': '/images/products/acacia-sey.jpg'
            }
        ]
        
        for item in sample_data:
            try:
                MarketData.objects.get_or_create(
                    name=item['name'],
                    defaults=item
                )
                self.stdout.write(f"Imported market data: {item['name']}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error importing market data {item['name']}: {str(e)}"))
    
    def import_sample_currencies(self):
        self.stdout.write('Importing sample currencies...')
        
        sample_currencies = [
            {
                'code': 'USD',
                'name': 'US Dollar',
                'rate': 1.0000,
                'trend': 0
            },
            {
                'code': 'AED',
                'name': 'UAE Dirham',
                'rate': 3.6725,
                'trend': 0
            },
            {
                'code': 'SDG',
                'name': 'Sudanese Pound',
                'rate': 601.0000,
                'trend': 1
            }
        ]
        
        for currency in sample_currencies:
            try:
                Currency.objects.get_or_create(
                    code=currency['code'],
                    defaults=currency
                )
                self.stdout.write(f"Imported currency: {currency['code']}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error importing currency {currency['code']}: {str(e)}"))
    
    def import_sample_announcements(self):
        self.stdout.write('Importing sample announcements...')
        
        sample_announcements = [
            {
                'title': 'Welcome to SudaStock',
                'content': 'Welcome to the new SudaStock platform. We are excited to bring you the latest market data and insights.',
                'priority': 'high'
            },
            {
                'title': 'Market Update: Sesame Prices Rising',
                'content': 'Sesame prices have been steadily rising over the past week due to increased demand from China.',
                'priority': 'medium'
            },
            {
                'title': 'New Feature: Currency Tracking',
                'content': 'We have added a new feature to track currency exchange rates in real-time.',
                'priority': 'low'
            }
        ]
        
        for announcement in sample_announcements:
            try:
                Announcement.objects.get_or_create(
                    title=announcement['title'],
                    defaults=announcement
                )
                self.stdout.write(f"Imported announcement: {announcement['title']}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error importing announcement {announcement['title']}: {str(e)}"))
