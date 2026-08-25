import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { UserRole, AccountStatus } from "@/types/database";
import { ADMIN_ROLES, ROLE_PERMISSIONS, AdminSection } from "@/lib/auth/roles";
import { getSafeRedirectUrl } from "@/utils/security";

/**
 * Lennox ChinaMall — Edge Middleware
 *
 * Enforces server-side session refresh, route protection, role & module gating,
 * account status validation, and open-redirect neutralization.
 */

const EXEMPT_AUTH_PATHS = [
  "/auth/verify-email",
  "/auth/reset-password",
  "/auth/forbidden",
  "/auth/unauthorized",
  "/auth/locked",
  "/auth/suspended",
  "/auth/expired-link",
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not add logic between createServerClient and supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const role = (user?.app_metadata?.role as UserRole) || null;
  const accountStatus = (user?.app_metadata?.account_status as AccountStatus) || "active";

  // ─── 1. Account Status Enforcement (Suspended/Blocked) ─────────────────────
  if (user && (accountStatus === "suspended" || accountStatus === "blocked")) {
    if (!pathname.startsWith("/auth/suspended") && !pathname.startsWith("/api/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/suspended";
      return NextResponse.redirect(url);
    }
  }

  // ─── 2. Dedicated Admin Login Route (/admin/login) ─────────────────────────
  if (pathname === "/admin/login") {
    // If already authenticated with an admin role, send to dashboard
    if (user && role && ADMIN_ROLES.includes(role)) {
      const rawRedirect = request.nextUrl.searchParams.get("redirect");
      const safeRedirect = getSafeRedirectUrl(rawRedirect, "/admin/dashboard");
      const url = request.nextUrl.clone();
      url.pathname = safeRedirect;
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }
    // Otherwise allow viewing admin login
    return supabaseResponse;
  }

  // ─── 3. Protected Admin Routes (/admin/*) ──────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // A. Unauthenticated -> redirect to /admin/login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // B. Authenticated as regular customer -> block and redirect to home (silent, no admin leakage)
    if (!role || !ADMIN_ROLES.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }

    // C. Granular module permission check for staff roles
    const segments = pathname.replace(/^\/admin\/?/, "").split("/");
    const moduleName = (segments[0] || "dashboard") as AdminSection;

    const allowedModules = ROLE_PERMISSIONS[role] || [];
    if (!allowedModules.includes(moduleName)) {
      // Role does not have access to this module -> redirect to allowed default dashboard
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // ─── 4. Protected Customer Account Routes (/account/*) ─────────────────────
  if (pathname.startsWith("/account")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ─── 5. Customer & Legacy Auth Routes (/auth/*) ────────────────────────────
  // Redirect logged-in users away from login/registration pages
  if (pathname.startsWith("/auth/")) {
    const isExempt = EXEMPT_AUTH_PATHS.some((path) => pathname.startsWith(path));

    if (user && !isExempt) {
      // If visiting /auth/admin-login while logged in as admin
      if (pathname.includes("admin-login")) {
        if (role && ADMIN_ROLES.includes(role)) {
          const url = request.nextUrl.clone();
          url.pathname = "/admin/dashboard";
          return NextResponse.redirect(url);
        }
      }

      // If user is staff/admin, default redirect is /admin/dashboard, otherwise /account
      const defaultDest = role && ADMIN_ROLES.includes(role) ? "/admin/dashboard" : "/account/profile";
      const rawRedirect = request.nextUrl.searchParams.get("redirect");
      const safeRedirect = getSafeRedirectUrl(rawRedirect, defaultDest);

      const url = request.nextUrl.clone();
      url.pathname = safeRedirect;
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (.svg, .png, .jpg, .webp, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
