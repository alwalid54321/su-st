-- SQL Script to manually create/update the Super Admin user
-- Run this in your Neon SQL Editor

INSERT INTO core_user (
    username, 
    email, 
    password, 
    is_staff, 
    is_active, 
    is_superuser, 
    plan, 
    date_joined, 
    last_login, 
    email_verified
) 
VALUES (
    'Mohmed Salah', 
    'sudastock249@gmail.com', 
    '$2b$10$Pwp2X7ppHv0gR68OknSz1u4jARb/99suczfZZCgi4ppiaFKtBdvey', 
    true, 
    true, 
    true, 
    'premium', 
    NOW(), 
    NOW(), 
    true
)
ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    is_staff = true,
    is_superuser = true,
    plan = 'premium',
    is_active = true,
    email_verified = true,
    last_login = NOW();
