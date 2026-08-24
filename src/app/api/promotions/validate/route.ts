import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { evaluatePromotion } from "@/lib/promotions/engine";
import { MOCK_COUPONS } from "@/lib/mockData";
import { Coupon } from "@/types/database";

export async function POST(request: Request) {
  // 1. Rate limiting (max 30 coupon validations per minute per IP to prevent code brute-forcing)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`promo-validate:${clientIp}`, {
    limit: 30,
    windowMs: 60000,
  });

  if (!rateCheck.success) {
    return NextResponse.json(
      { valid: false, message: "Too many coupon validation attempts. Please slow down.", discountAmount: 0 },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { code, items = [], shippingCost = 0 } = body;

    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) {
      return NextResponse.json({
        valid: false,
        message: "Please enter a valid promotion code.",
        discountAmount: 0,
        freeShipping: false,
      });
    }

    const supabase = await createClient();

    // 2. Fetch coupon by code
    let coupon: Coupon | null = null;
    const { data: dbCoupon } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", cleanCode)
      .maybeSingle();

    if (dbCoupon) {
      coupon = dbCoupon as unknown as Coupon;
    } else {
      // Fallback to default catalog promo vouchers
      const fallback = MOCK_COUPONS.find(
        (c) => c.code.toUpperCase() === cleanCode
      );
      if (fallback) {
        coupon = {
          id: fallback.id,
          code: fallback.code,
          title: fallback.description || fallback.code,
          discount_type: fallback.discountType,
          type: fallback.discountType,
          discount_value: fallback.value,
          value: fallback.value,
          min_order_amount: fallback.minSpend,
          min_spend: fallback.minSpend,
          usage_limit: fallback.maxUses,
          used_count: fallback.usageCount,
          description: fallback.description,
          is_active: fallback.isActive,
          status: "active",
          created_at: new Date().toISOString(),
        };
      }
    }

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: `Coupon code "${cleanCode}" was not found.`,
        discountAmount: 0,
        freeShipping: false,
      });
    }

    // 3. User session & order history check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isFirstOrder = true;
    let userRedemptionCount = 0;

    if (user?.id) {
      // Check prior orders
      const { count: orderCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", ["paid", "shipped", "delivered", "completed"]);

      if (orderCount && orderCount > 0) {
        isFirstOrder = false;
      }

      // Check redemptions count for this user
      const { count: redemptionsCount } = await supabase
        .from("coupon_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("coupon_id", coupon.id);

      userRedemptionCount = redemptionsCount || 0;
    }

    // 4. Run discount engine
    const evaluation = evaluatePromotion(coupon, items, {
      userId: user?.id,
      customerEmail: user?.email,
      isFirstOrder,
      userRedemptionCount,
      shippingCost: Number(shippingCost) || 0,
    });

    if (!evaluation.valid) {
      return NextResponse.json({
        valid: false,
        message: evaluation.message,
        discountAmount: 0,
        freeShipping: false,
      });
    }

    return NextResponse.json({
      valid: true,
      message: evaluation.message,
      discountAmount: evaluation.discountAmount,
      freeShipping: evaluation.freeShipping,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title || coupon.code,
        discountType: coupon.discount_type || coupon.type || "percentage",
        discountValue: coupon.discount_value ?? coupon.value,
        description: coupon.description,
        firstOrderOnly: coupon.first_order_only,
        scope: coupon.scope,
      },
    });
  } catch (err: any) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { valid: false, message: "Error validating coupon. Please try again.", discountAmount: 0 },
      { status: 500 }
    );
  }
}
