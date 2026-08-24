import { NextRequest, NextResponse } from "next/server";
import { dispatchNotification } from "@/lib/notifications/dispatcher";
import { DispatchNotificationParams } from "@/types/notifications";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const internalSecret = process.env.INTERNAL_SERVICE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Validate internal secret if configured
    if (internalSecret && authHeader !== `Bearer ${internalSecret}`) {
      // In dev mode allow if no authorization header is strictly enforced
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body: DispatchNotificationParams = await req.json();

    if (!body.title || !body.body || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields: title, body, category" },
        { status: 400 }
      );
    }

    const result = await dispatchNotification(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("api/notifications/send error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
