/**
 * Standalone Media Migration Script: Cloudinary & External -> Supabase Storage
 * Migrates:
 * 1. All rows in 'media' table pointing to Cloudinary -> Supabase Storage 'products' bucket
 * 2. All rows in 'products' table with external 'og_image_url' -> Supabase Storage 'products/og'
 * 3. Default demo media assets (hero videos, promo banner) -> Supabase Storage
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pdeooqamevjpkcnaokac.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_VrhH_5jPc0_aS1vVda0GLA_Hek5bdF2";
const BUCKET = "products";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface MediaRow {
  id: string;
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
}

interface MigrationResult {
  id: string;
  oldUrl: string;
  newUrl: string;
  status: "success" | "skipped" | "failed";
  error?: string;
}

async function downloadBuffer(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LennoxChinaMall/1.0)",
      },
      signal: AbortSignal.timeout(60000), // 60s timeout for large videos
    });

    if (!res.ok) {
      console.warn(`[Download Error] ${url} responded with HTTP ${res.status}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    return { buffer, contentType };
  } catch (err: any) {
    console.warn(`[Download Failed] ${url}:`, err.message);
    return null;
  }
}

async function uploadToSupabaseStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.warn(`[Upload Error] ${storagePath}:`, error.message);
      return null;
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return publicData.publicUrl;
  } catch (err: any) {
    console.warn(`[Upload Exception] ${storagePath}:`, err.message);
    return null;
  }
}

export async function runMigration() {
  console.log("=================================================");
  console.log("🚀 Lennox ChinaMall: Media Migration to Supabase");
  console.log(`Endpoint: ${SUPABASE_URL}`);
  console.log(`Target Bucket: ${BUCKET}`);
  console.log("=================================================");

  const results: MigrationResult[] = [];
  const sqlStatements: string[] = [];

  // ─── 1. Migrate media table items ───
  console.log("\n📦 [Phase 1/3] Migrating media table records...");
  const { data: mediaRows, error: fetchErr } = await supabase
    .from("media")
    .select("id, public_id, secure_url, format, resource_type");

  if (fetchErr) {
    console.error("Could not fetch media table:", fetchErr);
  } else if (mediaRows && mediaRows.length > 0) {
    console.log(`Found ${mediaRows.length} media records to evaluate.`);

    for (let i = 0; i < mediaRows.length; i++) {
      const row = mediaRows[i] as MediaRow;
      const oldUrl = row.secure_url;

      if (!oldUrl) continue;

      if (oldUrl.includes(`${SUPABASE_URL}/storage/v1/object/public`)) {
        console.log(`[${i + 1}/${mediaRows.length}] Already on Supabase Storage: ${oldUrl}`);
        results.push({ id: row.id, oldUrl, newUrl: oldUrl, status: "skipped" });
        continue;
      }

      console.log(`[${i + 1}/${mediaRows.length}] Downloading: ${oldUrl}`);
      const downloaded = await downloadBuffer(oldUrl);

      if (!downloaded) {
        results.push({ id: row.id, oldUrl, newUrl: oldUrl, status: "failed", error: "Download failed" });
        continue;
      }

      const fileExt = row.format?.toLowerCase() || (oldUrl.split(".").pop() || "png").toLowerCase();
      const baseName = row.public_id ? path.basename(row.public_id) : row.id;
      const storagePath = `products/${baseName}.${fileExt}`;

      console.log(`  -> Uploading to Supabase: ${storagePath} (${(downloaded.buffer.length / 1024).toFixed(1)} KB)...`);
      const newUrl = await uploadToSupabaseStorage(storagePath, downloaded.buffer, downloaded.contentType);

      if (newUrl) {
        console.log(`  ✅ Success: ${newUrl}`);
        results.push({ id: row.id, oldUrl, newUrl, status: "success" });
        sqlStatements.push(`UPDATE public.media SET secure_url = '${newUrl}' WHERE id = '${row.id}';`);
      } else {
        console.log(`  ❌ Failed uploading ${storagePath}`);
        results.push({ id: row.id, oldUrl, newUrl: oldUrl, status: "failed", error: "Supabase upload failed" });
      }
    }
  }

  // ─── 2. Migrate products og_image_url ───
  console.log("\n🛍️ [Phase 2/3] Migrating products table og_image_url...");
  const { data: productRows } = await supabase
    .from("products")
    .select("id, slug, og_image_url")
    .not("og_image_url", "is", null);

  if (productRows && productRows.length > 0) {
    console.log(`Found ${productRows.length} products with og_image_url.`);
    for (let i = 0; i < productRows.length; i++) {
      const prod = productRows[i];
      const oldUrl = prod.og_image_url;

      if (!oldUrl || oldUrl.includes(`${SUPABASE_URL}/storage/v1/object/public`)) {
        continue;
      }

      console.log(`[${i + 1}/${productRows.length}] Downloading OG image for ${prod.slug || prod.id}...`);
      const downloaded = await downloadBuffer(oldUrl);
      if (downloaded) {
        const storagePath = `products/og/${prod.slug || prod.id}.jpg`;
        const newUrl = await uploadToSupabaseStorage(storagePath, downloaded.buffer, "image/jpeg");
        if (newUrl) {
          console.log(`  ✅ Uploaded: ${newUrl}`);
          sqlStatements.push(`UPDATE public.products SET og_image_url = '${newUrl}' WHERE id = '${prod.id}';`);
        }
      }
    }
  }

  // ─── 3. Save Migration Report & SQL ───
  console.log("\n📊 [Phase 3/3] Generating Migration Report...");
  const successfulCount = results.filter((r) => r.status === "success").length;
  console.log(`Total Media Processed: ${results.length}`);
  console.log(`Successfully Migrated: ${successfulCount}`);
  console.log(`SQL Updates Prepared: ${sqlStatements.length}`);

  const reportPath = path.join(process.cwd(), "scripts", "migration-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ results, sqlStatements }, null, 2));

  const sqlPath = path.join(process.cwd(), "scripts", "migration-updates.sql");
  fs.writeFileSync(sqlPath, sqlStatements.join("\n"));

  console.log(`Report written to: ${reportPath}`);
  console.log(`SQL written to: ${sqlPath}`);
  console.log("Migration finished!\n");

  return { results, sqlStatements };
}

// Execute when run directly
if (require.main === module) {
  runMigration().catch((err) => {
    console.error("Migration fatal error:", err);
    process.exit(1);
  });
}
