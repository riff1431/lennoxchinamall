"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Order, OrderStatus } from "@/types/database";
import { MOCK_ORDERS } from "@/lib/mockData";
import { logAuditEvent } from "@/lib/audit";

// ─── Fetch Admin Orders ─────────────────────────────────────────────────────

export interface FetchAdminOrdersParams {
  search?: string;
  status?: string;
  sourcingStatus?: string;
  page?: number;
  limit?: number;
}

export async function getAdminOrders(params?: FetchAdminOrdersParams) {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "finance_manager", "order_manager", "support_agent"].includes(session.role)) {
    return { success: false, error: "Unauthorized access", orders: [] };
  }

  try {
    const supabase = await createClient();

    let query = supabase
      .from("orders")
      .select("*, items:order_items(*), address:order_addresses(*)")
      .order("created_at", { ascending: false });

    if (params?.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }
    if (params?.sourcingStatus && params.sourcingStatus !== "all") {
      query = query.eq("sourcing_status", params.sourcingStatus);
    }
    if (params?.search && params.search.trim()) {
      const s = params.search.trim();
      query = query.or(`order_number.ilike.%${s}%,merchant_trade_no.ilike.%${s}%,tracking_number.ilike.%${s}%`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      let filtered = [...MOCK_ORDERS];
      if (params?.status && params.status !== "all") {
        filtered = filtered.filter((o) => o.status === params.status);
      }
      if (params?.search && params.search.trim()) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter((o) => o.order_number.toLowerCase().includes(s) || (o.tracking_number && o.tracking_number.toLowerCase().includes(s)));
      }
      return { success: true, orders: filtered as Order[] };
    }

    return { success: true, orders: data as Order[] };
  } catch (err) {
    console.error("Fetch admin orders error:", err);
    return { success: true, orders: MOCK_ORDERS as Order[] };
  }
}

// ─── Update Order Status ────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: OrderStatus, notes?: string) {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "finance_manager", "order_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) return { success: false, error: error.message };

    // Record status history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status,
      notes: notes || `Status changed to ${status} by admin`,
      changed_by: session.id,
      created_at: new Date().toISOString(),
    });

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "order",
      entityId: orderId,
      changes: { status, notes },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath("/account/orders");
    return { success: true, message: `Order status updated to ${status}!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update order status" };
  }
}

// ─── Update Tracking Number & Air Express Dispatch ──────────────────────────

export async function updateTrackingInfo(orderId: string, trackingNumber: string, courierCode = "YunExpress Air Freight") {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "order_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("orders")
      .update({
        tracking_number: trackingNumber,
        courier_code: courierCode,
        status: "shipped",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) return { success: false, error: error.message };

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "order",
      entityId: orderId,
      changes: { trackingNumber, courierCode },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
    return { success: true, message: `Air tracking number ${trackingNumber} added and marked as Shipped!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update tracking" };
  }
}
