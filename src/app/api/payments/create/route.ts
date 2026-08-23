import { NextResponse } from "next/server";
import { createBinancePrepayOrder } from "@/lib/binance";
import { createOrder, CreateOrderParams } from "@/services/orders";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderParams;

    // 1. Create order and get unique merchant trade number
    const orderResult = await createOrder(body);

    if (!orderResult.success || !orderResult.merchantTradeNo) {
      return NextResponse.json(
        { success: false, message: orderResult.message || "Failed to create order" },
        { status: 400 }
      );
    }

    // 2. Request Binance Prepay QR Order
    const binanceResponse = await createBinancePrepayOrder({
      merchantTradeNo: orderResult.merchantTradeNo,
      orderAmount: orderResult.totalAmount || 0,
      currency: "USDT",
      description: `Lennox Sourcing Order ${orderResult.orderNumber}`,
    });

    return NextResponse.json({
      success: true,
      orderNumber: orderResult.orderNumber,
      orderId: orderResult.orderId,
      merchantTradeNo: orderResult.merchantTradeNo,
      totalAmount: orderResult.totalAmount,
      binanceData: binanceResponse.data,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Payment initialization failed";
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 500 }
    );
  }
}
