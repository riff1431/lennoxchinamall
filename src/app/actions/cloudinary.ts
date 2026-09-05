"use server";

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
}

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  secure_url?: string;
  public_id?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  resource_type?: string;
  duration?: number;
  error?: string;
}

export interface CloudinaryTestResult {
  success: boolean;
  cloudName: string;
  status: "healthy" | "configured" | "degraded" | "pending_keys";
  responseTimeMs: number;
  message: string;
  endpoint: string;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), ".cloudinary_config.json");

// In-memory runtime cache for server settings
let runtimeCloudinaryConfig: CloudinaryConfig | null = null;

function readLocalConfigFile(): CloudinaryConfig | null {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // Ignore read error
  }
  return null;
}

function writeLocalConfigFile(config: CloudinaryConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write local .cloudinary_config.json:", err);
  }
}

/**
 * Parses a CLOUDINARY_URL string (e.g. cloudinary://api_key:api_secret@cloud_name)
 */
function parseCloudinaryUrl(urlStr: string): Partial<CloudinaryConfig> | null {
  try {
    if (!urlStr || !urlStr.startsWith("cloudinary://")) return null;
    const cleanUrl = urlStr.replace("cloudinary://", "");
    const [authPart, cloudName] = cleanUrl.split("@");
    if (!authPart || !cloudName) return null;
    const [apiKey, apiSecret] = authPart.split(":");
    return {
      cloudName: cloudName.trim(),
      apiKey: (apiKey || "").trim(),
      apiSecret: (apiSecret || "").trim(),
    };
  } catch {
    return null;
  }
}

/**
 * Get active credentials resolving File -> Memory -> DB -> ENV
 */
export async function getActiveCredentials(): Promise<CloudinaryConfig> {
  // 1. Check local file config
  const fileConfig = readLocalConfigFile();
  if (fileConfig && (fileConfig.apiKey || fileConfig.cloudName)) {
    return fileConfig;
  }

  // 2. Check runtime memory
  if (runtimeCloudinaryConfig && (runtimeCloudinaryConfig.apiKey || runtimeCloudinaryConfig.cloudName)) {
    return runtimeCloudinaryConfig;
  }

  // 3. Check Supabase DB
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("integration_settings")
      .select("settings")
      .eq("service_id", "cloudinary")
      .single();

    if (data?.settings) {
      runtimeCloudinaryConfig = data.settings as CloudinaryConfig;
      writeLocalConfigFile(runtimeCloudinaryConfig);
      return runtimeCloudinaryConfig;
    }
  } catch {
    // Database table fallback
  }

  // 4. Check CLOUDINARY_URL in process.env
  if (process.env.CLOUDINARY_URL) {
    const parsed = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
    if (parsed && parsed.cloudName) {
      const config: CloudinaryConfig = {
        cloudName: parsed.cloudName,
        apiKey: parsed.apiKey || "",
        apiSecret: parsed.apiSecret || "",
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
      };
      runtimeCloudinaryConfig = config;
      return config;
    }
  }

  // 5. Fallback to discrete process.env variables
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "vojfukje";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "";

  return { cloudName, apiKey, apiSecret, uploadPreset };
}

/**
 * Helper to configure the Cloudinary SDK with current active credentials
 */
async function configureCloudinarySdk(): Promise<CloudinaryConfig> {
  const creds = await getActiveCredentials();
  cloudinary.config({
    cloud_name: creds.cloudName || "vojfukje",
    api_key: creds.apiKey || undefined,
    api_secret: creds.apiSecret || undefined,
    secure: true,
  });
  return creds;
}

/**
 * Retrieve saved Cloudinary configuration for the Admin UI (with masked secret)
 */
export async function getCloudinarySettings(): Promise<{
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  hasApiSecret: boolean;
  isConfigured: boolean;
}> {
  const creds = await getActiveCredentials();
  const hasSecret = Boolean(creds.apiSecret);
  const isConfigured = Boolean((creds.apiKey && creds.apiSecret) || creds.uploadPreset);

  return {
    cloudName: creds.cloudName || "vojfukje",
    apiKey: creds.apiKey || "",
    apiSecret: hasSecret ? "••••••••••••••••" : "",
    uploadPreset: creds.uploadPreset || "",
    hasApiSecret: hasSecret,
    isConfigured,
  };
}

/**
 * Save Cloudinary configuration dynamically from the Admin Integrations UI
 */
export async function saveCloudinarySettings(config: {
  cloudName: string;
  apiKey: string;
  apiSecret?: string;
  uploadPreset?: string;
}): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (session && !["super_admin", "admin"].includes(session.role)) {
    return { success: false, message: "Unauthorized. Admin permissions required." };
  }

  const cloudName = config.cloudName.trim() || "vojfukje";
  const apiKey = config.apiKey.trim();
  const uploadPreset = config.uploadPreset?.trim() || "";

  // Retrieve current active config to preserve existing secret if masked
  const currentCreds = await getActiveCredentials();
  let apiSecret = config.apiSecret?.trim() || "";
  if ((!apiSecret || apiSecret.startsWith("•••")) && currentCreds.apiSecret) {
    apiSecret = currentCreds.apiSecret;
  }

  const newConfig: CloudinaryConfig = {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
  };

  runtimeCloudinaryConfig = newConfig;

  // Persist to local JSON file
  writeLocalConfigFile(newConfig);

  // Apply to process.env runtime
  process.env.CLOUDINARY_CLOUD_NAME = cloudName;
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = cloudName;
  if (apiKey) process.env.CLOUDINARY_API_KEY = apiKey;
  if (apiSecret) process.env.CLOUDINARY_API_SECRET = apiSecret;
  if (uploadPreset) process.env.CLOUDINARY_UPLOAD_PRESET = uploadPreset;

  // Persist to Supabase if table exists
  try {
    const serviceClient = createServiceClient();
    await serviceClient.from("integration_settings").upsert({
      service_id: "cloudinary",
      settings: newConfig,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Ignore DB error
  }

  return {
    success: true,
    message: `Cloudinary settings for cloud '${cloudName}' saved and activated successfully!`,
  };
}

/**
 * Test connectivity to Cloudinary API and check configuration status.
 */
export async function testCloudinaryConnection(): Promise<CloudinaryTestResult> {
  const creds = await getActiveCredentials();
  const { cloudName, apiKey, apiSecret, uploadPreset } = creds;
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const startTime = Date.now();

  try {
    // Check basic cloud reachability
    const pingUrl = `https://res.cloudinary.com/${cloudName}/image/upload/sample.jpg`;
    const res = await fetch(pingUrl, {
      method: "HEAD",
      cache: "no-store",
    });

    const latency = Date.now() - startTime;
    const hasFullKeys = Boolean(apiKey && apiSecret);
    const hasPreset = Boolean(uploadPreset);

    if (hasFullKeys) {
      // Test authenticated signature validity via SDK ping
      try {
        await configureCloudinarySdk();
        const apiTest = await cloudinary.api.ping();
        if (apiTest?.status === "ok") {
          return {
            success: true,
            cloudName,
            status: "healthy",
            responseTimeMs: latency,
            message: `Cloud environment '${cloudName}' is fully verified and connected with API credentials (${latency}ms latency).`,
            endpoint,
          };
        }
      } catch (authErr: any) {
        return {
          success: false,
          cloudName,
          status: "pending_keys",
          responseTimeMs: latency,
          message: `Cloudinary API Authentication failed: ${authErr.message || "Invalid API Key or Secret"}. Please verify credentials.`,
          endpoint,
        };
      }
    }

    if (res.status === 200 || res.status === 404 || res.status === 400) {
      if (hasPreset) {
        return {
          success: true,
          cloudName,
          status: "configured",
          responseTimeMs: latency,
          message: `Cloud environment '${cloudName}' reachable with upload preset '${uploadPreset}' (${latency}ms latency).`,
          endpoint,
        };
      }

      return {
        success: true,
        cloudName,
        status: "pending_keys",
        responseTimeMs: latency,
        message: `Cloud environment '${cloudName}' is reachable (${latency}ms latency). Add your Cloudinary API Key & Secret or an Unsigned Upload Preset to enable uploads.`,
        endpoint,
      };
    } else {
      return {
        success: true,
        cloudName,
        status: "configured",
        responseTimeMs: latency,
        message: `Cloud environment '${cloudName}' endpoint reachable (${res.status}).`,
        endpoint,
      };
    }
  } catch (err: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      cloudName,
      status: "degraded",
      responseTimeMs: latency,
      message: err.message || "Failed to reach Cloudinary endpoint",
      endpoint,
    };
  }
}

/**
 * Upload a media file (Buffer/File/Blob) to Cloudinary with automatic WebP/AVIF compression and CDN delivery.
 * Supports large video files, images, and raw documents without in-memory Base64 overhead.
 */
export async function uploadToCloudinary(formData: FormData): Promise<CloudinaryUploadResult> {
  const creds = await configureCloudinarySdk();
  const { cloudName, apiKey, apiSecret, uploadPreset } = creds;

  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "lennox_chinamall";

  if (!file) {
    return { success: false, error: "No file provided for Cloudinary upload." };
  }

  const fileExt = (file.name?.split(".").pop() || "").toLowerCase();
  const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv", "m4v", "flv", "wmv", "3gp", "ogv", "ts", "qt"];
  const isVideo = file.type?.startsWith("video/") || videoExtensions.includes(fileExt);
  const isDoc = file.type?.includes("pdf") || ["pdf", "doc", "docx", "txt", "xls", "xlsx", "csv"].includes(fileExt);
  const resourceType: "video" | "image" | "raw" | "auto" = isVideo ? "video" : isDoc ? "raw" : "image";

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Signed upload using Cloudinary SDK (High performance stream, handles large QC videos & high-res images)
    if (apiKey && apiSecret) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            // Automatic optimization transformations
            transformation: resourceType === "image" ? [{ quality: "auto", fetch_format: "auto" }] : undefined,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(buffer);
      });

      return {
        success: true,
        url: uploadResult.secure_url || uploadResult.url,
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        format: (uploadResult.format || fileExt).toUpperCase(),
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes || buffer.length,
        resource_type: uploadResult.resource_type,
        duration: uploadResult.duration,
      };
    }

    // 2. Unsigned upload preset via Cloudinary REST API
    if (uploadPreset) {
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType === "raw" ? "raw" : isVideo ? "video" : "image"}/upload`;
      const cloudFormData = new FormData();
      
      // Send binary blob directly instead of base64 to avoid memory bloat
      const blob = new Blob([buffer], { type: file.type || "application/octet-stream" });
      cloudFormData.append("file", blob, file.name);
      cloudFormData.append("upload_preset", uploadPreset);
      if (folder) {
        cloudFormData.append("folder", folder);
      }

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: cloudFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn("Cloudinary unsigned upload failed:", data);
        return {
          success: false,
          error: data?.error?.message || `Cloudinary upload failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        url: data.secure_url || data.url,
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: (data.format || fileExt).toUpperCase(),
        width: data.width,
        height: data.height,
        bytes: data.bytes || buffer.length,
        resource_type: data.resource_type,
        duration: data.duration,
      };
    }

    // 3. Neither keys nor preset configured
    return {
      success: false,
      error: `Cloudinary API Key & Secret or an Unsigned Upload Preset is required to upload to cloud '${cloudName}'. Please configure credentials in Admin Integrations or Media Settings.`,
    };
  } catch (err: any) {
    console.error("Cloudinary upload caught exception:", err);
    return {
      success: false,
      error: err.message || "Failed to upload to Cloudinary",
    };
  }
}

/**
 * Upload an existing remote URL (e.g. Unsplash, legacy CDN, or external video) directly into Cloudinary CDN.
 */
export async function uploadRemoteUrlToCloudinary(
  remoteUrl: string,
  options: {
    folder?: string;
    publicId?: string;
    resourceType?: "auto" | "image" | "video" | "raw";
  } = {}
): Promise<CloudinaryUploadResult> {
  const creds = await configureCloudinarySdk();
  const { cloudName, apiKey, apiSecret, uploadPreset } = creds;
  const folder = options.folder || "lennox_chinamall";

  if (!remoteUrl || !remoteUrl.startsWith("http")) {
    return { success: false, error: "Invalid remote URL provided for Cloudinary upload." };
  }

  // If already hosted on this Cloudinary cloud, return as-is
  if (remoteUrl.includes(`res.cloudinary.com/${cloudName}`)) {
    return {
      success: true,
      url: remoteUrl,
      secure_url: remoteUrl,
      public_id: options.publicId,
    };
  }

  const isVideo =
    /\.(mp4|webm|mov|avi|mkv|m4v)(\?.*)?$/i.test(remoteUrl) ||
    remoteUrl.includes("/storage/hero-ad/");
  const resourceType = options.resourceType || (isVideo ? "video" : "auto");

  try {
    if (apiKey && apiSecret) {
      const result = await cloudinary.uploader.upload(remoteUrl, {
        folder,
        public_id: options.publicId,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      });

      return {
        success: true,
        url: result.secure_url || result.url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: (result.format || (isVideo ? "MP4" : "JPG")).toUpperCase(),
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resource_type: result.resource_type,
        duration: result.duration,
      };
    }

    if (uploadPreset) {
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType === "video" ? "video" : "image"}/upload`;
      const cloudFormData = new FormData();
      cloudFormData.append("file", remoteUrl);
      cloudFormData.append("upload_preset", uploadPreset);
      if (folder) cloudFormData.append("folder", folder);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: cloudFormData,
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || `Cloudinary remote URL migration failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        url: data.secure_url || data.url,
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
        resource_type: data.resource_type,
        duration: data.duration,
      };
    }

    return {
      success: false,
      error: `Cloudinary credentials required to migrate remote URL '${remoteUrl}' into Cloudinary.`,
    };
  } catch (err: any) {
    console.error("Cloudinary remote URL upload exception:", err);
    return {
      success: false,
      error: err.message || "Failed to upload remote URL to Cloudinary",
    };
  }
}
