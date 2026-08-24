"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Coupon, FlashDeal, CouponType } from "@/types/database";
import { MOCK_COUPONS } from "@/lib/mockData";
import { logAuditEvent } from "@/lib/audit";

// ─── Fetch Coupons & Flash Deals ────────────────────────────────────────────

export async function getPromotionsData() {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access", coupons: [], flashDeals: [] };
  }

  try {
    const supabase = await createClient();

    const { data: couponsData } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: dealsData } = await supabase
      .from("flash_deals")
      .select("*")
      .order("created_at", { ascending: false });

    const coupons = couponsData && couponsData.length > 0 ? couponsData : MOCK_COUPONS;
    const flashDeals = dealsData && dealsData.length > 0 ? dealsData : [];

    return { success: true, coupons: coupons as unknown as Coupon[], flashDeals: flashDeals as FlashDeal[] };
  } catch (err) {
    console.error("Fetch promotions error:", err);
    return { success: true, coupons: MOCK_COUPONS as unknown as Coupon[], flashDeals: [] };
  }
}

// ─── Create Coupon ──────────────────────────────────────────────────────────

export async function createCoupon(formData: FormData) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access" };
  }

  const code = (formData.get("code") as string).trim().toUpperCase();
  const description = formData.get("description") as string;
  const type = (formData.get("type") as CouponType) || "percentage";
  const value = Number(formData.get("value")) || 10;
  const minOrderAmount = Number(formData.get("min_order_amount")) || 0;
  const usageLimit = Number(formData.get("usage_limit")) || null;

  try {
    const supabase = await createClient();

    const { error } = await supabase.from("coupons").insert({
      code,
      description,
      type,
      value,
      min_order_amount: minOrderAmount,
      usage_limit: usageLimit,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    if (error) return { success: false, error: error.message };

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "setting",
      changes: { action: "COUPON_CREATED", code, value, type },
    });

    revalidatePath("/admin/promotions");
    revalidatePath("/cart");
    return { success: true, message: `Voucher code ${code} created successfully!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create coupon" };
  }
}

// ─── Toggle Coupon Status ───────────────────────────────────────────────────

export async function toggleCouponStatus(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("coupons").update({ is_active: isActive }).eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/promotions");
    return { success: true, message: `Coupon ${isActive ? "activated" : "deactivated"}!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed status toggle" };
  }
}
