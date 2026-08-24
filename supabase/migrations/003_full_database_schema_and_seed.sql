-- ============================================================================
-- Lennox ChinaMall — Complete Database Schema & Initial Production Seed
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- ─── 1. Extensions ──────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── 2. Custom Types & Enums ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('draft', 'published', 'archived', 'scheduled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending_payment', 'paid', 'sourcing', 'purchased', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('initiated', 'pending', 'paid', 'expired', 'failed', 'refunded', 'partially_refunded', 'review_required');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'super_admin', 'catalogue_manager', 'order_manager', 'support_agent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.coupon_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.return_status AS ENUM ('requested', 'approved', 'rejected', 'received', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 3. Catalogue Domain Tables ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  position INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  base_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(12, 2),
  cost NUMERIC(12, 2), -- Private: admin only
  status public.product_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  is_flash_deal BOOLEAN NOT NULL DEFAULT FALSE,
  flash_deal_ends_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  weight NUMERIC(8, 2),
  dimensions JSONB,
  shipping_origin TEXT DEFAULT 'Shenzhen, China',
  hs_code TEXT,
  supplier_code TEXT, -- Private: admin only
  seo_title TEXT,
  seo_description TEXT,
  avg_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  review_count INT NOT NULL DEFAULT 0,
  sold_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  title TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(12, 2),
  cost NUMERIC(12, 2), -- Private: admin only
  stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  weight NUMERIC(8, 2),
  attributes JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  supplier_code TEXT, -- Private: admin only
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  type TEXT NOT NULL DEFAULT 'image',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'embed',
  position INT NOT NULL DEFAULT 1,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. Private Sourcing & Suppliers (Admin Only) ───────────────────────────

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact TEXT,
  platform TEXT, -- e.g. 1688, Taobao, Factory Direct
  source_url TEXT,
  region TEXT,
  lead_time_days INT DEFAULT 3,
  reliability_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_sku TEXT,
  purchase_url TEXT,
  min_order INT DEFAULT 1,
  acquisition_price NUMERIC(12, 2),
  currency TEXT DEFAULT 'CNY',
  last_checked_at TIMESTAMPTZ,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sourcing_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_item_id TEXT,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_order_number TEXT,
  purchase_date TIMESTAMPTZ DEFAULT now(),
  actual_cost NUMERIC(12, 2),
  shipping_cost NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USDT',
  status TEXT NOT NULL DEFAULT 'pending',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. Orders & Payments Domain ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  sourcing_status TEXT DEFAULT 'pending',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USDT',
  payment_method TEXT NOT NULL DEFAULT 'binance_pay',
  payment_status public.payment_status NOT NULL DEFAULT 'initiated',
  merchant_trade_no TEXT UNIQUE,
  prepay_id TEXT,
  shipping_method TEXT DEFAULT 'air_express',
  tracking_number TEXT,
  courier_code TEXT,
  tracking_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.variants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  sku TEXT,
  price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  attributes JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  supplier_code TEXT, -- Private: admin only
  sourcing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  street_line_1 TEXT NOT NULL,
  street_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.order_status NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  merchant_trade_no TEXT NOT NULL UNIQUE,
  prepay_id TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  status public.payment_status NOT NULL DEFAULT 'initiated',
  binance_transaction_id TEXT,
  payment_timestamp TIMESTAMPTZ,
  network_fee NUMERIC(12, 4) DEFAULT 0,
  qr_content TEXT,
  checkout_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. Promotions & Store Settings ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  type public.coupon_type NOT NULL DEFAULT 'percentage',
  value NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(12, 2) DEFAULT 0,
  max_discount_amount NUMERIC(12, 2),
  usage_limit INT,
  used_count INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.flash_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  discount_percentage NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 7. Enable RLS on All Tables ────────────────────────────────────────────

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sourcing_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ─── 8. RLS Policies ────────────────────────────────────────────────────────

-- Public read for published catalogue
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active brands" ON public.brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view active variants" ON public.variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view product media" ON public.product_media FOR SELECT USING (true);
CREATE POLICY "Public can view product videos" ON public.product_videos FOR SELECT USING (true);
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active flash deals" ON public.flash_deals FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view public store settings" ON public.store_settings FOR SELECT USING (true);

-- Admin staff full CRUD across all tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'categories', 'brands', 'products', 'variants', 'product_media', 'product_videos',
    'suppliers', 'supplier_products', 'sourcing_purchases', 'orders', 'order_items',
    'order_addresses', 'order_status_history', 'payments', 'coupons', 'flash_deals', 'store_settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins have full access on %I" ON public.%I', t, t);
    EXECUTE format('
      CREATE POLICY "Admins have full access on %I" ON public.%I
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = (SELECT auth.uid())
          AND p.role IN (''super_admin'', ''catalogue_manager'', ''order_manager'', ''support_agent'')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = (SELECT auth.uid())
          AND p.role IN (''super_admin'', ''catalogue_manager'', ''order_manager'', ''support_agent'')
        )
      )
    ', t, t);
  END LOOP;
END $$;

-- ─── 9. Initial Production Data Seed ────────────────────────────────────────

-- Categories
INSERT INTO public.categories (id, name, slug, icon, position, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', '4K Drones & FPV', 'drones-fpv', 'Camera', 1, true),
  ('c1000000-0000-0000-0000-000000000002', '3D Printers & Laser CNC', '3d-printers', 'Printer', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Pro Audio & Boomboxes', 'audio-electronics', 'Headphones', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Automotive & OBD2 Tools', 'automotive-tools', 'Wrench', 4, true),
  ('c1000000-0000-0000-0000-000000000005', 'Tactical & Outdoor Gear', 'tactical-outdoor', 'Shield', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Brands
INSERT INTO public.brands (id, name, slug, logo_url, is_active)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Eachine', 'eachine', '/brands/eachine.png', true),
  ('b1000000-0000-0000-0000-000000000002', 'Creality', 'creality', '/brands/creality.png', true),
  ('b1000000-0000-0000-0000-000000000003', 'BlitzWolf', 'blitzwolf', '/brands/blitzwolf.png', true),
  ('b1000000-0000-0000-0000-000000000004', 'Autel', 'autel', '/brands/autel.png', true)
ON CONFLICT (slug) DO NOTHING;

-- Suppliers
INSERT INTO public.suppliers (id, code, name, contact, platform, source_url, region, lead_time_days, status)
VALUES
  ('s1000000-0000-0000-0000-000000000001', 'SUP-SZ-DRONE-88', 'Shenzhen SkyRover UAV Tech', 'Mr. Chen (+86 755 8321 4400)', '1688 Factory Direct', 'https://1688.com/skyrover', 'Guangdong, China', 2, 'active'),
  ('s1000000-0000-0000-0000-000000000002', 'SUP-NB-3DP-04', 'Ningbo Precision Additive Labs', 'Ms. Lin (+86 574 8765 1122)', 'Factory Direct PO', 'https://1688.com/nb3dprint', 'Zhejiang, China', 3, 'active'),
  ('s1000000-0000-0000-0000-000000000003', 'SUP-GZ-AUDIO-19', 'Guangzhou Sonic Acoustics Co.', 'Mr. Liang (+86 20 8900 3344)', 'Taobao Wholesale', 'https://taobao.com/sonic', 'Guangdong, China', 2, 'active')
ON CONFLICT (code) DO NOTHING;

-- Products
INSERT INTO public.products (
  id, title, slug, sku, short_description, description,
  category_id, brand_id, base_price, compare_at_price, cost,
  status, is_featured, is_best_seller, is_flash_deal,
  supplier_code, shipping_origin, avg_rating, review_count, sold_count
)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'Eachine EX5 4K Laser Gimbal Aerial GPS Drone',
    'eachine-ex5-4k-gps-fpv-drone',
    'LCM-DRN-EX5-4K',
    'Triple GPS auto-return, 5km transmission range & brushless motors. Sourced directly with zero middleman markups.',
    'Engineered for long-range aerial cinematography with dual 4K EIS cameras and 5GHz WiFi FPV transmission.',
    'c1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    189.00, 349.00, 95.00,
    'published', true, true, true,
    'SUP-SZ-DRONE-88', 'Shenzhen Air Logistics Hub', 4.95, 142, 850
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'Creality Ender-3 V3 SE CoreXY 600mm/s 3D Printer',
    'creality-ender-3-v3-se-3d-printer',
    'LCM-3DP-E3V3-SE',
    'CR-Touch auto leveling, Sprite direct extruder, 32-bit silent motherboard, and 600mm/s acceleration.',
    'Next-gen high-speed FDM printer capable of printing PLA, PETG, and TPU with factory auto calibration.',
    'c1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002',
    219.00, 399.00, 110.00,
    'published', true, true, false,
    'SUP-NB-3DP-04', 'Ningbo Industrial Port', 4.90, 98, 420
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'BlitzWolf BW-WA3 Pro 120W Quad-Driver Bluetooth Speaker',
    'blitzwolf-bw-wa3-pro-120w-bluetooth-speaker',
    'LCM-AUD-WA3P-120W',
    'Dual diaphragm heavy bass, 16000mAh powerbank battery, IPX5 waterproof, and RGB ambient light sync.',
    'Massive 120W outdoor sound projection engineered for festivals, camping, and bass-heavy playback.',
    'c1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000003',
    89.00, 169.00, 42.00,
    'published', true, false, true,
    'SUP-GZ-AUDIO-19', 'Guangzhou Air Express', 4.88, 76, 610
  )
ON CONFLICT (slug) DO NOTHING;

-- Product Media
INSERT INTO public.product_media (product_id, url, alt, position)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80', 'Eachine EX5 4K Drone Front View', 1),
  ('p1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', 'Creality Ender-3 V3 SE Setup', 1),
  ('p1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', 'BlitzWolf 120W Speaker', 1)
ON CONFLICT DO NOTHING;

-- Product Dual Videos (PRD §4.4)
INSERT INTO public.product_videos (product_id, url, type, position, title)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'embed', 1, 'Slot 1: Factory QC & Teardown Demo'),
  ('p1000000-0000-0000-0000-000000000001', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'embed', 2, 'Slot 2: Live Flight & 4K Camera Demo'),
  ('p1000000-0000-0000-0000-000000000002', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'embed', 1, 'Slot 1: 600mm/s High Speed Print Test'),
  ('p1000000-0000-0000-0000-000000000003', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'embed', 1, 'Slot 1: 120W Bass Audio Test')
ON CONFLICT DO NOTHING;

-- Coupons
INSERT INTO public.coupons (code, description, type, value, min_order_amount, is_active)
VALUES
  ('LENNOX10', '10% Off Direct Sourcing Voucher', 'percentage', 10.00, 50.00, true),
  ('USDTFREE', '$15 Off Binance Pay Settlement', 'fixed', 15.00, 100.00, true)
ON CONFLICT (code) DO NOTHING;

-- Store Settings
INSERT INTO public.store_settings (key, value)
VALUES
  ('general', '{"site_name": "Lennox ChinaMall", "currency": "USDT", "support_email": "support@lennoxchinamall.com"}'::jsonb),
  ('binance_pay', '{"enabled": true, "zero_fee": true, "environment": "live"}'::jsonb),
  ('logistics', '{"air_express_lead_days": 5, "default_courier": "YunExpress Air Cargo"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
