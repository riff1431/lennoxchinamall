"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit";

export interface StoreSettingsData {
  siteName: string;
  supportEmail: string;
  defaultCurrency: string;
  airExpressLeadDays: number;
  freeShippingThreshold: number;
  binancePayEnabled: boolean;
  zeroFeePromoted: boolean;
  maintenanceMode: boolean;
}

export async function getStoreSettings() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return { success: false, error: "Unauthorized access", settings: getDefaultSettings() };
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("store_settings").select("*");

    const settingsMap: Record<string, any> = {};
    if (data) {
      data.forEach((row) => {
        settingsMap[row.key] = row.value;
      });
    }

    const merged: StoreSettingsData = {
      siteName: settingsMap.general?.site_name || "Lennox ChinaMall",
      supportEmail: settingsMap.general?.support_email || "support@lennoxchinamall.com",
      defaultCurrency: settingsMap.general?.currency || "USDT",
      airExpressLeadDays: settingsMap.logistics?.air_express_lead_days || 5,
      freeShippingThreshold: settingsMap.logistics?.free_shipping_threshold || 150,
      binancePayEnabled: settingsMap.binance_pay?.enabled ?? true,
      zeroFeePromoted: settingsMap.binance_pay?.zero_fee ?? true,
      maintenanceMode: settingsMap.general?.maintenance_mode ?? false,
    };

    return { success: true, settings: merged };
  } catch (err) {
    return { success: true, settings: getDefaultSettings() };
  }
}

export async function updateStoreSettings(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return { success: false, error: "Only Super Admins can modify store settings." };
  }

  const siteName = formData.get("site_name") as string;
  const supportEmail = formData.get("support_email") as string;
  const defaultCurrency = formData.get("currency") as string;
  const airExpressLeadDays = Number(formData.get("air_lead_days")) || 5;
  const freeShippingThreshold = Number(formData.get("free_shipping_threshold")) || 150;
  const binancePayEnabled = formData.get("binance_pay_enabled") === "true";

  try {
    const supabase = await createClient();

    await supabase.from("store_settings").upsert([
      {
        key: "general",
        value: { site_name: siteName, support_email: supportEmail, currency: defaultCurrency },
        updated_at: new Date().toISOString(),
      },
      {
        key: "logistics",
        value: { air_express_lead_days: airExpressLeadDays, free_shipping_threshold: freeShippingThreshold },
        updated_at: new Date().toISOString(),
      },
      {
        key: "binance_pay",
        value: { enabled: binancePayEnabled, zero_fee: true },
        updated_at: new Date().toISOString(),
      },
    ]);

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "setting",
      changes: { siteName, supportEmail, defaultCurrency, airExpressLeadDays },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { success: true, message: "Store settings saved successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update settings" };
  }
}

function getDefaultSettings(): StoreSettingsData {
  return {
    siteName: "Lennox ChinaMall",
    supportEmail: "support@lennoxchinamall.com",
    defaultCurrency: "USDT",
    airExpressLeadDays: 5,
    freeShippingThreshold: 150,
    binancePayEnabled: true,
    zeroFeePromoted: true,
    maintenanceMode: false,
  };
}
