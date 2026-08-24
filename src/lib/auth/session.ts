/**
 * Lennox ChinaMall — Server-Side Session Helpers
 *
 * These helpers run exclusively in Server Components, Server Actions,
 * and Route Handlers. They read the authenticated session via Supabase SSR.
 *
 * Role is read from app_metadata (safe, server-set).
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import { isAdminRole } from "./roles";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  emailVerified: boolean;
}

/**
 * Get the current authenticated session.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const role =
    (user.app_metadata?.role as UserRole) || "customer";

  return {
    id: user.id,
    email: user.email || "",
    displayName:
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      null,
    avatarUrl: user.user_metadata?.avatar_url || null,
    role,
    emailVerified: !!user.email_confirmed_at,
  };
}

/**
 * Get session or redirect to login.
 * Use in Server Components / layouts that require authentication.
 */
export async function getSessionOrRedirect(
  redirectTo?: string
): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const loginUrl = redirectTo
      ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
      : "/auth/login";
    redirect(loginUrl);
  }
  return session;
}

/**
 * Require an admin role or redirect.
 * Use in admin layouts/pages.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    redirect("/auth/login");
  }
  return session;
}

/**
 * Get the user's profile from the profiles table.
 */
export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}
