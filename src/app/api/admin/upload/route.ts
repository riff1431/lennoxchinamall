import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const DEFAULT_BUCKET = "products";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pdeooqamevjpkcnaokac.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZW9vcWFtZXZqcGtjbmFva2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzQ0MTIsImV4cCI6MjEwMzc1MDQxMn0.cYikKs8ea3SxeIV1q99p6vO5-AlQD9SRlQk-XKHoDNU";

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

    // Upload directly to Supabase Storage REST API (guaranteed cross-platform reliability)
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const storagePath = `${folder}/${cleanFileName}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${storagePath}`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: buffer,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Supabase Storage REST upload failed [${res.status}]:`, errText);
      return NextResponse.json(
        { success: false, error: `Supabase Storage upload failed (${res.status}): ${errText}` },
        { status: res.status >= 400 && res.status < 500 ? res.status : 500 }
      );
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: file.name,
      size: sizeFormatted,
      format: fileExt.toUpperCase(),
      type: mediaType,
      provider: "supabase",
    });
  } catch (err: any) {
    console.error("API /api/admin/upload error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error during upload." },
      { status: 500 }
    );
  }
}
