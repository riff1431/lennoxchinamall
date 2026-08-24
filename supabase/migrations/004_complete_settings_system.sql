-- ============================================================================
-- Lennox ChinaMall — Migration 004: Complete Dynamic Settings System
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Drop old policies to replace with clean ones
DROP POLICY IF EXISTS "Public can view public store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admins have full access on store_settings" ON public.store_settings;

-- Public can only read explicitly marked public setting records
CREATE POLICY "Public can view public store settings"
  ON public.store_settings
  FOR SELECT
  USING (is_public = TRUE);

-- Authenticated staff & admins can read and manage all settings
CREATE POLICY "Staff can view and manage store settings"
  ON public.store_settings
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

-- ─── Seed Initial Complete Configuration Domains ───────────────────────────

-- 1. Store Information & Logistics Hubs
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'store_info',
  TRUE,
  '{
    "store_name": "Lennox ChinaMall",
    "legal_entity": "Lennox Global Trading Ltd.",
    "tagline": "Direct China Factory Sourcing & Wholesale Hardware Portal",
    "support_email": "support@lennoxchinamall.com",
    "business_phone": "+86 755 8899 0011",
    "guangzhou_hub": "Building 4, Baiyun International Logistics Park, Guangzhou, GD 510440",
    "shenzhen_hub": "Floor 8, SkyRover Drone Industrial Park, Nanshan, Shenzhen, GD 518057",
    "business_hours": "Mon-Fri: 09:00 - 18:00 (GMT+8)",
    "timezone": "Asia/Shanghai"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Branding & Visual Identity
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'branding',
  TRUE,
  '{
    "primary_logo_url": "/logo-lennoxchinamall.jpeg",
    "dark_logo_url": "/logo-lennoxchinamall.jpeg",
    "favicon_url": "/favicon.ico",
    "primary_color": "#FF1028",
    "secondary_color": "#00143D",
    "accent_color": "#10B981",
    "hero_banner_tag": "DIRECT FACTORY SOURCING IN USDT"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Currencies & Exchange Rates
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'currencies',
  TRUE,
  '{
    "base_currency": "USDT",
    "rates": {
      "USDT": 1.00,
      "USD": 1.00,
      "EUR": 0.92,
      "GBP": 0.78,
      "AUD": 1.52,
      "CAD": 1.36,
      "CNY": 7.24,
      "AED": 3.67,
      "SAR": 3.75
    },
    "symbol_position": "prefix",
    "decimal_places": 2
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. Localization & Units
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'localization',
  TRUE,
  '{
    "default_locale": "en-US",
    "supported_locales": ["en-US", "es-ES", "ar-SA", "fr-FR", "de-DE", "zh-CN"],
    "date_format": "MMM DD, YYYY",
    "time_format": "24h",
    "weight_unit": "kg",
    "dimension_unit": "cm"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. Tax & China Export Customs
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'tax_customs',
  TRUE,
  '{
    "tax_mode": "zero_tax_export",
    "default_hs_code": "85176200",
    "customs_declaration": "Direct China cross-border wholesale hardware export with duty prepaid options.",
    "customs_duty_handling": "ddu_dap"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 6. Shipping Zones & Air Express Logistics
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'shipping_zones',
  TRUE,
  '{
    "air_express_lead_days": 5,
    "free_shipping_threshold": 75.00,
    "standard_air_cost": 8.50,
    "express_air_cost": 18.00,
    "default_carrier": "YunExpress Air Freight",
    "allowed_zones": ["North America", "European Union", "United Kingdom", "Australia & NZ", "Middle East", "Southeast Asia"]
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 7. Order Workflow & Auto-Cancellation
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'order_workflow',
  FALSE,
  '{
    "unpaid_cancel_minutes": 120,
    "auto_complete_days": 14,
    "allow_guest_checkout": false,
    "min_order_amount_usdt": 10.00,
    "max_order_amount_usdt": 50000.00,
    "order_number_prefix": "LCM"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8. Invoice & Sourcing Receipts
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'invoice',
  TRUE,
  '{
    "invoice_prefix": "LCM-INV-2026-",
    "tax_registration_no": "CN-GZ-91440101MA59X89",
    "company_title": "Lennox ChinaMall Direct Sourcing Operations",
    "terms_note": "Payment settled exclusively in verified USDT via Binance Pay escrow.",
    "footer_declaration": "Goods inspected at Shenzhen/Guangzhou testing facilities before air cargo departure."
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 9. Email Templates
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'email_templates',
  FALSE,
  '{
    "order_confirmation_subject": "Order Confirmed #{order_number} — Lennox ChinaMall",
    "payment_received_subject": "Binance Pay USDT Payment Verified for #{order_number}",
    "shipping_dispatched_subject": "Air Cargo Dispatched! Track #{tracking_number}",
    "sender_name": "Lennox ChinaMall Fulfilment Desk",
    "sender_email": "orders@lennoxchinamall.com"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 10. Notification Triggers
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'notifications',
  FALSE,
  '{
    "notify_on_new_order": true,
    "notify_on_low_stock": true,
    "notify_on_payment_failed": true,
    "low_stock_threshold": 5,
    "alert_recipient_email": "alerts@lennoxchinamall.com"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 11. Binance Pay API Gateway (Private/Encrypted)
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'binance_pay',
  FALSE,
  '{
    "enabled": true,
    "environment": "live",
    "zero_fee_promoted": true,
    "merchant_id": "384910291",
    "api_key": "live_bn_api_8849201948201",
    "api_secret": "live_bn_sec_9948201928401928",
    "webhook_secret": "live_wh_sec_7729104829104",
    "accepted_tokens": ["USDT", "USDC", "BTC", "ETH", "BNB"]
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 12. Supabase Storage & Assets Limits
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'storage',
  TRUE,
  '{
    "products_bucket": "products",
    "banners_bucket": "banners",
    "max_image_mb": 10,
    "max_video_mb": 100,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "video/mp4"]
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 13. SEO & Metadata
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'seo',
  TRUE,
  '{
    "meta_title_template": "%s | Lennox ChinaMall Direct Sourcing",
    "default_meta_title": "Lennox ChinaMall — Direct China Sourcing & Wholesale Hardware Portal",
    "default_meta_description": "Buy 4K camera drones, CoreXY 3D printers, and professional audio at direct factory prices with Binance Pay USDT escrow.",
    "og_image_url": "/logo-lennoxchinamall.jpeg",
    "twitter_handle": "@lennoxchinamall",
    "google_site_verification": "gsc_token_verification_lennox_2026",
    "robots_txt": "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /auth/\nSitemap: https://lennoxchinamall.com/sitemap.xml"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 14. Analytics & Tracking Pixels
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'analytics',
  TRUE,
  '{
    "google_analytics_id": "G-LENNOX2026",
    "facebook_pixel_id": "",
    "tiktok_pixel_id": "",
    "custom_head_scripts": ""
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 15. Maintenance Mode Gate
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'maintenance',
  TRUE,
  '{
    "enabled": false,
    "heading": "Lennox ChinaMall Scheduled System Upgrade",
    "message": "We are synchronizing Shenzhen factory inventory lots. Checkout resumes shortly.",
    "expected_duration_minutes": 30,
    "admin_bypass_key": "lennox_admin_bypass_2026"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 16. Security & Session Governance
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'security',
  FALSE,
  '{
    "max_login_attempts": 5,
    "lockout_duration_minutes": 15,
    "staff_session_timeout_hours": 8,
    "enforce_2fa_for_staff": false,
    "ip_whitelist": ""
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 17. Disaster Recovery & Backups
INSERT INTO public.store_settings (key, is_public, value)
VALUES (
  'backups',
  FALSE,
  '{
    "auto_backup_frequency": "daily",
    "last_backup_date": "2026-08-24T12:00:00Z",
    "backup_retention_days": 30,
    "cloud_sync_enabled": true
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
