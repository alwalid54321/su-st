#!/bin/bash

# SudaStock Linux Deployment Script
# This script automates the deployment of SudaStock on a Linux server

set -e  # Exit on error

# Colors for output
BLUE='\033[0;34m'
GOLD='\033[0;33m'  # Using gold for accent color
NC='\033[0m'  # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GOLD}SudaStock Linux Deployment Script${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "Primary color: #1B1464 (Dark blue from logo)"
echo -e "Accent color: #786D3C (Gold accent from logo)"
echo -e "${BLUE}======================================${NC}"

# Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo -e "${GOLD}This script must be run as root${NC}" 
   exit 1
fi

# Update system packages
echo -e "\n${BLUE}Updating system packages...${NC}"
apt update
apt upgrade -y

# Install required packages
echo -e "\n${BLUE}Installing required packages...${NC}"
apt install -y python3 python3-pip python3-venv mysql-server nginx supervisor

# Create a user for the application
echo -e "\n${BLUE}Creating application user...${NC}"
if ! id -u sudastock &>/dev/null; then
    useradd -m -s /bin/bash sudastock
    echo "User 'sudastock' created"
else
    echo "User 'sudastock' already exists"
fi

# Create application directory
APP_DIR="/var/www/sudastock"
echo -e "\n${BLUE}Setting up application directory at ${APP_DIR}...${NC}"
mkdir -p $APP_DIR
chown sudastock:sudastock $APP_DIR

# Set up MySQL
echo -e "\n${BLUE}Setting up MySQL database...${NC}"
mysql -u root <<EOF
DROP USER IF EXISTS 'sudastock'@'localhost';
CREATE USER 'sudastock'@'localhost' IDENTIFIED BY '#SQLpassword5592';
DROP DATABASE IF EXISTS sudastock;
CREATE DATABASE sudastock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON sudastock.* TO 'sudastock'@'localhost';
FLUSH PRIVILEGES;
EOF

# Set up Python virtual environment
echo -e "\n${BLUE}Setting up Python virtual environment...${NC}"
su - sudastock -c "python3 -m venv ${APP_DIR}/venv"

# Copy application files
echo -e "\n${BLUE}Copying application files...${NC}"
# Note: You need to manually copy your application files to the server
# or use git clone to get them from your repository

# Install Python dependencies
echo -e "\n${BLUE}Installing Python dependencies...${NC}"
su - sudastock -c "${APP_DIR}/venv/bin/pip install -r ${APP_DIR}/requirements.txt"
su - sudastock -c "${APP_DIR}/venv/bin/pip install gunicorn mysqlclient"

# Run migrations
echo -e "\n${BLUE}Running database migrations...${NC}"
su - sudastock -c "cd ${APP_DIR} && ${APP_DIR}/venv/bin/python manage.py migrate"

# Collect static files
echo -e "\n${BLUE}Collecting static files...${NC}"
su - sudastock -c "cd ${APP_DIR} && ${APP_DIR}/venv/bin/python manage.py collectstatic --noinput"

# Create a custom.css file with the theme colors
echo -e "\n${BLUE}Setting up theme colors...${NC}"
mkdir -p ${APP_DIR}/static/css
cat > ${APP_DIR}/static/css/theme.css <<EOF
:root {
  --primary-dark: #1B1464;  /* Dark blue from logo */
  --accent: #786D3C;  /* Gold accent from logo */
  --primary-light: #f8f9fa;
  --text-dark: #333333;
  --text-light: #ffffff;
}
EOF
chown -R sudastock:sudastock ${APP_DIR}/static

# Set up Gunicorn service
echo -e "\n${BLUE}Setting up Gunicorn service...${NC}"
cat > /etc/supervisor/conf.d/sudastock.conf <<EOF
[program:sudastock]
command=${APP_DIR}/venv/bin/gunicorn --workers 3 --bind unix:${APP_DIR}/sudastock.sock sudastock.wsgi:application
directory=${APP_DIR}
user=sudastock
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/sudastock.log
EOF

# Set up Nginx
echo -e "\n${BLUE}Setting up Nginx...${NC}"
cat > /etc/nginx/sites-available/sudastock <<EOF
server {
    listen 80;
    server_name _;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root ${APP_DIR};
    }

    location /media/ {
        root ${APP_DIR};
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:${APP_DIR}/sudastock.sock;
    }
}
EOF

# Enable the Nginx site
ln -sf /etc/nginx/sites-available/sudastock /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Restart services
echo -e "\n${BLUE}Restarting services...${NC}"
supervisorctl reread
supervisorctl update
supervisorctl restart sudastock
systemctl restart nginx

# Create backup directory
echo -e "\n${BLUE}Setting up backup directory...${NC}"
mkdir -p /var/backups/sudastock
chown sudastock:sudastock /var/backups/sudastock

# Add backup cron job
echo -e "\n${BLUE}Setting up database backup cron job...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * mysqldump -u sudastock -p'#SQLpassword5592' sudastock | gzip > /var/backups/sudastock/db_\$(date +\%Y\%m\%d).sql.gz") | crontab -

echo -e "\n${GOLD}SudaStock deployment completed!${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "Your application should now be running at http://your-server-ip"
echo -e "Make sure to set up SSL/TLS for production use."
echo -e "${BLUE}======================================${NC}"
