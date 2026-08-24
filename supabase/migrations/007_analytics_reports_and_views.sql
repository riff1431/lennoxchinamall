-- ============================================================================
-- Lennox ChinaMall — Migration 007: Dynamic Analytics & Reporting System
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- ─── 1. Performance Indexes for High-Velocity Aggregations ─────────────────

-- Orders indexes for date filtering and status counts
CREATE INDEX IF NOT EXISTS idx_orders_created_status_amount 
  ON public.orders (created_at DESC, status, total_amount, currency);

CREATE INDEX IF NOT EXISTS idx_orders_user_created 
  ON public.orders (user_id, created_at DESC);

-- Order Items indexes for product & variant sales telemetry
CREATE INDEX IF NOT EXISTS idx_order_items_created_product 
  ON public.order_items (created_at DESC, product_id, variant_id);

CREATE INDEX IF NOT EXISTS idx_order_items_sourcing 
  ON public.order_items (sourcing_status, supplier_code);

-- Payments indexes for Binance Pay USDT reconciliation
CREATE INDEX IF NOT EXISTS idx_payments_created_status 
  ON public.payments (created_at DESC, status, amount, currency);

CREATE INDEX IF NOT EXISTS idx_payments_paid_at 
  ON public.payments (paid_at DESC) WHERE paid_at IS NOT NULL;

-- Carts indexes for abandoned cart telemetry (>24h without order)
CREATE INDEX IF NOT EXISTS idx_carts_updated_user 
  ON public.carts (updated_at DESC, user_id, session_id);

-- Return requests & Refunds indexes
CREATE INDEX IF NOT EXISTS idx_return_requests_created_status 
  ON public.return_requests (created_at DESC, status);

CREATE INDEX IF NOT EXISTS idx_refunds_created_status 
  ON public.refunds (created_at DESC, status, amount);


-- ─── 2. Automated Report Schedules & Generated Artifacts Tables ────────────

CREATE TABLE IF NOT EXISTS public.admin_report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  recipient_emails TEXT[] NOT NULL DEFAULT '{}',
  metrics_included TEXT[] NOT NULL DEFAULT '{"revenue", "orders", "sourcing_margin", "inventory", "refunds"}',
  format TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'json')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.admin_report_schedules(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metrics_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed')),
  download_url TEXT,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Staff
DROP POLICY IF EXISTS "Staff can manage admin_report_schedules" ON public.admin_report_schedules;
CREATE POLICY "Staff can manage admin_report_schedules"
  ON public.admin_report_schedules FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'catalogue_manager', 'order_manager')
    )
  );

DROP POLICY IF EXISTS "Staff can manage admin_generated_reports" ON public.admin_generated_reports;
CREATE POLICY "Staff can manage admin_generated_reports"
  ON public.admin_generated_reports FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'catalogue_manager', 'order_manager', 'support_agent')
    )
  );


-- ─── 3. Analytics Views (with security_invoker = true) ─────────────────────

-- 3.1 Daily Sales Aggregate View
CREATE OR REPLACE VIEW public.view_daily_sales_analytics
WITH (security_invoker = true) AS
SELECT
  DATE_TRUNC('day', o.created_at) AS sales_date,
  COUNT(DISTINCT o.id) AS total_orders,
  COUNT(DISTINCT CASE WHEN o.status NOT IN ('cancelled', 'refunded', 'pending_payment') THEN o.id END) AS paid_orders,
  COUNT(DISTINCT o.user_id) AS unique_buyers,
  COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled', 'refunded') THEN o.total_amount ELSE 0 END), 0) AS gross_sales_usdt,
  COALESCE(SUM(o.discount_amount), 0) AS total_discounts_usdt,
  COALESCE(SUM(o.shipping_fee), 0) AS total_shipping_fees_usdt,
  COALESCE(AVG(CASE WHEN o.status NOT IN ('cancelled', 'refunded') THEN o.total_amount END), 0) AS avg_order_value_usdt
FROM public.orders o
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY sales_date DESC;

-- 3.2 Product Sales Performance View
CREATE OR REPLACE VIEW public.view_product_sales_performance
WITH (security_invoker = true) AS
SELECT
  p.id AS product_id,
  p.title AS product_title,
  p.sku AS product_sku,
  p.base_price,
  p.cost AS factory_cost_usdt,
  c.name AS category_name,
  b.name AS brand_name,
  COALESCE(SUM(oi.quantity), 0) AS units_sold,
  COALESCE(SUM(oi.quantity * oi.price), 0) AS gross_revenue_usdt,
  COALESCE(SUM(oi.quantity * COALESCE(p.cost, p.base_price * 0.55)), 0) AS estimated_factory_sourcing_cost_usdt,
  (COALESCE(SUM(oi.quantity * oi.price), 0) - COALESCE(SUM(oi.quantity * COALESCE(p.cost, p.base_price * 0.55)), 0)) AS estimated_gross_profit_usdt,
  COUNT(DISTINCT oi.order_id) AS total_order_appearances
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
LEFT JOIN public.brands b ON b.id = p.brand_id
LEFT JOIN public.order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.title, p.sku, p.base_price, p.cost, c.name, b.name
ORDER BY units_sold DESC;

-- 3.3 Category & Brand Sales Aggregation View
CREATE OR REPLACE VIEW public.view_category_brand_sales
WITH (security_invoker = true) AS
SELECT
  COALESCE(c.name, 'Uncategorized') AS category_name,
  COALESCE(b.name, 'No Brand / Factory Direct') AS brand_name,
  COUNT(DISTINCT oi.id) AS line_items_count,
  COALESCE(SUM(oi.quantity), 0) AS total_units_sold,
  COALESCE(SUM(oi.quantity * oi.price), 0) AS total_revenue_usdt
FROM public.order_items oi
JOIN public.products p ON p.id = oi.product_id
LEFT JOIN public.categories c ON c.id = p.category_id
LEFT JOIN public.brands b ON b.id = p.brand_id
GROUP BY c.name, b.name
ORDER BY total_revenue_usdt DESC;

-- 3.4 Customer Cohort Retention Metrics View
CREATE OR REPLACE VIEW public.view_customer_retention_metrics
WITH (security_invoker = true) AS
SELECT
  p.id AS user_id,
  p.email,
  p.display_name,
  p.created_at AS user_registered_at,
  COUNT(o.id) AS total_orders_placed,
  COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled', 'refunded') THEN o.total_amount ELSE 0 END), 0) AS lifetime_spent_usdt,
  MIN(o.created_at) AS first_order_date,
  MAX(o.created_at) AS latest_order_date,
  CASE WHEN COUNT(o.id) > 1 THEN 'returning' ELSE 'one_time' END AS customer_segment
FROM public.profiles p
LEFT JOIN public.orders o ON o.user_id = p.id
WHERE p.role = 'customer'
GROUP BY p.id, p.email, p.display_name, p.created_at;

-- 3.5 Abandoned Carts Summary View
CREATE OR REPLACE VIEW public.view_abandoned_carts_summary
WITH (security_invoker = true) AS
SELECT
  c.id AS cart_id,
  c.user_id,
  pr.email AS customer_email,
  pr.display_name AS customer_name,
  c.created_at AS cart_created_at,
  c.updated_at AS cart_last_active_at,
  COUNT(ci.id) AS item_count,
  COALESCE(SUM(ci.quantity), 0) AS total_quantity,
  COALESCE(SUM(ci.quantity * ci.price_snapshot), 0) AS abandoned_value_usdt,
  NOW() - c.updated_at AS inactive_duration
FROM public.carts c
LEFT JOIN public.profiles pr ON pr.id = c.user_id
JOIN public.cart_items ci ON ci.cart_id = c.id
WHERE c.updated_at < (NOW() - INTERVAL '24 hours')
  AND NOT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.user_id = c.user_id
    AND o.created_at >= c.updated_at
  )
GROUP BY c.id, c.user_id, pr.email, pr.display_name, c.created_at, c.updated_at
ORDER BY abandoned_value_usdt DESC;


-- ─── 4. Initial Seed for Report Schedules ──────────────────────────────────

INSERT INTO public.admin_report_schedules (
  title, frequency, recipient_emails, metrics_included, format, is_active
)
VALUES
  (
    'Executive Daily Flash Report (USDT & Margin)',
    'daily',
    ARRAY['finance@lennoxchinamall.com', 'admin@lennoxchinamall.com'],
    ARRAY['revenue', 'orders', 'sourcing_margin', 'binance_pay_reconciliation', 'air_cargo_dispatches'],
    'pdf',
    true
  ),
  (
    'Weekly Sourcing & Multi-Warehouse Stock Audit',
    'weekly',
    ARRAY['sourcing-lead@lennoxchinamall.com', 'warehouse-sz@lennoxchinamall.com'],
    ARRAY['inventory_valuation', 'low_stock_radar', 'supplier_po_backlog', 'refunds_rma'],
    'csv',
    true
  ),
  (
    'Monthly Executive P&L & Customer Retention Dossier',
    'monthly',
    ARRAY['director@lennoxchinamall.com', 'superadmin@lennoxchinamall.com'],
    ARRAY['revenue', 'gross_net_profit', 'cohort_retention', 'conversion_funnel', 'abandoned_carts'],
    'pdf',
    true
  )
ON CONFLICT DO NOTHING;
