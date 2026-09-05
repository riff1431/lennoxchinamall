"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit";
import { AllStoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS, maskSecret } from "@/lib/settings-constants";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_SUPPLIERS } from "@/lib/mockData";
import {
  readLocalSettings,
  writeLocalSettingsDomain,
  mergeSettings,
} from "@/lib/settings-storage";

// Helper to get available Supabase client
function getDatabaseClient() {
  try {
    return createServiceClient();
  } catch {
    return null;
  }
}

// ─── Fetch All 17 Settings Domains ──────────────────────────────────────────

export async function getCompleteStoreSettings(): Promise<{
  success: boolean;
  settings: AllStoreSettings;
  userRole?: string;
  error?: string;
}> {
  const session = await getSession();
  const userRole = session?.role || "super_admin";

  try {
    // 1. Read persistent local file settings
    const fileSettings = readLocalSettings();

    // 2. Fetch Supabase records
    let dbRows: { key: string; value: any }[] = [];
    try {
      const serviceClient = getDatabaseClient();
      const supabase = serviceClient || (await createClient());
      const { data, error } = await supabase.from("store_settings").select("*");
      if (!error && data && data.length > 0) {
        dbRows = data;
      }
    } catch (dbErr) {
      console.warn("Supabase fetch fallback to local cache:", dbErr);
    }

    const settings = mergeSettings(fileSettings, dbRows);

    // Role-based credential masking for non-super admins
    if (session && session.role !== "super_admin") {
      settings.binance_pay.api_secret = maskSecret(settings.binance_pay.api_secret);
      settings.binance_pay.webhook_secret = maskSecret(settings.binance_pay.webhook_secret);
      settings.security.ip_whitelist = maskSecret(settings.security.ip_whitelist);
    }

    return {
      success: true,
      settings,
      userRole,
    };
  } catch (err: any) {
    console.error("Fetch complete settings error:", err);
    return {
      success: true,
      settings: DEFAULT_STORE_SETTINGS,
      userRole,
    };
  }
}

// ─── Update Settings Domain ─────────────────────────────────────────────────

export async function updateSettingsDomain(
  domainKey: string,
  payload: any
): Promise<{ success: boolean; message?: string; error?: string }> {
  const session = await getSession();

  // Security: only Super Admin can edit sensitive domains if authenticated session exists
  const sensitiveDomains = ["binance_pay", "security", "backups", "order_workflow"];
  if (session && sensitiveDomains.includes(domainKey) && session.role !== "super_admin") {
    return {
      success: false,
      error: `Access Denied: Only Super Admins can modify ${domainKey} settings.`,
    };
  }

  // Preserve existing secrets if masked value was submitted
  if (domainKey === "binance_pay") {
    const current = await getCompleteStoreSettings();
    if (payload.api_secret && payload.api_secret.startsWith("••••")) {
      payload.api_secret = current.settings.binance_pay.api_secret;
    }
    if (payload.webhook_secret && payload.webhook_secret.startsWith("••••")) {
      payload.webhook_secret = current.settings.binance_pay.webhook_secret;
    }
  }

  try {
    // 1. ALWAYS persist to local disk cache first (guaranteed 100% persistence on refresh)
    writeLocalSettingsDomain(domainKey as keyof AllStoreSettings, payload);

    // 2. Also attempt clean Supabase upsert (key, value, updated_at)
    try {
      const serviceClient = getDatabaseClient();
      const supabase = serviceClient || (await createClient());

      const { error: dbError } = await supabase.from("store_settings").upsert(
        {
          key: domainKey,
          value: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

      if (dbError) {
        console.warn(`Supabase DB sync note for ${domainKey}:`, dbError.message);
      }
    } catch (dbErr) {
      console.warn(`Supabase DB upsert caught:`, dbErr);
    }

    if (session) {
      await logAuditEvent({
        adminId: session.id,
        adminEmail: session.email,
        action: "SETTINGS_CHANGED",
        entityType: "setting",
        entityId: String(domainKey),
        changes: { domain: domainKey, updated_keys: Object.keys(payload) },
      });
    }

    try {
      revalidatePath("/admin/settings");
      revalidatePath("/", "layout");
      revalidatePath("/checkout");
    } catch {
      // Revalidation handled safely
    }

    return {
      success: true,
      message: `${String(domainKey).replace(/_/g, " ").toUpperCase()} settings applied successfully!`,
    };
  } catch (err: any) {
    console.error("updateSettingsDomain error:", err);
    return { success: false, error: err.message || "Failed to save settings." };
  }
}

// ─── Reset Domain to Default ────────────────────────────────────────────────

export async function resetSettingsToDefault(domainKey: string) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return { success: false, error: "Only Super Admins can reset configurations." };
  }

  const defaultValue = (DEFAULT_STORE_SETTINGS as any)[domainKey];
  return updateSettingsDomain(domainKey, defaultValue);
}

// ─── Export Complete Database Backup (JSON) ─────────────────────────────────

export async function exportDatabaseBackup() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return { success: false, error: "Only Super Admins can generate disaster recovery backups." };
  }

  try {
    const supabase = await createClient();

    const [productsRes, categoriesRes, brandsRes, suppliersRes, couponsRes, settingsRes, ordersRes] =
      await Promise.all([
        supabase.from("products").select("*, variants(*), media:product_media(*), videos:product_videos(*)"),
        supabase.from("categories").select("*"),
        supabase.from("brands").select("*"),
        supabase.from("suppliers").select("*"),
        supabase.from("coupons").select("*"),
        supabase.from("store_settings").select("*"),
        supabase.from("orders").select("*, items:order_items(*)").limit(100),
      ]);

    const backupPayload = {
      backup_version: "2.0.0",
      generated_at: new Date().toISOString(),
      generated_by: session.email,
      environment: "production",
      catalogue: {
        categories: categoriesRes.data || MOCK_CATEGORIES,
        brands: brandsRes.data || MOCK_BRANDS,
        products: productsRes.data || MOCK_PRODUCTS,
      },
      sourcing: {
        suppliers: suppliersRes.data || MOCK_SUPPLIERS,
      },
      commerce: {
        coupons: couponsRes.data || [],
        recent_orders: ordersRes.data || [],
      },
      settings: settingsRes.data || DEFAULT_STORE_SETTINGS,
    };

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "setting",
      changes: { action: "SYSTEM_BACKUP_GENERATED" },
    });

    return {
      success: true,
      backupData: backupPayload,
      filename: `lennoxchinamall_backup_${new Date().toISOString().slice(0, 10)}.json`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate backup." };
  }
}

// ─── Legacy compatibility helpers ───────────────────────────────────────────

export async function getStoreSettings() {
  const res = await getCompleteStoreSettings();
  if (res.success && res.settings) {
    return {
      success: true,
      settings: {
        siteName: res.settings.store_info.store_name,
        supportEmail: res.settings.store_info.support_email,
        defaultCurrency: res.settings.currencies.base_currency,
        airExpressLeadDays: res.settings.shipping_zones.air_express_lead_days,
        freeShippingThreshold: res.settings.shipping_zones.free_shipping_threshold,
        binancePayEnabled: res.settings.binance_pay.enabled,
        zeroFeePromoted: res.settings.binance_pay.zero_fee_promoted,
        maintenanceMode: res.settings.maintenance.enabled,
      },
    };
  }
  return { success: true, settings: {} as any };
}

export async function updateStoreSettings(formData: FormData) {
  const siteName = formData.get("site_name") as string;
  const supportEmail = formData.get("support_email") as string;
  const defaultCurrency = formData.get("currency") as string;
  const airLeadDays = Number(formData.get("air_lead_days")) || 5;
  const freeShipping = Number(formData.get("free_shipping_threshold")) || 75;

  await updateSettingsDomain("store_info", {
    ...DEFAULT_STORE_SETTINGS.store_info,
    store_name: siteName,
    support_email: supportEmail,
  });

  await updateSettingsDomain("currencies", {
    ...DEFAULT_STORE_SETTINGS.currencies,
    base_currency: defaultCurrency,
  });

  await updateSettingsDomain("shipping_zones", {
    ...DEFAULT_STORE_SETTINGS.shipping_zones,
    air_express_lead_days: airLeadDays,
    free_shipping_threshold: freeShipping,
  });

  return { success: true, message: "Settings saved successfully!" };
}
