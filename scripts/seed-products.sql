-- PART 1: Products, Announcements, Ports, Variations
-- Run this in Neon SQL Editor first

-- ============================================
-- MARKET DATA (Products)
-- ============================================
INSERT INTO core_marketdata (name, value, port_sudan, dmt_china, dmt_uae, dmt_mersing, dmt_india, status, forecast, trend, image_url, category, is_current, last_update, created_at) VALUES
('White Sesame Seeds', 1850.00, 1820.00, 1890.00, 1870.00, 1880.00, 1860.00, 'Active', 'Rising', 5, '/images/products/sesame_white.jpg', 'sesame', true, NOW(), NOW()),
('Brown Sesame Seeds', 1720.00, 1690.00, 1750.00, 1735.00, 1740.00, 1730.00, 'Active', 'Stable', 2, '/images/products/sesame_brown.jpg', 'sesame', true, NOW(), NOW()),
('Gum Arabic (Hashab)', 3250.00, 3200.00, 3300.00, 3280.00, 3290.00, 3270.00, 'Active', 'Rising', 8, '/images/products/gum_arabic.jpg', 'gum', true, NOW(), NOW()),
('Gum Arabic (Talha)', 2890.00, 2850.00, 2920.00, 2910.00, 2905.00, 2895.00, 'Active', 'Stable', 1, '/images/products/gum_talha.jpg', 'gum', true, NOW(), NOW()),
('Raw Cotton', 2150.00, 2100.00, 2180.00, 2165.00, 2170.00, 2160.00, 'Limited', 'Falling', -3, '/images/products/cotton.jpg', 'textile', true, NOW(), NOW()),
('Sorghum', 420.00, 410.00, 435.00, 428.00, 430.00, 425.00, 'Active', 'Rising', 4, '/images/products/sorghum.jpg', 'grain', true, NOW(), NOW()),
('Hibiscus Flower', 1250.00, 1220.00, 1275.00, 1260.00, 1265.00, 1255.00, 'Active', 'Stable', 0, '/images/products/hibiscus.jpg', 'others', true, NOW(), NOW()),
('Peanuts (Groundnuts)', 1580.00, 1550.00, 1610.00, 1595.00, 1600.00, 1590.00, 'Active', 'Rising', 6, '/images/products/peanuts.jpg', 'others', true, NOW(), NOW()),
('Watermelon Seeds', 980.00, 960.00, 1000.00, 990.00, 995.00, 985.00, 'Active', 'Stable', 1, '/images/products/watermelon_seeds.jpg', 'others', true, NOW(), NOW()),
('Livestock (Cattle)', 45000.00, 44000.00, 46500.00, 45800.00, 46000.00, 45500.00, 'Limited', 'Rising', 3, '/images/products/livestock.jpg', 'livestock', true, NOW(), NOW());

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
INSERT INTO core_announcement (title, content, priority, category, is_active, is_featured, created_at, updated_at) VALUES
('New Export Routes to China', 'SudaStock is pleased to announce new direct shipping routes to major Chinese ports, reducing transit time by 30%.', 'high', 'news', true, true, NOW(), NOW()),
('Gum Arabic Price Update', 'Due to increased global demand, Hashab gum prices have risen 8% this month. Talha remains stable.', 'medium', 'alert', true, false, NOW(), NOW()),
('Platform Upgrade Complete', 'Our system has been upgraded with enhanced security features and faster data processing.', 'low', 'update', true, false, NOW(), NOW()),
('Special Offer: Premium Subscription', 'Get 1 year of market history data with our Premium plan. Limited time offer!', 'high', 'promotion', true, true, NOW(), NOW()),
('Sesame Export Season Begins', 'The 2026 white sesame export season has officially started. Current quality reports are excellent.', 'medium', 'news', true, false, NOW(), NOW());

-- ============================================
-- PORTS
-- ============================================
INSERT INTO core_port (name, location, is_active, created_at, updated_at) VALUES
('Port Sudan', 'Red Sea, Sudan', true, NOW(), NOW()),
('Jebel Ali', 'Dubai, UAE', true, NOW(), NOW()),
('Shanghai', 'China', true, NOW(), NOW()),
('Mumbai', 'India', true, NOW(), NOW()),
('Mersing', 'Malaysia', true, NOW(), NOW()),
('Jeddah', 'Saudi Arabia', true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET location = EXCLUDED.location;

-- ============================================
-- PRODUCT VARIATIONS
-- ============================================
INSERT INTO core_productvariation (name, description, is_active, created_at, updated_at) VALUES
('Premium Grade', 'Highest quality, handpicked selection', true, NOW(), NOW()),
('Standard Grade', 'Standard commercial quality', true, NOW(), NOW()),
('Organic Certified', 'Certified organic farming practices', true, NOW(), NOW()),
('Conventional', 'Traditional farming methods', true, NOW(), NOW());

-- ============================================
-- GALLERY IMAGES
-- ============================================
INSERT INTO core_galleryimage (title, image_url, description, "order", is_active, is_current, created_at, updated_at) VALUES
('Sudan Sesame Farm', '/images/gallery/sesame_farm.jpg', 'Vast sesame fields in Eastern Sudan', 1, true, true, NOW(), NOW()),
('Gum Arabic Harvest', '/images/gallery/gum_harvest.jpg', 'Traditional gum arabic tapping', 2, true, true, NOW(), NOW()),
('Port Sudan Loading', '/images/gallery/port_loading.jpg', 'Container ships at Port Sudan', 3, true, true, NOW(), NOW()),
('Cotton Processing', '/images/gallery/cotton_processing.jpg', 'Modern cotton processing facility', 4, true, true, NOW(), NOW()),
('Livestock Market', '/images/gallery/livestock_market.jpg', 'Traditional livestock trading', 5, true, true, NOW(), NOW());

-- Verify
SELECT 'Products seeded!' as status, COUNT(*) as product_count FROM core_marketdata;
SELECT 'Announcements seeded!' as status, COUNT(*) as announcement_count FROM core_announcement;
SELECT 'Ports seeded!' as status, COUNT(*) as port_count FROM core_port;
