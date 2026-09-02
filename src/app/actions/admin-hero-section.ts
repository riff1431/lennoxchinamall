"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit";
import {
  HeroLennoxConfig,
  DEFAULT_HERO_LENNOX_CONFIG,
  HomepageSection,
} from "@/types/homepage";

/**
 * Fetches the 3-Column Hero Section configuration for the admin panel.
 */
export async function getAdminHeroSectionConfig(): Promise<{
  success: boolean;
  config: HeroLennoxConfig;
  error?: string;
}> {
  const session = await getSession();
  if (
    !session ||
    !["super_admin", "admin", "catalogue_manager", "product_manager"].includes(
      session.role
    )
  ) {
    return {
      success: false,
      config: DEFAULT_HERO_LENNOX_CONFIG,
      error: "Unauthorized access.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("type", "hero_banner")
      .maybeSingle();

    if (error || !data) {
      return { success: true, config: DEFAULT_HERO_LENNOX_CONFIG };
    }

    const section = data as HomepageSection;
    const heroConfig = section.config?.hero_lennox;

    if (!heroConfig) {
      return { success: true, config: DEFAULT_HERO_LENNOX_CONFIG };
    }

    return {
      success: true,
      config: {
        deal_of_the_day: {
          ...DEFAULT_HERO_LENNOX_CONFIG.deal_of_the_day!,
          ...heroConfig.deal_of_the_day,
        },
        middle_banner: {
          ...DEFAULT_HERO_LENNOX_CONFIG.middle_banner!,
          ...heroConfig.middle_banner,
        },
        four_deals:
          heroConfig.four_deals && heroConfig.four_deals.length > 0
            ? heroConfig.four_deals
            : DEFAULT_HERO_LENNOX_CONFIG.four_deals,
        video_reels:
          heroConfig.video_reels && heroConfig.video_reels.length > 0
            ? heroConfig.video_reels
            : DEFAULT_HERO_LENNOX_CONFIG.video_reels,
      },
    };
  } catch (err: any) {
    return { success: true, config: DEFAULT_HERO_LENNOX_CONFIG };
  }
}

/**
 * Updates the 3-Column Hero Section configuration.
 */
export async function updateAdminHeroSectionConfig(payload: HeroLennoxConfig) {
  const session = await getSession();
  if (
    !session ||
    !["super_admin", "admin", "catalogue_manager", "product_manager"].includes(
      session.role
    )
  ) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const supabase = await createClient();

    // Check if hero section exists
    const { data: existing } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("type", "hero_banner")
      .maybeSingle();

    const updatedConfig = {
      ...(existing?.config || {}),
      hero_lennox: payload,
    };

    if (existing?.id) {
      const { error: updateErr } = await supabase
        .from("homepage_sections")
        .update({
          config: updatedConfig,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }
    } else {
      const { error: insertErr } = await supabase
        .from("homepage_sections")
        .insert({
          name: "Direct Shenzhen Factory Hero Carousel",
          subtitle:
            "Zero middleman wholesale drops with verified Binance Pay USDT checkout",
          type: "hero_banner",
          layout: "carousel",
          position: 1,
          is_active: true,
          status: "published",
          visibility: "all",
          config: updatedConfig,
        });

      if (insertErr) {
        return { success: false, error: insertErr.message };
      }
    }

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "setting",
      entityId: existing?.id || "hero_banner",
      changes: { action: "HERO_SECTION_UPDATED", payload },
    });

    revalidatePath("/");
    revalidatePath("/admin/hero-section");
    revalidatePath("/admin/homepage-sections");

    return {
      success: true,
      message: "Hero section configuration updated successfully.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update hero section.",
    };
  }
}

/**
 * Resets the 3-Column Hero Section configuration to factory defaults.
 */
export async function resetAdminHeroSectionConfig() {
  return updateAdminHeroSectionConfig(DEFAULT_HERO_LENNOX_CONFIG);
}
