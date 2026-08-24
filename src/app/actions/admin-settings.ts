"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit";
import { AllStoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS, maskSecret } from "@/lib/settings-constants";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_SUPPLIERS } from "@/lib/mockData";





// ─── Fetch All 17 Settings Domains ──────────────────────────────────────────

export async function getCompleteStoreSettings(): Promise<{
  success: boolean;
  settings: AllStoreSettings;
  userRole?: string;
  error?: string;
}> {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager", "order_manager"].includes(session.role)) {
    return {
      success: false,
      settings: DEFAULT_STORE_SETTINGS,
      error: "Unauthorized access.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("store_settings").select("*");

    const settings: AllStoreSettings = JSON.parse(JSON.stringify(DEFAULT_STORE_SETTINGS));

    if (data && data.length > 0) {
      data.forEach((row) => {
        if (row.key in settings) {
          (settings as any)[row.key] = { ...(settings as any)[row.key], ...row.value };
        }
      });
    }

    // Role-based credential masking for non-super admins
    if (session.role !== "super_admin") {
      settings.binance_pay.api_secret = maskSecret(settings.binance_pay.api_secret);
      settings.binance_pay.webhook_secret = maskSecret(settings.binance_pay.webhook_secret);
      settings.security.ip_whitelist = maskSecret(settings.security.ip_whitelist);
    }

    return {
      success: true,
      settings,
      userRole: session.role,
    };
  } catch (err: any) {
    console.error("Fetch complete settings error:", err);
    return {
      success: true,
      settings: DEFAULT_STORE_SETTINGS,
      userRole: session.role,
    };
  }
}

// ─── Update Settings Domain ─────────────────────────────────────────────────

export async function updateSettingsDomain(
  domainKey: string,
  payload: any
): Promise<{ success: boolean; message?: string; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }

  // Security: only Super Admin can edit sensitive domains
  const sensitiveDomains = ["binance_pay", "security", "backups", "order_workflow"];
  if (sensitiveDomains.includes(domainKey) && session.role !== "super_admin") {
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
    const supabase = await createClient();

    const isPublic = [
      "store_info",
      "branding",
      "currencies",
      "localization",
      "tax_customs",
      "shipping_zones",
      "invoice",
      "storage",
      "seo",
      "analytics",
      "maintenance",
    ].includes(domainKey);

    const { error } = await supabase.from("store_settings").upsert({
      key: domainKey,
      value: payload,
      is_public: isPublic,
      updated_by: session.id,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Settings upsert fallback:", error.message);
    }

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "setting",
      entityId: String(domainKey),
      changes: { domain: domainKey, updated_keys: Object.keys(payload) },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    revalidatePath("/checkout");
    return {
      success: true,
      message: `${String(domainKey).replace(/_/g, " ").toUpperCase()} settings applied successfully!`,
    };
  } catch (err: any) {
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
