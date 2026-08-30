"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { MOCK_BRANDS, MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { revalidatePath } from "next/cache";

export async function seedDatabase() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return { success: false, error: "Only Super Admins can seed the database." };
  }

  const supabase = await createClient();
  const results: string[] = [];

  try {
    // 1. Seed brands if empty
    const { data: existingBrands } = await supabase.from("brands").select("id").limit(1);
    if (!existingBrands || existingBrands.length === 0) {
      const brandsToInsert = MOCK_BRANDS.map(b => ({
        name: b.name,
        slug: b.slug,
        logo_url: b.logo_url,
        description: b.description,
        is_active: b.is_active,
      }));
      const { error: brandsErr } = await supabase.from("brands").insert(brandsToInsert);
      if (brandsErr) {
        results.push(`Brands: FAILED - ${brandsErr.message}`);
      } else {
        results.push(`Brands: Seeded ${brandsToInsert.length} brands`);
      }
    } else {
      results.push("Brands: Already have data, skipped");
    }

    // 2. Seed categories if empty
    const { data: existingCats } = await supabase.from("categories").select("id").limit(1);
    if (!existingCats || existingCats.length === 0) {
      const catsToInsert = MOCK_CATEGORIES.map(c => ({
        name: c.name,
        slug: c.slug,
        parent_id: c.parent_id || null,
        description: c.description,
        image_url: c.image_url,
        icon: c.icon || c.iconName || null,
        position: c.position || 0,
        is_active: c.is_active !== false,
        seo_title: c.seo_title || null,
        seo_description: c.seo_description || null,
      }));
      const { error: catsErr } = await supabase.from("categories").insert(catsToInsert);
      if (catsErr) {
        results.push(`Categories: FAILED - ${catsErr.message}`);
      } else {
        results.push(`Categories: Seeded ${catsToInsert.length} categories`);
      }
    } else {
      results.push("Categories: Already have data, skipped");
    }

    // 3. Seed products if empty
    const { data: existingProds } = await supabase.from("products").select("id").limit(1);
    if (!existingProds || existingProds.length === 0) {
      // Get the newly created categories and brands to map IDs
      const { data: dbBrands } = await supabase.from("brands").select("id, slug");
      const { data: dbCats } = await supabase.from("categories").select("id, slug");
      
      const brandMap = new Map((dbBrands || []).map(b => [b.slug, b.id]));
      const catMap = new Map((dbCats || []).map(c => [c.slug, c.id]));

      let seededCount = 0;
      for (const p of MOCK_PRODUCTS) {
        // Find matching category and brand by slug
        const mockCat = MOCK_CATEGORIES.find(c => c.id === p.category_id);
        const mockBrand = p.brand_id ? (MOCK_BRANDS as any[]).find(b => b.id === p.brand_id) : null;
        
        const categoryId = mockCat ? (catMap.get(mockCat.slug) || null) : null;
        const brandId = mockBrand ? (brandMap.get(mockBrand.slug) || null) : null;

        const { data: newProd, error: prodErr } = await supabase
          .from("products")
          .insert({
            title: p.title,
            slug: p.slug,
            sku: p.sku,
            short_description: p.short_description,
            description: p.description,
            category_id: categoryId,
            brand_id: brandId,
            base_price: p.base_price,
            compare_at_price: p.compare_at_price,
            cost: p.cost,
            status: p.status || "published",
            is_featured: p.is_featured || false,
            is_best_seller: p.is_best_seller || false,
            is_new_arrival: p.is_new_arrival || false,
            is_flash_deal: p.is_flash_deal || false,
            tags: p.tags || [],
            weight: p.weight,
            dimensions: p.dimensions,
            shipping_origin: p.shipping_origin,
            hs_code: p.hs_code,
            supplier_code: p.supplier_code,
            seo_title: p.seo_title,
            seo_description: p.seo_description,
          })
          .select("id")
          .single();

        if (!prodErr && newProd) {
          seededCount++;

          // Insert media
          if (p.media && p.media.length > 0) {
            const mediaInserts = p.media.map((m, idx) => ({
              product_id: newProd.id,
              url: m.url,
              alt: m.alt || p.title,
              type: "image",
              position: idx + 1,
            }));
            await supabase.from("product_media").insert(mediaInserts);
          }

          // Insert videos
          if (p.videos && p.videos.length > 0) {
            const videoInserts = p.videos.map(v => ({
              product_id: newProd.id,
              url: v.url,
              type: v.type || "embed",
              position: v.position,
              title: v.title,
            }));
            await supabase.from("product_videos").insert(videoInserts);
          }

          // Insert variants
          if (p.variants && p.variants.length > 0) {
            const variantInserts = p.variants.map(v => ({
              product_id: newProd.id,
              sku: v.sku,
              title: v.title || "Standard",
              price: v.price,
              compare_at_price: v.compare_at_price,
              cost: v.cost,
              stock: v.stock || 50,
              low_stock_threshold: v.low_stock_threshold || 10,
              weight: v.weight,
              attributes: v.attributes || {},
              image_url: v.image_url,
              supplier_code: v.supplier_code,
              is_active: v.is_active !== false,
              position: v.position || 0,
            }));
            await supabase.from("variants").insert(variantInserts);
          }
        }
      }
      results.push(`Products: Seeded ${seededCount} products with media, videos, and variants`);
    } else {
      results.push("Products: Already have data, skipped");
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/brands");
    revalidatePath("/", "page");

    return { success: true, message: "Database seeding complete.", details: results };
  } catch (err: any) {
    console.error("Seed database error:", err);
    return { success: false, error: err?.message || "Seeding failed.", details: results };
  }
}
