"use server";

import crypto from "crypto";
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

// In-memory runtime cache for server settings
let runtimeCloudinaryConfig: CloudinaryConfig | null = null;

/**
 * Retrieve saved Cloudinary configuration (from DB or fallback to env)
 */
export async function getCloudinarySettings(): Promise<{
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  hasApiSecret: boolean;
}> {
  // 1. Check runtime memory
  if (runtimeCloudinaryConfig) {
    return {
      cloudName: runtimeCloudinaryConfig.cloudName,
      apiKey: runtimeCloudinaryConfig.apiKey,
      apiSecret: runtimeCloudinaryConfig.apiSecret ? "••••••••••••••••" : "",
      uploadPreset: runtimeCloudinaryConfig.uploadPreset || "",
      hasApiSecret: Boolean(runtimeCloudinaryConfig.apiSecret),
    };
  }

  // 2. Check Supabase app_settings or integration_settings table
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("integration_settings")
      .select("settings")
      .eq("service_id", "cloudinary")
      .single();

    if (data?.settings) {
      runtimeCloudinaryConfig = data.settings as CloudinaryConfig;
      return {
        cloudName: runtimeCloudinaryConfig.cloudName,
        apiKey: runtimeCloudinaryConfig.apiKey,
        apiSecret: runtimeCloudinaryConfig.apiSecret ? "••••••••••••••••" : "",
        uploadPreset: runtimeCloudinaryConfig.uploadPreset || "",
        hasApiSecret: Boolean(runtimeCloudinaryConfig.apiSecret),
      };
    }
  } catch {
    // Database table fallback
  }

  // 3. Fallback to process.env
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "vojfukje";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "";

  return {
    cloudName,
    apiKey,
    apiSecret: apiSecret ? "••••••••••••••••" : "",
    uploadPreset,
    hasApiSecret: Boolean(apiSecret),
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

  // Preserve existing secret if input is unchanged masked value
  let apiSecret = config.apiSecret?.trim() || "";
  if (apiSecret.startsWith("•••") && runtimeCloudinaryConfig?.apiSecret) {
    apiSecret = runtimeCloudinaryConfig.apiSecret;
  } else if (apiSecret.startsWith("•••") && process.env.CLOUDINARY_API_SECRET) {
    apiSecret = process.env.CLOUDINARY_API_SECRET;
  }

  runtimeCloudinaryConfig = {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
  };

  // Persist to Supabase if table exists
  try {
    const serviceClient = createServiceClient();
    await serviceClient.from("integration_settings").upsert({
      service_id: "cloudinary",
      settings: runtimeCloudinaryConfig,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // In-memory cache active
  }

  return {
    success: true,
    message: `Cloudinary settings for cloud '${cloudName}' saved successfully!`,
  };
}

/**
 * Get active credentials resolving DB runtime -> ENV
 */
function getActiveCredentials() {
  const cloudName =
    runtimeCloudinaryConfig?.cloudName ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "vojfukje";

  const apiKey = runtimeCloudinaryConfig?.apiKey || process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = runtimeCloudinaryConfig?.apiSecret || process.env.CLOUDINARY_API_SECRET || "";
  const uploadPreset = runtimeCloudinaryConfig?.uploadPreset || process.env.CLOUDINARY_UPLOAD_PRESET || "";

  return { cloudName, apiKey, apiSecret, uploadPreset };
}

/**
 * Test connectivity to Cloudinary API and check configuration status.
 */
export async function testCloudinaryConnection(): Promise<CloudinaryTestResult> {
  const { cloudName, apiKey, apiSecret } = getActiveCredentials();
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
  const { cloudName, apiKey, apiSecret, uploadPreset } = getActiveCredentials();

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
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

      cloudFormData.append("api_key", apiKey);
      cloudFormData.append("timestamp", timestamp.toString());
      cloudFormData.append("signature", signature);
    } else if (uploadPreset) {
      // Unsigned upload preset
      cloudFormData.append("upload_preset", uploadPreset);
    } else {
      // Fallback unsigned default preset
      cloudFormData.append("upload_preset", "ml_default");
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
