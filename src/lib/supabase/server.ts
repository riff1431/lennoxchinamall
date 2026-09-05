import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase/config'

/**
 * If using Fluid compute: Don't put this client in a global variable. Always create a new client within each
 * function when using it.
 */
export async function createClient() {
  let cookieStore: any = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Called outside request scope
  }

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          if (!cookieStore) return;
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                httpOnly: options?.httpOnly ?? true,
                sameSite: options?.sameSite ?? "lax",
                secure: options?.secure ?? process.env.NODE_ENV === "production",
                path: options?.path ?? "/",
              })
            );
          } catch {
            // Handled safely
          }
        },
      },
    }
  );
}

/**
 * Service role client for server-side admin operations that bypass RLS
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = getSupabaseUrl();

  // If service role key is not configured or is placeholder, fall back to anon key safely
  const hasValidServiceKey =
    serviceKey &&
    serviceKey.trim() !== "" &&
    !serviceKey.includes("your-supabase-service-role-key") &&
    serviceKey.length > 20;

  const key = hasValidServiceKey ? serviceKey : getSupabaseAnonKey();

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    supabaseUrl,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

