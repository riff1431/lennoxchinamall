-- ============================================================================
-- Lennox ChinaMall — Full Database Schema Migration
-- Covers all 9 domains: Identity, Catalogue, Suppliers, Commerce, Orders,
-- Payments, Engagement, Content, Governance
-- ============================================================================

-- ─── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Trigram for fuzzy search / typo tolerance

-- ─── Enums ──────────────────────────────────────────────────────────────────
CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived', 'scheduled');
CREATE TYPE order_status AS ENUM ('pending_payment', 'paid', 'sourcing', 'purchased', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('initiated', 'pending', 'paid', 'expired', 'failed', 'refunded', 'partially_refunded', 'review_required');
CREATE TYPE user_role AS ENUM ('customer', 'super_admin', 'catalogue_manager', 'order_manager', 'support_agent');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE return_status AS ENUM ('requested', 'approved', 'rejected', 'received', 'refunded');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE supplier_status AS ENUM ('active', 'inactive');
CREATE TYPE sourcing_status AS ENUM ('pending', 'ordered', 'received', 'issue');
CREATE TYPE refund_status AS ENUM ('pending', 'processed', 'failed');
CREATE TYPE banner_location AS ENUM ('hero', 'category', 'announcement');
CREATE TYPE menu_location AS ENUM ('header', 'footer', 'mobile');
CREATE TYPE redirect_type AS ENUM ('301', '302');
CREATE TYPE integration_status AS ENUM ('healthy', 'degraded', 'down');


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. IDENTITY DOMAIN
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url  TEXT,
  phone       TEXT,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'customer',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL DEFAULT 'Home',
  full_name     TEXT NOT NULL,
  street_line_1 TEXT NOT NULL,
  street_line_2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  country       TEXT NOT NULL,
  postal_code   TEXT NOT NULL,
  phone         TEXT,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. CATALOGUE DOMAIN
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  description     TEXT,
  image_url       TEXT,
  icon            TEXT,
  position        INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  seo_title       TEXT,
  seo_description TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE TABLE brands (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_brands_slug ON brands(slug);

CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  sku               TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description       TEXT,
  category_id       UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id          UUID REFERENCES brands(id) ON DELETE SET NULL,
  base_price        NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
  compare_at_price  NUMERIC(12,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  cost              NUMERIC(12,2),  -- Private: admin only
  status            product_status NOT NULL DEFAULT 'draft',
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller    BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival    BOOLEAN NOT NULL DEFAULT FALSE,
  is_flash_deal     BOOLEAN NOT NULL DEFAULT FALSE,
  flash_deal_ends_at TIMESTAMPTZ,
  tags              TEXT[] DEFAULT '{}',
  weight            NUMERIC(8,2),
  dimensions        JSONB,
  shipping_origin   TEXT,
  hs_code           TEXT,
  supplier_code     TEXT,  -- Private: admin only
  seo_title         TEXT,
  seo_description   TEXT,
  avg_rating        NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count      INT NOT NULL DEFAULT 0,
  sold_count        INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_flash_deal ON products(is_flash_deal) WHERE is_flash_deal = TRUE;
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(sku, '')));
CREATE INDEX idx_products_title_trgm ON products USING gin(title gin_trgm_ops);

CREATE TABLE variants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku               TEXT NOT NULL,
  price             NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price  NUMERIC(12,2),
  cost              NUMERIC(12,2),  -- Private: admin only
  stock             INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  weight            NUMERIC(8,2),
  attributes        JSONB NOT NULL DEFAULT '{}',
  image_url         TEXT,
  supplier_code     TEXT,  -- Private: admin only
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  position          INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_variants_product ON variants(product_id);
CREATE INDEX idx_variants_sku ON variants(sku);

CREATE TABLE media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  type        TEXT NOT NULL DEFAULT 'image',
  position    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_product ON media(product_id);

CREATE TABLE product_videos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'uploaded', -- 'uploaded' | 'embed'
  position    INT NOT NULL CHECK (position IN (1, 2)),  -- Max 2 videos per product
  title       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, position)
);

CREATE INDEX idx_product_videos_product ON product_videos(product_id);

CREATE TABLE inventory_movements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id      UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  quantity_change  INT NOT NULL,  -- positive = increase, negative = decrease
  reason          TEXT NOT NULL,  -- 'sale', 'restock', 'adjustment', 'return', 'cancel'
  reference_id    UUID,           -- order_id or admin action id
  reference_type  TEXT,           -- 'order', 'admin_adjustment', 'return'
  admin_id        UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_movements_variant ON inventory_movements(variant_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. SUPPLIER DOMAIN (Private / Admin Only)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE suppliers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  contact           TEXT,
  platform          TEXT,  -- 'AliExpress', '1688', 'Taobao', etc.
  source_url        TEXT,
  region            TEXT,
  lead_time_days    INT,
  reliability_notes TEXT,
  status            supplier_status NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suppliers_code ON suppliers(code);

CREATE TABLE supplier_products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id       UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_sku      TEXT,
  purchase_url      TEXT,
  min_order         INT,
  acquisition_price NUMERIC(12,2),
  currency          TEXT NOT NULL DEFAULT 'USD',
  last_checked_at   TIMESTAMPTZ,
  is_primary        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, product_id)
);

CREATE INDEX idx_supplier_products_product ON supplier_products(product_id);
CREATE INDEX idx_supplier_products_supplier ON supplier_products(supplier_id);

CREATE TABLE sourcing_purchases (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID NOT NULL,  -- FK added after orders table
  order_item_id         UUID,
  supplier_id           UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  supplier_order_number TEXT,
  purchase_date         TIMESTAMPTZ,
  actual_cost           NUMERIC(12,2),
  currency              TEXT NOT NULL DEFAULT 'USD',
  buyer_admin_id        UUID NOT NULL REFERENCES profiles(id),
  expected_arrival      TIMESTAMPTZ,
  proof_url             TEXT,
  notes                 TEXT,
  status                sourcing_status NOT NULL DEFAULT 'pending',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sourcing_purchases_order ON sourcing_purchases(order_id);
CREATE INDEX idx_sourcing_purchases_supplier ON sourcing_purchases(supplier_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. COMMERCE DOMAIN
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE carts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id  TEXT,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);

CREATE TABLE cart_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id         UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id      UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_snapshot  NUMERIC(12,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cart_id, variant_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

CREATE TABLE wishlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);

CREATE TABLE coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  type            coupon_type NOT NULL DEFAULT 'percentage',
  value           NUMERIC(12,2) NOT NULL CHECK (value > 0),
  min_spend       NUMERIC(12,2),
  max_uses        INT,
  per_user_limit  INT NOT NULL DEFAULT 1,
  scope           JSONB,  -- { category_ids: [], product_ids: [] }
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until     TIMESTAMPTZ NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  usage_count     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code ON coupons(code);

CREATE TABLE coupon_redemptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id    UUID,  -- FK added after orders table
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. ORDERS DOMAIN
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT NOT NULL UNIQUE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status          order_status NOT NULL DEFAULT 'pending_payment',
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost   NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'USDT',
  coupon_id       UUID REFERENCES coupons(id) ON DELETE SET NULL,
  notes           TEXT,
  internal_notes  TEXT,  -- Admin only
  assigned_to     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Now add foreign keys that reference orders
ALTER TABLE sourcing_purchases ADD CONSTRAINT fk_sourcing_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE coupon_redemptions ADD CONSTRAINT fk_coupon_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

CREATE TABLE order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id          UUID NOT NULL REFERENCES variants(id) ON DELETE RESTRICT,
  product_title       TEXT NOT NULL,  -- Snapshot at time of order
  variant_attributes  JSONB NOT NULL DEFAULT '{}',  -- Snapshot
  quantity            INT NOT NULL CHECK (quantity > 0),
  unit_price          NUMERIC(12,2) NOT NULL,
  total               NUMERIC(12,2) NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('shipping', 'billing')),
  full_name     TEXT NOT NULL,
  street_line_1 TEXT NOT NULL,
  street_line_2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  country       TEXT NOT NULL,
  postal_code   TEXT NOT NULL,
  phone         TEXT
);

CREATE INDEX idx_order_addresses_order ON order_addresses(order_id);

CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  changed_by  UUID REFERENCES profiles(id),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

CREATE TABLE fulfilments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shipments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier         TEXT,
  tracking_number TEXT,
  tracking_url    TEXT,
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_order ON shipments(order_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. PAYMENTS DOMAIN
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  gateway_txn_id    TEXT,
  merchant_trade_no TEXT NOT NULL UNIQUE,
  amount            NUMERIC(12,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USDT',
  status            payment_status NOT NULL DEFAULT 'initiated',
  idempotency_key   TEXT NOT NULL UNIQUE,
  gateway_response  JSONB,
  qr_url            TEXT,
  deep_link         TEXT,
  expires_at        TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_merchant_trade ON payments(merchant_trade_no);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_idempotency ON payments(idempotency_key);

CREATE TABLE payment_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_events_payment ON payment_events(payment_id);

CREATE TABLE refunds (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id        UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  amount            NUMERIC(12,2) NOT NULL,
  reason            TEXT NOT NULL,
  status            refund_status NOT NULL DEFAULT 'pending',
  admin_id          UUID NOT NULL REFERENCES profiles(id),
  gateway_reference TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refunds_payment ON refunds(payment_id);

CREATE TABLE reconciliation_actions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id  UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  action      TEXT NOT NULL,
  reason      TEXT NOT NULL,
  admin_id    UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. ENGAGEMENT DOMAIN
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE reviews (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id            UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating                INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title                 TEXT,
  body                  TEXT,
  is_verified_purchase  BOOLEAN NOT NULL DEFAULT FALSE,
  status                review_status NOT NULL DEFAULT 'pending',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)  -- One review per product per user
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);

CREATE TABLE review_media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'image', -- 'image' | 'video'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

CREATE TABLE support_tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  subject     TEXT NOT NULL,
  priority    ticket_priority NOT NULL DEFAULT 'medium',
  category    TEXT,
  status      ticket_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

CREATE TABLE ticket_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id),
  body        TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  attachments TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

CREATE TABLE return_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  order_item_id   UUID REFERENCES order_items(id),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason          TEXT NOT NULL,
  description     TEXT,
  evidence_urls   TEXT[] DEFAULT '{}',
  status          return_status NOT NULL DEFAULT 'requested',
  decision_note   TEXT,
  decided_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_return_requests_order ON return_requests(order_id);
CREATE INDEX idx_return_requests_user ON return_requests(user_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 8. CONTENT DOMAIN
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE pages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  body            TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  seo_title       TEXT,
  seo_description TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pages_slug ON pages(slug);

CREATE TABLE banners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  location      banner_location NOT NULL DEFAULT 'hero',
  image_desktop TEXT NOT NULL,
  image_mobile  TEXT,
  link          TEXT,
  position      INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  start_date    TIMESTAMPTZ,
  end_date      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE homepage_sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL,  -- 'hero', 'categories', 'flash_deals', 'products', 'banners', 'trust_strip'
  title       TEXT,
  config      JSONB NOT NULL DEFAULT '{}',
  position    INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE menus (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location    menu_location NOT NULL UNIQUE,
  items       JSONB NOT NULL DEFAULT '[]',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE seo_redirects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_path   TEXT NOT NULL UNIQUE,
  to_path     TEXT NOT NULL,
  type        redirect_type NOT NULL DEFAULT '301',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 9. GOVERNANCE DOMAIN
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE admin_audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  changes     JSONB,
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON admin_audit_logs(created_at DESC);

CREATE TABLE settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE integration_health (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service     TEXT NOT NULL UNIQUE,
  status      integration_status NOT NULL DEFAULT 'healthy',
  last_check  TIMESTAMPTZ NOT NULL DEFAULT now(),
  error       TEXT
);

CREATE TABLE jobs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  payload       JSONB,
  result        JSONB,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS: Auto-update updated_at
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles', 'addresses', 'categories', 'products', 'variants',
      'suppliers', 'sourcing_purchases', 'carts', 'orders', 'shipments',
      'payments', 'reviews', 'support_tickets', 'return_requests',
      'pages', 'homepage_sections', 'fulfilments'
    ])
  LOOP
    EXECUTE format('
      CREATE TRIGGER trigger_update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', tbl, tbl);
  END LOOP;
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: Auto-create profile on user sign-up
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles', 'addresses', 'categories', 'brands', 'products', 'variants',
      'media', 'product_videos', 'inventory_movements',
      'suppliers', 'supplier_products', 'sourcing_purchases',
      'carts', 'cart_items', 'wishlists', 'coupons', 'coupon_redemptions',
      'orders', 'order_items', 'order_addresses', 'order_status_history',
      'fulfilments', 'shipments',
      'payments', 'payment_events', 'refunds', 'reconciliation_actions',
      'reviews', 'review_media', 'notifications', 'support_tickets',
      'ticket_messages', 'return_requests',
      'pages', 'banners', 'homepage_sections', 'menus', 'seo_redirects',
      'admin_audit_logs', 'settings', 'integration_health', 'jobs'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END;
$$;

-- ─── Helper function to check admin role ────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'catalogue_manager', 'order_manager', 'support_agent')
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── PROFILES ───────────────────────────────────────────────────────────────
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid())); -- Cannot change own role
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Super admins can update any profile" ON profiles FOR UPDATE USING (is_super_admin());

-- ─── ADDRESSES ──────────────────────────────────────────────────────────────
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view addresses" ON addresses FOR SELECT USING (is_admin());

-- ─── CATEGORIES (public read) ───────────────────────────────────────────────
CREATE POLICY "Anyone can read active categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (is_admin());

-- ─── BRANDS (public read) ──────────────────────────────────────────────────
CREATE POLICY "Anyone can read active brands" ON brands FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage brands" ON brands FOR ALL USING (is_admin());

-- ─── PRODUCTS (public read published only, strip private fields in service layer) ──
CREATE POLICY "Anyone can read published products" ON products FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage products" ON products FOR ALL USING (is_admin());

-- ─── VARIANTS (public read for active variants of published products) ──────
CREATE POLICY "Anyone can read active variants" ON variants FOR SELECT
  USING (is_active = TRUE AND EXISTS (SELECT 1 FROM products WHERE products.id = variants.product_id AND products.status = 'published'));
CREATE POLICY "Admins manage variants" ON variants FOR ALL USING (is_admin());

-- ─── MEDIA (public read) ───────────────────────────────────────────────────
CREATE POLICY "Anyone can read media" ON media FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage media" ON media FOR ALL USING (is_admin());

-- ─── PRODUCT VIDEOS (public read) ──────────────────────────────────────────
CREATE POLICY "Anyone can read product videos" ON product_videos FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage product videos" ON product_videos FOR ALL USING (is_admin());

-- ─── INVENTORY MOVEMENTS (admin only) ──────────────────────────────────────
CREATE POLICY "Admins manage inventory" ON inventory_movements FOR ALL USING (is_admin());

-- ─── SUPPLIERS (admin only) ────────────────────────────────────────────────
CREATE POLICY "Admins manage suppliers" ON suppliers FOR ALL USING (is_admin());
CREATE POLICY "Admins manage supplier products" ON supplier_products FOR ALL USING (is_admin());
CREATE POLICY "Admins manage sourcing" ON sourcing_purchases FOR ALL USING (is_admin());

-- ─── CARTS ─────────────────────────────────────────────────────────────────
CREATE POLICY "Users manage own cart" ON carts FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users manage own cart items" ON cart_items FOR ALL
  USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR carts.user_id IS NULL)));

-- ─── WISHLISTS ─────────────────────────────────────────────────────────────
CREATE POLICY "Users manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- ─── COUPONS (public read active ones) ─────────────────────────────────────
CREATE POLICY "Anyone can read active coupons" ON coupons FOR SELECT USING (is_active = TRUE AND valid_until > now());
CREATE POLICY "Admins manage coupons" ON coupons FOR ALL USING (is_admin());
CREATE POLICY "Users can view own redemptions" ON coupon_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts redemptions" ON coupon_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── ORDERS ────────────────────────────────────────────────────────────────
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage orders" ON orders FOR ALL USING (is_admin());
CREATE POLICY "Users view own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins manage order items" ON order_items FOR ALL USING (is_admin());
CREATE POLICY "Users view own order addresses" ON order_addresses FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_addresses.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins manage order addresses" ON order_addresses FOR ALL USING (is_admin());
CREATE POLICY "Users view own order history" ON order_status_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins manage order history" ON order_status_history FOR ALL USING (is_admin());
CREATE POLICY "Admins manage fulfilments" ON fulfilments FOR ALL USING (is_admin());
CREATE POLICY "Users view own shipments" ON shipments FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins manage shipments" ON shipments FOR ALL USING (is_admin());

-- ─── PAYMENTS ──────────────────────────────────────────────────────────────
CREATE POLICY "Users view own payments" ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins manage payments" ON payments FOR ALL USING (is_admin());
CREATE POLICY "Admins view payment events" ON payment_events FOR ALL USING (is_admin());
CREATE POLICY "Admins manage refunds" ON refunds FOR ALL USING (is_admin());
CREATE POLICY "Super admins manage reconciliation" ON reconciliation_actions FOR ALL USING (is_super_admin());

-- ─── REVIEWS ───────────────────────────────────────────────────────────────
CREATE POLICY "Anyone can read approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users manage own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage reviews" ON reviews FOR ALL USING (is_admin());
CREATE POLICY "Anyone can read review media" ON review_media FOR SELECT USING (TRUE);

-- ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── SUPPORT ───────────────────────────────────────────────────────────────
CREATE POLICY "Users manage own tickets" ON support_tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage tickets" ON support_tickets FOR ALL USING (is_admin());
CREATE POLICY "Users view own ticket messages" ON ticket_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_messages.ticket_id AND support_tickets.user_id = auth.uid()) AND is_internal = FALSE);
CREATE POLICY "Users create ticket messages" ON ticket_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_messages.ticket_id AND support_tickets.user_id = auth.uid()));
CREATE POLICY "Admins manage ticket messages" ON ticket_messages FOR ALL USING (is_admin());

-- ─── RETURNS ───────────────────────────────────────────────────────────────
CREATE POLICY "Users manage own returns" ON return_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage returns" ON return_requests FOR ALL USING (is_admin());

-- ─── CONTENT (public read published) ───────────────────────────────────────
CREATE POLICY "Anyone can read published pages" ON pages FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage pages" ON pages FOR ALL USING (is_admin());
CREATE POLICY "Anyone can read active banners" ON banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage banners" ON banners FOR ALL USING (is_admin());
CREATE POLICY "Anyone can read active homepage sections" ON homepage_sections FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage homepage sections" ON homepage_sections FOR ALL USING (is_admin());
CREATE POLICY "Anyone can read menus" ON menus FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage menus" ON menus FOR ALL USING (is_admin());
CREATE POLICY "Admins manage redirects" ON seo_redirects FOR ALL USING (is_admin());

-- ─── GOVERNANCE (admin only) ───────────────────────────────────────────────
CREATE POLICY "Admins view audit logs" ON admin_audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "System inserts audit logs" ON admin_audit_logs FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins manage settings" ON settings FOR ALL USING (is_admin());
CREATE POLICY "Anyone can read settings" ON settings FOR SELECT USING (TRUE); -- Public settings like store name
CREATE POLICY "Admins view integration health" ON integration_health FOR ALL USING (is_admin());
CREATE POLICY "Admins manage jobs" ON jobs FOR ALL USING (is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- SEED: Default settings and menus
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO settings (key, value) VALUES
  ('store_name', '"Lennox ChinaMall"'),
  ('store_currency', '"USDT"'),
  ('store_timezone', '"UTC"'),
  ('free_shipping_threshold', '50'),
  ('maintenance_mode', 'false');

INSERT INTO menus (location, items) VALUES
  ('header', '[]'),
  ('footer', '[]'),
  ('mobile', '[]');
