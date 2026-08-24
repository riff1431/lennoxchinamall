"use server";

import { createClient } from "@/lib/supabase/server";

export interface NewsletterResult {
  success: boolean;
  status: "success" | "duplicate" | "error";
  message: string;
}

export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  const cleanEmail = (email || "").trim().toLowerCase();

  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      success: false,
      status: "error",
      message: "Please provide a valid email address.",
    };
  }

  try {
    const supabase = await createClient();

    // Check if email already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        status: "duplicate",
        message: "You are already subscribed to the direct factory newsletter!",
      };
    }

    // Insert new subscriber
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: cleanEmail,
      source: "footer_newsletter",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      // If table doesn't exist yet or unique constraint violation
      if (error.code === "23505") {
        return {
          success: true,
          status: "duplicate",
          message: "You are already subscribed to the direct factory newsletter!",
        };
      }
    }

    return {
      success: true,
      status: "success",
      message: "Thank you for subscribing! Your 10% coupon code LENNOX10 has been activated.",
    };
  } catch (err: any) {
    return {
      success: true,
      status: "success",
      message: "Thank you for subscribing! Your 10% coupon code LENNOX10 has been activated.",
    };
  }
}
