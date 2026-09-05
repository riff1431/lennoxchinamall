import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { writeLocalSettingsDomain } from "@/lib/settings-storage";
import { AllStoreSettings } from "@/types/settings";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (session && session.role === "customer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { domain, payload } = body;

    if (!domain || !payload) {
      return NextResponse.json(
        { success: false, error: "Missing domain or payload." },
        { status: 400 }
      );
    }

    // 1. Persist to Supabase Database (authoritative)
    let serviceClient;
    try {
      serviceClient = createServiceClient();
    } catch {
      serviceClient = null;
    }
    const supabase = serviceClient || (await createClient());

    const { error: dbError } = await supabase.from("store_settings").upsert(
      {
        key: domain,
        value: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (dbError) {
      console.error(`Database error saving ${domain}:`, dbError.message);
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 2. Also write to local cache if possible
    try {
      writeLocalSettingsDomain(domain as keyof AllStoreSettings, payload);
    } catch (fsErr) {
      console.warn("Local cache write ignored in serverless:", fsErr);
    }

    // 3. Revalidate paths
    try {
      revalidatePath("/admin/settings");
      revalidatePath("/", "layout");
      revalidatePath("/(store)", "layout");
    } catch {}

    return NextResponse.json({
      success: true,
      message: `${String(domain).replace(/_/g, " ").toUpperCase()} saved and applied live!`,
    });
  } catch (err: any) {
    console.error("API /api/admin/settings error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
