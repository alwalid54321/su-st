# SudaStock

A Django-based web application for tracking market data, currencies, and announcements.

## Features

- User authentication (login, register, logout)
- Market data management
- Currency tracking
- Announcements system
- Admin dashboard

## Theme Colors

- **Primary Dark: #1B1464** (Dark blue from logo)
- **Accent: #786D3C** (Gold accent from logo)

All UI elements follow this theme and are responsive.

## Requirements

- Python 3.8+
- MySQL 5.7+
- Node.js and npm (for frontend development)

## Installation

### Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sudastock.git
   cd sudastock
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up MySQL database:
   ```
   # For Linux/Mac:
   chmod +x setup_database.sh
   ./setup_database.sh
   
   # Or manually create the database and user in MySQL:
   CREATE DATABASE sudastock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'sudastock'@'localhost' IDENTIFIED BY '#SQLpassword5592';
   GRANT ALL PRIVILEGES ON sudastock.* TO 'sudastock'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Run migrations to set up the database schema:
   ```
   python migrate_to_mysql.py
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```
   python manage.py runserver
   ```

## Production Deployment (Linux)

For production deployment on a Linux server, follow these steps:

1. Copy all project files to your server

2. Make the deployment script executable:
   ```
   chmod +x deploy_linux.sh
   ```

3. Run the deployment script as root:
   ```
   sudo ./deploy_linux.sh
   ```

4. The script will:
   - Update system packages
   - Install required dependencies (Python, MySQL, Nginx, Supervisor)
   - Create a dedicated user for the application
   - Set up the MySQL database
   - Configure a Python virtual environment
   - Run database migrations
   - Set up Gunicorn with Supervisor
   - Configure Nginx as a reverse proxy
   - Set up automated database backups

5. After deployment, your site will be available at your server's IP address.

6. For security, make sure to:
   - Set up SSL/TLS with Let's Encrypt
   - Configure a firewall
   - Change default passwords

## API Endpoints

### Authentication

- `POST /api/auth/login/` - Login
- `POST /api/auth/register/` - Register
- `POST /api/auth/logout/` - Logout

### Market Data

- `GET /api/market-data/` - List all market data
- `GET /api/market-data/<id>/` - Get specific market data
- `POST /api/market-data/` - Create market data (admin only)
- `PUT /api/market-data/<id>/` - Update market data (admin only)
- `DELETE /api/market-data/<id>/` - Delete market data (admin only)

### Currencies

- `GET /api/currencies/` - List all currencies
- `GET /api/currencies/<id>/` - Get specific currency
- `POST /api/currencies/` - Create currency (admin only)
- `PUT /api/currencies/<id>/` - Update currency (admin only)
- `DELETE /api/currencies/<id>/` - Delete currency (admin only)

### Announcements

- `GET /api/announcements/` - List all announcements
- `GET /api/announcements/<id>/` - Get specific announcement
- `POST /api/announcements/` - Create announcement (admin only)
- `PUT /api/announcements/<id>/` - Update announcement (admin only)
- `DELETE /api/announcements/<id>/` - Delete announcement (admin only)

## Admin Dashboard

Access the admin dashboard at `/admin/` with your superuser credentials.