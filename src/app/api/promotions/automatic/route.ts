import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`promo-auto:${clientIp}`, {
    limit: 60,
    windowMs: 60000,
  });

  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const supabase = await createClient();

    // Fetch active automatic promotions
    const { data: automaticPromos } = await supabase
      .from("coupons")
      .select("*")
      .eq("is_automatic", true)
      .eq("is_active", true);

    // Fetch active flash deals
    const { data: flashDeals } = await supabase
      .from("flash_deals")
      .select("*")
      .eq("is_active", true)
      .gt("end_time", new Date().toISOString())
      .order("end_time", { ascending: true });

    return NextResponse.json({
      automaticPromotions: automaticPromos || [],
      flashDeals: flashDeals || [],
    });
  } catch (err: any) {
    console.error("Fetch automatic promotions error:", err);
    return NextResponse.json(
      { automaticPromotions: [], flashDeals: [] },
      { status: 500 }
    );
  }
}
