import { NextRequest, NextResponse } from "next/server";
import { registerPushSubscription } from "@/app/actions/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const result = await registerPushSubscription({
      endpoint: body.endpoint,
      keys: body.keys,
      userAgent,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
