/**
 * Lennox ChinaMall — Supabase Auth Callback Handler
 *
 * Securely exchanges one-time codes for authenticated sessions,
 * validates redirect targets, and routes expired or invalid tokens
 * to a dedicated expired link recovery page.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectUrl } from "@/utils/security";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Check if provider returned an explicit error (e.g. otp_expired, access_denied)
  if (errorParam || errorDescription) {
    const isExpired =
      errorDescription?.includes("expired") ||
      errorParam?.includes("expired") ||
      errorDescription?.includes("token");

    if (isExpired) {
      return NextResponse.redirect(`${origin}/auth/expired-link`);
    }

    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDescription || errorParam || "Authentication failed")}`
    );
  }

  const safeNext = getSafeRedirectUrl(rawNext, "/account/profile");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    // Code was invalid or expired
    if (
      error.message.includes("expired") ||
      error.message.includes("invalid") ||
      error.message.includes("Token")
    ) {
      return NextResponse.redirect(`${origin}/auth/expired-link`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/expired-link`);
}
