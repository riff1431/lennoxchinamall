import { NextResponse } from "next/server";
import { z } from "zod";
import { createBinancePrepayOrder } from "@/lib/binance";
import { createOrder, CreateOrderParams } from "@/services/orders";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  streetLine1: z.string().min(3, "Street address is required"),
  streetLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  // 1. Rate limiting (max 30 orders/min per IP)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`order:create:${clientIp}`, {
    limit: 30,
    windowMs: 60000,
  });

  if (!rateCheck.success) {
    return NextResponse.json(
      { success: false, message: "Too many order requests. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const rawBody = await request.json();

    // 2. Validate checkout shipping address structure
    const addressValidation = shippingAddressSchema.safeParse(rawBody.shippingAddress);
    if (!addressValidation.success) {
      const errorMsg = addressValidation.error.issues[0]?.message || "Invalid shipping address";
      return NextResponse.json(
        { success: false, message: errorMsg },
        { status: 400 }
      );
    }

    const body: CreateOrderParams = {
      items: Array.isArray(rawBody.items) ? rawBody.items : [],
      shippingAddress: addressValidation.data,
      shippingMethod: rawBody.shippingMethod === "express" ? "express" : "standard",
      couponCode: typeof rawBody.couponCode === "string" ? rawBody.couponCode.trim().toUpperCase() : undefined,
      notes: typeof rawBody.notes === "string" ? rawBody.notes.slice(0, 500) : undefined,
    };

    if (body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // 3. Create order and get unique merchant trade number
    const orderResult = await createOrder(body);

    if (!orderResult.success || !orderResult.merchantTradeNo) {
      return NextResponse.json(
        { success: false, message: orderResult.message || "Failed to create order" },
        { status: 400 }
      );
    }

    // 4. Initiate Binance Pay Prepay Order
    const binanceResult = await createBinancePrepayOrder({
      merchantTradeNo: orderResult.merchantTradeNo,
      orderAmount: orderResult.totalAmount || 0,
      currency: "USDT",
      description: `Lennox ChinaMall Order #${orderResult.orderNumber}`,
      goodsDetails: [
        {
          goodsType: "01",
          goodsCategory: "Z000",
          referenceGoodsId: orderResult.orderNumber || orderResult.merchantTradeNo,
          goodsName: `Lennox Order #${orderResult.orderNumber}`,
          goodsDetail: `Direct China wholesale hardware order. Order Number: ${orderResult.orderNumber}`,
        },
      ],
    });

    if (binanceResult.status !== "SUCCESS" || !binanceResult.data) {
      return NextResponse.json(
        {
          success: false,
          message: binanceResult.errorMessage || "Failed to generate Binance Pay payment session",
          orderNumber: orderResult.orderNumber,
        },
        { status: 502 }
      );
    }

    // 5. Return success payload with QR code, deep links, and prepay ID
    return NextResponse.json({
      success: true,
      orderNumber: orderResult.orderNumber,
      merchantTradeNo: orderResult.merchantTradeNo,
      totalAmount: orderResult.totalAmount,
      prepayId: binanceResult.data.prepayId,
      qrcodeLink: binanceResult.data.qrcodeLink,
      qrContent: binanceResult.data.qrContent,
      checkoutUrl: binanceResult.data.checkoutUrl,
      universalUrl: binanceResult.data.universalUrl,
      expireTime: binanceResult.data.expireTime,
    });
  } catch (error) {
    console.error("Order creation and payment generation failed:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while creating order" },
      { status: 500 }
    );
  }
}
