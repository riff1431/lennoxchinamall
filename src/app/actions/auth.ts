"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ─── Login ──────────────────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/account";

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map Supabase error codes to user-friendly messages
    if (error.message.includes("Invalid login credentials")) {
      return { success: false, error: "Invalid email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        error: "Please verify your email address before signing in. Check your inbox.",
      };
    }
    return { success: false, error: error.message };
  }

  // Determine redirect: if the user is an admin and no explicit redirect, go to admin
  const role = data.user?.app_metadata?.role;
  let finalRedirect = redirectTo;
  if (
    role &&
    role !== "customer" &&
    (redirectTo === "/account" || redirectTo === "/account/profile")
  ) {
    finalRedirect = "/admin/dashboard";
  }

  revalidatePath("/", "layout");
  redirect(finalRedirect);
}

// ─── Signup ─────────────────────────────────────────────────────────────────

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("display_name") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/account`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return {
        success: false,
        error: "An account with this email already exists. Try signing in.",
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/auth/verify-email");
}

// ─── Sign Out ───────────────────────────────────────────────────────────────

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

// ─── Forgot Password ────────────────────────────────────────────────────────

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Email address is required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// ─── Reset Password ─────────────────────────────────────────────────────────

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/auth/login?message=password_reset_success");
}

// ─── Update Profile ─────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const displayName = formData.get("display_name") as string;
  const phone = formData.get("phone") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  // Update profiles table (role is protected by RLS WITH CHECK)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      phone: phone || null,
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // Also update user_metadata display_name for session consistency
  await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  revalidatePath("/account", "layout");
  return { success: true, error: null };
}

// ─── Change Password ────────────────────────────────────────────────────────

export async function changePassword(formData: FormData) {
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
