import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/types/database";
import { MOCK_BRANDS } from "@/lib/mockData";

export async function getBrands(): Promise<Brand[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_BRANDS as Brand[];
    }

    return data as unknown as Brand[];
  } catch {
    return MOCK_BRANDS as Brand[];
  }
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      const fallback = MOCK_BRANDS.find((b) => b.slug === slug);
      return (fallback as Brand) || null;
    }

    return data as unknown as Brand;
  } catch {
    const fallback = MOCK_BRANDS.find((b) => b.slug === slug);
    return (fallback as Brand) || null;
  }
}
