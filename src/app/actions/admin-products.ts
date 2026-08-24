"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Product, Variant, ProductMedia, ProductVideo } from "@/types/database";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from "@/lib/mockData";
import { logAuditEvent } from "@/lib/audit";
import { slugify } from "@/utils/helpers";

// ─── Fetch Products ─────────────────────────────────────────────────────────

export interface FetchAdminProductsParams {
  search?: string;
  categoryId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getAdminProducts(params?: FetchAdminProductsParams) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access", products: [], categories: [], brands: [] };
  }

  try {
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("*, category:categories(*), brand:brands(*), variants(*), media:product_media(*), videos:product_videos(*)")
      .order("created_at", { ascending: false });

    if (params?.categoryId && params.categoryId !== "all") {
      query = query.eq("category_id", params.categoryId);
    }
    if (params?.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }
    if (params?.search && params.search.trim()) {
      const s = params.search.trim();
      query = query.or(`title.ilike.%${s}%,sku.ilike.%${s}%,supplier_code.ilike.%${s}%`);
    }

    const { data: productsData, error } = await query;
    const { data: categoriesData } = await supabase.from("categories").select("*").order("position");
    const { data: brandsData } = await supabase.from("brands").select("*").order("name");

    const categories = categoriesData && categoriesData.length > 0 ? categoriesData : MOCK_CATEGORIES;
    const brands = brandsData && brandsData.length > 0 ? brandsData : MOCK_BRANDS;

    if (error || !productsData || productsData.length === 0) {
      // Return fallback products with search filtering applied
      let filtered = [...MOCK_PRODUCTS];
      if (params?.categoryId && params.categoryId !== "all") {
        filtered = filtered.filter((p) => p.category_id === params.categoryId);
      }
      if (params?.search && params.search.trim()) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter((p) => p.title.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
      }
      return { success: true, products: filtered, categories, brands };
    }

    return { success: true, products: productsData as Product[], categories, brands };
  } catch (err) {
    console.error("Fetch admin products error:", err);
    return { success: true, products: MOCK_PRODUCTS, categories: MOCK_CATEGORIES, brands: MOCK_BRANDS };
  }
}

// ─── Create Product ─────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access" };
  }

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || slugify(title);
  const sku = formData.get("sku") as string;
  const categoryId = formData.get("category_id") as string;
  const brandId = (formData.get("brand_id") as string) || null;
  const shortDescription = formData.get("short_description") as string;
  const description = formData.get("description") as string;
  const basePrice = Number(formData.get("base_price")) || 0;
  const compareAtPrice = Number(formData.get("compare_at_price")) || null;
  const cost = Number(formData.get("cost")) || null; // Private
  const supplierCode = (formData.get("supplier_code") as string) || null;
  const shippingOrigin = (formData.get("shipping_origin") as string) || "Shenzhen, China";
  const isFeatured = formData.get("is_featured") === "true";
  const isFlashDeal = formData.get("is_flash_deal") === "true";
  const status = (formData.get("status") as any) || "published";

  // Dual Videos
  const video1Url = formData.get("video1_url") as string;
  const video1Title = formData.get("video1_title") as string;
  const video2Url = formData.get("video2_url") as string;
  const video2Title = formData.get("video2_title") as string;

  // Media
  const imageUrls = formData.getAll("images") as string[];

  try {
    const supabase = await createClient();

    const { data: newProd, error: prodErr } = await supabase
      .from("products")
      .insert({
        title,
        slug,
        sku,
        category_id: categoryId || null,
        brand_id: brandId || null,
        short_description: shortDescription,
        description,
        base_price: basePrice,
        compare_at_price: compareAtPrice,
        cost,
        supplier_code: supplierCode,
        shipping_origin: shippingOrigin,
        is_featured: isFeatured,
        is_flash_deal: isFlashDeal,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (prodErr) {
      return { success: false, error: prodErr.message };
    }

    // Insert Product Media
    if (imageUrls && imageUrls.length > 0) {
      const mediaInserts = imageUrls.filter(Boolean).map((url, idx) => ({
        product_id: newProd.id,
        url,
        position: idx + 1,
      }));
      if (mediaInserts.length > 0) {
        await supabase.from("product_media").insert(mediaInserts);
      }
    }

    // Insert Dual Videos
    const videoInserts = [];
    if (video1Url) {
      videoInserts.push({
        product_id: newProd.id,
        url: video1Url,
        position: 1,
        title: video1Title || "Slot 1: QC Teardown",
        type: "embed",
      });
    }
    if (video2Url) {
      videoInserts.push({
        product_id: newProd.id,
        url: video2Url,
        position: 2,
        title: video2Title || "Slot 2: Live Hands-on Demo",
        type: "embed",
      });
    }
    if (videoInserts.length > 0) {
      await supabase.from("product_videos").insert(videoInserts);
    }

    // Insert default variant
    await supabase.from("variants").insert({
      product_id: newProd.id,
      sku: `${sku}-STD`,
      title: "Standard Edition",
      price: basePrice,
      compare_at_price: compareAtPrice,
      cost,
      stock: 50,
      is_active: true,
    });

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "product",
      entityId: newProd.id,
      changes: { title, sku, basePrice, supplierCode },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/", "page");
    return { success: true, message: `Product "${title}" created successfully!`, productId: newProd.id };
  } catch (err: any) {
    console.error("Create product error:", err);
    return { success: false, error: err.message || "Failed to create product" };
  }
}

// ─── Update Product ─────────────────────────────────────────────────────────

export async function updateProduct(id: string, formData: FormData) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access" };
  }

  const title = formData.get("title") as string;
  const sku = formData.get("sku") as string;
  const basePrice = Number(formData.get("base_price")) || 0;
  const compareAtPrice = Number(formData.get("compare_at_price")) || null;
  const cost = Number(formData.get("cost")) || null;
  const supplierCode = formData.get("supplier_code") as string;
  const status = formData.get("status") as any;
  const isFeatured = formData.get("is_featured") === "true";
  const isFlashDeal = formData.get("is_flash_deal") === "true";

  try {
    const supabase = await createClient();

    const { error: updateErr } = await supabase
      .from("products")
      .update({
        title,
        sku,
        base_price: basePrice,
        compare_at_price: compareAtPrice,
        cost,
        supplier_code: supplierCode,
        status,
        is_featured: isFeatured,
        is_flash_deal: isFlashDeal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "product",
      entityId: id,
      changes: { title, basePrice, status },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/", "page");
    return { success: true, message: `Product "${title}" updated successfully!` };
  } catch (err: any) {
    console.error("Update product error:", err);
    return { success: false, error: err.message || "Failed to update product" };
  }
}

// ─── Delete Product ─────────────────────────────────────────────────────────

export async function deleteProduct(id: string) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return { success: false, error: "Only Super Admins can permanently delete products." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "SETTINGS_CHANGED",
      entityType: "product",
      entityId: id,
      changes: { action: "DELETED" },
    });

    revalidatePath("/admin/products");
    revalidatePath("/", "page");
    return { success: true, message: "Product deleted permanently." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete product" };
  }
}

// ─── Bulk Product Actions ───────────────────────────────────────────────────

export async function bulkUpdateProductStatus(ids: string[], status: string) {
  const session = await getSession();
  if (!session || !["super_admin", "catalogue_manager"].includes(session.role)) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/products");
    revalidatePath("/", "page");
    return { success: true, message: `${ids.length} products updated to ${status} status.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed bulk update" };
  }
}
