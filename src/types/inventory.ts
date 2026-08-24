/**
 * Lennox ChinaMall — Enterprise Inventory & Stock Management Type Definitions
 */

export interface InventoryItemRecord {
  id: string;
  product_id?: string;
  variant_id?: string;
  sku: string;
  product_name: string;
  variant_name?: string;
  category_name: string;
  supplier_code: string;
  sourcing_cost_usdt: number;
  shenzhen_stock: number;
  guangzhou_stock: number;
  hk_air_stock: number;
  reserved_stock: number;
  low_stock_threshold: number;
  reorder_point: number;
  total_stock?: number;
  available_stock?: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovementRecord {
  id: string;
  inventory_item_id: string;
  sku: string;
  warehouse: "shenzhenStock" | "guangzhouStock" | "hkAirStock" | "all";
  change_qty: number;
  previous_total: number;
  new_total: number;
  reason: string;
  reference_type?: "order" | "purchase_order" | "manual_adjustment" | "return";
  reference_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface InventoryOverviewMetrics {
  total_skus: number;
  total_stock_units: number;
  available_units: number;
  reserved_units: number;
  low_stock_alerts: number;
  out_of_stock_count: number;
  total_inventory_value_usdt: number;
}

export interface StockAdjustmentPayload {
  itemId: string;
  warehouse: "shenzhenStock" | "guangzhouStock" | "hkAirStock";
  type: "add" | "subtract" | "set";
  quantity: number;
  reason: string;
  notes?: string;
}
