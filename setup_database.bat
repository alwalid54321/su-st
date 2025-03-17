@echo off
echo Running MySQL setup script...
mysql -u root -p -e "DROP USER IF EXISTS 'sudastock'@'localhost';"
mysql -u root -p -e "CREATE USER 'sudastock'@'localhost' IDENTIFIED BY '#SQLpassword5592';"
mysql -u root -p -e "DROP DATABASE IF EXISTS sudastock;"
mysql -u root -p -e "CREATE DATABASE sudastock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON sudastock.* TO 'sudastock'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
echo Database setup completed.
pause
