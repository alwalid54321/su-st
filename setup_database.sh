#!/bin/bash

echo "Setting up MySQL database for SudaStock..."

# Prompt for MySQL root password
read -sp "Enter MySQL root password: " MYSQL_ROOT_PASSWORD
echo

# Create database and user
mysql -u root -p$MYSQL_ROOT_PASSWORD <<EOF
DROP USER IF EXISTS 'sudastock'@'localhost';
CREATE USER 'sudastock'@'localhost' IDENTIFIED BY '#SQLpassword5592';
DROP DATABASE IF EXISTS sudastock;
CREATE DATABASE sudastock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON sudastock.* TO 'sudastock'@'localhost';
FLUSH PRIVILEGES;
EOF

# Check if the commands were successful
if [ $? -eq 0 ]; then
    echo "Database and user created successfully!"
else
    echo "Error: Failed to create database and user."
    exit 1
fi

echo "MySQL setup completed."
