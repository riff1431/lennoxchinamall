import crypto from "crypto";

export interface BinancePrepayRequest {
  merchantTradeNo: string;
  orderAmount: number;
  currency?: string; // "USDT"
  description: string;
  goodsDetails?: {
    goodsType: string;
    goodsCategory: string;
    referenceGoodsId: string;
    goodsName: string;
    goodsDetail?: string;
  }[];
}

export interface BinancePrepayResponse {
  status: "SUCCESS" | "FAIL";
  code: string;
  data?: {
    prepayId: string;
    terminalType: string;
    expireTime: number;
    qrcodeLink: string;
    qrContent: string;
    checkoutUrl: string;
    deeplink: string;
    universalUrl: string;
  };
  errorMessage?: string;
}

export interface BinanceWebhookPayload {
  bizType: string;
  bizId: string;
  bizStatus: "PAY_SUCCESS" | "PAY_CLOSED";
  data: string; // JSON string containing merchantTradeNo, totalFee, currency, transId
}

/**
 * Generate HMAC-SHA512 signature for Binance Pay API requests
 */
export function generateBinanceSignature(
  timestamp: number,
  nonce: string,
  body: string,
  secretKey: string
): string {
  const payload = `${timestamp}\n${nonce}\n${body}\n`;
  return crypto
    .createHmac("sha512", secretKey)
    .update(payload)
    .digest("hex")
    .toUpperCase();
}

/**
 * Verify incoming webhook signature from Binance Pay
 */
export function verifyBinanceWebhookSignature(
  timestamp: string,
  nonce: string,
  body: string,
  receivedSignature: string,
  secretKey: string
): boolean {
  try {
    const payload = `${timestamp}\n${nonce}\n${body}\n`;
    const computedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(payload)
      .digest("hex")
      .toUpperCase();

    return (
      crypto.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(receivedSignature.toUpperCase())
      )
    );
  } catch {
    return false;
  }
}

/**
 * Server-side creation of a Binance Pay prepay order
 */
export async function createBinancePrepayOrder(
  params: BinancePrepayRequest
): Promise<BinancePrepayResponse> {
  const apiKey = process.env.BINANCE_API_KEY;
  const secretKey = process.env.BINANCE_API_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // If live Binance merchant credentials are not yet set, return simulated live prepay data
  if (!apiKey || !secretKey || apiKey.includes("your-")) {
    return {
      status: "SUCCESS",
      code: "000000",
      data: {
        prepayId: `PP_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        terminalType: "WEB",
        expireTime: Date.now() + 30 * 60 * 1000,
        qrcodeLink: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=binancepay://pay?tradeNo=${params.merchantTradeNo}`,
        qrContent: `binancepay://pay?tradeNo=${params.merchantTradeNo}`,
        checkoutUrl: `https://pay.binance.com/checkout?tradeNo=${params.merchantTradeNo}`,
        deeplink: `bnc://app.binance.com/payment/secpay?tradeNo=${params.merchantTradeNo}`,
        universalUrl: `https://app.binance.com/payment/secpay?tradeNo=${params.merchantTradeNo}`,
      },
    };
  }

  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString("hex");

  const requestBody = JSON.stringify({
    env: {
      terminalType: "WEB",
    },
    merchantTradeNo: params.merchantTradeNo,
    orderAmount: params.orderAmount,
    currency: params.currency || "USDT",
    description: params.description,
    returnUrl: `${appUrl}/account/orders`,
    cancelUrl: `${appUrl}/cart`,
  });

  const signature = generateBinanceSignature(
    timestamp,
    nonce,
    requestBody,
    secretKey
  );

  const response = await fetch(
    "https://bpay.binanceapi.com/binancepay/openapi/v2/order",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "BinancePay-Timestamp": timestamp.toString(),
        "BinancePay-Nonce": nonce,
        "BinancePay-Certificate-SN": apiKey,
        "BinancePay-Signature": signature,
      },
      body: requestBody,
    }
  );

  return (await response.json()) as BinancePrepayResponse;
}
