from django.contrib import admin
from django import forms
from django.utils.html import format_html
from django.apps import apps
from django.db import models
from .models_cnf import (
    CurrencyExchange, 
    Product, 
    OperationCost, 
    GovernmentCost, 
    LocalTransport, 
    InternationalTransport, 
    CNFPriceCalculation
)

class ProductAdminForm(forms.ModelForm):
    """Custom form for Product admin to allow selecting market data"""
    class Meta:
        model = Product
        fields = '__all__'
        
    def __init__(self, *args, **kwargs):
        super(ProductAdminForm, self).__init__(*args, **kwargs)
        # Only show market data items that are not already linked to a product
        if 'market_data' in self.fields:
            # Get MarketData model using apps.get_model inside the method
            MarketData = apps.get_model('core', 'MarketData')
            instance = kwargs.get('instance')
            if instance and instance.market_data:
                # If editing an existing product with market data, include its current market data
                self.fields['market_data'].queryset = MarketData.objects.filter(
                    models.Q(cnf_product__isnull=True) | models.Q(cnf_product=instance)
                )
            else:
                # If creating a new product, only show unlinked market data
                self.fields['market_data'].queryset = MarketData.objects.filter(cnf_product__isnull=True)
        
        # Add help text for the market data field
        self.fields['market_data'].help_text = "Link this product to market data for automatic price updates"

class OperationCostInline(admin.StackedInline):
    model = OperationCost
    can_delete = False
    verbose_name_plural = 'Operation Costs'
    fields = ('cleaning', 'empty_bags', 'printing', 'handling')
    
class GovernmentCostInline(admin.StackedInline):
    model = GovernmentCost
    can_delete = False
    verbose_name_plural = 'Government Costs'
    fields = ('paperwork', 'customs_duty', 'clearance')
    
class LocalTransportInline(admin.StackedInline):
    model = LocalTransport
    can_delete = False
    verbose_name_plural = 'Local Transport Costs'
    fields = ('transport_to_port',)
    
class InternationalTransportInline(admin.StackedInline):
    model = InternationalTransport
    extra = 1
    verbose_name_plural = 'International Transport Costs'
    fields = ('destination', 'freight_cost_usd')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ('name', 'cost_per_unit_sdg', 'waste_percentage', 'linked_market_data', 'updated_at')
    search_fields = ('name',)
    list_filter = ('updated_at',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'market_data')
        }),
        ('Cost Information', {
            'fields': ('cost_per_unit_sdg', 'waste_percentage'),
            'description': 'Enter the base cost per unit in SDG and waste percentage. These values will be used for CNF price calculations.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    inlines = [OperationCostInline, GovernmentCostInline, LocalTransportInline, InternationalTransportInline]
    
    def linked_market_data(self, obj):
        if obj.market_data:
            return format_html(
                '<span style="color: #786D3C;"><strong>{}</strong></span> <a href="/admin/core/marketdata/{}/change/" target="_blank">'
                '<i class="fas fa-external-link-alt" style="color: #1B1464;"></i></a>',
                obj.market_data.name, obj.market_data.id
            )
        return format_html('<span style="color: #999;">Not linked</span>')
    linked_market_data.short_description = 'Market Data'
    linked_market_data.allow_tags = True
    
    def save_model(self, request, obj, form, change):
        """Save the model and update market data prices"""
        super().save_model(request, obj, form, change)
        
        # If market data is linked, update the prices
        if obj.market_data:
            obj.update_market_data_prices()
    
    class Media:
        css = {
            'all': ('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',)
        }

@admin.register(CurrencyExchange)
class CurrencyExchangeAdmin(admin.ModelAdmin):
    list_display = ('date', 'usd_to_sdg')
    search_fields = ('date',)
    list_filter = ('date',)
    readonly_fields = ('date',)
    
    def save_model(self, request, obj, form, change):
        """Save the model and update all products' market data prices"""
        super().save_model(request, obj, form, change)
        
        # Update all products' market data prices when exchange rate changes
        for product in Product.objects.filter(market_data__isnull=False):
            product.update_market_data_prices()

@admin.register(InternationalTransport)
class InternationalTransportAdmin(admin.ModelAdmin):
    list_display = ('product', 'destination', 'freight_cost_usd', 'created_at', 'updated_at')
    list_filter = ('destination', 'product')
    search_fields = ('product__name', 'destination')
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # Update market data prices when saving international transport
        if obj.product.market_data:
            obj.product.update_market_data_prices()

@admin.register(CNFPriceCalculation)
class CNFPriceCalculationAdmin(admin.ModelAdmin):
    list_display = ('product', 'destination', 'cnf_price', 'calculation_date')
    search_fields = ('product__name', 'destination')
    list_filter = ('destination', 'calculation_date')
    readonly_fields = ('product', 'destination', 'total_cost_sdg', 'total_cost_usd', 
                      'fob_price', 'cnf_price', 'exchange_rate', 'calculation_date')
    fieldsets = (
        (None, {
            'fields': ('product', 'destination')
        }),
        ('Calculation Results', {
            'fields': ('total_cost_sdg', 'total_cost_usd', 'fob_price', 'cnf_price', 'exchange_rate')
        }),
        ('Timestamps', {
            'fields': ('calculation_date',),
        }),
    )
    
    def has_add_permission(self, request):
        """Disable adding calculations directly through admin"""
        return False
    
    def changelist_view(self, request, extra_context=None):
        """Add custom context to the changelist view"""
        extra_context = extra_context or {}
        extra_context['title'] = 'CNF Price Calculation History'
        return super().changelist_view(request, extra_context=extra_context)
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }
