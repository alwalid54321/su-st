import os
import sys
import django
from pathlib import Path

def init_database():
    print("Initializing database...")
    
    # Run Django migrations
    os.system("python manage.py makemigrations core")
    os.system("python manage.py migrate")
    
    # Import sample data
    os.system("python manage.py import_data")
    
    print("Database initialization completed successfully")

if __name__ == "__main__":
    init_database()
