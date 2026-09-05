"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export interface SupabaseUploadResult {
  success: boolean;
  url?: string;
  name?: string;
  size?: string;
  format?: string;
  type?: "image" | "video" | "document";
  provider?: "supabase" | "local";
  error?: string;
}

export interface StorageMigrationSummary {
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  details: Array<{
    id: string;
    type: "media" | "product";
    oldUrl: string;
    newUrl?: string;
    status: "success" | "skipped" | "failed";
    error?: string;
  }>;
}

const DEFAULT_BUCKET = "products";

function getMimeType(fileExt: string, isVideo: boolean): string {
  switch (fileExt) {
    case "mov":
    case "qt":
      return "video/quicktime";
    case "mp4":
    case "m4v":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "avi":
      return "video/x-msvideo";
    case "mkv":
      return "video/x-matroska";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "avif":
      return "image/avif";
    case "pdf":
      return "application/pdf";
    case "ico":
      return "image/x-icon";
    default:
      return isVideo ? "video/mp4" : "image/jpeg";
  }
}

/**
 * Uploads a media file (image/video/document) directly to Supabase Storage.
 * Fallback chain: Supabase Storage → Local filesystem.
 */
export async function uploadMediaFile(formData: FormData): Promise<SupabaseUploadResult> {
  const session = await getSession();
  if (session && session.role === "customer") {
    return { success: false, error: "Unauthorized access. Admin privileges required." };
  }

  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) || DEFAULT_BUCKET;
  const folder = (formData.get("folder") as string) || "media";

  if (!file) {
    return { success: false, error: "No file provided for upload." };
  }

  if (file.size > 100 * 1024 * 1024) {
    return { success: false, error: "File exceeds the maximum 100MB limit." };
  }

  const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
  const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv", "m4v", "flv", "wmv", "3gp", "ogv", "ts", "qt"];
  const isVideo = file.type.startsWith("video/") || videoExtensions.includes(fileExt);
  const isDoc = file.type.includes("pdf") || ["pdf", "doc", "docx", "txt"].includes(fileExt);
  const mediaType: "image" | "video" | "document" = isVideo ? "video" : isDoc ? "document" : "image";

  // Format size
  const sizeInMb = file.size / (1024 * 1024);
  const sizeFormatted = sizeInMb >= 1 ? `${sizeInMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

  const contentType = file.type && file.type !== "application/octet-stream" && file.type !== ""
    ? file.type
    : getMimeType(fileExt, isVideo);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 1. Primary: Supabase Storage
  try {
    let serviceClient;
    try {
      serviceClient = createServiceClient();
    } catch {
      serviceClient = null;
    }
    const supabase = serviceClient || (await createClient());
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    let targetBucket = bucket || "products";
    let { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

    // If bucket was not found, retry with default 'products' bucket
    if (error && targetBucket !== "products") {
      console.warn(`Supabase Storage upload to '${targetBucket}' failed: ${error.message}. Retrying with 'products' bucket.`);
      targetBucket = "products";
      const retryResult = await supabase.storage
        .from(targetBucket)
        .upload(fileName, buffer, {
          contentType,
          upsert: true,
        });
      data = retryResult.data;
      error = retryResult.error;
    }

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        return {
          success: true,
          url: publicUrlData.publicUrl,
          name: file.name,
          size: sizeFormatted,
          format: fileExt.toUpperCase(),
          type: mediaType,
          provider: "supabase",
        };
      }
    }

    if (error) {
      console.warn("Supabase Storage upload error:", error.message);
    }
  } catch (supabaseErr) {
    console.warn("Supabase Storage upload failed:", supabaseErr);
  }

  // 2. Fallback: Local filesystem write
  try {
    const fs = await import("fs");
    const path = await import("path");
    const targetDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(targetDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/${folder}/${safeName}`;
    return {
      success: true,
      url: localUrl,
      name: file.name,
      size: sizeFormatted,
      format: fileExt.toUpperCase(),
      type: mediaType,
      provider: "local",
    };
  } catch (localErr) {
    console.warn("Local disk write error:", localErr);
  }

  return {
    success: false,
    error: "Failed to upload media file. Please check Supabase Storage configuration.",
  };
}

/**
 * Downloads a remote URL and uploads it directly to Supabase Storage.
 */
export async function uploadRemoteUrlToSupabase(
  remoteUrl: string,
  options: {
    folder?: string;
    filename?: string;
    bucket?: string;
  } = {}
): Promise<SupabaseUploadResult> {
  const bucket = options.bucket || DEFAULT_BUCKET;
  const folder = options.folder || "media";

  if (!remoteUrl || !remoteUrl.startsWith("http")) {
    return { success: false, error: "Invalid remote URL provided." };
  }

  // If already hosted on Supabase Storage, return directly
  if (remoteUrl.includes("/storage/v1/object/public/")) {
    return {
      success: true,
      url: remoteUrl,
      provider: "supabase",
    };
  }

  try {
    const res = await fetch(remoteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LennoxChinaMall/1.0)",
      },
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      return { success: false, error: `Failed to download remote asset. HTTP status: ${res.status}` };
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "application/octet-stream";

    let fileExt = (remoteUrl.split(".").pop() || "").split("?")[0].toLowerCase();
    if (!fileExt || fileExt.length > 5) {
      if (contentType.includes("png")) fileExt = "png";
      else if (contentType.includes("webp")) fileExt = "webp";
      else if (contentType.includes("mp4")) fileExt = "mp4";
      else if (contentType.includes("quicktime")) fileExt = "mov";
      else fileExt = "jpg";
    }

    const isVideo = contentType.startsWith("video/") || ["mp4", "mov", "webm"].includes(fileExt);
    const isDoc = contentType.includes("pdf") || fileExt === "pdf";
    const mediaType = isVideo ? "video" : isDoc ? "document" : "image";

    const baseName = options.filename
      ? options.filename.replace(/\.[^/.]+$/, "")
      : `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const storagePath = `${folder}/${baseName}.${fileExt}`;

    let serviceClient;
    try {
      serviceClient = createServiceClient();
    } catch {
      serviceClient = null;
    }
    const supabase = serviceClient || (await createClient());

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    const sizeInMb = buffer.length / (1024 * 1024);
    const sizeFormatted = sizeInMb >= 1 ? `${sizeInMb.toFixed(1)} MB` : `${Math.round(buffer.length / 1024)} KB`;

    return {
      success: true,
      url: publicData.publicUrl,
      name: `${baseName}.${fileExt}`,
      size: sizeFormatted,
      format: fileExt.toUpperCase(),
      type: mediaType,
      provider: "supabase",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to migrate remote URL to Supabase." };
  }
}

/**
 * Server action: Migrates all external media records across the platform to Supabase Storage.
 */
export async function migrateAllMediaToSupabase(): Promise<StorageMigrationSummary> {
  const session = await getSession();
  if (session && session.role === "customer") {
    throw new Error("Unauthorized. Admin privileges required.");
  }

  let serviceClient;
  try {
    serviceClient = createServiceClient();
  } catch {
    serviceClient = null;
  }
  const supabase = serviceClient || (await createClient());

  const summary: StorageMigrationSummary = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  // 1. Evaluate 'media' table records
  try {
    const { data: mediaRows } = await supabase
      .from("media")
      .select("id, public_id, secure_url, format, resource_type");

    if (mediaRows && mediaRows.length > 0) {
      for (const row of mediaRows) {
        summary.total++;
        const oldUrl = row.secure_url;

        if (!oldUrl || oldUrl.includes("/storage/v1/object/public/")) {
          summary.skipped++;
          summary.details.push({ id: row.id, type: "media", oldUrl: oldUrl || "", status: "skipped" });
          continue;
        }

        const res = await uploadRemoteUrlToSupabase(oldUrl, {
          folder: "products",
          filename: row.public_id || row.id,
        });

        if (res.success && res.url) {
          summary.migrated++;
          summary.details.push({ id: row.id, type: "media", oldUrl, newUrl: res.url, status: "success" });
          // Update DB row
          await supabase.from("media").update({ secure_url: res.url }).eq("id", row.id);
        } else {
          summary.failed++;
          summary.details.push({ id: row.id, type: "media", oldUrl, status: "failed", error: res.error });
        }
      }
    }
  } catch (err: any) {
    console.warn("Error evaluating media table during migration:", err);
  }

  // 2. Evaluate 'products' og_image_url
  try {
    const { data: products } = await supabase
      .from("products")
      .select("id, slug, og_image_url")
      .not("og_image_url", "is", null);

    if (products && products.length > 0) {
      for (const prod of products) {
        const oldUrl = prod.og_image_url;
        if (!oldUrl) continue;

        summary.total++;
        if (oldUrl.includes("/storage/v1/object/public/")) {
          summary.skipped++;
          summary.details.push({ id: prod.id, type: "product", oldUrl, status: "skipped" });
          continue;
        }

        const res = await uploadRemoteUrlToSupabase(oldUrl, {
          folder: "products/og",
          filename: prod.slug || prod.id,
        });

        if (res.success && res.url) {
          summary.migrated++;
          summary.details.push({ id: prod.id, type: "product", oldUrl, newUrl: res.url, status: "success" });
          await supabase.from("products").update({ og_image_url: res.url }).eq("id", prod.id);
        } else {
          summary.failed++;
          summary.details.push({ id: prod.id, type: "product", oldUrl, status: "failed", error: res.error });
        }
      }
    }
  } catch (err: any) {
    console.warn("Error evaluating products table during migration:", err);
  }

  return summary;
}

/**
 * Health check diagnostics for Supabase Storage
 */
export async function getSupabaseStorageHealth(): Promise<{
  connected: boolean;
  bucket: string;
  publicUrlPrefix: string;
  objectCount: number;
  message: string;
}> {
  try {
    let serviceClient;
    try {
      serviceClient = createServiceClient();
    } catch {
      serviceClient = null;
    }
    const supabase = serviceClient || (await createClient());

    const { data: files, error } = await supabase.storage.from(DEFAULT_BUCKET).list("", { limit: 10 });

    if (error) {
      return {
        connected: false,
        bucket: DEFAULT_BUCKET,
        publicUrlPrefix: "",
        objectCount: 0,
        message: error.message,
      };
    }

    const { data: pubData } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl("sample.jpg");

    return {
      connected: true,
      bucket: DEFAULT_BUCKET,
      publicUrlPrefix: pubData.publicUrl.replace("/sample.jpg", ""),
      objectCount: files?.length || 0,
      message: "Supabase Storage bucket active and healthy.",
    };
  } catch (err: any) {
    return {
      connected: false,
      bucket: DEFAULT_BUCKET,
      publicUrlPrefix: "",
      objectCount: 0,
      message: err.message || "Failed to reach Supabase Storage",
    };
  }
}
