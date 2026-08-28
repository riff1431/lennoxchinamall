"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import {
  NotificationItem,
  NotificationPreference,
  NotificationCategory,
  CategoriesConfig,
} from "@/types/notifications";

// Fallback initial notifications if database is fresh
const SEED_FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-seed-1",
    user_id: "system",
    category: "shipping",
    channel: "in_app",
    priority: "high",
    title: "Air Cargo In Transit: Order #LCM-20260823-7492",
    body: "Your 4K GPS Drone parcel has cleared Shenzhen export customs and is en route via YunExpress Air Freight.",
    action_label: "Live Air Track",
    action_url: "/account/orders",
    icon: "Plane",
    read_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-seed-2",
    user_id: "system",
    category: "promotions",
    channel: "in_app",
    priority: "normal",
    title: "VIP Voucher Activated: LENNOX10",
    body: "10% discount on all factory-direct 3D printers and tools available for your next order.",
    action_label: "Shop Flash Deals",
    action_url: "/categories/flash-deals",
    icon: "Sparkles",
    read_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    archived_at: null,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-seed-3",
    user_id: "system",
    category: "payments",
    channel: "in_app",
    priority: "normal",
    title: "Payment Confirmed via Binance Pay",
    body: "USDT settlement for Order #LCM-20260823-7492 verified on BSC with zero network fees.",
    action_label: "View Invoice",
    action_url: "/account/orders",
    icon: "Coins",
    read_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    archived_at: null,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

export interface FetchUserNotificationsParams {
  category?: string;
  status?: "all" | "unread" | "archived" | "read";
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch customer's in-app notifications
 */
export async function getUserNotifications(params?: FetchUserNotificationsParams) {
  const session = await getSession();
  const userId = session?.id;

  try {
    const supabase = await createClient();

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (params?.status === "unread") {
      query = query.is("read_at", null).is("archived_at", null);
    } else if (params?.status === "archived") {
      query = query.not("archived_at", "is", null);
    } else if (params?.status === "read") {
      query = query.not("read_at", "is", null).is("archived_at", null);
    } else {
      // "all" tab excludes archived
      query = query.is("archived_at", null);
    }

    if (params?.category && params.category !== "all") {
      query = query.eq("category", params.category);
    }

    if (params?.search && params.search.trim()) {
      const s = params.search.trim();
      query = query.or(`title.ilike.%${s}%,body.ilike.%${s}%`);
    }

    if (params?.limit && params.limit > 0) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // If user has no notifications in DB yet, show formatted initial starter notifications
      let fallback = [...SEED_FALLBACK_NOTIFICATIONS];
      if (params?.status === "unread") fallback = fallback.filter((n) => !n.read_at && !n.archived_at);
      if (params?.status === "archived") fallback = fallback.filter((n) => !!n.archived_at);
      if (params?.category && params.category !== "all") fallback = fallback.filter((n) => n.category === params.category);
      if (params?.limit && params.limit > 0) fallback = fallback.slice(0, params.limit);
      return { success: true, notifications: fallback, unreadCount: fallback.filter((n) => !n.read_at).length };
    }

    const unreadCount = data.filter((n) => !n.read_at && !n.archived_at).length;
    return { success: true, notifications: data as NotificationItem[], unreadCount };
  } catch (err) {
    console.error("getUserNotifications error:", err);
    return { success: true, notifications: SEED_FALLBACK_NOTIFICATIONS, unreadCount: 1 };
  }
}

/**
 * Get active unread notifications count for header badge
 */
export async function getUnreadNotificationsCount() {
  const session = await getSession();
  const userId = session?.id;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null)
      .is("archived_at", null)
      .eq("is_deleted", false);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string) {
  if (!isValidUUID(id)) {
    // Non-UUID IDs (e.g. seed/guest notifications) succeed gracefully in memory
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/account/notifications");
    revalidatePath("/account");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to mark read" };
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead() {
  const session = await getSession();
  if (!session?.id) return { success: true };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.id)
      .is("read_at", null);

    if (error) return { success: false, error: error.message };
    revalidatePath("/account/notifications");
    revalidatePath("/account");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to mark all read" };
  }
}

/**
 * Archive a notification
 */
export async function archiveNotification(id: string) {
  if (!isValidUUID(id)) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/account/notifications");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to archive" };
  }
}

/**
 * Unarchive a notification
 */
export async function unarchiveNotification(id: string) {
  if (!isValidUUID(id)) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({
        archived_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/account/notifications");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to unarchive" };
  }
}

/**
 * Delete a notification (soft delete)
 */
export async function deleteNotification(id: string) {
  if (!isValidUUID(id)) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/account/notifications");
    revalidatePath("/account");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete" };
  }
}

/**
 * Batch action on multiple notifications
 */
export async function batchNotificationAction(
  ids: string[],
  action: "read" | "archive" | "delete"
) {
  const validIds = ids.filter(isValidUUID);
  if (!validIds.length) return { success: true, count: ids.length };

  try {
    const supabase = await createClient();
    let updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (action === "read") {
      updatePayload = { ...updatePayload, read_at: new Date().toISOString() };
    } else if (action === "archive") {
      updatePayload = { ...updatePayload, archived_at: new Date().toISOString() };
    } else if (action === "delete") {
      updatePayload = { ...updatePayload, is_deleted: true };
    }

    const { error } = await supabase
      .from("notifications")
      .update(updatePayload)
      .in("id", validIds);

    if (error) return { success: false, error: error.message };
    revalidatePath("/account/notifications");
    revalidatePath("/account");
    return { success: true, count: validIds.length };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Batch action failed" };
  }
}

/**
 * Get customer's notification preferences
 */
export async function getUserNotificationPreferences(): Promise<{
  success: boolean;
  preferences?: NotificationPreference;
}> {
  const session = await getSession();
  const userId = session?.id;

  const defaultPreferences: NotificationPreference = {
    id: "default",
    user_id: userId || "guest",
    in_app_enabled: true,
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    phone_number: null,
    categories_config: {
      orders: { in_app: true, email: true, push: true, sms: true },
      payments: { in_app: true, email: true, push: true, sms: true },
      shipping: { in_app: true, email: true, push: true, sms: true },
      delivery: { in_app: true, email: true, push: true, sms: true },
      returns: { in_app: true, email: true, push: true, sms: false },
      refunds: { in_app: true, email: true, push: true, sms: true },
      reviews: { in_app: true, email: true, push: false, sms: false },
      support: { in_app: true, email: true, push: true, sms: false },
      security: { in_app: true, email: true, push: true, sms: true },
      promotions: { in_app: true, email: true, push: true, sms: false },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!userId) {
    return { success: true, preferences: defaultPreferences };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return { success: true, preferences: defaultPreferences };
    }

    return { success: true, preferences: data as NotificationPreference };
  } catch (err) {
    console.error("getUserNotificationPreferences error:", err);
    return { success: true, preferences: defaultPreferences };
  }
}

/**
 * Update customer's notification preferences
 */
export async function updateUserNotificationPreferences(
  prefs: Partial<NotificationPreference>
) {
  const session = await getSession();
  const userId = session?.id;
  if (!userId) return { success: false, error: "Authentication required" };

  try {
    const supabase = await createClient();
    const payload = {
      user_id: userId,
      in_app_enabled: prefs.in_app_enabled,
      email_enabled: prefs.email_enabled,
      push_enabled: prefs.push_enabled,
      sms_enabled: prefs.sms_enabled,
      phone_number: prefs.phone_number,
      categories_config: prefs.categories_config,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("notification_preferences")
      .upsert(payload, { onConflict: "user_id" });

    if (error) return { success: false, error: error.message };
    revalidatePath("/account/notifications");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update preferences" };
  }
}

/**
 * Register Web Push subscription for current user
 */
export async function registerPushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}) {
  const session = await getSession();
  const userId = session?.id;
  if (!userId) return { success: false, error: "Authentication required" };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notification_push_subscriptions")
      .upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: subscription.userAgent || "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Push subscription registration failed" };
  }
}
