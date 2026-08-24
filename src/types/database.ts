/**
 * Lennox ChinaMall — Database Type Definitions
 * Auto-generated types would come from `supabase gen types typescript`.
 * This is a placeholder with the core schema for development.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ProductStatus = "draft" | "published" | "archived" | "scheduled";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "sourcing"
  | "purchased"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "initiated"
  | "pending"
  | "paid"
  | "expired"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "review_required";

export type UserRole =
  | "customer"
  | "super_admin"
  | "catalogue_manager"
  | "order_manager"
  | "support_agent";

export type CouponType = "percentage" | "fixed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "received"
  | "refunded";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type BannerLocation = "hero" | "category" | "announcement";
export type MenuLocation = "header" | "footer" | "mobile";

export type RedirectType = "301" | "302";

// ─── Core Entity Types ──────────────────────────────────────────────────────

export interface Profile {
  id: string; // matches auth.users.id
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  street_line_1: string;
  street_line_2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Catalogue ──────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  children?: Category[];
  parent?: Category | null;
  product_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  product_count?: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  category_id: string;
  brand_id: string | null;
  base_price: number;
  compare_at_price: number | null;
  cost: number | null; // Private: admin only
  status: ProductStatus;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_flash_deal: boolean;
  flash_deal_ends_at: string | null;
  tags: string[];
  weight: number | null;
  dimensions: Json | null; // { length, width, height }
  shipping_origin: string | null;
  hs_code: string | null;
  supplier_code: string | null; // Private: admin only
  seo_title: string | null;
  seo_description: string | null;
  avg_rating: number;
  review_count: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
  // Relations & Rich Metadata
  category?: Category;
  brand?: Brand | null;
  variants?: Variant[];
  media?: ProductMedia[];
  videos?: ProductVideo[];
  reviews?: Review[];
  specifications?: Record<string, string>;
  specs?: Record<string, string>;
}

export interface Variant {
  id: string;
  product_id: string;
  sku: string;
  title?: string;
  price: number;
  compare_at_price: number | null;
  cost: number | null; // Private: admin only
  stock: number;
  low_stock_threshold: number;
  weight: number | null;
  attributes: Json; // { color: "Red", size: "XL" }
  image_url: string | null;
  supplier_code: string | null; // Private: admin only
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ProductMedia {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  type: "image";
  position: number;
  created_at: string;
}

export interface ProductVideo {
  id: string;
  product_id: string;
  url: string;
  type: "uploaded" | "embed";
  position: number; // 1 or 2 (max 2 videos)
  title: string | null;
  created_at: string;
}

// ─── Suppliers (Private/Admin Only) ─────────────────────────────────────────

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string | null;
  platform: string | null; // AliExpress, 1688, Taobao, etc.
  source_url: string | null;
  region: string | null;
  lead_time_days: number | null;
  reliability_notes: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_id: string;
  supplier_sku: string | null;
  purchase_url: string | null;
  min_order: number | null;
  acquisition_price: number | null;
  currency: string;
  last_checked_at: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface SourcingPurchase {
  id: string;
  order_id: string;
  order_item_id?: string | null;
  supplier_id?: string | null;
  supplier_order_number?: string | null;
  purchase_date?: string | null;
  actual_cost?: number | null;
  shipping_cost?: number | null;
  currency?: string;
  buyer_admin_id?: string;
  expected_arrival?: string | null;
  proof_url?: string | null;
  tracking_number?: string | null;
  notes?: string | null;
  status: "pending" | "ordered" | "received" | "issue";
  created_at: string;
  updated_at?: string;
}

// ─── Commerce ───────────────────────────────────────────────────────────────

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  price_snapshot: number;
  created_at: string;
  // Relations
  variant?: Variant & { product?: Product };
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  // Relations
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_spend?: number | null;
  min_order_amount?: number | null;
  max_uses?: number | null;
  usage_limit?: number | null;
  used_count?: number;
  description?: string | null;
  per_user_limit?: number;
  scope?: Json | null;
  valid_from?: string;
  valid_until?: string;
  expires_at?: string | null;
  is_active: boolean;
  usage_count?: number;
  created_at: string;
}

export interface FlashDeal {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  discount_percentage?: number | null;
  created_at: string;
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  sourcing_status?: string | null;
  subtotal: number;
  discount: number;
  discount_amount?: number;
  shipping_cost: number;
  shipping_fee?: number;
  total: number;
  total_amount?: number;
  currency: string;
  payment_method?: string;
  payment_status?: PaymentStatus;
  merchant_trade_no?: string;
  prepay_id?: string;
  shipping_method?: string;
  tracking_number?: string | null;
  courier_code?: string | null;
  tracking_url?: string | null;
  coupon_id?: string | null;
  notes?: string | null;
  internal_notes?: string | null; // Admin only
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  items?: OrderItem[];
  address?: OrderAddress;
  addresses?: OrderAddress[];
  status_history?: OrderStatusHistory[];
  payment?: Payment;
  shipment?: Shipment;
  customer?: Profile;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id?: string | null;
  variant_id?: string | null;
  title?: string;
  product_title?: string; // Snapshot
  sku?: string | null;
  variant_attributes?: Json; // Snapshot
  attributes?: Json;
  quantity: number;
  price?: number;
  unit_price?: number;
  total?: number;
  image_url?: string | null;
  supplier_code?: string | null;
  sourcing_status?: string | null;
  created_at?: string;
  // Relations
  variant?: Variant & { product?: Product };
}

export interface OrderAddress {
  id: string;
  order_id: string;
  type: "shipping" | "billing";
  full_name: string;
  street_line_1: string;
  street_line_2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string | null;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Payments ───────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  order_id: string;
  gateway_txn_id: string | null;
  merchant_trade_no: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotency_key: string;
  gateway_response: Json | null;
  qr_url: string | null;
  deep_link: string | null;
  expires_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentEvent {
  id: string;
  payment_id: string;
  event_type: string;
  payload: Json;
  signature_valid: boolean;
  created_at: string;
}

export interface Refund {
  id: string;
  payment_id: string;
  amount: number;
  reason: string;
  status: "pending" | "processed" | "failed";
  admin_id: string;
  gateway_reference: string | null;
  created_at: string;
}

// ─── Engagement ─────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
  // Relations
  media?: ReviewMedia[];
  user?: Pick<Profile, "display_name" | "avatar_url">;
}

export interface ReviewMedia {
  id: string;
  review_id: string;
  url: string;
  type: "image" | "video";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Json | null;
  read_at: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  priority: TicketPriority;
  category: string | null;
  status: TicketStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  body: string;
  is_internal: boolean;
  attachments: string[];
  created_at: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  order_item_id: string | null;
  user_id: string;
  reason: string;
  description: string | null;
  evidence_urls: string[];
  status: ReturnStatus;
  decision_note: string | null;
  decided_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Content ────────────────────────────────────────────────────────────────

export interface Page {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  location: BannerLocation;
  image_desktop: string;
  image_mobile: string | null;
  link: string | null;
  position: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface HomepageSection {
  id: string;
  type: string; // "hero" | "categories" | "flash_deals" | "products" | "banners" | "trust_strip"
  title: string | null;
  config: Json; // Section-specific configuration
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: string;
  location: MenuLocation;
  items: Json; // Nested menu items array
  updated_at: string;
}

export interface SeoRedirect {
  id: string;
  from_path: string;
  to_path: string;
  type: RedirectType;
  created_at: string;
}

// ─── Governance ─────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: Json | null;
  ip: string | null;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: Json;
  updated_at: string;
}

export interface IntegrationHealth {
  id: string;
  service: string;
  status: "healthy" | "degraded" | "down";
  last_check: string;
  error: string | null;
}

// ─── Database type for Supabase client ──────────────────────────────────────

export type Database = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Tables: Record<string, { Row: any; Insert: any; Update: any; Relationships: any[] }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Views: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Functions: Record<string, any>;
    Enums: {
      product_status: ProductStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      user_role: UserRole;
      coupon_type: CouponType;
    };
  };
};
