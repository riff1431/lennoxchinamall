-- ============================================================================
-- Lennox ChinaMall — Migration 007: Shipping & Order Fulfillment Module
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Shipping Methods & Carrier Rates
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  carrier TEXT NOT NULL, -- YunExpress, SF International, DHL Express, Yanwen
  service_type TEXT NOT NULL, -- 'Priority Air', 'Express Courier', 'Standard Freight'
  base_cost_usdt NUMERIC(10,2) NOT NULL DEFAULT 8.50,
  per_kg_cost_usdt NUMERIC(10,2) NOT NULL DEFAULT 4.00,
  estimated_days_min INT NOT NULL DEFAULT 5,
  estimated_days_max INT NOT NULL DEFAULT 8,
  free_shipping_min_order NUMERIC(10,2) DEFAULT 75.00,
  allowed_zones JSONB NOT NULL DEFAULT '["North America", "European Union", "United Kingdom", "Australia & NZ", "Middle East", "Southeast Asia"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Fulfillments & Air Parcels
CREATE TABLE IF NOT EXISTS public.fulfillments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_country TEXT NOT NULL,
  recipient_city TEXT NOT NULL DEFAULT 'Los Angeles, CA',
  recipient_address TEXT,
  courier TEXT NOT NULL DEFAULT 'YunExpress',
  service_type TEXT NOT NULL DEFAULT 'Priority Air Cargo',
  tracking_number TEXT UNIQUE NOT NULL,
  tracking_url TEXT,
  status TEXT NOT NULL DEFAULT 'in_transit', -- 'processing', 'packing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled'
  weight_kg NUMERIC(6,2) NOT NULL DEFAULT 1.20,
  origin_hub TEXT NOT NULL DEFAULT 'Shenzhen Drone Hub',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  internal_notes TEXT,
  shipped_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fulfillments_order_num ON public.fulfillments(order_number);
CREATE INDEX IF NOT EXISTS idx_fulfillments_tracking ON public.fulfillments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_fulfillments_status ON public.fulfillments(status);

-- 3. Fulfillment Timeline Milestones
CREATE TABLE IF NOT EXISTS public.fulfillment_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id UUID REFERENCES public.fulfillments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fulfillment_timeline_id ON public.fulfillment_timeline(fulfillment_id);

-- 4. Order Returns & Refunds
CREATE TABLE IF NOT EXISTS public.order_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested', -- 'requested', 'approved', 'item_received', 'refunded', 'rejected'
  refund_amount_usdt NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  return_tracking TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_returns ENABLE ROW LEVEL SECURITY;

-- Public can view active shipping methods for checkout
CREATE POLICY "Public can view active shipping methods"
  ON public.shipping_methods FOR SELECT USING (is_active = TRUE);

-- Staff has full access
CREATE POLICY "Staff can manage shipping_methods"
  ON public.shipping_methods FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'order_manager', 'catalogue_manager', 'support_agent')
    )
  );

CREATE POLICY "Staff can manage fulfillments"
  ON public.fulfillments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'order_manager', 'catalogue_manager', 'support_agent')
    )
  );

CREATE POLICY "Staff can manage fulfillment_timeline"
  ON public.fulfillment_timeline FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'order_manager', 'catalogue_manager', 'support_agent')
    )
  );

CREATE POLICY "Staff can manage order_returns"
  ON public.order_returns FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'order_manager', 'catalogue_manager', 'support_agent')
    )
  );

-- ─── Seed Initial Production Shipping Methods ──────────────────────────────

INSERT INTO public.shipping_methods (name, carrier, service_type, base_cost_usdt, per_kg_cost_usdt, estimated_days_min, estimated_days_max, free_shipping_min_order)
VALUES
  ('YunExpress Priority Direct Line', 'YunExpress', 'Priority Air', 8.50, 4.00, 5, 8, 75.00),
  ('SF International Priority Express', 'SF Express', 'Express Courier', 18.00, 7.50, 3, 5, 150.00),
  ('DHL Express Wholesale Airfreight', 'DHL Express', 'Express Courier', 32.00, 12.00, 2, 4, 300.00),
  ('Yanwen Special Economic Line', 'Yanwen', 'Standard Freight', 4.50, 2.50, 10, 15, 50.00)
ON CONFLICT DO NOTHING;

-- ─── Seed Initial Production Fulfillments & Milestones ──────────────────────

INSERT INTO public.fulfillments (
  id, order_id, order_number, recipient_name, recipient_country, recipient_city, recipient_address,
  courier, service_type, tracking_number, tracking_url, status, weight_kg, origin_hub, items, internal_notes
)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'ord-1',
    'LCM-99012',
    'Marcus Vance',
    'United States',
    'Austin, TX',
    '701 Brazos St, Suite 400',
    'YunExpress Air Freight',
    'Priority Air Cargo',
    'YT260824901928US',
    'https://www.yuntrack.com/parcelTracking?pNumber=YT260824901928US',
    'in_transit',
    0.85,
    'Shenzhen Drone Hub',
    '[{"sku": "DRONE-4K-1B", "name": "Eachine EX5 4K GPS FPV Drone", "qty": 1, "hs_code": "85176200"}]'::jsonb,
    'QC verified with 4K laser gimbal flight test before departure.'
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    'ord-2',
    'LCM-99013',
    'Elena Rostova',
    'Germany',
    'Berlin',
    'Alexanderplatz 7, 10178 Berlin',
    'SF International',
    'Priority Express',
    'SF202688491029DE',
    'https://www.sf-international.com/express/track?trackNumbers=SF202688491029DE',
    'shipped',
    14.20,
    'Guangzhou QC Center',
    '[{"sku": "3DP-K1MAX-STD", "name": "Creality K1 Max High-Speed 3D Printer", "qty": 1, "hs_code": "84778000"}]'::jsonb,
    'Heavy cargo packed with reinforced corner brackets and wooden pallet.'
  ),
  (
    'f1000000-0000-0000-0000-000000000003',
    'ord-3',
    'LCM-99014',
    'Tariq Al-Mansoor',
    'United Arab Emirates',
    'Dubai',
    'Downtown Boulevard, Tower 2, Apt 1804',
    'DHL Express',
    'Express Air Courier',
    'DHL8892019482AE',
    'https://www.dhl.com/en/express/tracking.html?AWB=DHL8892019482AE',
    'delivered',
    2.10,
    'HK International Air Hub',
    '[{"sku": "AUDIO-WA3-PRO", "name": "BlitzWolf BW-WA3 Pro 120W Bluetooth Speaker", "qty": 2, "hs_code": "85182200"}]'::jsonb,
    'Delivered and signed at Dubai front desk.'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Timelines
INSERT INTO public.fulfillment_timeline (fulfillment_id, status, title, location, description)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'shipped', 'Origin Facility Dispatch', 'Shenzhen Logistics Hub, GD', 'Parcel packaged and handed over to YunExpress Air Freight.'),
  ('f1000000-0000-0000-0000-000000000001', 'in_transit', 'China Customs Export Cleared', 'Shenzhen Baoan International Airport (SZX)', 'Export declaration customs clearance successful. Scheduled for Flight CK208.'),
  ('f1000000-0000-0000-0000-000000000001', 'in_transit', 'International Air Cargo Departure', 'SZX Airport → LAX Airport', 'Direct air transit in progress.'),
  ('f1000000-0000-0000-0000-000000000002', 'shipped', 'Guangzhou Pallet Consolidation', 'Guangzhou QC Center, GD', 'Wooden crate inspection passed. Dispatched via SF Express Priority.'),
  ('f1000000-0000-0000-0000-000000000003', 'delivered', 'Delivered & Signed', 'Dubai, UAE', 'Delivered to recipient with signature confirmation.')
ON CONFLICT DO NOTHING;

-- Seed Returns
INSERT INTO public.order_returns (order_id, order_number, customer_email, reason, status, refund_amount_usdt, return_tracking, notes)
VALUES
  ('ord-4', 'LCM-99008', 'david.k@gmail.com', 'Ordered incorrect battery voltage variant for drone', 'requested', 189.00, '', 'Customer requested swap for 2-battery hardcase version.'),
  ('ord-5', 'LCM-99005', 'sarah.m@outlook.com', 'Minor cosmetic scratch on outer carrying case', 'refunded', 25.00, 'RET-SZ-99120', 'Partial goodwill USDT refund issued via Binance Pay escrow.')
ON CONFLICT DO NOTHING;
