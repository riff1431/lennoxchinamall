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
import type { UserRole, AccountStatus } from "@/types/database";
import { isAdminRole, AdminSection } from "./roles";
import { hasActionPermission, PermissionAction } from "./permissions";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  twoFactorEnabled?: boolean;
}

/**
 * Get the current authenticated session with verified account status.
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
    (user.app_metadata?.role as UserRole) ||
    (user.user_metadata?.role as UserRole) ||
    (user.email === "admin@lennoxchinamall.com" ? "super_admin" : "customer");
  const accountStatus = (user.app_metadata?.account_status as AccountStatus) || "active";

  return {
    id: user.id,
    email: user.email || "",
    displayName:
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      null,
    avatarUrl: user.user_metadata?.avatar_url || null,
    role,
    accountStatus,
    emailVerified: !!user.email_confirmed_at,
    twoFactorEnabled: !!user.app_metadata?.two_factor_enabled,
  };
}

/**
 * Get session or redirect to customer login.
 * Redirects to `/auth/suspended` if the account is suspended or blocked.
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

  if (session.accountStatus === "suspended" || session.accountStatus === "blocked") {
    redirect("/auth/suspended");
  }

  return session;
}

/**
 * Require an authorized admin/staff role or redirect.
 * If unauthenticated -> redirects to `/admin/login`.
 * If customer -> redirects to `/auth/forbidden`.
 */
export async function requireAdmin(redirectTo?: string): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    const adminLoginUrl = redirectTo
      ? `/admin/login?redirect=${encodeURIComponent(redirectTo)}`
      : "/admin/login";
    redirect(adminLoginUrl);
  }

  if (!isAdminRole(session.role)) {
    redirect("/auth/forbidden");
  }

  if (session.accountStatus === "suspended" || session.accountStatus === "blocked") {
    redirect("/auth/suspended");
  }

  return session;
}

/**
 * Require a specific granular module action permission in Server Components / Actions.
 */
export async function requirePermission(
  section: AdminSection,
  action: PermissionAction = "view"
): Promise<SessionUser> {
  const session = await requireAdmin();

  if (!hasActionPermission(session.role, section, action)) {
    redirect("/auth/forbidden");
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
