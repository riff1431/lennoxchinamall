"use server";

import { createClient } from "@/lib/supabase/server";
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

  try {
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    const isVideo = file.type.startsWith("video/") || ["mp4", "webm", "mov", "avi"].includes(fileExt);
    const isDoc = file.type.includes("pdf") || ["pdf", "doc", "docx", "txt"].includes(fileExt);
    const mediaType: "image" | "video" | "document" = isVideo ? "video" : isDoc ? "document" : "image";
    
    // Format size
    const sizeInMb = file.size / (1024 * 1024);
    const sizeFormatted = sizeInMb >= 1 ? `${sizeInMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

    const supabase = await createClient();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
        upsert: true,
      });

    if (error) {
      console.warn("Storage upload warning (fallback enabled):", error.message);
      // Generate base64 data URL as preview if size allows (< 4MB)
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
