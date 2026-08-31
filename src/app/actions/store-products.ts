"use server";

import { createClient } from "@/lib/supabase/server";
import { Product, Category, Brand } from "@/types/database";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from "@/lib/mockData";

export interface ProductFilters {
  q?: string;
  categorySlug?: string;
  categoryId?: string;
  subcategory?: string;
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  flashDealsOnly?: boolean;
  newArrivalsOnly?: boolean;
  bestSellersOnly?: boolean;
  hasVideoOnly?: boolean;
  freeShippingOnly?: boolean;
  originHub?: string;
  sortBy?: "relevance" | "newest" | "popularity" | "rating" | "price_asc" | "price_desc" | "discount_desc";
  page?: number;
  pageSize?: number;
}

export interface FilteredProductsResult {
  success: boolean;
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  appliedFiltersCount: number;
  facets: {
    brands: { id: string; name: string; count: number }[];
    categories: { id: string; name: string; slug: string; count: number }[];
    priceRange: { min: number; max: number };
    totalInStock: number;
    totalFlashDeals: number;
  };
  error?: string;
}

export async function getFilteredProducts(filters: ProductFilters = {}): Promise<FilteredProductsResult> {
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(1, Math.min(48, Number(filters.pageSize) || 12));
  const sortBy = filters.sortBy || "relevance";

  try {
    const supabase = await createClient();

    let { data: dbProducts, error } = await supabase
      .from("products")
      .select("*, category:categories(*), brand:brands(*), media:product_media(*), videos:product_videos(*), variants(*)")
      .eq("status", "published");

    // Merge database products with mock catalogue so newly added products persist alongside catalogue
    const productMap = new Map<string, Product>();
    MOCK_PRODUCTS.forEach((p) => {
      if (p.status === "published") productMap.set(p.id, p);
    });

    if (dbProducts && dbProducts.length > 0 && !error) {
      (dbProducts as unknown as Product[]).forEach((p) => {
        if (p.status === "published") productMap.set(p.id, p);
      });
    }

    let allProducts: Product[] = Array.from(productMap.values());

    // 1. Text Search Query Filter
    if (filters.q && filters.q.trim().length > 0) {
      const q = filters.q.toLowerCase().trim();
      allProducts = allProducts.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const skuMatch = p.sku ? p.sku.toLowerCase().includes(q) : false;
        const tagMatch = p.tags ? p.tags.some((t) => t.toLowerCase().includes(q)) : false;
        const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
        return titleMatch || skuMatch || tagMatch || descMatch;
      });
    }

    // 2. Category Filter
    if (filters.categorySlug && filters.categorySlug !== "all") {
      if (filters.categorySlug === "flash-deals") {
        allProducts = allProducts.filter((p) => p.is_flash_deal);
      } else if (filters.categorySlug === "new-arrivals") {
        allProducts = allProducts.filter((p) => p.is_new_arrival);
      } else {
        const targetCategory = MOCK_CATEGORIES.find((c) => c.slug === filters.categorySlug);
        if (targetCategory) {
          allProducts = allProducts.filter(
            (p) => p.category_id === targetCategory.id || (p as any).category?.slug === filters.categorySlug
          );
        }
      }
    } else if (filters.categoryId && filters.categoryId !== "all") {
      allProducts = allProducts.filter((p) => p.category_id === filters.categoryId);
    }

    // 3. Flags Filter
    if (filters.flashDealsOnly) {
      allProducts = allProducts.filter((p) => p.is_flash_deal);
    }
    if (filters.newArrivalsOnly) {
      allProducts = allProducts.filter((p) => p.is_new_arrival);
    }
    if (filters.bestSellersOnly) {
      allProducts = allProducts.filter((p) => p.is_best_seller);
    }
    if (filters.hasVideoOnly) {
      allProducts = allProducts.filter((p) => p.videos && p.videos.length > 0);
    }

    // 4. Brands Filter
    if (filters.brandIds && filters.brandIds.length > 0) {
      allProducts = allProducts.filter((p) => p.brand_id && filters.brandIds!.includes(p.brand_id));
    }

    // 5. Price Range Filter
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      allProducts = allProducts.filter((p) => p.base_price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice < 5000) {
      allProducts = allProducts.filter((p) => p.base_price <= filters.maxPrice!);
    }

    // 6. Rating Filter
    if (filters.minRating !== undefined && filters.minRating > 0) {
      allProducts = allProducts.filter((p) => (p.avg_rating || 0) >= filters.minRating!);
    }

    // 7. Stock Availability
    if (filters.inStockOnly) {
      allProducts = allProducts.filter((p) => {
        const stock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 50;
        return stock > 0;
      });
    }

    // Compute Dynamic Facets for Filters
    const brandCountsMap = new Map<string, number>();
    const categoryCountsMap = new Map<string, number>();
    let totalInStock = 0;
    let totalFlashDeals = 0;
    let minPriceFound = 999999;
    let maxPriceFound = 0;

    allProducts.forEach((p) => {
      if (p.brand_id) {
        brandCountsMap.set(p.brand_id, (brandCountsMap.get(p.brand_id) || 0) + 1);
      }
      if (p.category_id) {
        categoryCountsMap.set(p.category_id, (categoryCountsMap.get(p.category_id) || 0) + 1);
      }
      if (p.is_flash_deal) totalFlashDeals++;
      const stock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 50;
      if (stock > 0) totalInStock++;
      if (p.base_price < minPriceFound) minPriceFound = p.base_price;
      if (p.base_price > maxPriceFound) maxPriceFound = p.base_price;
    });

    const facetBrands = MOCK_BRANDS.map((b) => ({
      id: b.id,
      name: b.name,
      count: brandCountsMap.get(b.id) || 0,
    })).filter((b) => b.count > 0 || (filters.brandIds && filters.brandIds.includes(b.id)));

    const facetCategories = MOCK_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: categoryCountsMap.get(c.id) || 0,
    }));

    // 8. Sorting
    allProducts.sort((a, b) => {
      if (sortBy === "price_asc") return a.base_price - b.base_price;
      if (sortBy === "price_desc") return b.base_price - a.base_price;
      if (sortBy === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortBy === "popularity") return (b.sold_count || 0) - (a.sold_count || 0);
      if (sortBy === "newest") {
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      }
      if (sortBy === "discount_desc") {
        const discA = a.compare_at_price ? (a.compare_at_price - a.base_price) / a.compare_at_price : 0;
        const discB = b.compare_at_price ? (b.compare_at_price - b.base_price) / b.compare_at_price : 0;
        return discB - discA;
      }
      return 0; // relevance
    });

    // 9. Count applied filters
    let appliedCount = 0;
    if (filters.brandIds && filters.brandIds.length > 0) appliedCount += filters.brandIds.length;
    if (filters.minPrice && filters.minPrice > 0) appliedCount++;
    if (filters.maxPrice && filters.maxPrice < 500) appliedCount++;
    if (filters.minRating && filters.minRating > 0) appliedCount++;
    if (filters.inStockOnly) appliedCount++;
    if (filters.flashDealsOnly && filters.categorySlug !== "flash-deals") appliedCount++;
    if (filters.hasVideoOnly) appliedCount++;

    // 10. Pagination
    const totalCount = allProducts.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const paginatedProducts = allProducts.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      products: paginatedProducts,
      totalCount,
      totalPages,
      currentPage: page,
      appliedFiltersCount: appliedCount,
      facets: {
        brands: facetBrands,
        categories: facetCategories,
        priceRange: {
          min: minPriceFound === 999999 ? 0 : Math.floor(minPriceFound),
          max: maxPriceFound === 0 ? 500 : Math.ceil(maxPriceFound),
        },
        totalInStock,
        totalFlashDeals,
      },
    };
  } catch (err: any) {
    return {
      success: true,
      products: MOCK_PRODUCTS.slice(0, pageSize),
      totalCount: MOCK_PRODUCTS.length,
      totalPages: Math.ceil(MOCK_PRODUCTS.length / pageSize),
      currentPage: page,
      appliedFiltersCount: 0,
      facets: {
        brands: MOCK_BRANDS.map((b) => ({ id: b.id, name: b.name, count: 2 })),
        categories: MOCK_CATEGORIES.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: 3 })),
        priceRange: { min: 20, max: 400 },
        totalInStock: MOCK_PRODUCTS.length,
        totalFlashDeals: 3,
      },
    };
  }
}
