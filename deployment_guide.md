# SudaStock Deployment Guide

This guide provides step-by-step instructions for deploying the SudaStock application to a production environment with MySQL.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Environment](#development-environment)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Static Files](#static-files)
6. [Web Server Configuration](#web-server-configuration)
7. [SSL/TLS Setup](#ssltls-setup)
8. [Deployment Process](#deployment-process)
9. [Maintenance](#maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- A server with Python 3.8+ installed
- MySQL 5.7+ installed and running
- Domain name configured to point to your server
- SSH access to your server

## Development Environment

### Running the Development Server

The Django development server only supports HTTP, not HTTPS. If you're seeing errors like:

```
You're accessing the development server over HTTPS, but it only supports HTTP.
```

Make sure to:

1. Access the development server using `http://` not `https://`
2. Update all callback URLs in your `.env` file to use `http://` for development
3. Set `SECURE_SSL_REDIRECT=False` in your `.env` file during development

```bash
# Run the development server
python manage.py runserver
```

### Theme Configuration

The SudaStock website uses the following color scheme:

- Primary Dark: `#1B1464` (Dark blue from logo)
- Accent: `#786D3C` (Gold accent from logo)

These colors are configured in the `.env` file and are applied throughout the website.

### Switching Between Development and Production

The application is configured to use SQLite in development and MySQL in production. To switch:

1. For development:
   - Set `DEBUG=True` in `.env`
   - Comment out `DB_ENGINE=mysql` in `.env`
   - Use HTTP URLs for all callbacks

2. For production:
   - Set `DEBUG=False` in `.env`
   - Set `DB_ENGINE=mysql` in `.env`
   - Use HTTPS URLs for all callbacks
   - Enable security settings in `.env`

## Database Setup

### 1. Create MySQL Database and User

```sql
CREATE DATABASE sudastock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sudastock'@'localhost' IDENTIFIED BY '#SQLpassword5592';
GRANT ALL PRIVILEGES ON sudastock.* TO 'sudastock'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configure MySQL for Production

Edit your MySQL configuration file (usually `/etc/mysql/my.cnf` or `/etc/mysql/mysql.conf.d/mysqld.cnf`):

```ini
[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default-storage-engine = InnoDB
innodb_buffer_pool_size = 256M
max_connections = 100
```

Restart MySQL:

```bash
sudo systemctl restart mysql
```

## Environment Configuration

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sudastock.git /var/www/sudastock
cd /var/www/sudastock
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Update the `.env` file with your production settings. Make sure to change:

- `DEBUG=False`
- `DB_ENGINE=mysql`
- `ALLOWED_HOSTS` to include your domain
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` for your MySQL setup
- `SECRET_KEY` to a secure random string
- Email settings
- OAuth callback URLs to use your domain with HTTPS
- Enable security settings:
  ```
  SECURE_SSL_REDIRECT=True
  SESSION_COOKIE_SECURE=True
  CSRF_COOKIE_SECURE=True
  SECURE_HSTS_SECONDS=31536000
  SECURE_HSTS_INCLUDE_SUBDOMAINS=True
  SECURE_HSTS_PRELOAD=True
  ```

### 5. Apply Migrations

```bash
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

## Static Files

### 1. Collect Static Files

```bash
python manage.py collectstatic --no-input
```

### 2. Configure Media Directory

```bash
mkdir -p /var/www/sudastock/media
chmod 755 /var/www/sudastock/media
```

## Web Server Configuration

### Using Gunicorn with Nginx

#### 1. Create a Gunicorn Service

Create a file `/etc/systemd/system/sudastock.service`:

```ini
[Unit]
Description=SudaStock Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/sudastock
ExecStart=/var/www/sudastock/venv/bin/gunicorn --workers 4 --threads 2 --timeout 120 --bind unix:/var/www/sudastock/sudastock.sock sudastock.wsgi:application
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### 2. Start and Enable the Service

```bash
sudo systemctl start sudastock
sudo systemctl enable sudastock
```

#### 3. Configure Nginx

Create a file `/etc/nginx/sites-available/sudastock`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /var/www/sudastock;
    }
    
    location /media/ {
        root /var/www/sudastock;
    }
    
    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/sudastock/sudastock.sock;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
}
```

#### 4. Enable the Nginx Configuration

```bash
sudo ln -s /etc/nginx/sites-available/sudastock /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/TLS Setup

### Using Let's Encrypt with Certbot

#### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

#### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 3. Auto-renewal

Certbot sets up auto-renewal by default. Verify with:

```bash
sudo systemctl status certbot.timer
```

## Deployment Process

### Initial Deployment

1. Clone the repository to your server
2. Set up the virtual environment and install dependencies
3. Configure environment variables
4. Set up the database
5. Collect static files
6. Configure Gunicorn and Nginx
7. Set up SSL/TLS

### Updates

For future updates:

1. Pull the latest changes:
   ```bash
   cd /var/www/sudastock
   git pull
   ```

2. Install any new dependencies:
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Apply migrations:
   ```bash
   python manage.py migrate
   ```

4. Collect static files:
   ```bash
   python manage.py collectstatic --no-input
   ```

5. Restart Gunicorn:
   ```bash
   sudo systemctl restart sudastock
   ```

## Maintenance

### Backup Strategy

#### Database Backups

Set up a cron job for daily backups:

```bash
# Add to crontab
0 2 * * * mysqldump -u sudastock -p'#SQLpassword5592' sudastock | gzip > /var/backups/sudastock/db_$(date +\%Y\%m\%d).sql.gz
```

#### Media Backups

Set up a cron job for weekly media backups:

```bash
# Add to crontab
0 3 * * 0 tar -czf /var/backups/sudastock/media_$(date +\%Y\%m\%d).tar.gz /var/www/sudastock/media
```

### Monitoring

Consider setting up monitoring with:

- Sentry for error tracking (already configured in settings)
- Prometheus + Grafana for system monitoring
- Uptime Robot for basic uptime monitoring

### Security Updates

Regularly update your system and dependencies:

```bash
# System updates
sudo apt update && sudo apt upgrade

# Python dependencies
pip install -U -r requirements.txt
```

## Optimizing Media Files

For optimal performance, ensure all media files are properly optimized:

1. Compress images using tools like TinyPNG or ImageOptim
2. Convert videos to optimized formats (H.264/MP4 for compatibility)
3. Keep video file sizes under 10MB for hero backgrounds
4. Consider using a CDN for media delivery in high-traffic scenarios

## Troubleshooting

### Common Issues

1. **HTTPS in Development**
   - Error: `You're accessing the development server over HTTPS, but it only supports HTTP.`
   - Solution: Use `http://` instead of `https://` when accessing the development server
   - For production, use Nginx with Let's Encrypt to handle HTTPS

2. **Database Connection Errors**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure MySQL user has proper permissions

3. **Static Files Not Loading**
   - Check STATIC_ROOT and STATIC_URL settings
   - Verify Nginx configuration for static files location
   - Run collectstatic again

4. **500 Server Errors**
   - Check Gunicorn logs: `sudo journalctl -u sudastock`
   - Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
   - Verify permissions on project files
