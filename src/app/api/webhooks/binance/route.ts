import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyBinanceWebhookSignature } from "@/lib/binance";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headers = request.headers;

    const timestamp = headers.get("binancepay-timestamp") || "";
    const nonce = headers.get("binancepay-nonce") || "";
    const signature = headers.get("binancepay-signature") || "";
    const secretKey = process.env.BINANCE_API_SECRET;

    // 1. Verify Webhook Signature if production secret exists
    if (secretKey && !secretKey.includes("your-")) {
      const isValid = verifyBinanceWebhookSignature(
        timestamp,
        nonce,
        rawBody,
        signature,
        secretKey
      );

      if (!isValid) {
        return NextResponse.json(
          { returnCode: "FAIL", returnMessage: "Invalid Webhook Signature" },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const eventData =
      typeof payload.data === "string"
        ? JSON.parse(payload.data)
        : payload.data || {};

    const merchantTradeNo = eventData.merchantTradeNo;
    const transId = eventData.transId;
    const totalFee = eventData.totalFee;
    const status = payload.bizStatus;

    if (!merchantTradeNo) {
      return NextResponse.json(
        { returnCode: "FAIL", returnMessage: "Missing merchantTradeNo" },
        { status: 400 }
      );
    }

    // 2. Database update with Idempotency enforcement
    try {
      const supabase = createServiceClient();

      // Find the payment record
      const { data: paymentRecord } = await supabase
        .from("payments")
        .select("id, order_id, status")
        .eq("merchant_trade_no", merchantTradeNo)
        .single();

      if (paymentRecord) {
        // Idempotency: If already paid, do not reprocess
        if (paymentRecord.status === "paid") {
          return NextResponse.json({
            returnCode: "SUCCESS",
            returnMessage: "Already processed",
          });
        }

        if (status === "PAY_SUCCESS") {
          // Update payment
          await supabase
            .from("payments")
            .update({
              status: "paid",
              gateway_txn_id: transId,
              gateway_response: payload,
              paid_at: new Date().toISOString(),
            })
            .eq("id", paymentRecord.id);

          // Update order status to paid
          await supabase
            .from("orders")
            .update({
              status: "paid",
            })
            .eq("id", paymentRecord.order_id);

          // Add status history
          await supabase.from("order_status_history").insert({
            order_id: paymentRecord.order_id,
            from_status: "pending_payment",
            to_status: "paid",
            note: `Payment confirmed via Binance Pay Webhook (Txn: ${transId}). Order entered Sourcing Queue.`,
          });

          // Record payment event
          await supabase.from("payment_events").insert({
            payment_id: paymentRecord.id,
            event_type: "BINANCE_PAY_SUCCESS",
            payload,
            signature_valid: true,
          });
        }
      }
    } catch {
      // Database update caught; return success to prevent gateway storming
    }

    return NextResponse.json({
      returnCode: "SUCCESS",
      returnMessage: null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Webhook processing error";
    return NextResponse.json(
      { returnCode: "FAIL", returnMessage: errorMsg },
      { status: 500 }
    );
  }
}
