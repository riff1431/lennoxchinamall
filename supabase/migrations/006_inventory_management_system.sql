-- ============================================================================
-- Lennox ChinaMall — Migration 006: Complete Inventory & Stock Management System
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Warehouses & Logistics Hubs
CREATE TABLE IF NOT EXISTS public.inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.inventory_locations (code, name, city, address)
VALUES
  ('SZ-MAIN', 'Shenzhen Factory Hub', 'Shenzhen, GD', 'Floor 8, SkyRover Drone Industrial Park, Nanshan'),
  ('GZ-LOG', 'Guangzhou QC Center', 'Guangzhou, GD', 'Building 4, Baiyun International Logistics Park'),
  ('HK-AIR', 'HK International Air Hub', 'Hong Kong', 'Cargo Terminal 2, Chek Lap Kok')
ON CONFLICT (code) DO NOTHING;

-- 2. Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.variants(id) ON DELETE SET NULL,
  sku TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT DEFAULT 'Standard',
  category_name TEXT NOT NULL DEFAULT 'Consumer Electronics',
  supplier_code TEXT NOT NULL DEFAULT 'SUP-SZ-9021',
  sourcing_cost_usdt NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  shenzhen_stock INT NOT NULL DEFAULT 0,
  guangzhou_stock INT NOT NULL DEFAULT 0,
  hk_air_stock INT NOT NULL DEFAULT 0,
  reserved_stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,
  reorder_point INT NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_code ON public.inventory_items(supplier_code);

-- 3. Inventory Movement Audit Ledger
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  warehouse TEXT NOT NULL, -- 'shenzhenStock', 'guangzhouStock', 'hkAirStock', 'all'
  change_qty INT NOT NULL,
  previous_total INT NOT NULL,
  new_total INT NOT NULL,
  reason TEXT NOT NULL, -- 'Received PO', 'Damaged', 'Customer Return', 'Order Reservation', 'Order Release', 'Manual Adjustment', 'Audit Count'
  reference_type TEXT, -- 'order', 'purchase_order', 'manual_adjustment', 'return'
  reference_id TEXT,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON public.inventory_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON public.inventory_movements(created_at DESC);

-- Enable RLS
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can manage inventory_locations" ON public.inventory_locations;
DROP POLICY IF EXISTS "Staff can manage inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Staff can manage inventory_movements" ON public.inventory_movements;

CREATE POLICY "Staff can manage inventory_locations"
  ON public.inventory_locations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'catalogue_manager', 'order_manager', 'support_agent')
    )
  );

CREATE POLICY "Staff can manage inventory_items"
  ON public.inventory_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'catalogue_manager', 'order_manager', 'support_agent')
    )
  );

CREATE POLICY "Staff can manage inventory_movements"
  ON public.inventory_movements FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'catalogue_manager', 'order_manager', 'support_agent')
    )
  );

-- 4. Concurrency-Safe Stored Procedure: Adjust Stock
CREATE OR REPLACE FUNCTION public.adjust_stock_atomic(
  p_item_id UUID,
  p_warehouse TEXT, -- 'shenzhenStock', 'guangzhouStock', 'hkAirStock'
  p_type TEXT, -- 'add', 'subtract', 'set'
  p_qty INT,
  p_reason TEXT,
  p_notes TEXT DEFAULT NULL,
  p_admin_email TEXT DEFAULT 'admin@lennoxchinamall.com'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_prev_total INT;
  v_new_total INT;
  v_delta INT;
  v_target_col TEXT;
BEGIN
  -- Lock row for concurrency
  SELECT * INTO v_item FROM public.inventory_items WHERE id = p_item_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inventory item not found');
  END IF;

  v_prev_total := v_item.shenzhen_stock + v_item.guangzhou_stock + v_item.hk_air_stock;

  IF p_warehouse = 'shenzhenStock' THEN
    IF p_type = 'add' THEN
      v_delta := p_qty;
      UPDATE public.inventory_items SET shenzhen_stock = shenzhen_stock + p_qty, updated_at = now() WHERE id = p_item_id;
    ELSIF p_type = 'subtract' THEN
      v_delta := -p_qty;
      UPDATE public.inventory_items SET shenzhen_stock = GREATEST(0, shenzhen_stock - p_qty), updated_at = now() WHERE id = p_item_id;
    ELSE -- set
      v_delta := p_qty - v_item.shenzhen_stock;
      UPDATE public.inventory_items SET shenzhen_stock = p_qty, updated_at = now() WHERE id = p_item_id;
    END IF;
  ELSIF p_warehouse = 'guangzhouStock' THEN
    IF p_type = 'add' THEN
      v_delta := p_qty;
      UPDATE public.inventory_items SET guangzhou_stock = guangzhou_stock + p_qty, updated_at = now() WHERE id = p_item_id;
    ELSIF p_type = 'subtract' THEN
      v_delta := -p_qty;
      UPDATE public.inventory_items SET guangzhou_stock = GREATEST(0, guangzhou_stock - p_qty), updated_at = now() WHERE id = p_item_id;
    ELSE
      v_delta := p_qty - v_item.guangzhou_stock;
      UPDATE public.inventory_items SET guangzhou_stock = p_qty, updated_at = now() WHERE id = p_item_id;
    END IF;
  ELSIF p_warehouse = 'hkAirStock' THEN
    IF p_type = 'add' THEN
      v_delta := p_qty;
      UPDATE public.inventory_items SET hk_air_stock = hk_air_stock + p_qty, updated_at = now() WHERE id = p_item_id;
    ELSIF p_type = 'subtract' THEN
      v_delta := -p_qty;
      UPDATE public.inventory_items SET hk_air_stock = GREATEST(0, hk_air_stock - p_qty), updated_at = now() WHERE id = p_item_id;
    ELSE
      v_delta := p_qty - v_item.hk_air_stock;
      UPDATE public.inventory_items SET hk_air_stock = p_qty, updated_at = now() WHERE id = p_item_id;
    END IF;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid warehouse code');
  END IF;

  -- Recompute new total
  SELECT (shenzhen_stock + guangzhou_stock + hk_air_stock) INTO v_new_total FROM public.inventory_items WHERE id = p_item_id;

  -- Log inventory movement
  INSERT INTO public.inventory_movements (
    inventory_item_id,
    sku,
    warehouse,
    change_qty,
    previous_total,
    new_total,
    reason,
    reference_type,
    notes,
    created_by
  ) VALUES (
    p_item_id,
    v_item.sku,
    p_warehouse,
    v_delta,
    v_prev_total,
    v_new_total,
    p_reason,
    'manual_adjustment',
    p_notes,
    p_admin_email
  );

  RETURN jsonb_build_object(
    'success', true,
    'sku', v_item.sku,
    'previous_total', v_prev_total,
    'new_total', v_new_total,
    'delta', v_delta
  );
END;
$$;

-- 5. Stored Procedure: Reserve Stock for Confirmed Order
CREATE OR REPLACE FUNCTION public.reserve_order_stock_atomic(
  p_order_id TEXT,
  p_items JSONB -- [{ "sku": "DRONE-4K-STD", "qty": 1 }]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_elem JSONB;
  v_sku TEXT;
  v_qty INT;
  v_item RECORD;
BEGIN
  FOR v_elem IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_sku := v_elem->>'sku';
    v_qty := (v_elem->>'qty')::INT;

    SELECT * INTO v_item FROM public.inventory_items WHERE sku = v_sku FOR UPDATE;
    IF FOUND THEN
      UPDATE public.inventory_items
      SET reserved_stock = reserved_stock + v_qty,
          updated_at = now()
      WHERE id = v_item.id;

      INSERT INTO public.inventory_movements (
        inventory_item_id,
        sku,
        warehouse,
        change_qty,
        previous_total,
        new_total,
        reason,
        reference_type,
        reference_id,
        created_by
      ) VALUES (
        v_item.id,
        v_sku,
        'all',
        -v_qty,
        (v_item.shenzhen_stock + v_item.guangzhou_stock + v_item.hk_air_stock),
        (v_item.shenzhen_stock + v_item.guangzhou_stock + v_item.hk_air_stock),
        'Order Reservation (USDT Escrow Confirmed)',
        'order',
        p_order_id,
        'system'
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
END;
$$;

-- 6. Stored Procedure: Release Reserved Stock on Cancellation
CREATE OR REPLACE FUNCTION public.release_order_stock_atomic(
  p_order_id TEXT,
  p_items JSONB -- [{ "sku": "DRONE-4K-STD", "qty": 1 }]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_elem JSONB;
  v_sku TEXT;
  v_qty INT;
  v_item RECORD;
BEGIN
  FOR v_elem IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_sku := v_elem->>'sku';
    v_qty := (v_elem->>'qty')::INT;

    SELECT * INTO v_item FROM public.inventory_items WHERE sku = v_sku FOR UPDATE;
    IF FOUND THEN
      UPDATE public.inventory_items
      SET reserved_stock = GREATEST(0, reserved_stock - v_qty),
          updated_at = now()
      WHERE id = v_item.id;

      INSERT INTO public.inventory_movements (
        inventory_item_id,
        sku,
        warehouse,
        change_qty,
        previous_total,
        new_total,
        reason,
        reference_type,
        reference_id,
        created_by
      ) VALUES (
        v_item.id,
        v_sku,
        'all',
        v_qty,
        (v_item.shenzhen_stock + v_item.guangzhou_stock + v_item.hk_air_stock),
        (v_item.shenzhen_stock + v_item.guangzhou_stock + v_item.hk_air_stock),
        'Order Release (Cancelled / Payment Expired)',
        'order',
        p_order_id,
        'system'
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
END;
$$;

-- ─── Seed Initial Inventory Records Linked to Products ──────────────────────

INSERT INTO public.inventory_items (
  sku, product_name, variant_name, category_name, supplier_code, sourcing_cost_usdt,
  shenzhen_stock, guangzhou_stock, hk_air_stock, reserved_stock, low_stock_threshold, reorder_point
)
VALUES
  ('DRONE-4K-1B', 'Eachine EX5 4K GPS FPV Drone', '1 Battery Pack (Single)', 'Consumer Electronics', 'SUP-SZ-9021', 115.00, 32, 14, 8, 2, 10, 20),
  ('DRONE-4K-2B', 'Eachine EX5 4K GPS FPV Drone', '2 Batteries + Hard Case', 'Consumer Electronics', 'SUP-SZ-9021', 135.00, 18, 6, 4, 1, 8, 15),
  ('3DP-K1MAX-STD', 'Creality K1 Max High-Speed 3D Printer', 'Factory Standard Lot', '3D Printers & CNC', 'SUP-NB-4412', 410.00, 12, 5, 2, 1, 5, 10),
  ('3DP-K1MAX-AI', 'Creality K1 Max High-Speed 3D Printer', 'AI Lidar + Camera Pack', '3D Printers & CNC', 'SUP-NB-4412', 465.00, 7, 3, 1, 0, 5, 10),
  ('AUDIO-WA3-PRO', 'BlitzWolf BW-WA3 Pro 120W Bluetooth Speaker', '16000mAh Powerbank Boombox', 'Audio & Sound', 'SUP-GZ-3188', 48.50, 45, 20, 15, 4, 15, 30),
  ('OBD2-MK808S', 'Autel MaxiCOM MK808S Automotive Scanner', 'Bidirectional Multi-Language', 'Automotive Hardware', 'SUP-SZ-1049', 240.00, 9, 3, 2, 1, 5, 12),
  ('FLASHLIGHT-XHP', 'Astrolux FT03 XHP50.2 4300lm Searchlight', 'SST40 Long-Throw 875m', 'Outdoor & Tactical', 'SUP-NB-7720', 22.00, 60, 25, 10, 3, 20, 40),
  ('CNC-3018-PRO', 'TwoTrees TTC 450 CNC Router Engraver', '500W Spindle High-Torque Kit', 'Industrial Machinery', 'SUP-DG-8822', 290.00, 4, 2, 1, 0, 3, 6)
ON CONFLICT (sku) DO UPDATE SET
  product_name = EXCLUDED.product_name,
  variant_name = EXCLUDED.variant_name,
  sourcing_cost_usdt = EXCLUDED.sourcing_cost_usdt,
  shenzhen_stock = EXCLUDED.shenzhen_stock,
  guangzhou_stock = EXCLUDED.guangzhou_stock,
  hk_air_stock = EXCLUDED.hk_air_stock;
