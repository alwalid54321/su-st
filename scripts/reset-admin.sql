-- ADMIN USER ONLY - Quick Reset Script
-- Use this to quickly reset/update just the admin account
-- Password: #SUDApassword.STOCK3

DELETE FROM core_user WHERE email = 'sudastock249@gmail.com';

INSERT INTO core_user (
    username, 
    email, 
    password, 
    first_name,
    last_name,
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
    '$2b$10$I9YtfSUKrCkUn4pT5NlkWOsjfijIYyAh5q.i9Z2cSLTTdaAM83tlBe',
    'Mohmed',
    'Salah',
    true, 
    true, 
    true, 
    'premium', 
    NOW(), 
    NOW(), 
    true
);

-- Verify
SELECT 
    id,
    username,
    email,
    is_staff,
    is_superuser,
    plan,
    is_active,
    email_verified,
    '✓ Password: #SUDApassword.STOCK3' as credentials
FROM core_user 
WHERE email = 'sudastock249@gmail.com';
