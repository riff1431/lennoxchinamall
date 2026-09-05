import { createClient, createServiceClient } from "@/lib/supabase/server";
import { AllStoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";
import { readLocalSettings, mergeSettings } from "@/lib/settings-storage";

export { DEFAULT_STORE_SETTINGS, maskSecret } from "@/lib/settings-constants";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pdeooqamevjpkcnaokac.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZW9vcWFtZXZqcGtjbmFva2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzQ0MTIsImV4cCI6MjEwMzc1MDQxMn0.cYikKs8ea3SxeIV1q99p6vO5-AlQD9SRlQk-XKHoDNU";

/**
 * Fetches public store settings for storefront components.
 */
export async function getPublicStoreSettings(): Promise<Partial<AllStoreSettings>> {
  try {
    let dbRows: { key: string; value: any }[] = [];

    // Method 1: Direct PostgREST query (fastest, guaranteed across all serverless regions)
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/store_settings?select=key,value`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
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
