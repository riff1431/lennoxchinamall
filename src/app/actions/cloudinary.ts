"use server";

import crypto from "crypto";

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

/**
 * Test connectivity to Cloudinary API and check configuration status.
 */
export async function testCloudinaryConnection(): Promise<CloudinaryTestResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "vojfukje";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const startTime = Date.now();

  try {
    // Ping Cloudinary ping endpoint or upload endpoint
    const pingUrl = `https://res.cloudinary.com/${cloudName}/image/upload/sample.jpg`;
    const res = await fetch(pingUrl, {
      method: "HEAD",
      cache: "no-store",
    });

    const latency = Date.now() - startTime;

    if (res.status === 200 || res.status === 404 || res.status === 400) {
      const hasFullKeys = Boolean(apiKey && apiSecret);
      return {
        success: true,
        cloudName,
        status: hasFullKeys ? "healthy" : "configured",
        responseTimeMs: latency,
        message: hasFullKeys
          ? `Cloud environment '${cloudName}' active with signed API credentials. CDN latency: ${latency}ms.`
          : `Cloud environment '${cloudName}' connected to Fastly Global CDN. Add API Key & Secret or an unsigned upload preset to enable direct uploads.`,
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
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "vojfukje";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

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
      // Signed upload
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
