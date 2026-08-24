-- ==============================================================================
-- Lennox ChinaMall: Dynamic Promotions, Coupons, Flash Deals & Audit Engine
-- Migration: 004_promotions_and_coupons_engine.sql
-- ==============================================================================

-- 1. Ensure Coupon Types and Scope Enums exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'promotion_discount_type') THEN
    CREATE TYPE public.promotion_discount_type AS ENUM (
      'percentage',
      'fixed_amount',
      'free_shipping',
      'bogo',
      'tiered'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'promotion_scope') THEN
    CREATE TYPE public.promotion_scope AS ENUM (
      'all',
      'category',
      'brand',
      'product',
      'cart'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'promotion_status') THEN
    CREATE TYPE public.promotion_status AS ENUM (
      'draft',
      'scheduled',
      'active',
      'paused',
      'expired'
    );
  END IF;
END $$;

-- 2. Create or Upgrade the coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_discount_amount NUMERIC(12, 2),
  min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  scope TEXT NOT NULL DEFAULT 'all',
  target_category_ids UUID[] DEFAULT '{}',
  target_brand_ids UUID[] DEFAULT '{}',
  included_product_ids UUID[] DEFAULT '{}',
  excluded_product_ids UUID[] DEFAULT '{}',
  first_order_only BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_customer_ids UUID[] DEFAULT '{}',
  excluded_customer_ids UUID[] DEFAULT '{}',
  is_automatic BOOLEAN NOT NULL DEFAULT FALSE,
  is_flash_sale BOOLEAN NOT NULL DEFAULT FALSE,
  is_stackable BOOLEAN NOT NULL DEFAULT FALSE,
  bogo_buy_qty INT DEFAULT 1,
  bogo_get_qty INT DEFAULT 1,
  bogo_discount_percent NUMERIC(5, 2) DEFAULT 100,
  tier_rules JSONB DEFAULT '[]'::jsonb,
  usage_limit INT,
  per_customer_usage_limit INT DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upgrade columns if table already exists
DO $$
BEGIN
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS title TEXT;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percentage';
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS discount_value NUMERIC(12, 2) DEFAULT 0;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(12, 2);
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(12, 2) DEFAULT 0;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'all';
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS target_category_ids UUID[] DEFAULT '{}';
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS target_brand_ids UUID[] DEFAULT '{}';
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS included_product_ids UUID[] DEFAULT '{}';
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS excluded_product_ids UUID[] DEFAULT '{}';
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS first_order_only BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS allowed_customer_ids UUID[] DEFAULT '{}';
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS excluded_customer_ids UUID[] DEFAULT '{}';
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_automatic BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_flash_sale BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_stackable BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS bogo_buy_qty INT DEFAULT 1;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS bogo_get_qty INT DEFAULT 1;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS bogo_discount_percent NUMERIC(5, 2) DEFAULT 100;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS tier_rules JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS per_customer_usage_limit INT DEFAULT 1;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. Create Coupon Redemptions tracking table
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create or Upgrade Flash Deals Table
CREATE TABLE IF NOT EXISTS public.flash_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT,
  banner_url TEXT,
  discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 20,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  ALTER TABLE public.flash_deals ADD COLUMN IF NOT EXISTS slug TEXT;
  ALTER TABLE public.flash_deals ADD COLUMN IF NOT EXISTS banner_url TEXT;
  ALTER TABLE public.flash_deals ADD COLUMN IF NOT EXISTS product_ids UUID[] DEFAULT '{}';
  ALTER TABLE public.flash_deals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 5. Create Promotion Audit Logs table
CREATE TABLE IF NOT EXISTS public.promotion_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL, -- e.g. 'CREATED', 'UPDATED', 'TOGGLED', 'DUPLICATED', 'DELETED', 'REDEEMED'
  promotion_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  promotion_code TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_coupons_code_lower ON public.coupons(LOWER(code));
CREATE INDEX IF NOT EXISTS idx_coupons_active_dates ON public.coupons(is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_coupons_automatic ON public.coupons(is_automatic, is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON public.coupon_redemptions(user_id, coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_flash_deals_active_time ON public.flash_deals(is_active, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_promotion_audit_created ON public.promotion_audit_logs(created_at DESC);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Setup RLS Policies
-- Public view active public coupons
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > now()));

-- Public view active flash deals
DROP POLICY IF EXISTS "Public can view active flash deals" ON public.flash_deals;
CREATE POLICY "Public can view active flash deals" ON public.flash_deals
  FOR SELECT USING (is_active = TRUE AND end_time > now());

-- Authenticated users view their own redemptions
DROP POLICY IF EXISTS "Users view own coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users view own coupon redemptions" ON public.coupon_redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins full access to all promotion tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['coupons', 'coupon_redemptions', 'flash_deals', 'promotion_audit_logs'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins have full access on %I" ON public.%I', t, t);
    EXECUTE format('
      CREATE POLICY "Admins have full access on %I" ON public.%I
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN (''super_admin'', ''catalogue_manager'', ''order_manager'')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN (''super_admin'', ''catalogue_manager'', ''order_manager'')
        )
      );', t, t);
  END LOOP;
END $$;

-- 9. Seed Initial Dynamic Promotions
INSERT INTO public.coupons (
  code,
  title,
  description,
  discount_type,
  discount_value,
  max_discount_amount,
  min_order_amount,
  scope,
  first_order_only,
  usage_limit,
  per_customer_usage_limit,
  starts_at,
  expires_at,
  is_active,
  status
) VALUES
  (
    'WELCOME10',
    'New Customer Welcome Voucher',
    'Get 10% off your first factory-direct order with zero gas fee USDT checkout.',
    'percentage',
    10.00,
    50.00,
    30.00,
    'all',
    TRUE,
    1000,
    1,
    now() - INTERVAL '1 day',
    now() + INTERVAL '365 days',
    TRUE,
    'active'
  ),
  (
    'LENNOX10',
    'Sitewide Factory Direct 10% Off',
    'Save 10% across all Shenzhen & Ningbo certified electronics and hardware.',
    'percentage',
    10.00,
    100.00,
    50.00,
    'all',
    FALSE,
    5000,
    5,
    now() - INTERVAL '1 day',
    now() + INTERVAL '365 days',
    TRUE,
    'active'
  ),
  (
    'FACTORY50',
    'Wholesale Tier $50 Discount',
    'Instant $50 USDT credit on bulk hardware orders over $300.',
    'fixed_amount',
    50.00,
    50.00,
    300.00,
    'cart',
    FALSE,
    500,
    2,
    now() - INTERVAL '1 day',
    now() + INTERVAL '180 days',
    TRUE,
    'active'
  ),
  (
    'FREESHIP',
    'Global Priority Air Freight Waiver',
    'Enjoy free express air cargo on any order over $150 USDT.',
    'free_shipping',
    14.99,
    14.99,
    150.00,
    'cart',
    FALSE,
    2000,
    3,
    now() - INTERVAL '1 day',
    now() + INTERVAL '365 days',
    TRUE,
    'active'
  ),
  (
    'AUTODRONE15',
    'Automated Drone & RC Category Promo',
    'Automatic 15% price cut on all certified 4K camera drones and aerial gear.',
    'percentage',
    15.00,
    75.00,
    80.00,
    'category',
    FALSE,
    1000,
    2,
    now() - INTERVAL '1 day',
    now() + INTERVAL '90 days',
    TRUE,
    'active'
  )
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  min_order_amount = EXCLUDED.min_order_amount,
  max_discount_amount = EXCLUDED.max_discount_amount,
  scope = EXCLUDED.scope,
  first_order_only = EXCLUDED.first_order_only,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status;

-- 10. Seed Initial Flash Deal
INSERT INTO public.flash_deals (
  title,
  slug,
  discount_percentage,
  start_time,
  end_time,
  is_active
) VALUES (
  'Shenzhen Industrial Hub 24-Hour Hardware Drop',
  'shenzhen-24h-drop',
  35.00,
  now() - INTERVAL '2 hours',
  now() + INTERVAL '22 hours',
  TRUE
)
ON CONFLICT DO NOTHING;
