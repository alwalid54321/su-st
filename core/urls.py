from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_cnf
from . import views_cnf_unified

# Create a router for our viewsets
router = DefaultRouter()
router.register(r'market-data', views.MarketDataViewSet)
router.register(r'currencies', views.CurrencyViewSet)
router.register(r'announcements', views.AnnouncementViewSet)

# API endpoints
api_urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.LoginView.as_view(), name='api_login'),
    path('auth/register/', views.RegisterView.as_view(), name='api_register'),
    path('auth/logout/', views.LogoutView.as_view(), name='api_logout'),
    
    # API endpoints using the router
    path('', include(router.urls)),
    
    # Data insights request endpoint
    path('data-insights/request/', views.data_insights_request, name='data_insights_request'),
    
    # Health check endpoint
    path('health/', views.health_check, name='health_check'),
    
    # CNF Price Calculation API endpoints
    path('cnf-price/', views_cnf.get_cnf_price_api, name='api_cnf_price'),
    path('products/', views_cnf.get_products_api, name='api_products'),
    path('products/<int:product_id>/destinations/', views_cnf.get_product_destinations_api, name='api_product_destinations'),
    path('exchange-rate/', views_cnf.get_exchange_rate_api, name='api_exchange_rate'),
    
    # CNF product management API endpoints
    path('cnf-products/', views_cnf.admin_cnf_products_view, name='api_cnf_products'),
    path('cnf-products/save/', views_cnf.admin_cnf_products_save, name='api_cnf_products_save'),
    path('cnf-products/delete/', views_cnf.admin_cnf_products_delete, name='api_cnf_products_delete'),
    path('cnf-products/link/', views_cnf.admin_cnf_products_link, name='api_cnf_products_link'),
    
    # CNF Unified Interface API endpoints
    path('cnf/product/<int:product_id>/', views_cnf_unified.get_product_api, name='api_cnf_product'),
    path('cnf/calculations/', views_cnf_unified.get_calculations_api, name='api_cnf_calculations'),
    path('cnf/calculation/<int:calculation_id>/', views_cnf_unified.get_calculation_api, name='api_cnf_calculation'),
    path('cnf/calculation/update/', views_cnf_unified.update_calculation_api, name='api_cnf_calculation_update'),
    path('cnf/calculation/history/', views_cnf_unified.get_calculation_history_api, name='api_cnf_calculation_history'),
]

# Template view endpoints
urlpatterns = [
    # Template views
    path('', views.home_view, name='home'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    path('market-data/', views.market_data_view, name='market_data'),
    path('currencies/', views.currencies_view, name='currencies'),
    path('announcements/', views.announcements_view, name='announcements'),
    path('products/', views.products_view, name='products'),
    path('about/', views.about_view, name='about'),
    path('quote/', views.quote_view, name='quote'),
    path('sample/', views.sample_view, name='sample'),
    path('contact/', views.contact_view, name='contact'),
    
    # CNF Price Calculation views
    path('cnf-calculator/', views_cnf.cnf_calculator_view, name='cnf_calculator'),
    path('cnf-history/', views_cnf.cnf_history_view, name='cnf_history'),
    path('calculate-cnf-ajax/', views_cnf.calculate_cnf_ajax, name='calculate_cnf_ajax'),
    
    # Form submission endpoints
    path('quote-submit/', views.quote_submit, name='quote_submit'),
    path('sample-submit/', views.sample_submit, name='sample_submit'),
    
    # Admin views
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/market-data/', views.admin_market_data, name='admin_market_data'),
    path('admin/currencies/', views.admin_currencies, name='admin_currencies'),
    path('admin/announcements/', views.admin_announcements, name='admin_announcements'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/products/', views_cnf.admin_products_view, name='admin_products'),
    path('admin/exchange-rates/', views_cnf.admin_exchange_rates_view, name='admin_exchange_rates'),
    path('admin/cnf-products/', views_cnf.admin_cnf_products_view, name='admin_cnf_products'),
    path('admin/cnf-products/save/', views_cnf.admin_cnf_products_save, name='admin_cnf_products_save'),
    path('admin/cnf-products/delete/', views_cnf.admin_cnf_products_delete, name='admin_cnf_products_delete'),
    path('admin/cnf-products/link/', views_cnf.admin_cnf_products_link, name='admin_cnf_products_link'),
    path('admin/cnf-unified/', views_cnf_unified.admin_cnf_unified_view, name='admin_cnf_unified'),
    
    # API endpoints
    path('api/', include(api_urlpatterns)),
]
