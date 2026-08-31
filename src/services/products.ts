import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/database";
import { MOCK_PRODUCTS } from "@/lib/mockData";


export interface GetProductsOptions {
  categoryId?: string;
  brandId?: string;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "rating" | "popularity" | "newest";
  limit?: number;
  offset?: number;
  isAdmin?: boolean;
}

/**
 * Strips confidential supplier and cost data from public product responses.
 * (PRD §6.3: Private by design)
 */
export function sanitizePublicProduct(product: Product): Product {
  const sanitized = {
    ...product,
    cost: null,
    supplier_code: null,
  };

  if (sanitized.variants) {
    sanitized.variants = sanitized.variants.map((v) => ({
      ...v,
      cost: null,
      supplier_code: null,
    }));
  }

  return sanitized;
}

/**
 * Fetch products with filtering, sorting, and pagination
 */
export async function getProducts(
  options: GetProductsOptions = {}
): Promise<{ products: Product[]; total: number }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("*, category:categories(*), brand:brands(*), variants(*), media:product_media(*), videos:product_videos(*)", {
        count: "exact",
      });

    // Unless admin explicitly requests all, only return published items
    if (!options.isAdmin) {
      query = query.eq("status", "published");
    }

    if (options.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }
    if (options.brandId) {
      query = query.eq("brand_id", options.brandId);
    }
    if (options.isFlashDeal) {
      query = query.eq("is_flash_deal", true);
    }
    if (options.isBestSeller) {
      query = query.eq("is_best_seller", true);
    }
    if (options.isNewArrival) {
      query = query.eq("is_new_arrival", true);
    }
    if (options.isFeatured) {
      query = query.eq("is_featured", true);
    }
    if (options.minPrice !== undefined) {
      query = query.gte("base_price", options.minPrice);
    }
    if (options.maxPrice !== undefined) {
      query = query.lte("base_price", options.maxPrice);
    }
    if (options.search) {
      query = query.ilike("title", `%${options.search}%`);
    }

    // Sort order
    if (options.sortBy === "price_asc") {
      query = query.order("base_price", { ascending: true });
    } else if (options.sortBy === "price_desc") {
      query = query.order("base_price", { ascending: false });
    } else if (options.sortBy === "rating") {
      query = query.order("avg_rating", { ascending: false });
    } else if (options.sortBy === "popularity") {
      query = query.order("sold_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const limit = options.limit || 24;
    const offset = options.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error || !data || data.length === 0) {
      if (error) console.warn("Supabase products query error, falling back to mock data:", error.message);
      return getFallbackProducts(options);
    }

    const rawProducts = data as unknown as Product[];
    const products = options.isAdmin
      ? rawProducts
      : rawProducts.map(sanitizePublicProduct);

    return {
      products,
      total: count ?? products.length,
    };
  } catch {
    return getFallbackProducts(options);
  }
}

/**
 * Fetch a single product by slug or id with variants, media, and dual video slots
 */
export async function getProductBySlug(
  slug: string,
  isAdmin = false
): Promise<Product | null> {
  if (!slug) return null;
  try {
    const supabase = await createClient();

    // Query product by slug first
    let { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*), brand:brands(*), variants(*), media:product_media(*), videos:product_videos(*)")
      .eq("slug", slug)
      .maybeSingle();

    // If not found by slug, try matching by id
    if (!data && !error) {
      const byIdResult = await supabase
        .from("products")
        .select("*, category:categories(*), brand:brands(*), variants(*), media:product_media(*), videos:product_videos(*)")
        .eq("id", slug)
        .maybeSingle();
      data = byIdResult.data;
      error = byIdResult.error;
    }

    if (error || !data) {
      const fallback = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
      if (!fallback) return null;
      return isAdmin ? fallback : sanitizePublicProduct(fallback);
    }

    const product = data as unknown as Product;
    return isAdmin ? product : sanitizePublicProduct(product);
  } catch {
    const fallback = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    if (!fallback) return null;
    return isAdmin ? fallback : sanitizePublicProduct(fallback);
  }
}

/**
 * In-memory fallback for mock data filtering
 */
function getFallbackProducts(
  options: GetProductsOptions
): { products: Product[]; total: number } {
  let list = [...MOCK_PRODUCTS];

  if (!options.isAdmin) {
    list = list.filter((p) => p.status === "published");
  }
  if (options.categoryId) {
    list = list.filter((p) => p.category_id === options.categoryId);
  }
  if (options.brandId) {
    list = list.filter((p) => p.brand_id === options.brandId);
  }
  if (options.isFlashDeal) {
    list = list.filter((p) => p.is_flash_deal);
  }
  if (options.isBestSeller) {
    list = list.filter((p) => p.is_best_seller);
  }
  if (options.isNewArrival) {
    list = list.filter((p) => p.is_new_arrival);
  }
  if (options.isFeatured) {
    list = list.filter((p) => p.is_featured);
  }
  if (options.minPrice !== undefined) {
    list = list.filter((p) => p.base_price >= options.minPrice!);
  }
  if (options.maxPrice !== undefined) {
    list = list.filter((p) => p.base_price <= options.maxPrice!);
  }
  if (options.search) {
    const s = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.tags.some((t) => t.toLowerCase().includes(s))
    );
  }

  // Sorting
  if (options.sortBy === "price_asc") {
    list.sort((a, b) => a.base_price - b.base_price);
  } else if (options.sortBy === "price_desc") {
    list.sort((a, b) => b.base_price - a.base_price);
  } else if (options.sortBy === "rating") {
    list.sort((a, b) => b.avg_rating - a.avg_rating);
  } else if (options.sortBy === "popularity") {
    list.sort((a, b) => b.sold_count - a.sold_count);
  }

  const total = list.length;
  const limit = options.limit || 24;
  const offset = options.offset || 0;
  const paginated = list.slice(offset, offset + limit);

  const products = options.isAdmin
    ? paginated
    : paginated.map(sanitizePublicProduct);

  return { products, total };
}
