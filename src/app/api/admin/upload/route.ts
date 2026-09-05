import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (session && session.role === "customer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Admin privileges required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || DEFAULT_BUCKET;
    const folder = (formData.get("folder") as string) || "branding";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided for upload." },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File exceeds the maximum 100MB limit." },
        { status: 413 }
      );
    }

    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv", "m4v", "flv", "wmv", "3gp", "ogv", "ts", "qt"];
    const isVideo = file.type.startsWith("video/") || videoExtensions.includes(fileExt);
    const isDoc = file.type.includes("pdf") || ["pdf", "doc", "docx", "txt"].includes(fileExt);
    const mediaType: "image" | "video" | "document" = isVideo ? "video" : isDoc ? "document" : "image";

    // Format size
    const sizeInMb = file.size / (1024 * 1024);
    const sizeFormatted = sizeInMb >= 1 ? `${sizeInMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

    const contentType =
      file.type && file.type !== "application/octet-stream" && file.type !== ""
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

      const { data, error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            name: file.name,
            size: sizeFormatted,
            format: fileExt.toUpperCase(),
            type: mediaType,
            provider: "supabase",
          });
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
      return NextResponse.json({
        success: true,
        url: localUrl,
        name: file.name,
        size: sizeFormatted,
        format: fileExt.toUpperCase(),
        type: mediaType,
        provider: "local",
      });
    } catch (localErr) {
      console.warn("Local disk write error:", localErr);
    }

    return NextResponse.json(
      { success: false, error: "Failed to upload media file. Please check Supabase Storage configuration." },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("API /api/admin/upload error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error during upload." },
      { status: 500 }
    );
  }
}
