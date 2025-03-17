-- Drop the user if it exists (to avoid errors)
DROP USER IF EXISTS 'sudastock'@'localhost';

-- Create the sudastock user with the same password
CREATE USER 'sudastock'@'localhost' IDENTIFIED BY '#SQLpassword5592';

-- Drop the database if it exists
DROP DATABASE IF EXISTS sudastock;

-- Create the new database
CREATE DATABASE sudastock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON sudastock.* TO 'sudastock'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;
