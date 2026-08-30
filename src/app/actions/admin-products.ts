"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { Product, Variant, ProductMedia, ProductVideo, Category, Brand } from "@/types/database";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, registerCachedProduct } from "@/lib/mockData";
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
  const isAdmin = session ? ["super_admin", "catalogue_manager"].includes(session.role) : false;
  if (!isAdmin) {
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

// ─── Fetch Single Product By ID ─────────────────────────────────────────────

export async function getAdminProductById(id: string) {
  const session = await getSession();
  const isAdmin = session ? ["super_admin", "catalogue_manager"].includes(session.role) : false;
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access", product: null, categories: [], brands: [] };
  }

  try {
    const supabase = await createClient();

    const { data: productData, error } = await supabase
      .from("products")
      .select("*, category:categories(*), brand:brands(*), variants(*), media:product_media(*), videos:product_videos(*)")
      .eq("id", id)
      .single();

    const { data: categoriesData } = await supabase.from("categories").select("*").order("position");
    const { data: brandsData } = await supabase.from("brands").select("*").order("name");

    const categories = categoriesData && categoriesData.length > 0 ? categoriesData : MOCK_CATEGORIES;
    const brands = brandsData && brandsData.length > 0 ? brandsData : MOCK_BRANDS;

    if (error || !productData) {
      // Fallback search in mock data
      const mockProd = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
      if (mockProd) {
        return { success: true, product: mockProd, categories, brands };
      }
      return { success: false, error: "Product not found", product: null, categories, brands };
    }

    return { success: true, product: productData as Product, categories, brands };
  } catch (err) {
    console.error("Fetch single product error:", err);
    const mockProd = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
    return {
      success: true,
      product: mockProd || null,
      categories: MOCK_CATEGORIES,
      brands: MOCK_BRANDS,
    };
  }
}

// ─── Create Product ─────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  const session = await getSession();
  const isAdmin = session ? ["super_admin", "catalogue_manager"].includes(session.role) : false;
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access" };
  }

  const title = (formData.get("title") as string) || "Untitled Product";
  const slug = (formData.get("slug") as string) || slugify(title);
  const sku = (formData.get("sku") as string) || `LCM-${Math.floor(1000 + Math.random() * 9000)}`;
  const categoryId = (formData.get("category_id") as string) || null;
  const brandId = (formData.get("brand_id") as string) || null;
  const shortDescription = (formData.get("short_description") as string) || null;
  const description = (formData.get("description") as string) || null;
  const basePrice = Number(formData.get("base_price")) || 0;
  const compareAtPrice = Number(formData.get("compare_at_price")) || null;
  const cost = Number(formData.get("cost")) || null; // Private
  const supplierCode = (formData.get("supplier_code") as string) || null;
  const shippingOrigin = (formData.get("shipping_origin") as string) || "Shenzhen, China";
  const isFeatured = formData.get("is_featured") === "true";
  const isFlashDeal = formData.get("is_flash_deal") === "true";
  const isBestSeller = formData.get("is_best_seller") === "true";
  const isNewArrival = formData.get("is_new_arrival") === "true";
  const status = (formData.get("status") as any) || "published";
  const seoTitle = (formData.get("seo_title") as string) || null;
  const seoDescription = (formData.get("seo_description") as string) || null;
  const weight = Number(formData.get("weight")) || null; // Gross weight
  const netWeight = Number(formData.get("net_weight")) || null;
  const stock = Number(formData.get("stock")) || 50;

  // Parcel Dimensions & Physical Sizing
  const length = Number(formData.get("length")) || 0;
  const width = Number(formData.get("width")) || 0;
  const height = Number(formData.get("height")) || 0;
  const dimensionUnit = (formData.get("dimension_unit") as "cm" | "inch") || "cm";
  const cbm = length > 0 && width > 0 && height > 0 ? Number(((length * width * height) / 1000000).toFixed(6)) : 0;
  const volumetricWeight = length > 0 && width > 0 && height > 0 ? Number(((length * width * height) / 5000).toFixed(2)) : 0;
  const dimensions = length > 0 || width > 0 || height > 0 ? {
    length,
    width,
    height,
    unit: dimensionUnit,
    volumetric_weight: volumetricWeight,
    cbm,
  } : null;

  // Customs & Logistics
  const hsCode = (formData.get("hs_code") as string) || null;
  const cargoType = (formData.get("cargo_type") as string) || "general";
  const packageType = (formData.get("package_type") as string) || "corrugated_box";
  const customsDeclaredValue = Number(formData.get("customs_declared_value")) || null;
  const customsDeclarationName = (formData.get("customs_declaration_name") as string) || null;
  const leadTime = (formData.get("lead_time") as string) || "Same Day Dispatch (24h)";
  const domesticShippingCost = Number(formData.get("domestic_shipping_cost")) || null;
  const supplierContact = (formData.get("supplier_contact") as string) || null;
  const moq = Number(formData.get("moq")) || 1;
  const purchaseUrl = (formData.get("purchase_url") as string) || null;

  // Dual Videos
  const video1Url = formData.get("video1_url") as string;
  const video1Title = (formData.get("video1_title") as string) || "Slot 1: Quality Inspection";
  const video2Url = formData.get("video2_url") as string;
  const video2Title = (formData.get("video2_title") as string) || "Slot 2: Live Flight Demo";

  // Media
  const imageUrls = formData.getAll("images") as string[];

  // Tags
  const tagsStr = (formData.get("tags") as string) || "";
  const tags = tagsStr
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const generatedId = `prod-${Date.now()}`;

  const createdProduct: Product = {
    id: generatedId,
    title,
    slug,
    sku,
    category_id: categoryId || "cat-1",
    brand_id: brandId || "brand-1",
    short_description: shortDescription,
    description,
    base_price: basePrice,
    compare_at_price: compareAtPrice,
    cost,
    supplier_code: supplierCode,
    shipping_origin: shippingOrigin,
    is_featured: isFeatured,
    is_flash_deal: isFlashDeal,
    is_best_seller: isBestSeller,
    is_new_arrival: isNewArrival,
    flash_deal_ends_at: null,
    status,
    seo_title: seoTitle,
    seo_description: seoDescription,
    weight,
    net_weight: netWeight,
    dimensions,
    hs_code: hsCode,
    cargo_type: cargoType,
    package_type: packageType,
    customs_declared_value: customsDeclaredValue,
    customs_declaration_name: customsDeclarationName,
    lead_time: leadTime,
    domestic_shipping_cost: domesticShippingCost,
    supplier_contact: supplierContact,
    moq,
    purchase_url: purchaseUrl,
    avg_rating: 5.0,
    review_count: 0,
    sold_count: 0,
    tags,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    media: (imageUrls && imageUrls.length > 0
      ? imageUrls.filter(Boolean).map((url, i) => ({
          id: `m-${Date.now()}-${i}`,
          product_id: generatedId,
          url,
          alt: title,
          type: "image" as const,
          position: i + 1,
          created_at: new Date().toISOString(),
        }))
      : [
          {
            id: `m-${Date.now()}-0`,
            product_id: generatedId,
            url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
            alt: title,
            type: "image" as const,
            position: 1,
            created_at: new Date().toISOString(),
          },
        ]),
    videos: [
      ...(video1Url
        ? [
            {
              id: `v-${Date.now()}-1`,
              product_id: generatedId,
              url: video1Url,
              title: video1Title,
              type: "embed" as const,
              position: 1,
              created_at: new Date().toISOString(),
            },
          ]
        : []),
      ...(video2Url
        ? [
            {
              id: `v-${Date.now()}-2`,
              product_id: generatedId,
              url: video2Url,
              title: video2Title,
              type: "embed" as const,
              position: 2,
              created_at: new Date().toISOString(),
            },
          ]
        : []),
    ],
    variants: [
      {
        id: `v-${Date.now()}`,
        product_id: generatedId,
        sku: `${sku}-STD`,
        title: "Standard Edition",
        price: basePrice,
        compare_at_price: compareAtPrice,
        cost,
        stock: stock,
        low_stock_threshold: 10,
        weight: weight || 0.5,
        attributes: {},
        image_url: imageUrls[0] || null,
        supplier_code: supplierCode,
        is_active: true,
        position: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  try {
    const supabase = await createClient();

    const { data: newProd, error: prodErr } = await supabase
      .from("products")
      .insert({
        title,
        slug,
        sku,
        category_id: categoryId,
        brand_id: brandId,
        short_description: shortDescription,
        description,
        base_price: basePrice,
        compare_at_price: compareAtPrice,
        cost,
        supplier_code: supplierCode,
        shipping_origin: shippingOrigin,
        is_featured: isFeatured,
        is_flash_deal: isFlashDeal,
        is_best_seller: isBestSeller,
        is_new_arrival: isNewArrival,
        status,
        seo_title: seoTitle,
        seo_description: seoDescription,
        weight,
        dimensions,
        hs_code: hsCode,
        tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!prodErr && newProd) {
      createdProduct.id = newProd.id;

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

      const videoInserts = [];
      if (video1Url) {
        videoInserts.push({
          product_id: newProd.id,
          url: video1Url,
          position: 1,
          title: video1Title,
          type: "embed",
        });
      }
      if (video2Url) {
        videoInserts.push({
          product_id: newProd.id,
          url: video2Url,
          position: 2,
          title: video2Title,
          type: "embed",
        });
      }
      if (videoInserts.length > 0) {
        await supabase.from("product_videos").insert(videoInserts);
      }

      await supabase.from("variants").insert({
        product_id: newProd.id,
        sku: `${sku}-STD`,
        title: "Standard Edition",
        price: basePrice,
        compare_at_price: compareAtPrice,
        cost,
        stock: stock,
        is_active: true,
      });

      if (session) {
        await logAuditEvent({
          adminId: session.id,
          adminEmail: session.email,
          action: "PRODUCT_CREATED",
          entityType: "product",
          entityId: newProd.id,
          changes: { title, sku, basePrice, supplierCode },
        });
      }
    }

    registerCachedProduct(createdProduct);

    revalidatePath("/admin/products");
    revalidatePath("/products/[slug]", "page");
    revalidatePath(`/products/${createdProduct.slug}`, "page");
    revalidatePath("/", "page");

    return {
      success: true,
      message: `Product "${title}" created successfully!`,
      productId: createdProduct.id,
      product: createdProduct,
    };
  } catch (err: any) {
    console.error("Create product error:", err);
    return {
      success: false,
      error: err?.message || "Failed to create product. Please try again.",
    };
  }
}

// ─── Update Product ─────────────────────────────────────────────────────────

export async function updateProduct(id: string, formData: FormData) {
  const session = await getSession();
  const isAdmin = session ? ["super_admin", "catalogue_manager"].includes(session.role) : false;
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access" };
  }

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || slugify(title);
  const sku = formData.get("sku") as string;
  const categoryId = (formData.get("category_id") as string) || null;
  const brandId = (formData.get("brand_id") as string) || null;
  const shortDescription = (formData.get("short_description") as string) || null;
  const description = (formData.get("description") as string) || null;
  const basePrice = Number(formData.get("base_price")) || 0;
  const compareAtPrice = Number(formData.get("compare_at_price")) || null;
  const cost = Number(formData.get("cost")) || null;
  const supplierCode = (formData.get("supplier_code") as string) || null;
  const shippingOrigin = (formData.get("shipping_origin") as string) || "Shenzhen, China";
  const status = (formData.get("status") as any) || "published";
  const isFeatured = formData.get("is_featured") === "true";
  const isFlashDeal = formData.get("is_flash_deal") === "true";
  const isBestSeller = formData.get("is_best_seller") === "true";
  const isNewArrival = formData.get("is_new_arrival") === "true";
  const seoTitle = (formData.get("seo_title") as string) || null;
  const seoDescription = (formData.get("seo_description") as string) || null;
  const weight = Number(formData.get("weight")) || null;
  const netWeight = Number(formData.get("net_weight")) || null;

  // Parcel Dimensions & Physical Sizing
  const length = Number(formData.get("length")) || 0;
  const width = Number(formData.get("width")) || 0;
  const height = Number(formData.get("height")) || 0;
  const dimensionUnit = (formData.get("dimension_unit") as "cm" | "inch") || "cm";
  const cbm = length > 0 && width > 0 && height > 0 ? Number(((length * width * height) / 1000000).toFixed(6)) : 0;
  const volumetricWeight = length > 0 && width > 0 && height > 0 ? Number(((length * width * height) / 5000).toFixed(2)) : 0;
  const dimensions = length > 0 || width > 0 || height > 0 ? {
    length,
    width,
    height,
    unit: dimensionUnit,
    volumetric_weight: volumetricWeight,
    cbm,
  } : null;

  // Customs & Logistics
  const hsCode = (formData.get("hs_code") as string) || null;
  const cargoType = (formData.get("cargo_type") as string) || "general";
  const packageType = (formData.get("package_type") as string) || "corrugated_box";
  const customsDeclaredValue = Number(formData.get("customs_declared_value")) || null;
  const customsDeclarationName = (formData.get("customs_declaration_name") as string) || null;
  const leadTime = (formData.get("lead_time") as string) || "Same Day Dispatch (24h)";
  const domesticShippingCost = Number(formData.get("domestic_shipping_cost")) || null;
  const supplierContact = (formData.get("supplier_contact") as string) || null;
  const moq = Number(formData.get("moq")) || 1;
  const purchaseUrl = (formData.get("purchase_url") as string) || null;

  // Dual Videos
  const video1Url = formData.get("video1_url") as string;
  const video1Title = (formData.get("video1_title") as string) || "Slot 1: Quality Inspection";
  const video2Url = formData.get("video2_url") as string;
  const video2Title = (formData.get("video2_title") as string) || "Slot 2: Live Flight Demo";

  // Media
  const imageUrls = formData.getAll("images") as string[];

  // Tags
  const tagsStr = (formData.get("tags") as string) || "";
  const tags = tagsStr
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  try {
    const supabase = await createClient();

    const { error: updateErr } = await supabase
      .from("products")
      .update({
        title,
        slug,
        sku,
        category_id: categoryId,
        brand_id: brandId,
        short_description: shortDescription,
        description,
        base_price: basePrice,
        compare_at_price: compareAtPrice,
        cost,
        supplier_code: supplierCode,
        shipping_origin: shippingOrigin,
        status,
        is_featured: isFeatured,
        is_flash_deal: isFlashDeal,
        is_best_seller: isBestSeller,
        is_new_arrival: isNewArrival,
        seo_title: seoTitle,
        seo_description: seoDescription,
        weight,
        dimensions,
        hs_code: hsCode,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      console.warn("Supabase update product error:", updateErr);
    }

    // Refresh media if provided
    if (imageUrls && imageUrls.length > 0) {
      await supabase.from("product_media").delete().eq("product_id", id);
      const mediaInserts = imageUrls.filter(Boolean).map((url, idx) => ({
        product_id: id,
        url,
        position: idx + 1,
      }));
      if (mediaInserts.length > 0) {
        await supabase.from("product_media").insert(mediaInserts);
      }
    }

    // Refresh dual videos if provided
    if (video1Url || video2Url) {
      await supabase.from("product_videos").delete().eq("product_id", id);
      const videoInserts = [];
      if (video1Url) {
        videoInserts.push({
          product_id: id,
          url: video1Url,
          position: 1,
          title: video1Title,
          type: "embed",
        });
      }
      if (video2Url) {
        videoInserts.push({
          product_id: id,
          url: video2Url,
          position: 2,
          title: video2Title,
          type: "embed",
        });
      }
      if (videoInserts.length > 0) {
        await supabase.from("product_videos").insert(videoInserts);
      }
    }

    if (session) {
      await logAuditEvent({
        adminId: session.id,
        adminEmail: session.email,
        action: "PRODUCT_UPDATED",
        entityType: "product",
        entityId: id,
        changes: { title, basePrice, status },
      });
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/", "page");
    return { success: true, message: `Product "${title}" updated successfully!` };
  } catch (err: any) {
    console.error("Update product error:", err);
    return { success: false, error: err?.message || "Failed to update product. Please try again." };
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
      console.warn("Supabase delete product error:", error);
    }

    await logAuditEvent({
      adminId: session.id,
      adminEmail: session.email,
      action: "PRODUCT_DELETED",
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

export async function bulkDeleteProducts(ids: string[]) {
  const session = await getSession();
  const isAdmin = session ? ["super_admin", "catalogue_manager"].includes(session.role) : false;
  if (!isAdmin) {
    return { success: false, error: "Unauthorized to delete products." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().in("id", ids);

    if (error) {
      console.warn("Supabase bulk delete error:", error);
    }

    if (session) {
      await logAuditEvent({
        adminId: session.id,
        adminEmail: session.email,
        action: "PRODUCTS_BULK_DELETED",
        entityType: "product",
        entityId: ids.slice(0, 5).join(",") + (ids.length > 5 ? ` (+${ids.length - 5} more)` : ""),
        changes: { action: "BULK_DELETED", count: ids.length },
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/", "page");
    return { success: true, message: `Successfully deleted ${ids.length} products.` };
  } catch (err: any) {
    console.error("Bulk delete error:", err);
    return { success: false, error: err?.message || "Failed to delete products." };
  }
}

export async function bulkUpdateProductStatus(ids: string[], status: string) {
  const session = await getSession();
  const isAdmin = session ? ["super_admin", "catalogue_manager"].includes(session.role) : false;
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      console.warn("Supabase bulk update error:", error);
    }

    if (session) {
      await logAuditEvent({
        adminId: session.id,
        adminEmail: session.email,
        action: "PRODUCTS_STATUS_CHANGED",
        entityType: "product",
        entityId: ids.slice(0, 5).join(","),
        changes: { action: "BULK_STATUS_CHANGE", status, count: ids.length },
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/", "page");
    return { success: true, message: `${ids.length} products updated to ${status} status.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed bulk update" };
  }
}


