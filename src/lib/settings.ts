import { createClient, createServiceClient } from "@/lib/supabase/server";
import { AllStoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";
import { readLocalSettings, mergeSettings } from "@/lib/settings-storage";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/config";

export { DEFAULT_STORE_SETTINGS, maskSecret } from "@/lib/settings-constants";

/**
 * Fetches public store settings for storefront components.
 */
export async function getPublicStoreSettings(): Promise<Partial<AllStoreSettings>> {
  try {
    let dbRows: { key: string; value: any }[] = [];
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();

    // Method 1: Direct PostgREST query (fastest, guaranteed across all serverless regions)
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/store_settings?select=key,value`, {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        cache: "no-store",
      });
      if (res.ok) {
        dbRows = await res.json();
      }
    } catch {
      // Method 2: Supabase client fallback
      try {
        let serviceClient;
        try {
          serviceClient = createServiceClient();
        } catch {
          serviceClient = null;
        }
        const supabase = serviceClient || (await createClient());
        const { data, error } = await supabase.from("store_settings").select("key, value");
        if (!error && data && data.length > 0) {
          dbRows = data;
        }
      } catch {}
    }

    const fileSettings = readLocalSettings();
    return mergeSettings(fileSettings, dbRows);
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}
