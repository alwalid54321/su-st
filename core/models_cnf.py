from django.db import models
from django.utils import timezone
from decimal import Decimal

# Using lazy loading to avoid circular imports
from django.apps import apps

class CurrencyExchange(models.Model):
    date = models.DateField(auto_now_add=True)
    usd_to_sdg = models.DecimalField(max_digits=10, decimal_places=2, help_text="Exchange rate USD to SDG")

    def __str__(self):
        return f"Exchange Rate {self.date}: {self.usd_to_sdg}"
    
    class Meta:
        verbose_name = 'Currency Exchange Rate'
        verbose_name_plural = 'Currency Exchange Rates'
        ordering = ['-date']

class Product(models.Model):
    name = models.CharField(max_length=255, unique=True)
    market_data = models.OneToOneField('MarketData', on_delete=models.CASCADE, related_name="cnf_product", null=True, blank=True)
    cost_per_unit_sdg = models.DecimalField(max_digits=15, decimal_places=2, help_text="Base purchase cost in SDG")
    waste_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Waste percentage")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'CNF Product'
        verbose_name_plural = 'CNF Products'
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        # Save the product first
        super().save(*args, **kwargs)
        
        # If linked to market data, update the prices
        if self.market_data:
            self.update_market_data_prices()
    
    def update_market_data_prices(self):
        """Update the market data prices based on CNF calculations"""
        if not self.market_data:
            return
        
        # Get the latest exchange rate
        try:
            exchange_rate = CurrencyExchange.objects.latest('date')
        except CurrencyExchange.DoesNotExist:
            # Default to a reasonable exchange rate if none exists
            return
        
        # Calculate the base cost with waste
        base_cost_with_waste = self.cost_per_unit_sdg * (1 + (self.waste_percentage / Decimal('100.0')))
        
        # Get operation costs
        try:
            op_costs = self.operation_costs
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
            gov_costs = self.government_costs
            paperwork_cost = gov_costs.paperwork
            customs_duty_cost = gov_costs.customs_duty
            clearance_cost = gov_costs.clearance
        except GovernmentCost.DoesNotExist:
            paperwork_cost = Decimal('0.00')
            customs_duty_cost = Decimal('0.00')
            clearance_cost = Decimal('0.00')
        
        # Get local transport costs
        try:
            local_transport = self.local_transports
            local_transport_cost = local_transport.transport_to_port
        except LocalTransport.DoesNotExist:
            local_transport_cost = Decimal('0.00')
        
        # Get all international transports for this product
        int_transports = self.international_transports.all()
        
        # Store old values to calculate trends
        old_values = {
            'China': self.market_data.dmt_china,
            'UAE': self.market_data.dmt_uae,
            'Mersing': self.market_data.dmt_mersing,
            'India': self.market_data.dmt_india,
            'Port Sudan': self.market_data.port_sudan
        }
        
        # Flag to track if any changes were made
        changes_made = False
        
        # Update market data prices for each destination
        for transport in int_transports:
            destination = transport.destination
            
            # Calculate freight cost in SDG
            freight_cost_sdg = transport.freight_cost_usd * exchange_rate.usd_to_sdg
            
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
            
            # Update the corresponding market data field based on destination
            if destination == 'China':
                if self.market_data.dmt_china != total_cost_usd:
                    self.market_data.dmt_china = total_cost_usd
                    changes_made = True
            elif destination == 'UAE':
                if self.market_data.dmt_uae != total_cost_usd:
                    self.market_data.dmt_uae = total_cost_usd
                    changes_made = True
            elif destination == 'Mersing':
                if self.market_data.dmt_mersing != total_cost_usd:
                    self.market_data.dmt_mersing = total_cost_usd
                    changes_made = True
            elif destination == 'India':
                if self.market_data.dmt_india != total_cost_usd:
                    self.market_data.dmt_india = total_cost_usd
                    changes_made = True
            elif destination == 'Port Sudan':
                if self.market_data.port_sudan != total_cost_sdg:
                    self.market_data.port_sudan = total_cost_sdg
                    changes_made = True
            
            # Calculate trend for this destination
            old_value = old_values.get(destination, 0)
            new_value = total_cost_usd if destination != 'Port Sudan' else total_cost_sdg
            
            if old_value > 0 and new_value != old_value:
                percent_change = ((new_value - old_value) / old_value) * 100
                self.market_data.trend = int(percent_change)
                changes_made = True
                
                # Update forecast based on trend
                if percent_change > 0:
                    self.market_data.forecast = 'Rising'
                elif percent_change < 0:
                    self.market_data.forecast = 'Falling'
                else:
                    self.market_data.forecast = 'Stable'
            
            # Mark any existing current calculations for this product/destination as not current
            CNFPriceCalculation.objects.filter(
                product=self,
                destination=destination,
                is_current=True
            ).update(is_current=False)
            
            # Create a new CNF price calculation record
            CNFPriceCalculation.objects.create(
                product=self,
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
        
        # Always force an update to create an archive entry
        # This ensures that every CNF calculation creates a market data archive
        from django.apps import apps
        from django.utils import timezone
        import logging
        
        # Get the MarketData model directly to avoid circular imports
        MarketData = apps.get_model('core', 'MarketData')
        MarketDataArchive = apps.get_model('core', 'MarketDataArchive')
        
        # Get the current market data from the database to ensure we have the latest
        current_market_data = MarketData.objects.get(id=self.market_data.id)
        
        # Create an archive entry directly
        MarketDataArchive.objects.create(
            original_id=current_market_data.id,
            name=current_market_data.name,
            value=current_market_data.value,
            port_sudan=current_market_data.port_sudan,
            dmt_china=current_market_data.dmt_china,
            dmt_uae=current_market_data.dmt_uae,
            dmt_mersing=current_market_data.dmt_mersing,
            dmt_india=current_market_data.dmt_india,
            status=current_market_data.status,
            forecast=current_market_data.forecast,
            trend=current_market_data.trend,
            image_url=current_market_data.image_url,
            archived_at=timezone.now(),
            last_update=current_market_data.last_update,
            created_at=current_market_data.created_at
        )
        
        # Update the last_update field and save
        self.market_data.last_update = timezone.now()
        self.market_data.save()
        
        # Log the update
        logger = logging.getLogger(__name__)
        logger.info(f"Market data updated for product {self.name} with ID {self.id}. Market data ID: {self.market_data.id}")
        
        return True
    
    class Meta:
        verbose_name = 'CNF Product'
        verbose_name_plural = 'CNF Products'
        ordering = ['name']

class OperationCost(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="operation_costs")
    cleaning = models.DecimalField(max_digits=10, decimal_places=2, help_text="Cleaning cost in SDG")
    empty_bags = models.DecimalField(max_digits=10, decimal_places=2, help_text="Empty bags cost in SDG")
    printing = models.DecimalField(max_digits=10, decimal_places=2, help_text="Printing cost in SDG")
    handling = models.DecimalField(max_digits=10, decimal_places=2, help_text="Handling cost in SDG")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Operation Cost for {self.product.name}"
    
    class Meta:
        verbose_name = 'Operation Cost'
        verbose_name_plural = 'Operation Costs'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update market data prices when operation costs change
        self.product.update_market_data_prices()

class GovernmentCost(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="government_costs")
    paperwork = models.DecimalField(max_digits=10, decimal_places=2, help_text="Government paperwork in SDG")
    customs_duty = models.DecimalField(max_digits=10, decimal_places=2, help_text="Customs duty in SDG")
    clearance = models.DecimalField(max_digits=10, decimal_places=2, help_text="Clearance cost in SDG")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Government Cost for {self.product.name}"
    
    class Meta:
        verbose_name = 'Government Cost'
        verbose_name_plural = 'Government Costs'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update market data prices when government costs change
        self.product.update_market_data_prices()

class LocalTransport(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="local_transports")
    transport_to_port = models.DecimalField(max_digits=10, decimal_places=2, help_text="Cost of transport to Port Sudan in SDG")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Local Transport for {self.product.name}"
    
    class Meta:
        verbose_name = 'Local Transport'
        verbose_name_plural = 'Local Transports'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update market data prices when local transport costs change
        self.product.update_market_data_prices()

class InternationalTransport(models.Model):
    DESTINATION_CHOICES = (
        ('China', 'China'),
        ('UAE', 'UAE'),
        ('Mersing', 'Mersing'),
        ('India', 'India'),
        ('Port Sudan', 'Port Sudan'),
        ('Other', 'Other'),
    )
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="international_transports")
    destination = models.CharField(max_length=255, choices=DESTINATION_CHOICES, help_text="Destination country")
    freight_cost_usd = models.DecimalField(max_digits=10, decimal_places=2, help_text="Freight cost in USD")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"International Transport for {self.product.name} to {self.destination}"
    
    class Meta:
        verbose_name = 'International Transport'
        verbose_name_plural = 'International Transports'
        unique_together = ('product', 'destination')
        ordering = ['product', 'destination']
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update market data prices when international transport costs change
        self.product.update_market_data_prices()

class CNFPriceCalculation(models.Model):
    """Model to store calculated CNF prices for audit and history"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cnf_calculations")
    destination = models.CharField(max_length=255)
    total_cost_sdg = models.DecimalField(max_digits=15, decimal_places=2)
    total_cost_usd = models.DecimalField(max_digits=15, decimal_places=2)
    fob_price = models.DecimalField(max_digits=15, decimal_places=2)
    cnf_price = models.DecimalField(max_digits=15, decimal_places=2)
    exchange_rate = models.DecimalField(max_digits=10, decimal_places=2)
    calculation_date = models.DateTimeField(auto_now_add=True)
    is_current = models.BooleanField(default=True, help_text="Whether this is the current active calculation")
    is_manual_override = models.BooleanField(default=False, help_text="Whether this calculation was manually overridden")
    parent_calculation = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                                          related_name='derived_calculations', 
                                          help_text="Previous calculation this was based on")
    
    # Operation costs at time of calculation
    cleaning_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    empty_bags_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    printing_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    handling_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Government costs at time of calculation
    paperwork_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    customs_duty_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    clearance_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Transport costs at time of calculation
    local_transport_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    international_transport_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        status = " (Manual Override)" if self.is_manual_override else ""
        current = " (Current)" if self.is_current else ""
        return f"CNF Price for {self.product.name} to {self.destination} on {self.calculation_date.strftime('%Y-%m-%d')}{status}{current}"
    
    def save(self, *args, **kwargs):
        # Check if this is an update (object already exists)
        is_update = self.pk is not None
        
        # Save the calculation
        super().save(*args, **kwargs)
        
        # If this is a current calculation, update the market data
        if self.is_current and self.product.market_data:
            market_data = self.product.market_data
            
            # Update the corresponding market data field based on destination
            if self.destination == 'China':
                market_data.dmt_china = self.cnf_price
            elif self.destination == 'UAE':
                market_data.dmt_uae = self.cnf_price
            elif self.destination == 'Mersing':
                market_data.dmt_mersing = self.cnf_price
            elif self.destination == 'India':
                market_data.dmt_india = self.cnf_price
            elif self.destination == 'Port Sudan':
                market_data.port_sudan = self.total_cost_sdg
            
            # Update forecast and trend based on comparison with previous calculation
            if is_update and self.parent_calculation:
                prev_price = 0
                current_price = 0
                
                if self.destination == 'China':
                    prev_price = self.parent_calculation.cnf_price
                    current_price = self.cnf_price
                elif self.destination == 'UAE':
                    prev_price = self.parent_calculation.cnf_price
                    current_price = self.cnf_price
                elif self.destination == 'Mersing':
                    prev_price = self.parent_calculation.cnf_price
                    current_price = self.cnf_price
                elif self.destination == 'India':
                    prev_price = self.parent_calculation.cnf_price
                    current_price = self.cnf_price
                elif self.destination == 'Port Sudan':
                    prev_price = self.parent_calculation.total_cost_sdg
                    current_price = self.total_cost_sdg
                
                # Calculate percentage change
                if prev_price > 0:
                    percent_change = ((current_price - prev_price) / prev_price) * 100
                    
                    # Update trend (percentage)
                    market_data.trend = int(percent_change)
                    
                    # Update forecast based on trend
                    if percent_change > 0:
                        market_data.forecast = 'Rising'
                    elif percent_change < 0:
                        market_data.forecast = 'Falling'
                    else:
                        market_data.forecast = 'Stable'
            
            # Save the updated market data to trigger history creation
            market_data.save()
        
        # If this is a new calculation being set as current, mark other calculations for this product/destination as not current
        if self.is_current and not self.pk:
            CNFPriceCalculation.objects.filter(
                product=self.product,
                destination=self.destination,
                is_current=True
            ).update(is_current=False)
    
    def create_derived_calculation(self, **override_fields):
        """Create a new calculation based on this one with specific fields overridden"""
        # Set this calculation as not current
        self.is_current = False
        self.save()
        
        # Create a new calculation with the same values
        new_calc = CNFPriceCalculation.objects.create(
            product=self.product,
            destination=self.destination,
            total_cost_sdg=self.total_cost_sdg,
            total_cost_usd=self.total_cost_usd,
            fob_price=self.fob_price,
            cnf_price=self.cnf_price,
            exchange_rate=self.exchange_rate,
            is_current=True,
            is_manual_override=True,
            parent_calculation=self,
            cleaning_cost=self.cleaning_cost,
            empty_bags_cost=self.empty_bags_cost,
            printing_cost=self.printing_cost,
            handling_cost=self.handling_cost,
            paperwork_cost=self.paperwork_cost,
            customs_duty_cost=self.customs_duty_cost,
            clearance_cost=self.clearance_cost,
            local_transport_cost=self.local_transport_cost,
            international_transport_cost=self.international_transport_cost,
        )
        
        # Override specified fields
        for field, value in override_fields.items():
            if hasattr(new_calc, field):
                setattr(new_calc, field, value)
        
        # Save the new calculation which will trigger the save method to update market data
        new_calc.save()
        
        return new_calc
    
    class Meta:
        verbose_name = 'CNF Price Calculation'
        verbose_name_plural = 'CNF Price Calculations'
        ordering = ['-calculation_date']
