/**
 * Authoritative Supabase Configuration
 * Project: Lennox ChinaMall (pdeooqamevjpkcnaokac)
 */
export const ACTIVE_SUPABASE_URL = "https://pdeooqamevjpkcnaokac.supabase.co";
export const ACTIVE_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZW9vcWFtZXZqcGtjbmFva2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzQ0MTIsImV4cCI6MjEwMzc1MDQxMn0.cYikKs8ea3SxeIV1q99p6vO5-AlQD9SRlQk-XKHoDNU";
export const ACTIVE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_VrhH_5jPc0_aS1vVda0GLA_Hek5bdF2";

export const VALID_STORAGE_BUCKETS = ["products", "reviews", "banners"] as const;
export type StorageBucket = (typeof VALID_STORAGE_BUCKETS)[number];

export function getSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  // Guard against obsolete project ref (kdekxqbdkjdfjyyprhbv) or unconfigured placeholders
  if (
    envUrl &&
    envUrl.trim() !== "" &&
    !envUrl.includes("kdekxqbdkjdfjyyprhbv") &&
    !envUrl.includes("your-project") &&
    !envUrl.includes("placeholder")
  ) {
    return envUrl.trim().replace(/\/$/, "");
  }
  return ACTIVE_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (
    envKey &&
    envKey.trim() !== "" &&
    envKey.startsWith("eyJ") &&
    !envKey.includes("your-supabase")
  ) {
    try {
      const parts = envKey.split(".");
      if (parts.length >= 2) {
        let jsonStr = "";
        if (typeof Buffer !== "undefined") {
          jsonStr = Buffer.from(parts[1], "base64").toString();
        } else if (typeof atob !== "undefined") {
          jsonStr = atob(parts[1]);
        }
        if (jsonStr) {
          const payload = JSON.parse(jsonStr);
          if (payload.ref === "kdekxqbdkjdfjyyprhbv") {
            return ACTIVE_SUPABASE_ANON_KEY;
          }
        }
      }
    } catch {
      // ignore
    }
    return envKey.trim();
  }
  return ACTIVE_SUPABASE_ANON_KEY;
}

export function getSupabasePublishableKey(): string {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (
    envKey &&
    envKey.trim() !== "" &&
    !envKey.includes("CdurTHAw3sfYD") &&
    !envKey.includes("your-supabase") &&
    !envKey.includes("placeholder")
  ) {
    return envKey.trim();
  }
  return ACTIVE_SUPABASE_PUBLISHABLE_KEY;
}

