import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// 1x1 transparent GIF buffer
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const channel = searchParams.get("channel") || "email";

  if (token) {
    // Record open asynchronously
    (async () => {
      try {
        const supabase = createServiceClient();
        await supabase
          .from("notification_logs")
          .update({
            status: "opened",
            opened_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("tracking_token", token)
          .is("opened_at", null);
      } catch (err) {
        console.warn("Open tracking update error:", err);
      }
    })();
  }

  return new NextResponse(TRANSPARENT_GIF_BUFFER, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
