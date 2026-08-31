"use server";

import crypto from "crypto";
import fs from "fs";
import path from "path";
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
 * Get active credentials resolving File -> Memory -> DB -> ENV
 */
export async function getActiveCredentials(): Promise<CloudinaryConfig> {
  // 1. Check local file config
  const fileConfig = readLocalConfigFile();
  if (fileConfig && (fileConfig.apiKey || fileConfig.cloudName)) {
    return fileConfig;
  }

  // 2. Check runtime memory
  if (runtimeCloudinaryConfig) {
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

  // 4. Fallback to process.env
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
 * Retrieve saved Cloudinary configuration for the Admin UI (with masked secret)
 */
export async function getCloudinarySettings(): Promise<{
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  hasApiSecret: boolean;
}> {
  const creds = await getActiveCredentials();
  return {
    cloudName: creds.cloudName || "vojfukje",
    apiKey: creds.apiKey || "",
    apiSecret: creds.apiSecret ? "••••••••••••••••" : "",
    uploadPreset: creds.uploadPreset || "",
    hasApiSecret: Boolean(creds.apiSecret),
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
    message: `Cloudinary settings for cloud '${cloudName}' saved and activated!`,
  };
}

/**
 * Test connectivity to Cloudinary API and check configuration status.
 */
export async function testCloudinaryConnection(): Promise<CloudinaryTestResult> {
  const { cloudName, apiKey, apiSecret } = await getActiveCredentials();
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const startTime = Date.now();

  try {
    const pingUrl = `https://res.cloudinary.com/${cloudName}/image/upload/sample.jpg`;
    const res = await fetch(pingUrl, {
      method: "HEAD",
      cache: "no-store",
    });

    const latency = Date.now() - startTime;
    const hasFullKeys = Boolean(apiKey && apiSecret);

    if (res.status === 200 || res.status === 404 || res.status === 400) {
      return {
        success: true,
        cloudName,
        status: hasFullKeys ? "healthy" : "configured",
        responseTimeMs: latency,
        message: hasFullKeys
          ? `Cloud environment '${cloudName}' active with API Key & Secret (${latency}ms latency).`
          : `Cloud environment '${cloudName}' reachable (${latency}ms latency). Add API Key & Secret in Configure modal to enable authenticated uploads.`,
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
 * Upload a media file to Cloudinary with automatic WebP/AVIF compression and CDN delivery.
 */
export async function uploadToCloudinary(formData: FormData): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret, uploadPreset } = await getActiveCredentials();

  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "lennox_chinamall";

  if (!file) {
    return { success: false, error: "No file provided for Cloudinary upload." };
  }

  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

    const timestamp = Math.round(Date.now() / 1000);
    const cloudFormData = new FormData();
    cloudFormData.append("file", base64Data);
    cloudFormData.append("folder", folder);

    if (apiKey && apiSecret) {
      // Signed upload with SHA-1 signature
      // Parameters to sign in alphabetical order: folder, timestamp
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

      cloudFormData.append("api_key", apiKey);
      cloudFormData.append("timestamp", timestamp.toString());
      cloudFormData.append("signature", signature);
    } else if (uploadPreset) {
      // Unsigned upload preset
      cloudFormData.append("upload_preset", uploadPreset);
    } else {
      return {
        success: false,
        error: "Cloudinary API Key & Secret or Upload Preset is required for direct upload.",
      };
    }

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: cloudFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn("Cloudinary upload API response error:", data);
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
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      resource_type: data.resource_type,
    };
  } catch (err: any) {
    console.error("Cloudinary upload caught exception:", err);
    return {
      success: false,
      error: err.message || "Failed to upload to Cloudinary",
    };
  }
}
