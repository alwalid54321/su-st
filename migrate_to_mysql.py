import os
import sys
import django
from pathlib import Path

def migrate_to_mysql():
    print("Migrating database to MySQL...")
    
    # Run Django migrations
    os.system("python manage.py makemigrations")
    os.system("python manage.py migrate")
    
    # Import sample data
    os.system("python manage.py import_data")
    
    print("Database migration completed successfully")

if __name__ == "__main__":
    migrate_to_mysql()
