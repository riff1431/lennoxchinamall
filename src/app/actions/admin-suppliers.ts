"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Supplier, SourcingPurchase } from "@/types/database";
import { MOCK_SUPPLIERS, MOCK_ORDERS } from "@/lib/mockData";
import { logAuditEvent } from "@/lib/audit";

// ─── Fetch Suppliers ────────────────────────────────────────────────────────

export async function getSuppliers() {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "catalogue_manager", "product_manager", "order_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access", suppliers: [], sourcingPurchases: [] };
  }

  try {
    const supabase = await createClient();

    const { data: suppliersData, error: supErr } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: purchasesData } = await supabase
      .from("sourcing_purchases")
      .select("*")
      .order("purchase_date", { ascending: false });

    const suppliers = suppliersData && suppliersData.length > 0 ? suppliersData : MOCK_SUPPLIERS;
    const purchases = purchasesData && purchasesData.length > 0 ? purchasesData : getDemoPurchases();

    return { success: true, suppliers: suppliers as Supplier[], sourcingPurchases: purchases as SourcingPurchase[] };
  } catch (err) {
    console.error("Fetch suppliers error:", err);
    return { success: true, suppliers: MOCK_SUPPLIERS, sourcingPurchases: getDemoPurchases() };
  }
}

// ─── Create Supplier ────────────────────────────────────────────────────────

export async function createSupplier(formData: FormData) {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "catalogue_manager", "product_manager", "order_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access" };
  }

  const name = formData.get("name") as string;
  const region = (formData.get("region") as string) || "Guangdong, China";
  const platform = (formData.get("platform") as string) || "1688 Factory Direct";
  const contact = formData.get("contact") as string;
  const sourceUrl = formData.get("source_url") as string;
  const leadTimeDays = Number(formData.get("lead_time_days")) || 3;
  const reliabilityNotes = formData.get("reliability_notes") as string;
  const status = (formData.get("status") as string) || "active";

  // Generate private confidential supplier code (e.g. SUP-SZ-7749)
  const regionPrefix = region.includes("Shenzhen") ? "SZ" : region.includes("Ningbo") ? "NB" : region.includes("Guangzhou") ? "GZ" : "CN";
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const code = (formData.get("code") as string) || `SUP-${regionPrefix}-${randomId}`;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("suppliers")
      .insert({
        code,
        name,
        region,
        platform,
        contact,
        source_url: sourceUrl,
        lead_time_days: leadTimeDays,
        reliability_notes: reliabilityNotes,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "setting",
      changes: { action: "SUPPLIER_CREATED", code, name },
    });

    revalidatePath("/admin/suppliers");
    return { success: true, message: `Supplier ${name} (${code}) added to directory!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create supplier" };
  }
}

// ─── Update Sourcing Purchase ───────────────────────────────────────────────

export async function createSourcingPurchase(formData: FormData) {
  const session = await getSession();
  if (!session || !["super_admin", "admin", "order_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access" };
  }

  const orderId = formData.get("order_id") as string;
  const supplierId = formData.get("supplier_id") as string;
  const supplierOrderNumber = formData.get("supplier_order_number") as string;
  const actualCost = Number(formData.get("actual_cost")) || 0;
  const trackingNumber = formData.get("tracking_number") as string;
  const notes = formData.get("notes") as string;

  try {
    const supabase = await createClient();

    const { error } = await supabase.from("sourcing_purchases").insert({
      order_id: orderId,
      supplier_id: supplierId || null,
      supplier_order_number: supplierOrderNumber,
      actual_cost: actualCost,
      tracking_number: trackingNumber,
      notes,
      status: "ordered",
      purchase_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    if (error) return { success: false, error: error.message };

    // Update order sourcing status
    await supabase.from("orders").update({ sourcing_status: "purchased" }).eq("order_number", orderId);

    revalidatePath("/admin/suppliers");
    revalidatePath("/admin/orders");
    return { success: true, message: `Sourcing PO recorded for Order #${orderId}!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record PO" };
  }
}

function getDemoPurchases(): SourcingPurchase[] {
  return [
    {
      id: "po-1",
      order_id: "LCM-20260823-7492",
      order_item_id: "item-1",
      supplier_id: "s1000000-0000-0000-0000-000000000001",
      supplier_order_number: "1688-PO-99201948",
      purchase_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      actual_cost: 95.00,
      shipping_cost: 12.50,
      currency: "USDT",
      status: "received",
      tracking_number: "SF-EXPRESS-9920194",
      notes: "Direct Shenzhen factory lot dispatch.",
      created_at: new Date().toISOString(),
    },
    {
      id: "po-2",
      order_id: "LCM-20260823-8831",
      order_item_id: "item-2",
      supplier_id: "s1000000-0000-0000-0000-000000000002",
      supplier_order_number: "1688-PO-88192014",
      purchase_date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      actual_cost: 110.00,
      shipping_cost: 18.00,
      currency: "USDT",
      status: "ordered",
      tracking_number: "YT-AIR-8819201",
      notes: "CoreXY hot-end lot pre-tested.",
      created_at: new Date().toISOString(),
    },
  ];
}
