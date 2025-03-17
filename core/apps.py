from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    
    def ready(self):
        """
        Import models when the app is ready to ensure proper registration
        with Django's app registry
        """
        # Import models here to avoid circular imports
        import core.models
        import core.models_cnf
