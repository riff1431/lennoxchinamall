import { createClient, createServiceClient } from "@/lib/supabase/server";
import { AllStoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";
import { readLocalSettings, mergeSettings } from "@/lib/settings-storage";

export { DEFAULT_STORE_SETTINGS, maskSecret } from "@/lib/settings-constants";

/**
 * Fetches public store settings for storefront components.
 */
export async function getPublicStoreSettings(): Promise<Partial<AllStoreSettings>> {
  try {
    const fileSettings = readLocalSettings();

    let dbRows: { key: string; value: any }[] = [];
    try {
      let serviceClient;
      try {
        serviceClient = createServiceClient();
      } catch {
        serviceClient = null;
      }
      const supabase = serviceClient || (await createClient());
      const { data, error } = await supabase
        .from("store_settings")
        .select("key, value");

      if (!error && data && data.length > 0) {
        dbRows = data;
      }
    } catch {
      // Supabase fetch optional, fallback to file settings
    }

    return mergeSettings(fileSettings, dbRows);
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

