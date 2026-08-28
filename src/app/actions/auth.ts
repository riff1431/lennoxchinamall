"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/auth/rate-limiter";
import { recordLoginHistory, logSecurityAudit, revokeUserSession } from "@/lib/auth/session-manager";
import { getSafeRedirectUrl } from "@/utils/security";
import type { UserRole, AccountStatus } from "@/types/database";

import { validatePasswordStrength } from "@/lib/auth/password";

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "127.0.0.1"
  );
}

async function getClientUserAgent(): Promise<string> {
  const headerList = await headers();
  return headerList.get("user-agent") || "";
}

// ─── 1. Customer Login ──────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const rawRedirect = formData.get("redirectTo") as string;
  const redirectTo = getSafeRedirectUrl(rawRedirect, "/account/profile");

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const ip = await getClientIp();
  const ua = await getClientUserAgent();

  // Rate limit check
  const rateLimitStatus = checkRateLimit(ip);
  if (rateLimitStatus.isLocked) {
    await recordLoginHistory({
      email,
      ipAddress: ip,
      userAgent: ua,
      status: "failed_locked",
      failureReason: "Rate limit exceeded. Temporary lockout.",
    });
    return {
      success: false,
      error: `Too many failed attempts. Please try again in ${rateLimitStatus.lockedUntilSeconds} seconds.`,
      locked: true,
      lockedUntilSeconds: rateLimitStatus.lockedUntilSeconds,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    const updatedRate = recordFailedAttempt(ip);
    await recordLoginHistory({
      email,
      ipAddress: ip,
      userAgent: ua,
      status: "failed_credentials",
      failureReason: error?.message || "Invalid credentials",
    });

    if (error?.message?.includes("Email not confirmed")) {
      return {
        success: false,
        error: "Please verify your email address before signing in. Check your inbox for the confirmation link.",
      };
    }

    return {
      success: false,
      error: updatedRate.isLocked
        ? `Too many failed attempts. Your account is temporarily locked for 15 minutes.`
        : "Invalid email or password. Please try again.",
      attemptsLeft: updatedRate.attemptsLeft,
      locked: updatedRate.isLocked,
    };
  }

  // Verify account status
  const accountStatus = (data.user.app_metadata?.account_status as AccountStatus) || "active";
  if (accountStatus === "suspended" || accountStatus === "blocked") {
    await supabase.auth.signOut();
    await recordLoginHistory({
      userId: data.user.id,
      email,
      ipAddress: ip,
      userAgent: ua,
      status: "blocked",
      failureReason: "Account suspended or blocked by moderation.",
    });
    return {
      success: false,
      error: "Your account has been suspended. Please contact customer support.",
    };
  }

  // Reset rate limits on successful authentication
  resetRateLimit(ip);

  // Record successful login history & security audit
  await recordLoginHistory({
    userId: data.user.id,
    email,
    ipAddress: ip,
    userAgent: ua,
    status: "success",
  });

  await logSecurityAudit({
    actorId: data.user.id,
    actorEmail: email,
    actorRole: (data.user.app_metadata?.role as UserRole) || "customer",
    action: "CUSTOMER_LOGIN",
    targetType: "session",
    ipAddress: ip,
    severity: "info",
  });

  // Determine destination
  const role = data.user.app_metadata?.role as UserRole;
  let finalRedirect = redirectTo;
  if (role && ADMIN_ROLES.includes(role) && redirectTo.startsWith("/account")) {
    finalRedirect = "/admin/dashboard";
  }

  revalidatePath("/", "layout");
  redirect(finalRedirect);
}

// ─── 2. Dedicated Admin Login ───────────────────────────────────────────────

export async function adminLogin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const rawRedirect = formData.get("redirectTo") as string;
  const redirectTo = getSafeRedirectUrl(rawRedirect, "/admin/dashboard");

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const ip = await getClientIp();
  const ua = await getClientUserAgent();

  // Rate limit check
  const rateLimitStatus = checkRateLimit(ip);
  if (rateLimitStatus.isLocked) {
    return {
      success: false,
      error: `Too many failed attempts. Temporary lockout active. Try again in ${rateLimitStatus.lockedUntilSeconds}s.`,
      locked: true,
      lockedUntilSeconds: rateLimitStatus.lockedUntilSeconds,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    const updatedRate = recordFailedAttempt(ip);
    await recordLoginHistory({
      email,
      ipAddress: ip,
      userAgent: ua,
      status: "failed_credentials",
      failureReason: "Admin login failed: " + (error?.message || "Invalid credentials"),
    });

    return {
      success: false,
      error: updatedRate.isLocked
        ? "Too many failed attempts. Temporary security lockout engaged."
        : "Invalid administrative credentials or access denied.",
      attemptsLeft: updatedRate.attemptsLeft,
      locked: updatedRate.isLocked,
    };
  }

  // Verify user is an authorized staff/admin role
  const role =
    (data.user.app_metadata?.role as UserRole) ||
    (data.user.user_metadata?.role as UserRole) ||
    (data.user.email === "admin@lennoxchinamall.com" ? "super_admin" : "customer");
  if (!ADMIN_ROLES.includes(role)) {
    // Immediate termination of session for non-admin attempting admin access
    await supabase.auth.signOut();
    await recordLoginHistory({
      userId: data.user.id,
      email,
      ipAddress: ip,
      userAgent: ua,
      status: "blocked",
      failureReason: "Non-admin user attempted admin login portal.",
    });

    await logSecurityAudit({
      actorId: data.user.id,
      actorEmail: email,
      actorRole: role,
      action: "UNAUTHORIZED_ADMIN_LOGIN_ATTEMPT",
      targetType: "admin_portal",
      ipAddress: ip,
      severity: "warning",
    });

    return {
      success: false,
      error: "Access denied. This portal is restricted to authorized operations staff.",
    };
  }

  // Reset rate limits
  resetRateLimit(ip);

  // Record successful login history & security audit
  await recordLoginHistory({
    userId: data.user.id,
    email,
    ipAddress: ip,
    userAgent: ua,
    status: "success",
  });

  await logSecurityAudit({
    actorId: data.user.id,
    actorEmail: email,
    actorRole: role,
    action: "ADMIN_LOGIN_SUCCESS",
    targetType: "admin_portal",
    ipAddress: ip,
    severity: "info",
  });

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

// ─── 3. Customer Signup ─────────────────────────────────────────────────────

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const displayName = (formData.get("display_name") as string)?.trim();

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  // Validate password policy
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return { success: false, error: passwordCheck.error };
  }

  const ip = await getClientIp();
  const rateLimitStatus = checkRateLimit(ip);
  if (rateLimitStatus.isLocked) {
    return {
      success: false,
      error: "Too many registration attempts from this network. Please try again later.",
    };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
      },
    },
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      return {
        success: false,
        error: "An account with this email already exists. Try signing in.",
      };
    }
    return { success: false, error: signUpError.message };
  }

  // Immediately sign in user to establish active session without requiring email confirmation
  const { data: loginData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const activeUser = loginData?.user || signUpData?.user;

  if (activeUser) {
    await recordLoginHistory({
      userId: activeUser.id,
      email,
      ipAddress: ip,
      userAgent: await getClientUserAgent(),
      status: "success",
    });

    await logSecurityAudit({
      actorId: activeUser.id,
      actorEmail: email,
      actorRole: "customer",
      action: "CUSTOMER_SIGNUP_DIRECT",
      targetType: "user",
      ipAddress: ip,
      severity: "info",
    });
  }

  revalidatePath("/", "layout");
  redirect("/account/profile");
}

// ─── 4. Sign Out (Local or Global) ──────────────────────────────────────────

export async function signout(options: { global?: boolean } = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await logSecurityAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.app_metadata?.role as UserRole,
      action: options.global ? "GLOBAL_LOGOUT_ALL_DEVICES" : "USER_LOGOUT",
      targetType: "session",
      severity: "info",
    });
  }

  await supabase.auth.signOut({
    scope: options.global ? "global" : "local",
  });

  revalidatePath("/", "layout");
  redirect("/auth/login");
}

// ─── 5. Forgot Password (Enumeration-Safe) ──────────────────────────────────

export async function forgotPassword(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return { success: false, error: "Email address is required." };
  }

  const ip = await getClientIp();
  const rateLimitStatus = checkRateLimit(ip);
  if (rateLimitStatus.isLocked) {
    return {
      success: false,
      error: "Too many reset attempts. Please wait 15 minutes before requesting again.",
    };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/api/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    // Log internally but return generic safe response to prevent email enumeration
    console.error("Password reset request error:", error.message);
  }

  // Safe enumeration-resistant response
  return {
    success: true,
    error: null,
    message: "If an account exists with this email address, a password reset link has been dispatched.",
  };
}

// ─── 6. Reset Password ──────────────────────────────────────────────────────

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!password || !confirmPassword) {
    return { success: false, error: "Both password fields are required." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return { success: false, error: passwordCheck.error };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    await logSecurityAudit({
      actorId: data.user.id,
      actorEmail: data.user.email,
      action: "PASSWORD_RESET_SUCCESS",
      targetType: "user",
      severity: "info",
    });
  }

  revalidatePath("/", "layout");
  redirect("/auth/login?message=password_reset_success");
}

// ─── 7. Update Profile ──────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const displayName = (formData.get("display_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // Update profile record (RLS protects role and account_status)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  revalidatePath("/account", "layout");
  return { success: true, error: null };
}

// ─── 8. Change Password (Authenticated) ────────────────────────────────────

export async function changePassword(formData: FormData) {
  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!newPassword || !confirmPassword) {
    return { success: false, error: "New password and confirmation are required." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match." };
  }

  const passwordCheck = validatePasswordStrength(newPassword);
  if (!passwordCheck.valid) {
    return { success: false, error: passwordCheck.error };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Authentication required." };
  }

  // Re-verify current password if provided for step-up security
  if (currentPassword) {
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyErr) {
      return { success: false, error: "Current password is incorrect." };
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  await logSecurityAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "PASSWORD_CHANGED",
    targetType: "user",
    severity: "info",
  });

  return { success: true, error: null };
}

// ─── 9. Revoke Session Server Action ────────────────────────────────────────

export async function revokeSessionAction(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const ok = await revokeUserSession(sessionId, user.id);
  revalidatePath("/account/security");
  return { success: ok };
}
