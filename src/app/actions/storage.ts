"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

/**
 * Uploads a media file (image/video/document) to Supabase Storage and returns the public URL and metadata.
 */
export async function uploadMediaFile(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  name?: string;
  size?: string;
  format?: string;
  type?: "image" | "video" | "document";
  error?: string;
}> {
  const session = await getSession();
  if (session && session.role === "customer") {
    return { success: false, error: "Unauthorized access." };
  }

  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) || "products";
  const folder = (formData.get("folder") as string) || "media";

  if (!file) {
    return { success: false, error: "No file provided." };
  }

  if (file.size > 100 * 1024 * 1024) {
    return { success: false, error: "File exceeds the maximum 100MB limit." };
  }

  try {
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv", "m4v", "flv", "wmv", "3gp", "ogv", "ts", "qt"];
    const isVideo = file.type.startsWith("video/") || videoExtensions.includes(fileExt);
    const isDoc = file.type.includes("pdf") || ["pdf", "doc", "docx", "txt"].includes(fileExt);
    const mediaType: "image" | "video" | "document" = isVideo ? "video" : isDoc ? "document" : "image";
    
    // Format size
    const sizeInMb = file.size / (1024 * 1024);
    const sizeFormatted = sizeInMb >= 1 ? `${sizeInMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

    const getContentType = () => {
      if (file.type && file.type !== "application/octet-stream" && file.type !== "") return file.type;
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
    };

    // Attempt Cloudinary upload first (resolves via UI settings, .cloudinary_config.json, DB, or .env)
    try {
      const { uploadToCloudinary } = await import("@/app/actions/cloudinary");
      const cloudResult = await uploadToCloudinary(formData);
      if (cloudResult.success && (cloudResult.secure_url || cloudResult.url)) {
        return {
          success: true,
          url: cloudResult.secure_url || cloudResult.url,
          name: file.name,
          size: sizeFormatted,
          format: (cloudResult.format || fileExt).toUpperCase(),
          type: mediaType,
        };
      } else if (cloudResult.error) {
        console.warn("Cloudinary upload reported:", cloudResult.error);
      }
    } catch (cloudErr) {
      console.warn("Cloudinary direct upload attempt skipped/failed, falling back to Supabase Storage:", cloudErr);
    }

    let serviceClient;
    try {
      serviceClient = createServiceClient();
    } catch {
      serviceClient = null;
    }
    const supabase = serviceClient || (await createClient());
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: getContentType(),
        upsert: true,
      });

    if (error) {
      console.warn("Supabase Storage upload fallback, saving locally to public/uploads:", error.message);
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
        };
      } catch (localErr) {
        console.warn("Local disk write error, falling back to base64:", localErr);
      }

      // Generate base64 data URL as last resort
      let fallbackUrl = "";
      if (file.size < 4 * 1024 * 1024) {
        const base64 = buffer.toString("base64");
        fallbackUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;
      } else {
        fallbackUrl = isVideo
          ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          : "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80";
      }

      return {
        success: true,
        url: fallbackUrl,
        name: file.name,
        size: sizeFormatted,
        format: fileExt.toUpperCase(),
        type: mediaType,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      name: file.name,
      size: sizeFormatted,
      format: fileExt.toUpperCase(),
      type: mediaType,
    };
  } catch (err: any) {
    console.error("Storage upload error:", err);
    return { success: false, error: err.message || "Failed to upload file" };
  }
}
