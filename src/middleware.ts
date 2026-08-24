import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "@/types/database";

/**
 * Lennox ChinaMall — Edge Middleware
 *
 * Handles session refresh, route protection, and granular module role gating.
 * Role is checked from app_metadata (server-set, not user-editable).
 */

const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "catalogue_manager",
  "order_manager",
  "support_agent",
];

// Module-level permission map for edge checking
const ROLE_ALLOWED_MODULES: Record<UserRole, string[]> = {
  super_admin: [
    "dashboard",
    "products",
    "categories",
    "brands",
    "attributes",
    "inventory",
    "media",
    "suppliers",
    "sourcing",
    "orders",
    "payments",
    "shipping",
    "returns",
    "customers",
    "reviews",
    "support",
    "coupons",
    "flash-deals",
    "promotions",
    "homepage-sections",
    "pages",
    "menus",
    "seo",
    "notifications",
    "analytics",
    "staff",
    "audit-logs",
    "integrations",
    "settings",
    "security",
  ],
  catalogue_manager: [
    "dashboard",
    "products",
    "categories",
    "brands",
    "attributes",
    "inventory",
    "media",
    "suppliers",
    "flash-deals",
    "coupons",
    "promotions",
    "homepage-sections",
    "pages",
    "menus",
    "seo",
    "reviews",
  ],
  order_manager: [
    "dashboard",
    "orders",
    "payments",
    "shipping",
    "sourcing",
    "returns",
    "inventory",
    "suppliers",
    "customers",
    "support",
    "analytics",
  ],
  support_agent: [
    "dashboard",
    "orders",
    "shipping",
    "returns",
    "customers",
    "reviews",
    "support",
    "notifications",
  ],
  customer: [],
};

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

  // ─── Admin Routes (/admin/*) ─────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // 1. Not authenticated → redirect to admin login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/admin-login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // 2. Authenticated but not an admin role → redirect to home (silent, no admin leakage)
    const role = (user.app_metadata?.role as UserRole) || null;
    if (!role || !ADMIN_ROLES.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }

    // 3. Granular module permission check
    const segments = pathname.replace(/^\/admin\/?/, "").split("/");
    const moduleName = segments[0] || "dashboard";

    const allowedModules = ROLE_ALLOWED_MODULES[role] || [];
    if (!allowedModules.includes(moduleName)) {
      // Role does not have access to this module -> redirect to allowed default dashboard
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // ─── Account Routes (/account/*) ─────────────────────────────────────────
  if (pathname.startsWith("/account")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ─── Auth Routes (/auth/*) ───────────────────────────────────────────────
  // Redirect logged-in users away from auth pages (except verify-email and reset-password)
  if (pathname.startsWith("/auth/")) {
    const isExempt =
      pathname.includes("verify-email") ||
      pathname.includes("reset-password");

    if (user && !isExempt) {
      // If visiting admin-login while already an admin, go to admin dashboard
      if (pathname.includes("admin-login")) {
        const role = user.app_metadata?.role as UserRole;
        if (role && ADMIN_ROLES.includes(role)) {
          const url = request.nextUrl.clone();
          url.pathname = "/admin/dashboard";
          return NextResponse.redirect(url);
        }
      }

      const redirect =
        request.nextUrl.searchParams.get("redirect") || "/account";
      const url = request.nextUrl.clone();
      url.pathname = redirect;
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
