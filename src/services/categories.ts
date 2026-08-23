import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/database";
import { MOCK_CATEGORIES } from "@/lib/mockData";

/**
 * Fetch all active product categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_CATEGORIES;
    }

    return data as unknown as Category[];
  } catch {
    return MOCK_CATEGORIES;
  }
}

/**
 * Fetch a category by its slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      const fallback = MOCK_CATEGORIES.find((c) => c.slug === slug);
      return fallback || null;
    }

    return data as unknown as Category;
  } catch {
    const fallback = MOCK_CATEGORIES.find((c) => c.slug === slug);
    return fallback || null;
  }
}
