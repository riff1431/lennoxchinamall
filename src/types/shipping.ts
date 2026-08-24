/**
 * Lennox ChinaMall — Enterprise Shipping & Order Fulfillment Type Definitions
 */

export type FulfillmentStatus =
  | "processing"
  | "packing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled";

export interface FulfillmentItem {
  sku: string;
  name: string;
  qty: number;
  hs_code?: string;
  weight_kg?: number;
}

export interface FulfillmentRecord {
  id: string;
  order_id: string;
  order_number: string;
  recipient_name: string;
  recipient_country: string;
  recipient_city: string;
  recipient_address?: string;
  courier: string;
  service_type: string;
  tracking_number: string;
  tracking_url?: string;
  status: FulfillmentStatus;
  weight_kg: number;
  origin_hub: string;
  items: FulfillmentItem[];
  internal_notes?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FulfillmentTimelineEvent {
  id: string;
  fulfillment_id: string;
  status: string;
  title: string;
  location: string;
  description?: string;
  created_at: string;
}

export interface ShippingMethodRecord {
  id: string;
  name: string;
  carrier: string;
  service_type: string;
  base_cost_usdt: number;
  per_kg_cost_usdt: number;
  estimated_days_min: number;
  estimated_days_max: number;
  free_shipping_min_order?: number;
  allowed_zones: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderReturnRecord {
  id: string;
  order_id: string;
  order_number: string;
  customer_email: string;
  reason: string;
  status: "requested" | "approved" | "item_received" | "refunded" | "rejected";
  refund_amount_usdt: number;
  return_tracking?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingOverviewMetrics {
  active_in_transit: number;
  out_for_delivery: number;
  delivered_count: number;
  pending_dispatch: number;
  open_returns_count: number;
  avg_transit_days: number;
}
