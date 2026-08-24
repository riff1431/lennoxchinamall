-- ============================================================================
-- Lennox ChinaMall — Migration 005: Dynamic Homepage & Content CMS
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subtitle TEXT,
  type TEXT NOT NULL, -- hero_banner, category_grid, flash_deals, featured_products, best_sellers, new_arrivals, promo_blocks, trust_badges, dual_video_spotlight, custom_html
  layout TEXT NOT NULL DEFAULT 'grid', -- carousel, grid, banner_strip, spotlight, cards
  position INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'published', -- published, draft, scheduled
  visibility TEXT NOT NULL DEFAULT 'all', -- all, desktop_only, mobile_only
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_position ON public.homepage_sections(position);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON public.homepage_sections(is_active);

-- Enable RLS
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- Public can view active published or scheduled sections
CREATE POLICY "Public can view active homepage sections"
  ON public.homepage_sections
  FOR SELECT
  USING (
    is_active = TRUE
    AND status = 'published'
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  );

-- Staff and Admins have full access
CREATE POLICY "Staff have full access on homepage sections"
  ON public.homepage_sections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'catalogue_manager', 'order_manager', 'support_agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'catalogue_manager', 'order_manager', 'support_agent')
    )
  );

-- ─── Seed Initial Production Sections ───────────────────────────────────────

INSERT INTO public.homepage_sections (id, name, subtitle, type, layout, position, is_active, status, visibility, config)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Direct Shenzhen Factory Hero Carousel',
    'Zero middleman wholesale drops with verified Binance Pay USDT checkout',
    'hero_banner',
    'carousel',
    1,
    true,
    'published',
    'all',
    '{
      "slides": [
        {
          "id": "slide-1",
          "badge": "DIRECT SHENZHEN FACTORY LAUNCH",
          "title": "4K Laser Gimbal Aerial Drones",
          "subtitle": "Triple GPS auto-return, 5km transmission range & brushless motors. Sourced directly with zero middleman markups.",
          "price": 189.0,
          "original_price": 349.0,
          "tag": "-46% OFF",
          "desktop_image": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80",
          "mobile_image": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80",
          "link": "/products/eachine-ex5-4k-gps-fpv-drone",
          "hub": "Shenzhen Drone Hub"
        },
        {
          "id": "slide-2",
          "badge": "DIRECT NINGBO INDUSTRIAL DROP",
          "title": "CoreXY 600mm/s High-Speed 3D Printer",
          "subtitle": "Direct-drive dual gear extruder, vibration compensation & auto-bed leveling. Factory calibrated precision.",
          "price": 219.0,
          "original_price": 399.0,
          "tag": "-45% OFF",
          "desktop_image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
          "mobile_image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
          "link": "/products/creality-ender-3-v3-se-3d-printer",
          "hub": "Ningbo 3DP Lab"
        },
        {
          "id": "slide-3",
          "badge": "GUANGZHOU PRO AUDIO HUB",
          "title": "120W Quad-Driver Outdoor Bluetooth Boombox",
          "subtitle": "Dual passive radiators, 16000mAh battery pack with reverse USB charging & IPX5 water resistance.",
          "price": 89.0,
          "original_price": 169.0,
          "tag": "-47% OFF",
          "desktop_image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=80",
          "mobile_image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
          "link": "/products/blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
          "hub": "Guangzhou Audio Center"
        }
      ]
    }'::jsonb
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Flash Sourcing Drops',
    'Direct factory overstock lots releasing every 6 hours with verified stock counts',
    'flash_deals',
    'grid',
    2,
    true,
    'published',
    'all',
    '{
      "deal_ends_at": "2026-08-25T18:00:00Z",
      "discount_badge": "UP TO 60% OFF",
      "max_items": 4
    }'::jsonb
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Factory Category Showcase',
    'Explore wholesale product categories straight from industrial assembly lines',
    'category_grid',
    'grid',
    3,
    true,
    'published',
    'all',
    '{
      "show_product_counts": true,
      "max_categories": 6
    }'::jsonb
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Featured Hardware & Dual-Video Teardowns',
    'Inspected and benchmarked with live factory video teardowns before dispatch',
    'featured_products',
    'grid',
    4,
    true,
    'published',
    'all',
    '{
      "show_video_badge": true,
      "show_supplier_origin": true,
      "max_items": 4
    }'::jsonb
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'Direct Factory Trust & Binance Escrow Guarantee',
    'Why buyers and importers trust Lennox ChinaMall for cross-border hardware',
    'trust_badges',
    'cards',
    5,
    true,
    'published',
    'all',
    '{
      "badges": [
        {
          "icon": "ShieldCheck",
          "title": "0% Fee Binance Pay Escrow",
          "desc": "Funds held securely until your express air cargo arrives with verified tracking."
        },
        {
          "icon": "Factory",
          "title": "Direct China Sourcing",
          "desc": "Zero middleman markups. Sourced straight from Shenzhen, Ningbo & Guangzhou."
        },
        {
          "icon": "Truck",
          "title": "5-Day Air Express Freight",
          "desc": "Direct cargo flights via YunExpress and SF International to your door."
        },
        {
          "icon": "Video",
          "title": "Dual-Video QC Inspection",
          "desc": "Every product verified with factory teardown & live performance video demos."
        }
      ]
    }'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  type = EXCLUDED.type,
  layout = EXCLUDED.layout,
  position = EXCLUDED.position,
  config = EXCLUDED.config;
