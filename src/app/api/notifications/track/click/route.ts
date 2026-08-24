import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const target = searchParams.get("target") || "/";

  if (token) {
    (async () => {
      try {
        const supabase = createServiceClient();
        await supabase
          .from("notification_logs")
          .update({
            status: "clicked",
            clicked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("tracking_token", token);
      } catch (err) {
        console.warn("Click tracking error:", err);
      }
    })();
  }

  // Redirect user to destination URL
  return NextResponse.redirect(new URL(target, req.url));
}
