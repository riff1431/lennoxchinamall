import { createClient } from "@supabase/supabase-js";
import {
  MOCK_CATEGORIES,
  MOCK_BRANDS,
  MOCK_SUPPLIERS,
  MOCK_PRODUCTS,
  MOCK_COUPONS,
} from "../src/lib/mockData";
import { DEFAULT_HOMEPAGE_SECTIONS } from "../src/types/homepage";
import { DEFAULT_STORE_SETTINGS } from "../src/lib/settings-constants";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kdekxqbdkjdfjyyprhbv.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-")
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_CdurTHAw3sfYD_abMIBjyA_HA_iXUGY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  console.log("🚀 Starting comprehensive Supabase database seed...");

  // 1. Categories
  console.log("📦 Seeding categories...");
  for (const cat of MOCK_CATEGORIES) {
    const { error } = await supabase.from("categories").upsert(
      {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image_url: cat.image_url,
        icon: cat.icon || cat.iconName || "Package",
        position: cat.position || 0,
        is_active: cat.is_active !== false,
        seo_title: cat.seo_title,
        seo_description: cat.seo_description,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );
    if (error) console.error(`Error inserting category ${cat.slug}:`, error.message);
  }

  // 2. Brands
  console.log("🏷️ Seeding brands...");
  for (const b of MOCK_BRANDS) {
    const { error } = await supabase.from("brands").upsert(
      {
        name: b.name,
        slug: b.slug,
        logo_url: b.logo_url,
        description: b.description,
        is_active: b.is_active !== false,
      },
      { onConflict: "slug" }
    );
    if (error) console.error(`Error inserting brand ${b.slug}:`, error.message);
  }

  // 3. Suppliers
  console.log("🏭 Seeding suppliers...");
  for (const s of MOCK_SUPPLIERS) {
    const { error } = await supabase.from("suppliers").upsert(
      {
        code: s.code,
        name: s.name,
        contact: s.contact,
        platform: s.platform,
        source_url: s.source_url,
        region: s.region,
        lead_time_days: s.lead_time_days || 3,
        status: s.status || "active",
        reliability_notes: s.reliability_notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "code" }
    );
    if (error) console.error(`Error inserting supplier ${s.code}:`, error.message);
  }

  // Fetch updated DB maps for category and brand IDs
  const { data: dbCategories } = await supabase.from("categories").select("id, slug");
  const { data: dbBrands } = await supabase.from("brands").select("id, slug");

  const catMap = new Map((dbCategories || []).map((c) => [c.slug, c.id]));
  const brandMap = new Map((dbBrands || []).map((b) => [b.slug, b.id]));

  // 4. Products & Related entities
  console.log("🛍️ Seeding products, variants, media, and videos...");
  for (const p of MOCK_PRODUCTS) {
    const mockCat = MOCK_CATEGORIES.find((c) => c.id === p.category_id);
    const mockBrand = (MOCK_BRANDS as any[]).find((b) => b.id === p.brand_id);

    const categoryId = mockCat ? catMap.get(mockCat.slug) || null : null;
    const brandId = mockBrand ? brandMap.get(mockBrand.slug) || null : null;

    const { data: insertedProduct, error: prodErr } = await supabase
      .from("products")
      .upsert(
        {
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
          shipping_origin: p.shipping_origin || "Shenzhen, China",
          hs_code: p.hs_code,
          supplier_code: p.supplier_code,
          seo_title: p.seo_title,
          seo_description: p.seo_description,
          avg_rating: p.avg_rating || 5.0,
          review_count: p.review_count || 0,
          sold_count: p.sold_count || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (prodErr || !insertedProduct) {
      console.error(`Error inserting product ${p.slug}:`, prodErr?.message);
      continue;
    }

    const productId = insertedProduct.id;

    // Clean existing media/variants/videos for clean re-seed
    await supabase.from("product_media").delete().eq("product_id", productId);
    await supabase.from("product_videos").delete().eq("product_id", productId);
    await supabase.from("variants").delete().eq("product_id", productId);

    // Insert media
    if (p.media && p.media.length > 0) {
      const mediaToInsert = p.media.map((m, idx) => ({
        product_id: productId,
        url: m.url,
        alt: m.alt || p.title,
        type: "image",
        position: idx + 1,
      }));
      const { error: mediaErr } = await supabase.from("product_media").insert(mediaToInsert);
      if (mediaErr) console.error(`Error inserting media for ${p.slug}:`, mediaErr.message);
    }

    // Insert videos
    if (p.videos && p.videos.length > 0) {
      const videosToInsert = p.videos.map((v) => ({
        product_id: productId,
        url: v.url,
        type: v.type || "embed",
        position: v.position,
        title: v.title,
      }));
      const { error: videoErr } = await supabase.from("product_videos").insert(videosToInsert);
      if (videoErr) console.error(`Error inserting videos for ${p.slug}:`, videoErr.message);
    }

    // Insert variants
    if (p.variants && p.variants.length > 0) {
      const variantsToInsert = p.variants.map((v, idx) => ({
        product_id: productId,
        sku: v.sku || `${p.sku}-V${idx + 1}`,
        title: v.title || "Standard Edition",
        price: v.price || p.base_price,
        compare_at_price: v.compare_at_price || p.compare_at_price,
        cost: v.cost || p.cost,
        stock: v.stock || 100,
        low_stock_threshold: v.low_stock_threshold || 10,
        weight: v.weight || p.weight,
        attributes: v.attributes || {},
        image_url: v.image_url || p.media?.[0]?.url || null,
        supplier_code: v.supplier_code || p.supplier_code,
        is_active: v.is_active !== false,
        position: v.position || idx,
      }));
      const { error: varErr } = await supabase.from("variants").insert(variantsToInsert);
      if (varErr) console.error(`Error inserting variants for ${p.slug}:`, varErr.message);
    }
  }

  // 5. Coupons
  console.log("🎟️ Seeding coupons...");
  for (const rawC of MOCK_COUPONS) {
    const c = rawC as any;
    const { error } = await supabase.from("coupons").upsert(
      {
        code: c.code,
        description: c.description,
        type: c.discount_type || c.type || "percentage",
        value: c.discount_value || c.value || c.discount || 10,
        min_order_amount: c.min_order_amount || c.min_spend || 0,
        max_discount_amount: c.max_discount_amount || null,
        usage_limit: c.usage_limit || c.max_uses || null,
        used_count: c.used_count || c.usage_count || 0,
        is_active: c.is_active !== false && c.isActive !== false,
      },
      { onConflict: "code" }
    );
    if (error) console.error(`Error inserting coupon ${c.code}:`, error.message);
  }

  // 6. Homepage Sections
  console.log("🖼️ Seeding dynamic homepage CMS sections...");
  for (const s of DEFAULT_HOMEPAGE_SECTIONS) {
    const { error } = await supabase.from("homepage_sections").upsert(
      {
        id: s.id,
        name: s.name,
        subtitle: s.subtitle,
        type: s.type,
        layout: s.layout,
        position: s.position,
        is_active: s.is_active,
        status: s.status || "published",
        visibility: s.visibility || "all",
        start_date: s.start_date,
        end_date: s.end_date,
        config: s.config || {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) console.error(`Error inserting section ${s.name}:`, error.message);
  }

  // 7. Store Settings
  console.log("⚙️ Seeding store settings...");
  for (const [key, val] of Object.entries(DEFAULT_STORE_SETTINGS)) {
    const { error } = await supabase.from("store_settings").upsert(
      {
        key,
        value: val,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    if (error) console.error(`Error inserting setting ${key}:`, error.message);
  }

  console.log("✅ Comprehensive seed completed successfully!");
}

runSeed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
