-- ============================================================================
-- Lennox ChinaMall — Master Database Seed SQL
-- ============================================================================

-- 1. Categories
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('4K Drones & FPV', 'drones-fpv', 'Factory-direct 4K GPS drones, brushless motors, FPV cinewhoop racers, and goggles', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&auto=format&fit=crop&q=80', 'Camera', 1, true, '4K Drones & FPV Racing - Lennox ChinaMall', 'Wholesale 4K GPS drones and FPV racing equipment.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('3D Printers & Laser CNC', '3d-printers', 'High precision FDM 3D printers, SLA resin printers, laser engravers, and filaments', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80', 'Printer', 2, true, '3D Printers & Laser CNC - Lennox ChinaMall', 'Direct-from-factory 3D printers and precision laser engravers.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Pro Audio & Boomboxes', 'audio-electronics', 'Heavy bass Bluetooth boomboxes, studio monitor headphones, and wireless mic systems', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80', 'Headphones', 3, true, 'Pro Audio & Boomboxes - Lennox ChinaMall', 'High fidelity Bluetooth speakers and audio equipment.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Men''s Fashion', 'mens-fashion', 'Factory-direct men''s apparel, footwear, streetwear, and accessories', 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&auto=format&fit=crop&q=80', 'Shirt', 4, true, 'Men''s Fashion & Apparel - Lennox ChinaMall', 'Direct-from-factory men''s clothing and fashion goods.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Women''s Fashion', 'womens-fashion', 'Trendy women''s clothing, dresses, designer bags, and jewelry', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80', 'ShoppingBag', 5, true, 'Women''s Fashion & Dresses - Lennox ChinaMall', 'Boutique dresses and accessories straight from verified manufacturers.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Kid''s Fashion', 'kids-fashion', 'Comfortable, stylish children''s clothing and footwear', 'https://images.unsplash.com/photo-1503944570678-75c1a7d6e42b?w=1200&auto=format&fit=crop&q=80', 'Baby', 6, true, 'Kid''s Fashion & Wear - Lennox ChinaMall', 'Direct children''s clothing and sets at wholesale prices.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Health & Beauty', 'health-beauty', 'Skincare, cosmetics, personal care, and massage wellness', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80', 'Sparkles', 7, true, 'Health & Beauty - Lennox ChinaMall', 'Top grade skincare and beauty products.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Pet Supplies', 'pet-supplies', 'Pet toys, feeders, grooming supplies, and comfy pet beds', 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80', 'Footprints', 8, true, 'Pet Supplies & Accessories - Lennox ChinaMall', 'Wholesale pet care accessories and automatic feeders.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Home & Kitchen', 'home-kitchen', 'Kitchen appliances, blenders, air fryers, and modern home essentials', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80', 'Utensils', 9, true, 'Home & Kitchen - Lennox ChinaMall', 'High performance kitchen appliances and home living gadgets.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Baby & Toddler', 'baby-toddler', 'Infant care, strollers, baby clothes, and safety toys', 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=1200&auto=format&fit=crop&q=80', 'Baby', 10, true, 'Baby & Toddler Essentials - Lennox ChinaMall', 'Safe and verified baby care items.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Sports & Outdoors', 'sports-outdoors', 'Fitness gear, balls, sports equipment, and camping hardware', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80', 'Dumbbell', 11, true, 'Sports & Outdoors - Lennox ChinaMall', 'Direct fitness hardware, sports accessories, and outdoor gear.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Consumer Electronics', 'consumer-electronics', 'Factory-direct smart gadgets, audio, cameras, and accessories', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeede?w=1200&auto=format&fit=crop&q=80', 'Smartphone', 12, true, 'Consumer Electronics - Lennox ChinaMall', 'Direct-from-factory electronics, audio gears, and smart gadgets in USDT.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Tools & DIY Hardware', 'tools-diy-hardware', 'Laser engravers, 3D printers, soldering stations, and precision tools', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80', 'Wrench', 13, true, 'Tools, 3D Printers & Industrial - Lennox ChinaMall', 'Professional maker tools, CNC machines, and soldering kits.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;
INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES ('Automotive & E-Mobility', 'automotive-e-mobility', 'OBD2 diagnostic scanners, dash cams, and electric scooter accessories', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80', 'Car', 14, true, 'Car Electronics & Diagnostic Tools - Lennox ChinaMall', 'Direct automotive tools, jump starters, and dashcams.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

-- 2. Brands
INSERT INTO public.brands (name, slug, logo_url, description, is_active)
VALUES ('Eachine Labs', 'eachine-labs', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=200&auto=format&fit=crop&q=80', 'FPV & Aerial RC Tech', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.brands (name, slug, logo_url, description, is_active)
VALUES ('BlitzWolf', 'blitzwolf', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80', 'Audio & Power Accessories', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.brands (name, slug, logo_url, description, is_active)
VALUES ('Creality 3D', 'creality-3d', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80', 'Desktop 3D Printing & Laser', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.brands (name, slug, logo_url, description, is_active)
VALUES ('Astrolux EDC', 'astrolux-edc', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=200&auto=format&fit=crop&q=80', 'High Performance Flashlights', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
INSERT INTO public.brands (name, slug, logo_url, description, is_active)
VALUES ('Topshak Tools', 'topshak-tools', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&auto=format&fit=crop&q=80', 'Power Tools & Solder Gear', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 3. Suppliers
INSERT INTO public.suppliers (code, name, contact, platform, source_url, region, lead_time_days, status, reliability_notes)
VALUES ('SUP-GZ-4419', 'Guangzhou Eachine Drone Manufacturing Co., Ltd.', 'Ms. Chen (WeChat: eachine_drone_direct)', '1688 / Factory Direct', 'https://1688.com', 'Guangzhou, Guangdong', 2, 'active', 'Grade A supplier. Same day dispatch for drone units. 99.4% quality pass rate.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  contact = EXCLUDED.contact,
  platform = EXCLUDED.platform,
  source_url = EXCLUDED.source_url,
  region = EXCLUDED.region,
  lead_time_days = EXCLUDED.lead_time_days,
  status = EXCLUDED.status,
  reliability_notes = EXCLUDED.reliability_notes;
INSERT INTO public.suppliers (code, name, contact, platform, source_url, region, lead_time_days, status, reliability_notes)
VALUES ('SUP-SZ-9021', 'Shenzhen BlitzWolf Acoustic Technologies', 'Mr. Lin (WhatsApp: +86 138 0000 8888)', 'AliExpress Wholesale / Direct', 'https://aliexpress.com', 'Shenzhen, Guangdong', 1, 'active', 'Excellent audio manufacturer with international CE/FCC/RoHS certificates.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  contact = EXCLUDED.contact,
  platform = EXCLUDED.platform,
  source_url = EXCLUDED.source_url,
  region = EXCLUDED.region,
  lead_time_days = EXCLUDED.lead_time_days,
  status = EXCLUDED.status,
  reliability_notes = EXCLUDED.reliability_notes;
INSERT INTO public.suppliers (code, name, contact, platform, source_url, region, lead_time_days, status, reliability_notes)
VALUES ('SUP-SZ-CRE-88', 'Creality 3D Official Sourcing Hub', 'Direct Channel B2B', 'Creality B2B China Portal', 'https://creality.cn', 'Shenzhen, Guangdong', 3, 'active', 'Official distributor channel. Includes 1-year factory warranty guarantee.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  contact = EXCLUDED.contact,
  platform = EXCLUDED.platform,
  source_url = EXCLUDED.source_url,
  region = EXCLUDED.region,
  lead_time_days = EXCLUDED.lead_time_days,
  status = EXCLUDED.status,
  reliability_notes = EXCLUDED.reliability_notes;

-- 4. Products, Variants, Media, and Videos

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'drones-fpv' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'eachine-labs' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'Eachine EX5 4K GPS 5G WiFi FPV Brushless RC Drone with 30min Flight Time', 'eachine-ex5-4k-gps-fpv-drone', 'EAC-EX5-4K-BLK', 'Ultra-compact foldable 4K UHD camera drone with GPS return-to-home, optical flow positioning, and 1000m range.',
    '### Flagship Sourced Aerial Drone for Enthusiasts
The Eachine EX5 combines commercial-grade GPS dual satellite positioning with a 4K UHD motorized tilt camera. Powered by brushless motors for wind resistance up to Level 5.

#### Key Features:
- **4K UHD Camera**: Electronic Image Stabilization with 90° adjustable angle
- **Intelligent GPS Return**: Automatic return on low battery or signal loss
- **Long Battery Endurance**: High capacity 7.4V 2200mAh modular battery delivers up to 30 mins
- **Brushless Power**: Low noise, high longevity, resistant against strong gusts
- **Waypoints & Orbit Mode**: Program flights directly on mobile app with live 5G FPV stream.', v_cat_id, v_brand_id, 89.99, 159.99,
    48.5, 'published'::public.product_status,
    true, true, false,
    true, '{"drone","4k","gps","fpv","brushless"}'::text[], 0.85,
    '{"length":24,"width":19,"height":7,"unit":"cm","volumetric_weight":0.64,"cbm":0.0032}'::jsonb, 'Shenzhen, Guangdong, China',
    '8806.22.00', 'SUP-GZ-4419', 'Eachine EX5 4K GPS FPV Drone - Direct from China in USDT',
    'Buy Eachine EX5 4K GPS drone with 30min battery and 5G FPV live stream at direct factory price with USDT.', 4.85, 248, 1890
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80', 'Eachine EX5 Drone in Flight', 'image', 1);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80', 'Drone Remote Controller & Folded Body', 'image', 2);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', 'Electronics and Brushless Motor Close-up', 'image', 3);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=80', 'Aerial 4K landscape capture view', 'image', 4);
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov', 'uploaded', 1, 'Video 1: Drone Flight Test & Range Demo');
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov', 'uploaded', 2, 'Video 2: Unboxing & Dual Battery Setup');
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'EAC-EX5-1BAT', 'Standard Edition', 89.99, 159.99, 48.5, 35, 5, 0.45, '{"Battery":"1 Battery","StorageBag":"Included"}'::jsonb, 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80', 'SUP-GZ-4419-1B', true, 1);
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'EAC-EX5-2BAT', 'Standard Edition', 104.99, 189.99, 57, 22, 5, 0.55, '{"Battery":"2 Batteries (60min)","StorageBag":"Included"}'::jsonb, 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&auto=format&fit=crop&q=80', 'SUP-GZ-4419-2B', true, 2);
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'EAC-EX5-3BAT', 'Standard Edition', 119.99, 219.99, 65, 14, 3, 0.65, '{"Battery":"3 Batteries (90min)","StorageBag":"Included"}'::jsonb, 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80', 'SUP-GZ-4419-3B', true, 3);
END $$;

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'consumer-electronics' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'blitzwolf' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'BlitzWolf BW-WA3 Pro 120W Bluetooth 5.0 Wireless Speaker with RGB Light & Quad Drivers', 'blitzwolf-bw-wa3-pro-120w-bluetooth-speaker', 'BW-WA3-PRO-120W', 'Huge 120W output, DSP heavy bass, 16000mAh emergency powerbank capability, and TWS stereo pairing.',
    '### Extreme Audio Powerhouse
120W quad driver acoustics with dual passive radiators deliver heart-thumping bass and crisp highs. Waterproof IPX5 rating makes it ready for outdoor parties.', v_cat_id, v_brand_id, 69.5, 119,
    38, 'published'::public.product_status,
    true, true, false,
    true, '{"speaker","bluetooth","120w","rgb","waterproof"}'::text[], 1.85,
    '{"length":28,"width":11,"height":11}'::jsonb, 'Shenzhen, China',
    '85182200', 'SUP-SZ-9021', 'BlitzWolf BW-WA3 Pro 120W RGB Bluetooth Speaker - Lennox ChinaMall',
    'Party speaker with 120W output, 16000mAh battery and RGB light show in USDT.', 4.9, 176, 2430
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', 'BlitzWolf 120W Speaker Front View', 'image', 1);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 'Audio Engineering and Bass Drivers', 'image', 2);
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov', 'uploaded', 1, 'Video 1: Bass Test & Decibel Measurement');
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov', 'uploaded', 2, 'Video 2: IPX5 Water Splash Demonstration');
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'BW-WA3-PRO-STD', 'Standard Edition', 69.5, 119, 38, 50, 8, 1.85, '{"Color":"Midnight Black","Mic":"Standard"}'::jsonb, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80', 'SUP-SZ-9021-STD', true, 1);
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'BW-WA3-PRO-MIC', 'Standard Edition', 84.5, 139, 46, 28, 5, 2.1, '{"Color":"Midnight Black","Mic":"2x Wireless Karaoke Mics"}'::jsonb, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80', 'SUP-SZ-9021-MIC', true, 2);
END $$;

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'tools-diy-hardware' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'creality-3d' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'Creality Ender-3 V3 SE High-Speed Auto-Leveling 3D Printer 250mm/s', 'creality-ender-3-v3-se-3d-printer', 'CRE-E3V3SE-US', 'High speed 250mm/s 3D printer with Sprite direct extruder, CR Touch auto-leveling, and dual Z-axis stabilization.',
    '### Next-Gen Fast 3D Printing for Everyone
Assemble and print in under 20 minutes with automatic bed leveling and strain sensor Z-offset calibration.', v_cat_id, v_brand_id, 179, 269,
    112, 'published'::public.product_status,
    true, false, true,
    true, '{"3dprinter","creality","diy","maker","high-speed"}'::text[], 7.2,
    '{"length":45,"width":40,"height":50}'::jsonb, 'Shenzhen, China',
    '84771010', 'SUP-SZ-CRE-88', 'Creality Ender 3 V3 SE 3D Printer - Factory Direct Sourcing',
    'Buy Creality Ender-3 V3 SE direct from China. Fast 250mm/s printing, CR Touch auto-leveling in USDT.', 4.88, 94, 810
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', 'Creality 3D Printer Operating', 'image', 1);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80', 'Sprite Direct Drive Extruder', 'image', 2);
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov', 'uploaded', 1, 'Video 1: 20-Minute Quick Setup & Bed Leveling');
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov', 'uploaded', 2, 'Video 2: High Speed 250mm/s Benchy Speedrun');
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'CRE-E3V3SE-STD', 'Standard Edition', 179, 269, 112, 18, 4, 7.2, '{"Plug":"US Plug (110V-220V)","Bundle":"Standard Kit"}'::jsonb, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80', 'SUP-SZ-CRE-88-US', true, 1);
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'CRE-E3V3SE-FIL', 'Standard Edition', 209, 310, 130, 12, 3, 9.2, '{"Plug":"US Plug (110V-220V)","Bundle":"+ 2KG PLA+ Filament Pack"}'::jsonb, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80', 'SUP-SZ-CRE-88-FIL', true, 2);
END $$;

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'drones-fpv' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'astrolux-edc' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'Astrolux FT03S SFH55 9300LM 927M Ultra Powerful Long-Throw EDC Tactical Flashlight', 'astrolux-ft03s-9300lm-tactical-flashlight', 'AST-FT03S-9300', 'Monster 9300 lumens output with 927 meters beam throw, Anduril 2 UI, Type-C 2A fast recharge, and 26650 battery.',
    '### Extreme Distance Search & Rescue Torch
Equipped with the massive SFH55 LED core, producing raw lighting power comparable to automotive headlights. Solid aerospace aluminum CNC construction.', v_cat_id, v_brand_id, 54.99, 95,
    29.5, 'published'::public.product_status,
    true, true, false,
    true, '{"flashlight","tactical","9300lm","edc","outdoor"}'::text[], 0.38,
    '{"length":17,"width":7,"height":7}'::jsonb, 'Dongguan, China',
    '85131000', 'SUP-DG-ASTRO', 'Astrolux FT03S 9300LM Long Throw Flashlight - Lennox ChinaMall',
    'Buy Astrolux FT03S 9300 lumens EDC flashlight with 927m beam throw in USDT.', 4.92, 312, 3840
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80', 'Astrolux Tactical Flashlight Beam', 'image', 1);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=80', 'Aluminum Head & Cooling Fins', 'image', 2);
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov', 'uploaded', 1, 'Video 1: 900-Meter Night Beam Distance Test');
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov', 'uploaded', 2, 'Video 2: Anduril 2 UI Ramping & Strobe Guide');
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'AST-FT03S-5700K', 'Standard Edition', 54.99, 95, 29.5, 45, 6, 0.38, '{"Tint":"5700K Natural White","Battery":"Include 5000mAh 26650"}'::jsonb, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&auto=format&fit=crop&q=80', 'SUP-DG-ASTRO-57', true, 1);
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'AST-FT03S-6500K', 'Standard Edition', 54.99, 95, 29.5, 30, 6, 0.38, '{"Tint":"6500K Cool White (Max Lumens)","Battery":"Include 5000mAh 26650"}'::jsonb, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&auto=format&fit=crop&q=80', 'SUP-DG-ASTRO-65', true, 2);
END $$;

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'tools-diy-hardware' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'topshak-tools' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'Topshak TS-ESD4 20V Cordless Brushless Impact Wrench & Screwdriver Drill Kit', 'topshak-ts-esd4-20v-brushless-impact-wrench', 'TOP-TS-ESD4-KIT', 'Heavy duty 350N.m torque, variable speed trigger, LED worklight, and 2x 2000mAh lithium power packs.',
    '### Workshop Grade Power in Your Hands
Built for automotive repair, DIY fabrication, and construction. High efficiency brushless motor eliminates brush wear and optimizes runtime.', v_cat_id, v_brand_id, 49.99, 89.99,
    26, 'published'::public.product_status,
    false, false, true,
    true, '{"tools","impact wrench","drill","brushless","cordless"}'::text[], 2.4,
    '{"length":30,"width":25,"height":10}'::jsonb, 'Zhejiang, China',
    '84672100', 'SUP-ZJ-TOP-44', 'Topshak TS-ESD4 20V Brushless Impact Wrench - Lennox ChinaMall',
    'Buy Topshak 20V 350N.m impact wrench kit with dual batteries directly in USDT.', 4.78, 85, 620
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80', 'Topshak Impact Wrench Tool in Workshop', 'image', 1);
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov', 'uploaded', 1, 'Video 1: Lug Nut Removal & Torque Stress Test');
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov', 'uploaded', 2, 'Video 2: Accessory Kit Overview & Socket Set');
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'TOP-TS-ESD4-2BAT', 'Standard Edition', 49.99, 89.99, 26, 40, 5, 2.4, '{"Batteries":"2x 20V 2.0Ah Packs","Case":"Hard Blow-Mold Case"}'::jsonb, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=80', 'SUP-ZJ-TOP-44-2B', true, 1);
END $$;

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'automotive-e-mobility' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'eachine' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'KONNWEI KW850 OBD2 Car Diagnostic Scanner Code Reader with Live Data Stream', 'konnwei-kw850-obd2-car-diagnostic-scanner', 'KON-KW850-PRO', 'Universal OBDII / EOBD engine fault code scanner with 2.8" TFT color screen, one-click I/M readiness, and battery health tester.',
    '### Professional Auto Mechanic in Your Glovebox
Diagnose Check Engine Light (MIL), read and clear freeze frame data, live sensor waveforms, O2 sensor tests, and EVAP leak diagnostics across all 1996+ OBD2 vehicles.', v_cat_id, v_brand_id, 32.99, 59.99,
    16.5, 'published'::public.product_status,
    false, true, false,
    false, '{"automotive","obd2","scanner","car repair","diagnostic"}'::text[], 0.52,
    '{"length":20,"width":10,"height":4}'::jsonb, 'Shenzhen, China',
    '90318090', 'SUP-SZ-KONN-01', 'KONNWEI KW850 OBD2 Scanner - Factory Direct in USDT',
    'Diagnose car trouble codes with KONNWEI KW850 color scanner direct from China factory.', 4.81, 142, 1560
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80', 'Automotive Diagnostic Scanner Connected to Car', 'image', 1);
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov', 'uploaded', 1, 'Video 1: Check Engine Code Reading & Reset Demo');
  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, 'https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov', 'uploaded', 2, 'Video 2: Live Sensor O2 & Battery Graphing');
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'KON-KW850-RED', 'Standard Edition', 32.99, 59.99, 16.5, 60, 10, 0.52, '{"Color":"Racing Red & Black"}'::jsonb, 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&auto=format&fit=crop&q=80', 'SUP-SZ-KONN-01-R', true, 1);
END $$;

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'tools-diy-hardware' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'eachine' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'LaserPecker 2 Super Fast Handheld Laser Engraver & 5W Metal Wood Cutter', 'laserpecker-2-handheld-laser-engraver', 'LP-2-PRO-SET', 'Ultra-fast 36000mm/min preview speed, 0.05mm compressed spot, power bank compatible portable engraver.',
    '### Flagship Ultra-Fast Dual-Galvo Laser System
Engineered for metal, wood, leather, acrylic and cylindrical engraving with high precision electric stand.', v_cat_id, v_brand_id, 389, 649,
    210, 'published'::public.product_status,
    true, true, false,
    false, '{"laser","engraver","cnc","maker","portable"}'::text[], 1.8,
    '{"length":26,"width":22,"height":18}'::jsonb, 'Shenzhen, China',
    '84561100', 'SUP-SZ-LP-02', 'LaserPecker 2 Handheld Laser Engraver - Direct from China',
    'Buy LaserPecker 2 portable laser engraver and cutter at factory price with USDT.', 4.92, 312, 2480
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', 'Laser Engraver in Action', 'image', 1);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80', 'Laser Engraved Metal and Wood Samples', 'image', 2);
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'LP-2-STD', 'Standard Edition', 389, 649, 210, 25, 4, 1.8, '{"Package":"Standard Stand Kit"}'::jsonb, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80', 'SUP-SZ-LP-02-STD', true, 1);
END $$;

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'tools-diy-hardware' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'eachine' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'TS101 Smart OLED USB-C 65W PD/DC Portable Soldering Iron Station', 'ts101-smart-usbc-soldering-iron', 'MIN-TS101-GRY', 'Upgraded 65W/90W dual power input soldering pencil with boost temperature turbo mode and anti-slip grip.',
    '### Essential Precision Soldering Tool for Drone & Electronics Builders
Heats from room temperature to 350°C in just 9 seconds. Supports PD 65W power bank operations.', v_cat_id, v_brand_id, 49.99, 89.99,
    24.5, 'published'::public.product_status,
    false, true, false,
    false, '{"soldering","electronics","diy","tools","fpv repair"}'::text[], 0.18,
    '{"length":16,"width":6,"height":3}'::jsonb, 'Dongguan, China',
    '85151100', 'SUP-DG-MIN-101', 'TS101 Smart Portable Soldering Iron - Factory Price',
    'Buy TS101 OLED USB-C soldering pencil direct from factory with USDT.', 4.88, 420, 3650
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&auto=format&fit=crop&q=80', 'TS101 Soldering Iron Precision Tip', 'image', 1);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', 'Circuit Board Soldering Close-up', 'image', 2);
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'TS101-B2-TIP', 'Standard Edition', 49.99, 89.99, 24.5, 80, 15, 0.18, '{"Tip":"B2 Conical Tip"}'::jsonb, 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=400&auto=format&fit=crop&q=80', 'SUP-DG-MIN-101-B2', true, 1);
END $$;

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'drones-fpv' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'eachine-labs' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'SJRC F22S 4K Pro 2-Axis Mechanical Gimbal EIS 3.5km Range Long Distance Drone', 'sjrc-f22s-4k-pro-long-distance-drone', 'SJR-F22S-4K', 'Long range 3.5km digital image transmission drone with laser obstacle avoidance and 35min flight time.',
    '### Professional Long-Range Aerial Explorer
Equipped with forward laser radar avoidance, 2-axis mechanical stabilization gimbal, and 4K 30fps HDR video capture.', v_cat_id, v_brand_id, 239, 420,
    135, 'published'::public.product_status,
    true, true, false,
    false, '{"drone","4k","gimbal","obstacle avoidance","long range"}'::text[], 0.58,
    '{"length":30,"width":24,"height":9}'::jsonb, 'Shenzhen, China',
    '88062200', 'SUP-SZ-SJRC-22', 'SJRC F22S 4K Pro Drone - Direct Factory Sourcing',
    'Buy SJRC F22S 4K Pro drone with 3.5km range in USDT with zero fee.', 4.89, 198, 1420
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=80', 'SJRC F22S High Altitude Flight', 'image', 1);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80', 'Drone in Hover Position', 'image', 2);
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'SJR-F22S-2BAT', 'Standard Edition', 239, 420, 135, 40, 6, 0.58, '{"Battery":"2 Batteries + Bag"}'::jsonb, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&auto=format&fit=crop&q=80', 'SUP-SZ-SJRC-22-2B', true, 1);
END $$;

DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'consumer-electronics' LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = 'blitzwolf' LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    'Anker Soundcore Motion Boom Plus 80W Heavy Bass IP67 Outdoor Speaker', 'anker-soundcore-motion-boom-plus-80w', 'ANK-MB-PLUS-80', 'Massive 80W stereo sound with BassUp technology, titanium drivers, 20-hour playtime, and built-in power bank.',
    '### Legendary Outdoor Sound System
Dual 30W woofers and 10W tweeters with IP67 dust/water resistance and partycast 2.0 synchronisation.', v_cat_id, v_brand_id, 139.99, 229.99,
    78, 'published'::public.product_status,
    true, true, false,
    false, '{"audio","speaker","bluetooth","ip67","soundcore"}'::text[], 2.2,
    '{"length":38,"width":14,"height":19}'::jsonb, 'Dongguan, China',
    '85182200', 'SUP-DG-ANK-09', 'Soundcore Motion Boom Plus 80W Speaker - Direct Sourcing',
    'Buy Motion Boom Plus 80W heavy bass speaker direct in USDT.', 4.95, 580, 4890
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', 'Motion Boom Plus Rugged Speaker', 'image', 1);
  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 'Speaker in Outdoor Environment', 'image', 2);
  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, 'ANK-MB-PLUS-BLK', 'Standard Edition', 139.99, 229.99, 78, 55, 10, 2.2, '{"Color":"Midnight Black"}'::jsonb, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&auto=format&fit=crop&q=80', 'SUP-DG-ANK-09-BLK', true, 1);
END $$;

-- 5. Coupons
INSERT INTO public.coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, used_count, is_active)
VALUES ('LENNOX10', '10% off on all direct factory electronics and drone hardware', 'percentage'::public.coupon_type, 10, 0, NULL, NULL, 0, true)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  min_order_amount = EXCLUDED.min_order_amount,
  max_discount_amount = EXCLUDED.max_discount_amount,
  is_active = EXCLUDED.is_active;
INSERT INTO public.coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, used_count, is_active)
VALUES ('USDT5', '$5 USDT instant discount on Binance Pay settlement', 'percentage'::public.coupon_type, 5, 0, NULL, NULL, 0, true)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  min_order_amount = EXCLUDED.min_order_amount,
  max_discount_amount = EXCLUDED.max_discount_amount,
  is_active = EXCLUDED.is_active;
INSERT INTO public.coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, used_count, is_active)
VALUES ('VIP20', 'Exclusive 20% discount for VIP tier hardware buyers', 'percentage'::public.coupon_type, 20, 0, NULL, NULL, 0, true)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  min_order_amount = EXCLUDED.min_order_amount,
  max_discount_amount = EXCLUDED.max_discount_amount,
  is_active = EXCLUDED.is_active;
INSERT INTO public.coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, used_count, is_active)
VALUES ('AIRFREE', '100% Free YunExpress Priority Air Express shipping', 'percentage'::public.coupon_type, 0, 0, NULL, NULL, 0, true)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  min_order_amount = EXCLUDED.min_order_amount,
  max_discount_amount = EXCLUDED.max_discount_amount,
  is_active = EXCLUDED.is_active;

-- 6. Homepage Sections
INSERT INTO public.homepage_sections (id, name, subtitle, type, layout, position, is_active, status, visibility, start_date, end_date, config)
VALUES ('a1000000-0000-0000-0000-000000000001', 'Direct Shenzhen Factory Hero Carousel', 'Zero middleman wholesale drops with verified Binance Pay USDT checkout', 'hero_banner', 'carousel', 1, true, 'published', 'all', NULL, NULL, '{"slides":[{"id":"slide-1","badge":"DIRECT SHENZHEN FACTORY LAUNCH","title":"4K Laser Gimbal Aerial Drones","subtitle":"Triple GPS auto-return, 5km transmission range & brushless motors. Sourced directly with zero middleman markups.","price":189,"original_price":349,"tag":"-46% OFF","desktop_image":"https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80","mobile_image":"https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80","link":"/products/eachine-ex5-4k-gps-fpv-drone","hub":"Shenzhen Drone Hub"},{"id":"slide-2","badge":"DIRECT NINGBO INDUSTRIAL DROP","title":"CoreXY 600mm/s High-Speed 3D Printer","subtitle":"Direct-drive dual gear extruder, vibration compensation & auto-bed leveling. Factory calibrated precision.","price":219,"original_price":399,"tag":"-45% OFF","desktop_image":"https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80","mobile_image":"https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80","link":"/products/creality-ender-3-v3-se-3d-printer","hub":"Ningbo 3DP Lab"},{"id":"slide-3","badge":"GUANGZHOU PRO AUDIO HUB","title":"120W Quad-Driver Outdoor Bluetooth Boombox","subtitle":"Dual passive radiators, 16000mAh battery pack with reverse USB charging & IPX5 water resistance.","price":89,"original_price":169,"tag":"-47% OFF","desktop_image":"https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=80","mobile_image":"https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80","link":"/products/blitzwolf-bw-wa3-pro-120w-bluetooth-speaker","hub":"Guangzhou Audio Center"}]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  type = EXCLUDED.type,
  layout = EXCLUDED.layout,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status,
  visibility = EXCLUDED.visibility,
  config = EXCLUDED.config;
INSERT INTO public.homepage_sections (id, name, subtitle, type, layout, position, is_active, status, visibility, start_date, end_date, config)
VALUES ('a1000000-0000-0000-0000-000000000002', 'Flash Sourcing Drops', 'Direct factory overstock lots releasing every 6 hours with verified stock counts', 'flash_deals', 'grid', 2, true, 'published', 'all', NULL, NULL, '{"deal_ends_at":"2026-08-25T18:00:00Z","discount_badge":"UP TO 60% OFF","max_items":4}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  type = EXCLUDED.type,
  layout = EXCLUDED.layout,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status,
  visibility = EXCLUDED.visibility,
  config = EXCLUDED.config;
INSERT INTO public.homepage_sections (id, name, subtitle, type, layout, position, is_active, status, visibility, start_date, end_date, config)
VALUES ('a1000000-0000-0000-0000-000000000003', 'Factory Category Showcase', 'Explore wholesale product categories straight from industrial assembly lines', 'category_grid', 'grid', 3, true, 'published', 'all', NULL, NULL, '{"show_product_counts":true,"max_categories":6}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  type = EXCLUDED.type,
  layout = EXCLUDED.layout,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status,
  visibility = EXCLUDED.visibility,
  config = EXCLUDED.config;
INSERT INTO public.homepage_sections (id, name, subtitle, type, layout, position, is_active, status, visibility, start_date, end_date, config)
VALUES ('a1000000-0000-0000-0000-000000000004', 'Featured Hardware & Dual-Video Teardowns', 'Inspected and benchmarked with live factory video teardowns before dispatch', 'featured_products', 'grid', 4, true, 'published', 'all', NULL, NULL, '{"show_video_badge":true,"show_supplier_origin":true,"max_items":4}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  type = EXCLUDED.type,
  layout = EXCLUDED.layout,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status,
  visibility = EXCLUDED.visibility,
  config = EXCLUDED.config;
INSERT INTO public.homepage_sections (id, name, subtitle, type, layout, position, is_active, status, visibility, start_date, end_date, config)
VALUES ('a1000000-0000-0000-0000-000000000005', 'Direct Factory Trust & Binance Escrow Guarantee', 'Why buyers and importers trust Lennox ChinaMall for cross-border hardware', 'trust_badges', 'cards', 5, true, 'published', 'all', NULL, NULL, '{"badges":[{"icon":"ShieldCheck","title":"0% Fee Binance Pay Escrow","desc":"Funds held securely until your express air cargo arrives with verified tracking."},{"icon":"Factory","title":"Direct China Sourcing","desc":"Zero middleman markups. Sourced straight from Shenzhen, Ningbo & Guangzhou."},{"icon":"Truck","title":"5-Day Air Express Freight","desc":"Direct cargo flights via YunExpress and SF International to your door."},{"icon":"Video","title":"Dual-Video QC Inspection","desc":"Every product verified with factory teardown & live performance video demos."}]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  type = EXCLUDED.type,
  layout = EXCLUDED.layout,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status,
  visibility = EXCLUDED.visibility,
  config = EXCLUDED.config;

-- 7. Store Settings
INSERT INTO public.store_settings (key, value)
VALUES ('store_info', '{"store_name":"Lennox China Mall","legal_entity":"Lennox Global Trading Ltd.","tagline":"Direct China Factory Sourcing & Wholesale Hardware Portal","support_email":"support@lennoxchinamall.com","business_phone":"+86 755 8899 0011","guangzhou_hub":"Building 4, Baiyun International Logistics Park, Guangzhou, GD 510440","shenzhen_hub":"Floor 8, SkyRover Drone Industrial Park, Nanshan, Shenzhen, GD 518057","business_hours":"Mon-Fri: 09:00 - 18:00 (GMT+8)","timezone":"Asia/Shanghai"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('branding', '{"primary_logo_url":"/logo-lennoxchinamall.png","dark_logo_url":"/logo-lennoxchinamall.png","favicon_url":"/favicon.ico","primary_color":"#FF1028","secondary_color":"#00143D","accent_color":"#10B981","hero_banner_tag":"DIRECT FACTORY SOURCING IN USDT"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('currencies', '{"base_currency":"USDT","rates":{"USDT":1,"USD":1,"EUR":0.92,"GBP":0.78,"AUD":1.52,"CAD":1.36,"CNY":7.24,"AED":3.67,"SAR":3.75},"symbol_position":"prefix","decimal_places":2}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('localization', '{"default_locale":"en-US","supported_locales":["en-US","es-ES","ar-SA","fr-FR","de-DE","zh-CN"],"date_format":"MMM DD, YYYY","time_format":"24h","weight_unit":"kg","dimension_unit":"cm"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('tax_customs', '{"tax_mode":"zero_tax_export","default_hs_code":"85176200","customs_declaration":"Direct China cross-border wholesale hardware export with duty prepaid options.","customs_duty_handling":"ddu_dap"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('shipping_zones', '{"air_express_lead_days":5,"free_shipping_threshold":75,"standard_air_cost":8.5,"express_air_cost":18,"default_carrier":"YunExpress Air Freight","allowed_zones":["North America","European Union","United Kingdom","Australia & NZ","Middle East","Southeast Asia"]}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('order_workflow', '{"unpaid_cancel_minutes":120,"auto_complete_days":14,"allow_guest_checkout":false,"min_order_amount_usdt":10,"max_order_amount_usdt":50000,"order_number_prefix":"LCM"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('invoice', '{"invoice_prefix":"LCM-INV-2026-","tax_registration_no":"CN-GZ-91440101MA59X89","company_title":"Lennox ChinaMall Direct Sourcing Operations","terms_note":"Payment settled exclusively in verified USDT via Binance Pay escrow.","footer_declaration":"Goods inspected at Shenzhen/Guangzhou testing facilities before air cargo departure."}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('email_templates', '{"order_confirmation_subject":"Order Confirmed #{order_number} — Lennox ChinaMall","payment_received_subject":"Binance Pay USDT Payment Verified for #{order_number}","shipping_dispatched_subject":"Air Cargo Dispatched! Track #{tracking_number}","sender_name":"Lennox ChinaMall Fulfilment Desk","sender_email":"orders@lennoxchinamall.com"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('notifications', '{"notify_on_new_order":true,"notify_on_low_stock":true,"notify_on_payment_failed":true,"low_stock_threshold":5,"alert_recipient_email":"alerts@lennoxchinamall.com"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('binance_pay', '{"enabled":true,"environment":"live","zero_fee_promoted":true,"merchant_id":"384910291","api_key":"live_bn_api_8849201948201","api_secret":"live_bn_sec_9948201928401928","webhook_secret":"live_wh_sec_7729104829104","accepted_tokens":["USDT","USDC","BTC","ETH","BNB"]}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('storage', '{"products_bucket":"products","banners_bucket":"banners","max_image_mb":100,"max_video_mb":100,"allowed_mime_types":["image/jpeg","image/png","image/webp","video/mp4"]}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('seo', '{"meta_title_template":"%s | Lennox ChinaMall Direct Sourcing","default_meta_title":"Lennox ChinaMall — Direct China Sourcing & Wholesale Hardware Portal","default_meta_description":"Buy 4K camera drones, CoreXY 3D printers, and professional audio at direct factory prices with Binance Pay USDT escrow.","og_image_url":"/logo-lennoxchinamall.png","twitter_handle":"@lennoxchinamall","google_site_verification":"gsc_token_verification_lennox_2026","robots_txt":"User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /auth/\nSitemap: https://lennoxchinamall.com/sitemap.xml"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('analytics', '{"google_analytics_id":"G-LENNOX2026","facebook_pixel_id":"","tiktok_pixel_id":"","custom_head_scripts":""}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('maintenance', '{"enabled":false,"heading":"Lennox ChinaMall Scheduled System Upgrade","message":"We are synchronizing Shenzhen factory inventory lots. Checkout resumes shortly.","expected_duration_minutes":30,"admin_bypass_key":"lennox_admin_bypass_2026"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('security', '{"max_login_attempts":5,"lockout_duration_minutes":15,"staff_session_timeout_hours":8,"enforce_2fa_for_staff":false,"ip_whitelist":""}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
INSERT INTO public.store_settings (key, value)
VALUES ('backups', '{"auto_backup_frequency":"daily","last_backup_date":"2026-08-24T12:00:00Z","backup_retention_days":30,"cloud_sync_enabled":true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
