import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyBinanceWebhookSignature } from "@/lib/binance";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  // 1. Rate Limiting (max 120 requests/min per IP)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`webhook:binance:${clientIp}`, {
    limit: 120,
    windowMs: 60000,
  });

  if (!rateCheck.success) {
    return NextResponse.json(
      { returnCode: "FAIL", returnMessage: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  try {
    const rawBody = await request.text();
    const headers = request.headers;

    const timestamp = headers.get("binancepay-timestamp") || "";
    const nonce = headers.get("binancepay-nonce") || "";
    const signature = headers.get("binancepay-signature") || "";
    const secretKey = process.env.BINANCE_API_SECRET;
    const isProduction = process.env.NODE_ENV === "production";

    // 2. Strict Signature & Replay Verification
    const hasLiveSecret = secretKey && !secretKey.includes("your-");

    if (isProduction && !hasLiveSecret) {
      console.error("[Security] BINANCE_API_SECRET not configured in production");
      return NextResponse.json(
        { returnCode: "FAIL", returnMessage: "Payment gateway configuration error" },
        { status: 500 }
      );
    }

    if (hasLiveSecret) {
      const isValid = verifyBinanceWebhookSignature(
        timestamp,
        nonce,
        rawBody,
        signature,
        secretKey
      );

      if (!isValid) {
        return NextResponse.json(
          { returnCode: "FAIL", returnMessage: "Invalid Webhook Signature or Stale Timestamp" },
          { status: 400 }
        );
      }
    }

    // 3. Parse and Validate Payload
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { returnCode: "FAIL", returnMessage: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const eventData =
      typeof payload.data === "string"
        ? JSON.parse(payload.data)
        : payload.data || {};

    const merchantTradeNo = eventData.merchantTradeNo;
    const transId = eventData.transId;
    const paidTotalFee = Number(eventData.totalFee);
    const paidCurrency = (eventData.currency || "USDT").toUpperCase();
    const status = payload.bizStatus;

    if (!merchantTradeNo) {
      return NextResponse.json(
        { returnCode: "FAIL", returnMessage: "Missing merchantTradeNo" },
        { status: 400 }
      );
    }

    // 4. Database update with Idempotency & Amount Verification
    try {
      const supabase = createServiceClient();

      // Find the payment record with amount and currency
      const { data: paymentRecord, error: fetchError } = await supabase
        .from("payments")
        .select("id, order_id, status, amount, currency")
        .eq("merchant_trade_no", merchantTradeNo)
        .single();

      if (fetchError || !paymentRecord) {
        console.warn(`[Webhook] Payment record not found for trade: ${merchantTradeNo}`);
        return NextResponse.json({
          returnCode: "SUCCESS",
          returnMessage: "Record not found",
        });
      }

      // Idempotency: If already paid, do not reprocess
      if (paymentRecord.status === "paid") {
        return NextResponse.json({
          returnCode: "SUCCESS",
          returnMessage: "Already processed",
        });
      }

      if (status === "PAY_SUCCESS") {
        // Strict Amount & Currency Integrity Verification
        const expectedAmount = Number(paymentRecord.amount);
        const expectedCurrency = (paymentRecord.currency || "USDT").toUpperCase();

        const amountDifference = Math.abs(expectedAmount - paidTotalFee);
        const currencyMatches = paidCurrency === expectedCurrency;

        if (amountDifference > 0.01 || !currencyMatches) {
          console.error(
            `[Security Alert] Payment amount mismatch for trade ${merchantTradeNo}. Expected ${expectedAmount} ${expectedCurrency}, received ${paidTotalFee} ${paidCurrency}`
          );

          // Mark payment for manual admin review rather than fulfilling
          await supabase
            .from("payments")
            .update({
              status: "review_required",
              gateway_txn_id: transId,
              gateway_response: payload,
            })
            .eq("id", paymentRecord.id);

          await supabase.from("payment_events").insert({
            payment_id: paymentRecord.id,
            event_type: "BINANCE_PAY_AMOUNT_MISMATCH",
            payload: {
              expectedAmount,
              expectedCurrency,
              paidTotalFee,
              paidCurrency,
              rawPayload: payload,
            },
            signature_valid: Boolean(hasLiveSecret),
          });

          return NextResponse.json({
            returnCode: "FAIL",
            returnMessage: "Amount mismatch detected",
          });
        }

        // Update payment to paid
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

        // Record successful payment event
        await supabase.from("payment_events").insert({
          payment_id: paymentRecord.id,
          event_type: "BINANCE_PAY_SUCCESS",
          payload,
          signature_valid: Boolean(hasLiveSecret),
        });
      }
    } catch (dbErr) {
      console.error("[Webhook Error] Database processing failed:", dbErr);
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

