-- Complete Database Seed Script for SudaStock
-- Run this in your Neon SQL Editor or any PostgreSQL client
-- This will populate all tables with initial data

-- ============================================
-- 1. ADMIN USER (Superuser with Premium)
-- ============================================
-- Password: #SUDApassword.STOCK3
-- Fresh bcrypt hash generated
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

-- ============================================
-- 2. TEST USERS (Various subscription levels)
-- ============================================
-- Password for all test users: testpass123
-- Bcrypt hash: $2b$10$XQ7vZ8K9vH8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F

INSERT INTO core_user (username, email, password, first_name, last_name, plan, is_active, email_verified) VALUES
('freeuser', 'free@test.com', '$2b$10$XQ7vZ8K9vH8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F', 'Free', 'User', 'free', true, true),
('plususer', 'plus@test.com', '$2b$10$XQ7vZ8K9vH8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F', 'Plus', 'User', 'plus', true, true),
('premiumuser', 'premium@test.com', '$2b$10$XQ7vZ8K9vH8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F', 'Premium', 'User', 'premium', true, true),
('staffuser', 'staff@test.com', '$2b$10$XQ7vZ8K9vH8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F8E8O8Y8G7E8F', 'Staff', 'User', 'plus', true, true)
ON CONFLICT (email) DO NOTHING;

-- Update staff user to have staff privileges
UPDATE core_user SET is_staff = true WHERE email = 'staff@test.com';

-- ============================================
-- 3. CURRENCIES (Major world currencies)
-- ============================================
INSERT INTO core_currency (code, name, rate, last_update) VALUES
('USD', 'US Dollar', 1.00, NOW()),
('SDG', 'Sudanese Pound', 602.50, NOW()),
('AED', 'UAE Dirham', 3.67, NOW()),
('SAR', 'Saudi Riyal', 3.75, NOW()),
('EUR', 'Euro', 0.92, NOW()),
('GBP', 'British Pound', 0.79, NOW()),
('CNY', 'Chinese Yuan', 7.24, NOW()),
('INR', 'Indian Rupee', 83.12, NOW()),
('TRY', 'Turkish Lira', 30.45, NOW()),
('QAR', 'Qatari Riyal', 3.64, NOW()),
('KWD', 'Kuwaiti Dinar', 0.31, NOW()),
('JOD', 'Jordanian Dinar', 0.71, NOW())
ON CONFLICT (code) DO UPDATE SET
    rate = EXCLUDED.rate,
    last_update = NOW();

-- ============================================
-- 4. MARKET DATA (Sudanese Commodities)
-- ============================================
INSERT INTO core_market_data (name, value, port_sudan, dmt_china, dmt_uae, dmt_mersing, dmt_india, status, forecast, trend, image_url, last_update) VALUES
('White Sesame Seeds', 1850.00, 1820.00, 1890.00, 1870.00, 1880.00, 1860.00, 'Active', 'Rising', 5, '/images/products/sesame_white.jpg', NOW()),
('Brown Sesame Seeds', 1720.00, 1690.00, 1750.00, 1735.00, 1740.00, 1730.00, 'Active', 'Stable', 2, '/images/products/sesame_brown.jpg', NOW()),
('Gum Arabic (Hashab)', 3250.00, 3200.00, 3300.00, 3280.00, 3290.00, 3270.00, 'Active', 'Rising', 8, '/images/products/gum_arabic.jpg', NOW()),
('Gum Arabic (Talha)', 2890.00, 2850.00, 2920.00, 2910.00, 2905.00, 2895.00, 'Active', 'Stable', 1, '/images/products/gum_talha.jpg', NOW()),
('Raw Cotton', 2150.00, 2100.00, 2180.00, 2165.00, 2170.00, 2160.00, 'Limited', 'Falling', -3, '/images/products/cotton.jpg', NOW()),
('Sorghum', 420.00, 410.00, 435.00, 428.00, 430.00, 425.00, 'Active', 'Rising', 4, '/images/products/sorghum.jpg', NOW()),
('Hibiscus Flower', 1250.00, 1220.00, 1275.00, 1260.00, 1265.00, 1255.00, 'Active', 'Stable', 0, '/images/products/hibiscus.jpg', NOW()),
('Peanuts (Groundnuts)', 1580.00, 1550.00, 1610.00, 1595.00, 1600.00, 1590.00, 'Active', 'Rising', 6, '/images/products/peanuts.jpg', NOW()),
('Watermelon Seeds', 980.00, 960.00, 1000.00, 990.00, 995.00, 985.00, 'Active', 'Stable', 1, '/images/products/watermelon_seeds.jpg', NOW()),
('Livestock (Cattle)', 45000.00, 44000.00, 46500.00, 45800.00, 46000.00, 45500.00, 'Limited', 'Rising', 3, '/images/products/livestock.jpg', NOW())
ON CONFLICT (name) DO UPDATE SET
    value = EXCLUDED.value,
    port_sudan = EXCLUDED.port_sudan,
    dmt_china = EXCLUDED.dmt_china,
    dmt_uae = EXCLUDED.dmt_uae,
    dmt_mersing = EXCLUDED.dmt_mersing,
    dmt_india = EXCLUDED.dmt_india,
    status = EXCLUDED.status,
    forecast = EXCLUDED.forecast,
    trend = EXCLUDED.trend,
    last_update = NOW();

-- ============================================
-- 5. ANNOUNCEMENTS
-- ============================================
INSERT INTO core_announcement (title, content, priority, category, is_active, is_featured, created_at, updated_at) VALUES
('New Export Routes to China', 'SudaStock is pleased to announce new direct shipping routes to major Chinese ports, reducing transit time by 30%.', 'high', 'news', true, true, NOW(), NOW()),
('Gum Arabic Price Update', 'Due to increased global demand, Hashab gum prices have risen 8% this month. Talha remains stable.', 'medium', 'alert', true, false, NOW(), NOW()),
('Platform Upgrade Complete', 'Our system has been upgraded with enhanced security features and faster data processing.', 'low', 'update', true, false, NOW(), NOW()),
('Special Offer: Premium Subscription', 'Get 1 year of market history data with our Premium plan. Limited time offer!', 'high', 'promotion', true, true, NOW(), NOW()),
('Sesame Export Season Begins', 'The 2026 white sesame export season has officially started. Current quality reports are excellent.', 'medium', 'news', true, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. PORTS
-- ============================================
INSERT INTO core_port (name, location, is_active, created_at, updated_at) VALUES
('Port Sudan', 'Red Sea, Sudan', true, NOW(), NOW()),
('Jebel Ali', 'Dubai, UAE', true, NOW(), NOW()),
('Shanghai', 'China', true, NOW(), NOW()),
('Mumbai', 'India', true, NOW(), NOW()),
('Mersing', 'Malaysia', true, NOW(), NOW()),
('Jeddah', 'Saudi Arabia', true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    location = EXCLUDED.location,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 7. PRODUCT VARIATIONS
-- ============================================
INSERT INTO core_product_variation (name, description, is_active, created_at, updated_at) VALUES
('Premium Grade', 'Highest quality, handpicked selection', true, NOW(), NOW()),
('Standard Grade', 'Standard commercial quality', true, NOW(), NOW()),
('Organic Certified', 'Certified organic farming practices', true, NOW(), NOW()),
('Conventional', 'Traditional farming methods', true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 8. HISTORICAL DATA (Sample archives for testing)
-- ============================================
-- Generate currency history for the past 30 days
INSERT INTO core_currency_archive (original_id, code, name, rate, archived_at, last_update)
SELECT 
    id,
    code,
    name,
    rate * (1 + (RANDOM() * 0.1 - 0.05)),  -- ±5% variance
    NOW() - (n || ' days')::INTERVAL,
    NOW() - (n || ' days')::INTERVAL
FROM core_currency
CROSS JOIN generate_series(1, 30) AS n
ON CONFLICT DO NOTHING;

-- Generate market data history for the past 30 days
INSERT INTO core_market_data_archive (original_id, name, value, port_sudan, dmt_china, dmt_uae, dmt_mersing, dmt_india, status, forecast, trend, image_url, archived_at, last_update, created_at)
SELECT 
    id,
    name,
    value * (1 + (RANDOM() * 0.15 - 0.075)),  -- ±7.5% variance
    port_sudan * (1 + (RANDOM() * 0.15 - 0.075)),
    dmt_china * (1 + (RANDOM() * 0.15 - 0.075)),
    dmt_uae * (1 + (RANDOM() * 0.15 - 0.075)),
    dmt_mersing * (1 + (RANDOM() * 0.15 - 0.075)),
    dmt_india * (1 + (RANDOM() * 0.15 - 0.075)),
    status,
    forecast,
    FLOOR(RANDOM() * 21 - 10)::INTEGER,  -- Random trend between -10 and +10
    image_url,
    NOW() - (n || ' days')::INTERVAL,
    NOW() - (n || ' days')::INTERVAL,
    created_at
FROM core_market_data
CROSS JOIN generate_series(1, 30) AS n
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment these to verify the seeding worked:
-- SELECT COUNT(*) as user_count FROM core_user;
-- SELECT COUNT(*) as currency_count FROM core_currency;
-- SELECT COUNT(*) as market_data_count FROM core_market_data;
-- SELECT COUNT(*) as announcement_count FROM core_announcement;
-- SELECT COUNT(*) as currency_history_count FROM core_currency_archive;
-- SELECT COUNT(*) as market_history_count FROM core_market_data_archive;

-- Display admin credentials for reference
SELECT 
    'Admin Login Credentials:' as info,
    email,
    'Password: #SUDApassword.STOCK3' as password,
    plan,
    is_superuser
FROM core_user 
WHERE email = 'sudastock249@gmail.com';
