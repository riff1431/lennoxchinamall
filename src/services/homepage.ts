import { createClient } from "@/lib/supabase/server";
import { HomepageSection, DEFAULT_HOMEPAGE_SECTIONS } from "@/types/homepage";

/**
 * Fetches dynamic homepage sections for storefront rendering.
 */
export async function getStorefrontSections(): Promise<HomepageSection[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("is_active", true)
      .eq("status", "published")
      .order("position", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_HOMEPAGE_SECTIONS;
    }

    const now = new Date();
    const activeSections = data.filter((sec: any) => {
      if (sec.start_date && new Date(sec.start_date) > now) return false;
      if (sec.end_date && new Date(sec.end_date) < now) return false;
      return true;
    });

    return (activeSections.length > 0 ? activeSections : DEFAULT_HOMEPAGE_SECTIONS) as HomepageSection[];
  } catch {
    return DEFAULT_HOMEPAGE_SECTIONS;
  }
}
