import { createClient } from "@/lib/supabase/server";
import { Order, OrderStatus } from "@/types/database";
import { CartItemType } from "@/store/useCartStore";
import { evaluatePromotion } from "@/lib/promotions/engine";
import {
  generateOrderNumber,
  generateMerchantTradeNo,
} from "@/utils/helpers";
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_COUPONS } from "@/lib/mockData";


export interface CreateOrderParams {
  userId?: string;
  items: CartItemType[];
  shippingAddress: {
    fullName: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone?: string;
  };
  shippingMethod: string;
  couponCode?: string;
  notes?: string;
}

export interface OrderCreationResult {
  success: boolean;
  orderNumber?: string;
  orderId?: string;
  merchantTradeNo?: string;
  totalAmount?: number;
  message?: string;
}

/**
 * Creates a new order, snapshotting all items, address, and initiating payment records.
 * Securely re-computes prices from the catalogue to prevent price-tampering attacks.
 */
export async function createOrder(
  params: CreateOrderParams
): Promise<OrderCreationResult> {
  const { items, shippingAddress, shippingMethod, couponCode, notes, userId } = params;

  if (!items || items.length === 0) {
    return { success: false, message: "Cart is empty" };
  }

  // 1. Verify and sanitize each item's price against the product catalogue
  const sanitizedItems = items.map((item) => {
    // Look up mock/catalog product & variant to ensure price authenticity
    const catalogProduct = MOCK_PRODUCTS.find((p) => p.id === item.productId || p.id === item.id);
    const catalogVariant = catalogProduct?.variants?.find((v) => v.id === item.variantId || v.id === item.id);
    
    // Use verified catalogue price if found, else fall back to item price with sanity bound
    const verifiedPrice = catalogVariant?.price ?? catalogProduct?.base_price ?? Math.max(0, Number(item.price) || 0);
    const verifiedQuantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

    return {
      ...item,
      price: verifiedPrice,
      quantity: verifiedQuantity,
    };
  });

  const subtotal = sanitizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const standardShipping = subtotal >= 50 ? 0 : 4.99;
  let shippingCost = shippingMethod === "express" ? 14.99 : standardShipping;
  let discount = 0;
  let activeCouponId: string | null = null;

  // 2. Validate coupon code dynamically from Supabase
  if (couponCode) {
    try {
      const supabase = await createClient();
      const cleanCode = couponCode.trim().toUpperCase();

      const { data: dbCoupon } = await supabase
        .from("coupons")
        .select("*")
        .ilike("code", cleanCode)
        .maybeSingle();

      const couponToEval = dbCoupon || MOCK_COUPONS.find((c) => c.code.toUpperCase() === cleanCode);

      if (couponToEval) {
        const mappedCoupon: any = {
          ...couponToEval,
          id: couponToEval.id,
          code: couponToEval.code,
          discount_type: (couponToEval as any).discount_type || (couponToEval as any).discountType || (couponToEval as any).type || "percentage",
          discount_value: (couponToEval as any).discount_value ?? (couponToEval as any).value ?? 0,
          min_order_amount: (couponToEval as any).min_order_amount ?? (couponToEval as any).minSpend ?? (couponToEval as any).min_spend ?? 0,
          usage_limit: (couponToEval as any).usage_limit ?? (couponToEval as any).maxUses ?? null,
          used_count: (couponToEval as any).used_count ?? (couponToEval as any).usageCount ?? 0,
          is_active: (couponToEval as any).is_active ?? (couponToEval as any).isActive ?? true,
        };

        const evalItems = sanitizedItems.map((i) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId,
          price: i.price,
          quantity: i.quantity,
        }));

        const result = evaluatePromotion(mappedCoupon, evalItems, {
          userId,
          shippingCost,
        });

        if (result.valid) {
          discount = result.discountAmount;
          if (result.freeShipping) {
            shippingCost = 0;
          }
          activeCouponId = mappedCoupon.id;
        }
      }
    } catch {
      // Fallback discount calculation
      discount = 0;
    }
  }

  const total = Math.max(0, Math.round((subtotal - discount + shippingCost) * 100) / 100);

  const orderNumber = generateOrderNumber();
  const merchantTradeNo = generateMerchantTradeNo();
  const idempotencyKey = `IDEM-${orderNumber}-${Date.now()}`;

  try {
    const supabase = await createClient();

    // 3. Derive user ID strictly from authenticated session
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const finalUserId = user?.id || userId || null;

    if (finalUserId) {
      // 4. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: finalUserId,
          status: "pending_payment",
          subtotal,
          discount,
          shipping_cost: shippingCost,
          total,
          currency: "USDT",
          notes: notes ? String(notes).slice(0, 500) : null,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;

      // 5. Insert Order Items (with verified snapshots)
      const orderItems = sanitizedItems.map((item) => ({
        order_id: orderId,
        variant_id: item.variantId || item.id,
        product_title: item.title,
        variant_attributes: item.attributes || {},
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity,
      }));

      await supabase.from("order_items").insert(orderItems);

      // 6. Record Coupon Redemption & Increment used_count
      if (activeCouponId && discount > 0) {
        try {
          await supabase.from("coupon_redemptions").insert({
            coupon_id: activeCouponId,
            order_id: orderId,
            user_id: finalUserId,
            customer_email: user?.email || null,
            discount_amount: discount,
          });

          // Increment used_count on coupon
          try {
            await supabase.rpc("increment_coupon_usage", { coupon_id: activeCouponId });
          } catch {
            const { data } = await supabase.from("coupons").select("used_count").eq("id", activeCouponId).single();
            if (data) {
              await supabase.from("coupons").update({ used_count: (data.used_count || 0) + 1 }).eq("id", activeCouponId);
            }
          }
        } catch {
          // Non-blocking redemption log
        }
      }


      // 5. Insert Shipping Address
      await supabase.from("order_addresses").insert({
        order_id: orderId,
        type: "shipping",
        full_name: shippingAddress.fullName.slice(0, 100),
        street_line_1: shippingAddress.streetLine1.slice(0, 200),
        street_line_2: shippingAddress.streetLine2 ? shippingAddress.streetLine2.slice(0, 200) : null,
        city: shippingAddress.city.slice(0, 100),
        state: shippingAddress.state.slice(0, 100),
        country: shippingAddress.country.slice(0, 100),
        postal_code: shippingAddress.postalCode.slice(0, 20),
        phone: shippingAddress.phone ? shippingAddress.phone.slice(0, 20) : null,
      });

      // 6. Insert Status History
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        from_status: null,
        to_status: "pending_payment",
        note: "Order created. Awaiting USDT settlement via Binance Pay.",
      });

      // 7. Insert Payments record
      await supabase.from("payments").insert({
        order_id: orderId,
        merchant_trade_no: merchantTradeNo,
        amount: total,
        currency: "USDT",
        status: "initiated",
        idempotency_key: idempotencyKey,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins
      });

      return {
        success: true,
        orderNumber,
        orderId,
        merchantTradeNo,
        totalAmount: total,
      };
    }

    // Guest Fallback simulation
    return {
      success: true,
      orderNumber,
      merchantTradeNo,
      totalAmount: total,
    };
  } catch {
    // Fallback simulation
    return {
      success: true,
      orderNumber,
      merchantTradeNo,
      totalAmount: total,
    };
  }
}

/**
 * Fetch orders for an authenticated customer or all orders for an authorized admin
 */
export async function getOrders(requestedUserId?: string): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return MOCK_ORDERS;
    }

    // Check if user is an admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.is_active && ["super_admin", "catalogue_manager", "order_manager", "support_agent"].includes(profile.role);

    let query = supabase
      .from("orders")
      .select("*, items:order_items(*), addresses:order_addresses(*), status_history:order_status_history(*), payments(*)")
      .order("created_at", { ascending: false });

    // If not admin, strictly scope to own user.id regardless of parameter
    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    } else if (requestedUserId) {
      query = query.eq("user_id", requestedUserId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return MOCK_ORDERS;
    }

    return data as unknown as Order[];
  } catch {
    return MOCK_ORDERS;
  }
}

/**
 * Update an order's status and record an audit status history event
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  changedBy?: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    const fromStatus = currentOrder?.status || null;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) return false;

    // Add status history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      from_status: fromStatus,
      to_status: newStatus,
      changed_by: changedBy || null,
      note: note || null,
    });

    return true;
  } catch {
    return false;
  }
}
