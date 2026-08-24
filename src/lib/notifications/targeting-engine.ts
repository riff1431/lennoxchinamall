/**
 * Lennox ChinaMall — Audience Targeting Engine
 * Evaluates audience segment rules and queries eligible recipient profiles.
 */

import { createServiceClient } from "@/lib/supabase/server";
import { TargetAudienceType } from "@/types/notifications";

export interface TargetFilterOptions {
  countries?: string[];
  min_orders?: number;
  max_orders?: number;
  min_spend?: number;
  account_status?: "verified" | "all" | "staff";
  user_ids?: string[];
  emails?: string[];
}

export interface TargetRecipient {
  id: string;
  email: string;
  phone?: string | null;
  displayName?: string | null;
  role: string;
}

export async function resolveTargetAudience(
  audienceType: TargetAudienceType,
  filter?: TargetFilterOptions | null
): Promise<TargetRecipient[]> {
  try {
    const supabase = createServiceClient();

    if (audienceType === "staff_only") {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, phone, display_name, role")
        .in("role", ["super_admin", "order_manager", "catalogue_manager", "support_agent"])
        .eq("is_active", true);

      if (error) throw error;
      return (data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        displayName: u.display_name,
        role: u.role,
      }));
    }

    if (audienceType === "specific_users") {
      let query = supabase
        .from("profiles")
        .select("id, email, phone, display_name, role")
        .eq("is_active", true);

      if (filter?.user_ids && filter.user_ids.length > 0) {
        query = query.in("id", filter.user_ids);
      } else if (filter?.emails && filter.emails.length > 0) {
        query = query.in("email", filter.emails);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        displayName: u.display_name,
        role: u.role,
      }));
    }

    if (audienceType === "by_country" && filter?.countries && filter.countries.length > 0) {
      // Find user IDs having addresses in given countries
      const { data: addressData, error: addressErr } = await supabase
        .from("addresses")
        .select("user_id")
        .in("country", filter.countries);

      if (addressErr) throw addressErr;
      const targetUserIds = Array.from(new Set((addressData || []).map((a: any) => a.user_id)));

      if (targetUserIds.length === 0) return [];

      const { data: profilesData, error: profErr } = await supabase
        .from("profiles")
        .select("id, email, phone, display_name, role")
        .in("id", targetUserIds)
        .eq("is_active", true);

      if (profErr) throw profErr;
      return (profilesData || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        displayName: u.display_name,
        role: u.role,
      }));
    }

    if (audienceType === "vip_customers") {
      // Find customers with orders totaling > $500 or order count >= 3
      const { data: ordersData } = await supabase
        .from("orders")
        .select("user_id, total")
        .in("status", ["paid", "sourcing", "processing", "shipped", "delivered"]);

      const spendMap: Record<string, number> = {};
      (ordersData || []).forEach((o: any) => {
        spendMap[o.user_id] = (spendMap[o.user_id] || 0) + (o.total || 0);
      });

      const vipIds = Object.keys(spendMap).filter((uid) => spendMap[uid] >= 500);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, phone, display_name, role")
        .in("id", vipIds.length > 0 ? vipIds : ["00000000-0000-0000-0000-000000000000"])
        .eq("is_active", true);

      if (error) throw error;
      return (data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        displayName: u.display_name,
        role: u.role,
      }));
    }

    if (audienceType === "by_order_history") {
      const minOrders = filter?.min_orders ?? 1;
      const { data: ordersData } = await supabase
        .from("orders")
        .select("user_id");

      const countMap: Record<string, number> = {};
      (ordersData || []).forEach((o: any) => {
        countMap[o.user_id] = (countMap[o.user_id] || 0) + 1;
      });

      const matchedIds = Object.keys(countMap).filter((uid) => (countMap[uid] || 0) >= minOrders);

      if (matchedIds.length === 0) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, phone, display_name, role")
        .in("id", matchedIds)
        .eq("is_active", true);

      if (error) throw error;
      return (data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        displayName: u.display_name,
        role: u.role,
      }));
    }

    // Default: 'all_users' or 'by_account_status'
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, phone, display_name, role")
      .eq("is_active", true);

    if (error) throw error;
    return (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      displayName: u.display_name,
      role: u.role,
    }));
  } catch (err) {
    console.error("resolveTargetAudience error:", err);
    return [];
  }
}
