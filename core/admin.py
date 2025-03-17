from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django import forms
from django.apps import apps
from django.db import models
from .models import (
    User, MarketData, Currency, Announcement,
    MarketDataArchive, CurrencyArchive, AnnouncementArchive
)
from .models_cnf import (
    CurrencyExchange, Product, OperationCost, GovernmentCost, 
    LocalTransport, InternationalTransport, CNFPriceCalculation
)

# Custom admin site styling
admin.site.site_header = format_html('<span style="color: #1B1464;">SudaStock</span> <span style="color: #786D3C;">Admin</span>')
admin.site.site_title = "SudaStock Admin Portal"
admin.site.index_title = "Welcome to SudaStock Admin Portal"

# Add custom admin CSS
class AdminMedia:
    class Media:
        css = {
            'all': ('css/admin_custom.css',)
        }

# Register User model with custom UserAdmin
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'last_login')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    class Media(AdminMedia.Media):
        pass

# Register MarketData model
@admin.register(MarketData)
class MarketDataAdmin(admin.ModelAdmin):
    list_display = ('name', 'value', 'status', 'forecast', 'trend', 'last_update', 'view_history_link')
    list_filter = ('status', 'forecast', 'trend')
    search_fields = ('name',)
    ordering = ('name',)
    
    class Media(AdminMedia.Media):
        pass
    
    def view_history_link(self, obj):
        count = MarketDataArchive.objects.filter(original_id=obj.id).count()
        if count > 0:
            return format_html(
                '<a href="/sudastock-admin/core/marketdataarchive/?original_id={}" class="button" style="background-color: #1B1464; color: white; padding: 5px 10px; border-radius: 3px; text-decoration: none;">View History ({} versions)</a>',
                obj.id, count
            )
        return "No history"
    
    view_history_link.short_description = "History"

# Register MarketDataArchive model (read-only)
@admin.register(MarketDataArchive)
class MarketDataArchiveAdmin(admin.ModelAdmin):
    list_display = ('name', 'value', 'status', 'forecast', 'trend', 'archived_at', 'original_link')
    list_filter = ('status', 'forecast', 'archived_at')
    search_fields = ('name',)
    ordering = ('-archived_at',)
    readonly_fields = [field.name for field in MarketDataArchive._meta.fields]
    
    class Media(AdminMedia.Media):
        pass
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def original_link(self, obj):
        return format_html(
            '<a href="/sudastock-admin/core/marketdata/{}/change/" class="button" style="background-color: #786D3C; color: white; padding: 5px 10px; border-radius: 3px; text-decoration: none;">View Current</a>',
            obj.original_id
        )
    
    original_link.short_description = "Current Version"

# Register Currency model
@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'rate', 'last_update', 'view_history_link')
    search_fields = ('code', 'name')
    ordering = ('code',)
    
    class Media(AdminMedia.Media):
        pass
    
    def view_history_link(self, obj):
        count = CurrencyArchive.objects.filter(original_id=obj.id).count()
        if count > 0:
            return format_html(
                '<a href="/sudastock-admin/core/currencyarchive/?original_id={}" class="button" style="background-color: #1B1464; color: white; padding: 5px 10px; border-radius: 3px; text-decoration: none;">View History ({} versions)</a>',
                obj.id, count
            )
        return "No history"
    
    view_history_link.short_description = "History"

# Register CurrencyArchive model (read-only)
@admin.register(CurrencyArchive)
class CurrencyArchiveAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'rate', 'archived_at', 'original_link')
    search_fields = ('code', 'name')
    ordering = ('-archived_at',)
    readonly_fields = [field.name for field in CurrencyArchive._meta.fields]
    
    class Media(AdminMedia.Media):
        pass
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def original_link(self, obj):
        return format_html(
            '<a href="/sudastock-admin/core/currency/{}/change/" class="button" style="background-color: #786D3C; color: white; padding: 5px 10px; border-radius: 3px; text-decoration: none;">View Current</a>',
            obj.original_id
        )
    
    original_link.short_description = "Current Version"

# Register Announcement model
@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'created_at', 'updated_at', 'view_history_link')
    list_filter = ('priority',)
    search_fields = ('title', 'content')
    ordering = ('-created_at',)
    
    class Media(AdminMedia.Media):
        pass
    
    def view_history_link(self, obj):
        count = AnnouncementArchive.objects.filter(original_id=obj.id).count()
        if count > 0:
            return format_html(
                '<a href="/sudastock-admin/core/announcementarchive/?original_id={}" class="button" style="background-color: #1B1464; color: white; padding: 5px 10px; border-radius: 3px; text-decoration: none;">View History ({} versions)</a>',
                obj.id, count
            )
        return "No history"
    
    view_history_link.short_description = "History"

# Register AnnouncementArchive model (read-only)
@admin.register(AnnouncementArchive)
class AnnouncementArchiveAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'archived_at', 'original_link')
    list_filter = ('priority', 'archived_at')
    search_fields = ('title', 'content')
    ordering = ('-archived_at',)
    readonly_fields = [field.name for field in AnnouncementArchive._meta.fields]
    
    class Media(AdminMedia.Media):
        pass
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def original_link(self, obj):
        return format_html(
            '<a href="/sudastock-admin/core/announcement/{}/change/" class="button" style="background-color: #786D3C; color: white; padding: 5px 10px; border-radius: 3px; text-decoration: none;">View Current</a>',
            obj.original_id
        )
    
    original_link.short_description = "Current Version"

# CNF Product Admin Form
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
        if 'market_data' in self.fields:
            self.fields['market_data'].help_text = "Link this product to market data for automatic price updates"

# CNF Product Admin Inlines
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

# Register CNF Product model
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
    
    class Media(AdminMedia.Media):
        pass
    
    def linked_market_data(self, obj):
        if obj.market_data:
            return format_html(
                '<span style="color: #786D3C;"><strong>{}</strong></span> <a href="/sudastock-admin/core/marketdata/{}/change/" target="_blank">'
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

# CNF Price Calculation Admin Form
class CNFPriceCalculationAdminForm(forms.ModelForm):
    """Custom form for CNF Price Calculation admin to allow selective updates"""
    
    # Override fields to allow editing
    override_cnf_price = forms.BooleanField(required=False, label="Override CNF Price")
    new_cnf_price = forms.DecimalField(required=False, max_digits=15, decimal_places=2, 
                                      label="New CNF Price (USD)")
    
    override_fob_price = forms.BooleanField(required=False, label="Override FOB Price")
    new_fob_price = forms.DecimalField(required=False, max_digits=15, decimal_places=2, 
                                      label="New FOB Price (USD)")
    
    override_total_cost_sdg = forms.BooleanField(required=False, label="Override Total Cost (SDG)")
    new_total_cost_sdg = forms.DecimalField(required=False, max_digits=15, decimal_places=2, 
                                          label="New Total Cost (SDG)")
    
    override_total_cost_usd = forms.BooleanField(required=False, label="Override Total Cost (USD)")
    new_total_cost_usd = forms.DecimalField(required=False, max_digits=15, decimal_places=2, 
                                          label="New Total Cost (USD)")
    
    class Meta:
        model = CNFPriceCalculation
        fields = '__all__'

# Register CNFPriceCalculation model
@admin.register(CNFPriceCalculation)
class CNFPriceCalculationAdmin(admin.ModelAdmin):
    form = CNFPriceCalculationAdminForm
    list_display = ('product', 'destination', 'cnf_price', 'is_current', 'is_manual_override', 'calculation_date')
    search_fields = ('product__name', 'destination')
    list_filter = ('destination', 'is_current', 'is_manual_override', 'calculation_date')
    readonly_fields = ('product', 'destination', 'calculation_date', 'parent_calculation', 
                      'is_current', 'is_manual_override')
    
    fieldsets = (
        (None, {
            'fields': ('product', 'destination', 'is_current', 'is_manual_override')
        }),
        ('Current Calculation Values', {
            'fields': ('total_cost_sdg', 'total_cost_usd', 'fob_price', 'cnf_price', 'exchange_rate'),
            'classes': ('wide',),
            'description': '<div style="color: #1B1464; padding: 10px; background-color: #f5f5f5; border-left: 5px solid #786D3C;">These are the current values. To create a new calculation with overridden values, use the fields below.</div>'
        }),
        ('Override Values', {
            'fields': (
                'override_cnf_price', 'new_cnf_price',
                'override_fob_price', 'new_fob_price',
                'override_total_cost_sdg', 'new_total_cost_sdg',
                'override_total_cost_usd', 'new_total_cost_usd',
            ),
            'classes': ('wide',),
            'description': '<div style="color: #1B1464; padding: 10px; background-color: #f5f5f5; border-left: 5px solid #786D3C;">Check the fields you want to override and enter new values. This will create a new calculation record while preserving the history.</div>'
        }),
        ('Cost Components', {
            'fields': (
                'cleaning_cost', 'empty_bags_cost', 'printing_cost', 'handling_cost',
                'paperwork_cost', 'customs_duty_cost', 'clearance_cost',
                'local_transport_cost', 'international_transport_cost'
            ),
            'classes': ('collapse',),
            'description': 'Historical cost components at the time of calculation'
        }),
        ('History', {
            'fields': ('parent_calculation', 'calculation_date'),
            'classes': ('collapse',),
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make all fields readonly if viewing a historical record that is not current"""
        if obj and not obj.is_current:
            # If viewing a historical record, make everything readonly
            return [f.name for f in self.model._meta.fields]
        return self.readonly_fields
    
    def save_model(self, request, obj, form, change):
        """Handle overridden values when saving the model"""
        if change and obj.is_current:
            # Check if any override fields are checked
            overrides = {}
            
            if form.cleaned_data.get('override_cnf_price') and form.cleaned_data.get('new_cnf_price'):
                overrides['cnf_price'] = form.cleaned_data['new_cnf_price']
                
            if form.cleaned_data.get('override_fob_price') and form.cleaned_data.get('new_fob_price'):
                overrides['fob_price'] = form.cleaned_data['new_fob_price']
                
            if form.cleaned_data.get('override_total_cost_sdg') and form.cleaned_data.get('new_total_cost_sdg'):
                overrides['total_cost_sdg'] = form.cleaned_data['new_total_cost_sdg']
                
            if form.cleaned_data.get('override_total_cost_usd') and form.cleaned_data.get('new_total_cost_usd'):
                overrides['total_cost_usd'] = form.cleaned_data['new_total_cost_usd']
            
            if overrides:
                # Create a new derived calculation with overrides
                new_calc = obj.create_derived_calculation(**overrides)
                
                # Update market data if needed
                if obj.product.market_data:
                    if obj.destination == 'China' and 'cnf_price' in overrides:
                        obj.product.market_data.dmt_china = overrides['cnf_price']
                    elif obj.destination == 'UAE' and 'cnf_price' in overrides:
                        obj.product.market_data.dmt_uae = overrides['cnf_price']
                    elif obj.destination == 'Mersing' and 'cnf_price' in overrides:
                        obj.product.market_data.dmt_mersing = overrides['cnf_price']
                    elif obj.destination == 'India' and 'cnf_price' in overrides:
                        obj.product.market_data.dmt_india = overrides['cnf_price']
                    elif obj.destination == 'Port Sudan' and 'total_cost_sdg' in overrides:
                        obj.product.market_data.port_sudan = overrides['total_cost_sdg']
                    
                    obj.product.market_data.save()
                
                # Redirect to the new calculation
                from django.contrib import messages
                messages.success(request, f"Created new calculation with overridden values. Previous values preserved in history.")
                
                # Don't save the original object, we've created a new one
                return
        
        # Normal save for non-override cases
        super().save_model(request, obj, form, change)
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of historical records"""
        if obj and not obj.is_current:
            return False
        return super().has_delete_permission(request, obj)
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj and not obj.is_current:
            # If viewing a historical record, hide the override fields
            for field_name in ['override_cnf_price', 'new_cnf_price', 
                              'override_fob_price', 'new_fob_price',
                              'override_total_cost_sdg', 'new_total_cost_sdg',
                              'override_total_cost_usd', 'new_total_cost_usd']:
                if field_name in form.base_fields:
                    form.base_fields[field_name].widget = forms.HiddenInput()
        return form
    
    class Media(AdminMedia.Media):
        css = {
            'all': ('css/admin_custom.css',)
        }
        js = ('js/cnf_admin.js',)

# Register CurrencyExchange model
@admin.register(CurrencyExchange)
class CurrencyExchangeAdmin(admin.ModelAdmin):
    list_display = ('date', 'usd_to_sdg')
    search_fields = ('date',)
    list_filter = ('date',)
    readonly_fields = ('date',)
    
    class Media(AdminMedia.Media):
        pass
    
    def save_model(self, request, obj, form, change):
        """Save the model and update all products' market data prices"""
        super().save_model(request, obj, form, change)
        
        # Update all products' market data prices when exchange rate changes
        for product in Product.objects.filter(market_data__isnull=False):
            product.update_market_data_prices()

# Register InternationalTransport model
@admin.register(InternationalTransport)
class InternationalTransportAdmin(admin.ModelAdmin):
    list_display = ('product', 'destination', 'freight_cost_usd', 'created_at', 'updated_at')
    list_filter = ('destination', 'product')
    search_fields = ('product__name', 'destination')
    
    class Media(AdminMedia.Media):
        pass
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # Update market data prices when saving international transport
        if obj.product.market_data:
            obj.product.update_market_data_prices()
