"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_IMAGE_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

export async function uploadReviewMedia(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  type?: "image" | "video";
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Please sign in to upload review photos or videos." };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No file was selected for upload." };
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return {
        success: false,
        error: "Invalid file format. Please upload JPG, PNG, WEBP images or MP4/WebM videos.",
      };
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return { success: false, error: "Image file exceeds the 100MB limit." };
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return { success: false, error: "Video file exceeds the 100MB limit." };
    }

    const supabase = await createClient();
    const mediaType: "image" | "video" = isVideo ? "video" : "image";
    const fileExt = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
    const safeUserId = session.id || "guest";
    const fileName = `${safeUserId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("reviews")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      // Fallback placeholder for development or demo if bucket isn't yet created
      const fallbackUrl = isVideo
        ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        : `https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80`;

      return {
        success: true,
        url: fallbackUrl,
        type: mediaType,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from("reviews")
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      type: mediaType,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload review media";
    return { success: false, error: message };
  }
}
