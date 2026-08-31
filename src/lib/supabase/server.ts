import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * If using Fluid compute: Don't put this client in a global variable. Always create a new client within each
 * function when using it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
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
            // The `setAll` method was called from a Server Component.
            // This is safely handled by middleware refreshing user sessions.
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  // If service role key is not configured or is placeholder, fall back to anon key safely
  const hasValidServiceKey =
    serviceKey &&
    serviceKey.trim() !== "" &&
    !serviceKey.includes("your-supabase-service-role-key") &&
    serviceKey.length > 20;

  const key = hasValidServiceKey
    ? serviceKey
    : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!key) {
    throw new Error("Supabase API key is not configured");
  }

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

