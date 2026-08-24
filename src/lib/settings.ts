import { createClient } from "@/lib/supabase/server";
import { AllStoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";

export { DEFAULT_STORE_SETTINGS, maskSecret } from "@/lib/settings-constants";

/**
 * Fetches public store settings for storefront components.
 */
export async function getPublicStoreSettings(): Promise<Partial<AllStoreSettings>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("key, value")
      .eq("is_public", true);

    if (error || !data || data.length === 0) {
      return DEFAULT_STORE_SETTINGS;
    }

    const settings: any = { ...DEFAULT_STORE_SETTINGS };
    data.forEach((row) => {
      if (row.key in settings) {
        settings[row.key] = { ...settings[row.key], ...row.value };
      }
    });

    return settings;
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}
