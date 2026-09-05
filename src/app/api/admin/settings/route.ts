import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/config";

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

    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();

    // Direct PostgREST upsert to public.store_settings (bypasses SSR cookie edge cases)
    const restUrl = `${supabaseUrl}/rest/v1/store_settings`;
    const dbRes = await fetch(restUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        key: domain,
        value: payload,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!dbRes.ok) {
      const errText = await dbRes.text();
      console.error(`PostgREST settings save failed [${dbRes.status}]:`, errText);
      return NextResponse.json(
        { success: false, error: `Database error (${dbRes.status}): ${errText}` },
        { status: 500 }
      );
    }

    // Revalidate paths cleanly
    try {
      revalidatePath("/admin/settings");
      revalidatePath("/");
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
