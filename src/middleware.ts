import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Lennox ChinaMall — Edge Middleware
 *
 * Handles session refresh, route protection, and admin role gating.
 * Role is checked from app_metadata (server-set, not user-editable).
 */

const ADMIN_ROLES = [
  "super_admin",
  "catalogue_manager",
  "order_manager",
  "support_agent",
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

  // ─── Admin Routes (/admin/*) ─────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Not authenticated → redirect to admin login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/admin-login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Authenticated but not an admin role → redirect to home (don't reveal admin exists)
    const role = user.app_metadata?.role;
    if (!role || !ADMIN_ROLES.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.delete("redirect");
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
        const role = user.app_metadata?.role;
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
