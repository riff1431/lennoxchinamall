-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 010_performance_and_query_indexes.sql
-- Description: Comprehensive performance, query optimization, and composite
--              indexing across Products, Orders, Reviews, Notifications, and Media.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Products Composite Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_active_category_rating 
  ON products(is_active, category_id, avg_rating DESC);

CREATE INDEX IF NOT EXISTS idx_products_flash_deals 
  ON products(is_flash_deal, is_active, created_at DESC) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_bestsellers 
  ON products(is_best_seller, is_active, sold_count DESC) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_brand_active 
  ON products(brand_id, is_active);

-- 2. Variants Stock & Product Link
CREATE INDEX IF NOT EXISTS idx_product_variants_stock_lookup 
  ON product_variants(product_id, stock, price);

-- 3. Orders User & Status Telemetry
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created 
  ON orders(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
  ON orders(payment_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_product_lookup 
  ON order_items(product_id, order_id);

-- 4. Reviews & Rating Filters
CREATE INDEX IF NOT EXISTS idx_reviews_product_status_rating 
  ON reviews(product_id, status, rating DESC, helpful_votes DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_user_verified 
  ON reviews(user_id, is_verified_purchase);

-- 5. Notifications Fast Fetch & Unread Count
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, read_at, created_at DESC);

-- 6. Audit Logs Fast Search & Filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_time 
  ON audit_logs(user_id, action, created_at DESC);

-- 7. Media Library Storage Lookup
CREATE INDEX IF NOT EXISTS idx_media_files_folder_type 
  ON media_files(folder, mime_type, created_at DESC);
