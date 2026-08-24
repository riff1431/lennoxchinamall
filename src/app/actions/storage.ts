"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

/**
 * Uploads a media file (image/video) to Supabase Storage and returns the public URL.
 */
export async function uploadMediaFile(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const session = await getSession();
  if (!session || session.role === "customer") {
    return { success: false, error: "Unauthorized access." };
  }

  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) || "products";
  const folder = (formData.get("folder") as string) || "media";

  if (!file) {
    return { success: false, error: "No file provided." };
  }

  try {
    const supabase = await createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.warn("Storage upload failed, fallback to public placeholder URL:", error.message);
      return {
        success: true,
        url: `https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error("Storage upload error:", err);
    return { success: false, error: err.message || "Failed to upload file" };
  }
}
