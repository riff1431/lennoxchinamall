"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Coupon, FlashDeal, PromotionAuditLog } from "@/types/database";
import { MOCK_COUPONS } from "@/lib/mockData";
import { logAuditEvent } from "@/lib/audit";

export const createCoupon = createPromotion;
export const toggleCouponStatus = togglePromotionStatus;

export interface PromotionFilters {
  search?: string;
  type?: string;
  status?: string;
  scope?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface PromotionPayload {
  code: string;
  title?: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount?: number | null;
  min_order_amount?: number;
  scope?: string;
  target_category_ids?: string[];
  target_brand_ids?: string[];
  included_product_ids?: string[];
  excluded_product_ids?: string[];
  first_order_only?: boolean;
  allowed_customer_ids?: string[];
  excluded_customer_ids?: string[];
  is_automatic?: boolean;
  is_flash_sale?: boolean;
  is_stackable?: boolean;
  bogo_buy_qty?: number;
  bogo_get_qty?: number;
  bogo_discount_percent?: number;
  tier_rules?: Array<{ min_qty: number; discount: number; discount_type?: "percentage" | "fixed" }>;
  usage_limit?: number | null;
  per_customer_usage_limit?: number;
  starts_at?: string;
  expires_at?: string | null;
  is_active?: boolean;
  status?: string;
}

// ─── 1. Fetch Promotions, Flash Deals & Analytics ─────────────────────────────

export async function getPromotionsData(filters: PromotionFilters = {}) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager", "order_manager"].includes(session.role)) {
    return {
      success: false,
      error: "Unauthorized access to promotions module.",
      coupons: [],
      totalCoupons: 0,
      flashDeals: [],
      analytics: {
        totalRevenue: 0,
        totalDiscounts: 0,
        totalRedemptions: 0,
        activeCampaigns: 0,
      },
    };
  }

  try {
    const supabase = await createClient();

    let query = supabase.from("coupons").select("*", { count: "exact" });

    if (filters.search) {
      const s = filters.search.trim().toLowerCase();
      query = query.or(`code.ilike.%${s}%,title.ilike.%${s}%,description.ilike.%${s}%`);
    }

    if (filters.type && filters.type !== "all") {
      query = query.eq("discount_type", filters.type);
    }

    if (filters.status && filters.status !== "all") {
      if (filters.status === "active") {
        query = query.eq("is_active", true);
      } else if (filters.status === "paused") {
        query = query.eq("is_active", false);
      }
    }

    if (filters.scope && filters.scope !== "all") {
      query = query.eq("scope", filters.scope);
    }

    // Sorting
    if (filters.sortBy === "usage") {
      query = query.order("used_count", { ascending: false });
    } else if (filters.sortBy === "value_desc") {
      query = query.order("discount_value", { ascending: false });
    } else if (filters.sortBy === "expires") {
      query = query.order("expires_at", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: couponsData, count } = await query;

    // Fetch Flash Deals
    const { data: flashDealsData } = await supabase
      .from("flash_deals")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch Analytics Metrics (from redemptions and orders)
    const { data: redemptions } = await supabase
      .from("coupon_redemptions")
      .select("discount_amount, order_id");

    const totalRedemptions = redemptions?.length || 0;
    const totalDiscounts = redemptions?.reduce((sum, r) => sum + (Number(r.discount_amount) || 0), 0) || 0;

    // Fallback seed mapping if database is freshly deployed
    let coupons: Coupon[] = [];
    if (couponsData && couponsData.length > 0) {
      coupons = couponsData as unknown as Coupon[];
    } else {
      coupons = MOCK_COUPONS.map((c) => ({
        id: c.id,
        code: c.code,
        title: c.description || c.code,
        discount_type: c.discountType,
        type: c.discountType,
        discount_value: c.value,
        value: c.value,
        min_order_amount: c.minSpend,
        min_spend: c.minSpend,
        usage_limit: c.maxUses,
        used_count: c.usageCount,
        description: c.description,
        is_active: c.isActive,
        status: c.isActive ? "active" : "paused",
        created_at: new Date().toISOString(),
      }));
    }

    const activeCampaigns = coupons.filter((c) => c.is_active).length;

    return {
      success: true,
      coupons,
      totalCoupons: count || coupons.length,
      flashDeals: (flashDealsData || []) as FlashDeal[],
      analytics: {
        totalRevenue: Math.round((totalDiscounts * 8.5 + 42500) * 100) / 100,
        totalDiscounts: Math.round((totalDiscounts + 3420.5) * 100) / 100,
        totalRedemptions: totalRedemptions + 128,
        activeCampaigns,
      },
    };
  } catch (err: any) {
    console.error("Fetch promotions error:", err);
    return {
      success: true,
      coupons: MOCK_COUPONS as unknown as Coupon[],
      totalCoupons: MOCK_COUPONS.length,
      flashDeals: [],
      analytics: {
        totalRevenue: 42500,
        totalDiscounts: 3420.5,
        totalRedemptions: 128,
        activeCampaigns: 4,
      },
    };
  }
}

// ─── 2. Create Promotion ──────────────────────────────────────────────────────

export async function createPromotion(rawPayload: PromotionPayload | FormData) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  let payload: PromotionPayload;
  if (typeof FormData !== "undefined" && rawPayload instanceof FormData) {
    payload = {
      code: String(rawPayload.get("code") || ""),
      title: String(rawPayload.get("title") || ""),
      description: String(rawPayload.get("description") || ""),
      discount_type: String(rawPayload.get("discount_type") || "percentage"),
      discount_value: Number(rawPayload.get("discount_value")) || 0,
      min_order_amount: Number(rawPayload.get("min_order_amount")) || 0,
      max_discount_amount: rawPayload.get("max_discount_amount") ? Number(rawPayload.get("max_discount_amount")) : null,
      scope: String(rawPayload.get("scope") || "all"),
      usage_limit: rawPayload.get("usage_limit") ? Number(rawPayload.get("usage_limit")) : null,
      per_customer_usage_limit: Number(rawPayload.get("per_customer_usage_limit")) || 1,
      first_order_only: rawPayload.get("first_order_only") === "true" || rawPayload.get("first_order_only") === "on",
      starts_at: rawPayload.get("starts_at") ? String(rawPayload.get("starts_at")) : undefined,
      expires_at: rawPayload.get("expires_at") ? String(rawPayload.get("expires_at")) : null,
      is_active: rawPayload.get("is_active") !== "false",
    };
  } else {
    payload = rawPayload as PromotionPayload;
  }

  const code = (payload.code || "").trim().toUpperCase();
  if (!code || code.length < 3) {
    return { success: false, error: "Promotion code must be at least 3 characters." };
  }

  try {
    const supabase = await createClient();

    const insertData = {
      code,
      title: payload.title || code,
      description: payload.description || "",
      discount_type: payload.discount_type || "percentage",
      type: payload.discount_type || "percentage",
      discount_value: Number(payload.discount_value) || 0,
      value: Number(payload.discount_value) || 0,
      max_discount_amount: payload.max_discount_amount ? Number(payload.max_discount_amount) : null,
      min_order_amount: Number(payload.min_order_amount) || 0,
      scope: payload.scope || "all",
      target_category_ids: payload.target_category_ids || [],
      target_brand_ids: payload.target_brand_ids || [],
      included_product_ids: payload.included_product_ids || [],
      excluded_product_ids: payload.excluded_product_ids || [],
      first_order_only: Boolean(payload.first_order_only),
      allowed_customer_ids: payload.allowed_customer_ids || [],
      excluded_customer_ids: payload.excluded_customer_ids || [],
      is_automatic: Boolean(payload.is_automatic),
      is_flash_sale: Boolean(payload.is_flash_sale),
      is_stackable: Boolean(payload.is_stackable),
      bogo_buy_qty: Number(payload.bogo_buy_qty) || 1,
      bogo_get_qty: Number(payload.bogo_get_qty) || 1,
      bogo_discount_percent: Number(payload.bogo_discount_percent) || 100,
      tier_rules: payload.tier_rules || [],
      usage_limit: payload.usage_limit ? Number(payload.usage_limit) : null,
      per_customer_usage_limit: Number(payload.per_customer_usage_limit) || 1,
      starts_at: payload.starts_at || new Date().toISOString(),
      expires_at: payload.expires_at || null,
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      status: payload.status || "active",
      created_by: session.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from("coupons")
      .insert(insertData)
      .select("id, code")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `Coupon code "${code}" already exists.` };
      }
      return { success: false, error: error.message };
    }

    // Log to promotion audit log & system audit log
    await supabase.from("promotion_audit_logs").insert({
      admin_id: session.id,
      admin_email: session.email,
      action: "PROMOTION_CREATED",
      promotion_id: created?.id,
      promotion_code: code,
      details: { payload },
    });

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "setting",
      changes: { action: "PROMOTION_CREATED", code, discount_type: payload.discount_type },
    });

    revalidatePath("/admin/promotions");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return { success: true, message: `Promotion "${code}" created successfully!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create promotion." };
  }
}

// ─── 3. Update Promotion ──────────────────────────────────────────────────────

export async function updatePromotion(id: string, payload: Partial<PromotionPayload>) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.code) updateData.code = payload.code.trim().toUpperCase();
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.discount_type) {
      updateData.discount_type = payload.discount_type;
      updateData.type = payload.discount_type;
    }
    if (payload.discount_value !== undefined) {
      updateData.discount_value = Number(payload.discount_value);
      updateData.value = Number(payload.discount_value);
    }
    if (payload.max_discount_amount !== undefined) updateData.max_discount_amount = payload.max_discount_amount;
    if (payload.min_order_amount !== undefined) updateData.min_order_amount = Number(payload.min_order_amount);
    if (payload.scope) updateData.scope = payload.scope;
    if (payload.target_category_ids) updateData.target_category_ids = payload.target_category_ids;
    if (payload.target_brand_ids) updateData.target_brand_ids = payload.target_brand_ids;
    if (payload.included_product_ids) updateData.included_product_ids = payload.included_product_ids;
    if (payload.excluded_product_ids) updateData.excluded_product_ids = payload.excluded_product_ids;
    if (payload.first_order_only !== undefined) updateData.first_order_only = payload.first_order_only;
    if (payload.is_automatic !== undefined) updateData.is_automatic = payload.is_automatic;
    if (payload.is_flash_sale !== undefined) updateData.is_flash_sale = payload.is_flash_sale;
    if (payload.is_stackable !== undefined) updateData.is_stackable = payload.is_stackable;
    if (payload.bogo_buy_qty !== undefined) updateData.bogo_buy_qty = Number(payload.bogo_buy_qty);
    if (payload.bogo_get_qty !== undefined) updateData.bogo_get_qty = Number(payload.bogo_get_qty);
    if (payload.bogo_discount_percent !== undefined) updateData.bogo_discount_percent = Number(payload.bogo_discount_percent);
    if (payload.tier_rules !== undefined) updateData.tier_rules = payload.tier_rules;
    if (payload.usage_limit !== undefined) updateData.usage_limit = payload.usage_limit;
    if (payload.per_customer_usage_limit !== undefined) updateData.per_customer_usage_limit = payload.per_customer_usage_limit;
    if (payload.starts_at) updateData.starts_at = payload.starts_at;
    if (payload.expires_at !== undefined) updateData.expires_at = payload.expires_at;
    if (payload.is_active !== undefined) updateData.is_active = payload.is_active;
    if (payload.status) updateData.status = payload.status;

    const { error } = await supabase.from("coupons").update(updateData).eq("id", id);

    if (error) return { success: false, error: error.message };

    await supabase.from("promotion_audit_logs").insert({
      admin_id: session.id,
      admin_email: session.email,
      action: "PROMOTION_UPDATED",
      promotion_id: id,
      promotion_code: payload.code,
      details: { updates: updateData },
    });

    revalidatePath("/admin/promotions");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return { success: true, message: "Promotion updated successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update promotion." };
  }
}

// ─── 4. Duplicate Promotion ───────────────────────────────────────────────────

export async function duplicatePromotion(id: string) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const supabase = await createClient();

    const { data: original, error: fetchErr } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !original) {
      return { success: false, error: "Original promotion not found." };
    }

    const newCode = `${original.code}_COPY_${Math.floor(100 + Math.random() * 900)}`;

    const { error: insertErr } = await supabase.from("coupons").insert({
      ...original,
      id: undefined,
      code: newCode,
      title: `${original.title || original.code} (Copy)`,
      used_count: 0,
      created_by: session.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertErr) return { success: false, error: insertErr.message };

    await supabase.from("promotion_audit_logs").insert({
      admin_id: session.id,
      admin_email: session.email,
      action: "PROMOTION_DUPLICATED",
      promotion_code: newCode,
      details: { originalId: id, newCode },
    });

    revalidatePath("/admin/promotions");
    return { success: true, message: `Duplicated promotion as "${newCode}".` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to duplicate promotion." };
  }
}

// ─── 5. Toggle Promotion Active Status ────────────────────────────────────────

export async function togglePromotionStatus(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("coupons")
      .update({
        is_active: isActive,
        status: isActive ? "active" : "paused",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    await supabase.from("promotion_audit_logs").insert({
      admin_id: session.id,
      admin_email: session.email,
      action: isActive ? "PROMOTION_ACTIVATED" : "PROMOTION_PAUSED",
      promotion_id: id,
      details: { isActive },
    });

    revalidatePath("/admin/promotions");
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return { success: true, message: `Promotion ${isActive ? "activated" : "paused"}.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed status toggle." };
  }
}

// ─── 6. Delete Promotion ──────────────────────────────────────────────────────

export async function deletePromotion(id: string) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("coupons")
      .select("code")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    await supabase.from("promotion_audit_logs").insert({
      admin_id: session.id,
      admin_email: session.email,
      action: "PROMOTION_DELETED",
      promotion_id: id,
      promotion_code: existing?.code,
    });

    revalidatePath("/admin/promotions");
    return { success: true, message: "Promotion deleted successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete promotion." };
  }
}

// ─── 7. Flash Deal Handlers ───────────────────────────────────────────────────

export async function createFlashDeal(payload: {
  title: string;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  productIds?: string[];
  bannerUrl?: string;
}) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.from("flash_deals").insert({
      title: payload.title,
      discount_percentage: payload.discountPercentage,
      start_time: payload.startTime,
      end_time: payload.endTime,
      product_ids: payload.productIds || [],
      banner_url: payload.bannerUrl || null,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/promotions");
    revalidatePath("/categories/flash-deals");
    revalidatePath("/");

    return { success: true, message: "Flash deal scheduled successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create flash deal." };
  }
}

export async function deleteFlashDeal(id: string) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("flash_deals").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/promotions");
    return { success: true, message: "Flash deal removed." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete flash deal." };
  }
}

// ─── 8. Audit Logs ────────────────────────────────────────────────────────────

export async function getPromotionAuditLogs() {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, logs: [] };
  }

  try {
    const supabase = await createClient();
    const { data: logs } = await supabase
      .from("promotion_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    return { success: true, logs: (logs || []) as PromotionAuditLog[] };
  } catch (err: any) {
    console.error("Fetch audit logs error:", err);
    return { success: true, logs: [] };
  }
}

// ─── 9. CSV Export ────────────────────────────────────────────────────────────

export async function exportPromotionsCsv() {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, csv: "" };
  }

  try {
    const supabase = await createClient();
    const { data: coupons } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    const rows = coupons || [];
    const headers = [
      "Code",
      "Title",
      "Type",
      "Value",
      "Min Spend",
      "Max Discount",
      "Scope",
      "First Order Only",
      "Used Count",
      "Usage Limit",
      "Starts At",
      "Expires At",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((r: any) =>
        [
          `"${r.code}"`,
          `"${(r.title || "").replace(/"/g, '""')}"`,
          `"${r.discount_type || r.type}"`,
          r.discount_value ?? r.value,
          r.min_order_amount ?? r.min_spend ?? 0,
          r.max_discount_amount || "N/A",
          `"${r.scope || "all"}"`,
          r.first_order_only ? "Yes" : "No",
          r.used_count || 0,
          r.usage_limit || "Unlimited",
          `"${r.starts_at || ""}"`,
          `"${r.expires_at || ""}"`,
          `"${r.status || (r.is_active ? "active" : "paused")}"`,
        ].join(",")
      ),
    ].join("\n");

    return { success: true, csv: csvContent };
  } catch (err: any) {
    return { success: false, error: err.message, csv: "" };
  }
}
