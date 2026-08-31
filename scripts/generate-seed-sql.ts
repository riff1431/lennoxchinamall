import {
  MOCK_CATEGORIES,
  MOCK_BRANDS,
  MOCK_SUPPLIERS,
  MOCK_PRODUCTS,
  MOCK_COUPONS,
} from "../src/lib/mockData";
import { DEFAULT_HOMEPAGE_SECTIONS } from "../src/types/homepage";
import { DEFAULT_STORE_SETTINGS } from "../src/lib/settings-constants";
import * as fs from "fs";

function escapeSql(str: any): string {
  if (str === null || str === undefined) return "NULL";
  if (typeof str === "boolean") return str ? "TRUE" : "FALSE";
  if (typeof str === "number") return String(str);
  if (typeof str === "object") {
    return `'${JSON.stringify(str).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeArray(arr: string[]): string {
  if (!arr || arr.length === 0) return "'{}'::text[]";
  const items = arr.map((s) => `"${s.replace(/"/g, '\\"')}"`).join(",");
  return `'{${items}}'::text[]`;
}

let sql = `-- ============================================================================
-- Lennox ChinaMall — Master Database Seed SQL
-- ============================================================================

`;

// 1. Categories
sql += `-- 1. Categories\n`;
for (const c of MOCK_CATEGORIES) {
  sql += `INSERT INTO public.categories (name, slug, description, image_url, icon, position, is_active, seo_title, seo_description)
VALUES (${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description)}, ${escapeSql(c.image_url)}, ${escapeSql(c.icon || c.iconName || "Package")}, ${c.position || 0}, ${c.is_active !== false}, ${escapeSql(c.seo_title)}, ${escapeSql(c.seo_description)})
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;\n`;
}

// 2. Brands
sql += `\n-- 2. Brands\n`;
for (const b of MOCK_BRANDS) {
  sql += `INSERT INTO public.brands (name, slug, logo_url, description, is_active)
VALUES (${escapeSql(b.name)}, ${escapeSql(b.slug)}, ${escapeSql(b.logo_url)}, ${escapeSql(b.description)}, ${b.is_active !== false})
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;\n`;
}

// 3. Suppliers
sql += `\n-- 3. Suppliers\n`;
for (const s of MOCK_SUPPLIERS) {
  sql += `INSERT INTO public.suppliers (code, name, contact, platform, source_url, region, lead_time_days, status, reliability_notes)
VALUES (${escapeSql(s.code)}, ${escapeSql(s.name)}, ${escapeSql(s.contact)}, ${escapeSql(s.platform)}, ${escapeSql(s.source_url)}, ${escapeSql(s.region)}, ${s.lead_time_days || 3}, ${escapeSql(s.status || "active")}, ${escapeSql(s.reliability_notes)})
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  contact = EXCLUDED.contact,
  platform = EXCLUDED.platform,
  source_url = EXCLUDED.source_url,
  region = EXCLUDED.region,
  lead_time_days = EXCLUDED.lead_time_days,
  status = EXCLUDED.status,
  reliability_notes = EXCLUDED.reliability_notes;\n`;
}

// 4. Products & Variants & Media & Videos
sql += `\n-- 4. Products, Variants, Media, and Videos\n`;
for (const p of MOCK_PRODUCTS) {
  const mockCat = MOCK_CATEGORIES.find((c) => c.id === p.category_id);
  const mockBrand = (MOCK_BRANDS as any[]).find((b) => b.id === p.brand_id);
  const catSlug = mockCat?.slug || "drones-fpv";
  const brandSlug = mockBrand?.slug || "eachine";

  sql += `
DO $$
DECLARE
  v_cat_id UUID;
  v_brand_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = ${escapeSql(catSlug)} LIMIT 1;
  SELECT id INTO v_brand_id FROM public.brands WHERE slug = ${escapeSql(brandSlug)} LIMIT 1;

  INSERT INTO public.products (
    title, slug, sku, short_description, description, category_id, brand_id,
    base_price, compare_at_price, cost, status, is_featured, is_best_seller,
    is_new_arrival, is_flash_deal, tags, weight, dimensions, shipping_origin,
    hs_code, supplier_code, seo_title, seo_description, avg_rating, review_count, sold_count
  ) VALUES (
    ${escapeSql(p.title)}, ${escapeSql(p.slug)}, ${escapeSql(p.sku)}, ${escapeSql(p.short_description)},
    ${escapeSql(p.description)}, v_cat_id, v_brand_id, ${p.base_price}, ${escapeSql(p.compare_at_price)},
    ${escapeSql(p.cost)}, ${escapeSql(p.status || "published")}::public.product_status,
    ${p.is_featured || false}, ${p.is_best_seller || false}, ${p.is_new_arrival || false},
    ${p.is_flash_deal || false}, ${escapeArray(p.tags || [])}, ${escapeSql(p.weight)},
    ${escapeSql(p.dimensions)}, ${escapeSql(p.shipping_origin || "Shenzhen, China")},
    ${escapeSql(p.hs_code)}, ${escapeSql(p.supplier_code)}, ${escapeSql(p.seo_title)},
    ${escapeSql(p.seo_description)}, ${p.avg_rating || 5.0}, ${p.review_count || 0}, ${p.sold_count || 0}
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    sku = EXCLUDED.sku,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    category_id = EXCLUDED.category_id,
    brand_id = EXCLUDED.brand_id,
    base_price = EXCLUDED.base_price,
    compare_at_price = EXCLUDED.compare_at_price,
    cost = EXCLUDED.cost,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller,
    is_new_arrival = EXCLUDED.is_new_arrival,
    is_flash_deal = EXCLUDED.is_flash_deal,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    dimensions = EXCLUDED.dimensions,
    shipping_origin = EXCLUDED.shipping_origin,
    hs_code = EXCLUDED.hs_code,
    supplier_code = EXCLUDED.supplier_code,
    avg_rating = EXCLUDED.avg_rating,
    review_count = EXCLUDED.review_count,
    sold_count = EXCLUDED.sold_count
  RETURNING id INTO v_prod_id;

  DELETE FROM public.product_media WHERE product_id = v_prod_id;
  DELETE FROM public.product_videos WHERE product_id = v_prod_id;
  DELETE FROM public.variants WHERE product_id = v_prod_id;
`;

  if (p.media && p.media.length > 0) {
    p.media.forEach((m, idx) => {
      sql += `  INSERT INTO public.product_media (product_id, url, alt, type, position) VALUES (v_prod_id, ${escapeSql(m.url)}, ${escapeSql(m.alt || p.title)}, 'image', ${idx + 1});\n`;
    });
  }

  if (p.videos && p.videos.length > 0) {
    p.videos.forEach((v) => {
      sql += `  INSERT INTO public.product_videos (product_id, url, type, position, title) VALUES (v_prod_id, ${escapeSql(v.url)}, ${escapeSql(v.type || "embed")}, ${v.position}, ${escapeSql(v.title)});\n`;
    });
  }

  if (p.variants && p.variants.length > 0) {
    p.variants.forEach((v, idx) => {
      sql += `  INSERT INTO public.variants (product_id, sku, title, price, compare_at_price, cost, stock, low_stock_threshold, weight, attributes, image_url, supplier_code, is_active, position) VALUES (v_prod_id, ${escapeSql(v.sku || `${p.sku}-V${idx + 1}`)}, ${escapeSql(v.title || "Standard Edition")}, ${v.price || p.base_price}, ${escapeSql(v.compare_at_price || p.compare_at_price)}, ${escapeSql(v.cost || p.cost)}, ${v.stock || 100}, ${v.low_stock_threshold || 10}, ${escapeSql(v.weight || p.weight)}, ${escapeSql(v.attributes || {})}, ${escapeSql(v.image_url || p.media?.[0]?.url || null)}, ${escapeSql(v.supplier_code || p.supplier_code)}, ${v.is_active !== false}, ${v.position || idx});\n`;
    });
  }

  sql += `END $$;\n`;
}

// 5. Coupons
sql += `\n-- 5. Coupons\n`;
for (const rawC of MOCK_COUPONS) {
  const c = rawC as any;
  sql += `INSERT INTO public.coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, used_count, is_active)
VALUES (${escapeSql(c.code)}, ${escapeSql(c.description)}, ${escapeSql(c.discount_type || c.type || "percentage")}::public.coupon_type, ${c.discount_value || c.value || c.discount || 10}, ${c.min_order_amount || c.min_spend || 0}, ${escapeSql(c.max_discount_amount || null)}, ${escapeSql(c.usage_limit || c.max_uses || null)}, ${c.used_count || c.usage_count || 0}, ${c.is_active !== false && c.isActive !== false})
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  min_order_amount = EXCLUDED.min_order_amount,
  max_discount_amount = EXCLUDED.max_discount_amount,
  is_active = EXCLUDED.is_active;\n`;
}

// 6. Homepage Sections
sql += `\n-- 6. Homepage Sections\n`;
for (const s of DEFAULT_HOMEPAGE_SECTIONS) {
  sql += `INSERT INTO public.homepage_sections (id, name, subtitle, type, layout, position, is_active, status, visibility, start_date, end_date, config)
VALUES (${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.subtitle)}, ${escapeSql(s.type)}, ${escapeSql(s.layout)}, ${s.position}, ${s.is_active}, ${escapeSql(s.status || "published")}, ${escapeSql(s.visibility || "all")}, ${escapeSql(s.start_date)}, ${escapeSql(s.end_date)}, ${escapeSql(s.config || {})})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  type = EXCLUDED.type,
  layout = EXCLUDED.layout,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status,
  visibility = EXCLUDED.visibility,
  config = EXCLUDED.config;\n`;
}

// 7. Store Settings
sql += `\n-- 7. Store Settings\n`;
for (const [key, val] of Object.entries(DEFAULT_STORE_SETTINGS)) {
  sql += `INSERT INTO public.store_settings (key, value)
VALUES (${escapeSql(key)}, ${escapeSql(val)})
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;\n`;
}

fs.writeFileSync("supabase/seed_master.sql", sql);
console.log("✅ Generated supabase/seed_master.sql successfully!");
