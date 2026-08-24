import { Coupon, TierRule, ValidationResult } from "@/types/database";

export interface EvaluationItem {
  id: string;
  productId: string;
  variantId?: string;
  title?: string;
  price: number;
  quantity: number;
  categoryId?: string;
  brandId?: string;
}

export interface EvaluationContext {
  userId?: string | null;
  customerEmail?: string | null;
  isFirstOrder?: boolean;
  userRedemptionCount?: number;
  shippingCost?: number;
  now?: Date;
}

/**
 * Pure evaluation engine for checking promotion validity and computing discount.
 */
export function evaluatePromotion(
  coupon: Coupon,
  items: EvaluationItem[],
  context: EvaluationContext = {}
): ValidationResult {
  const now = context.now || new Date();
  const shippingCost = context.shippingCost || 0;

  // 1. Basic Active & Status Check
  if (!coupon.is_active || (coupon.status && coupon.status !== "active")) {
    return {
      valid: false,
      message: "This coupon is currently inactive or has been paused.",
      discountAmount: 0,
      freeShipping: false,
    };
  }

  // 2. Start Date Check
  const startDate = coupon.starts_at || coupon.valid_from;
  if (startDate && new Date(startDate) > now) {
    return {
      valid: false,
      message: `This promotion starts on ${new Date(startDate).toLocaleDateString()}.`,
      discountAmount: 0,
      freeShipping: false,
    };
  }

  // 3. Expiration Check
  const expiryDate = coupon.expires_at || coupon.valid_until;
  if (expiryDate && new Date(expiryDate) < now) {
    return {
      valid: false,
      message: "This coupon code has expired.",
      discountAmount: 0,
      freeShipping: false,
    };
  }

  // 4. Global Usage Limit Check
  const maxUses = coupon.usage_limit ?? coupon.max_uses;
  const currentUses = coupon.used_count ?? coupon.usage_count ?? 0;
  if (maxUses !== null && maxUses !== undefined && maxUses > 0 && currentUses >= maxUses) {
    return {
      valid: false,
      message: "This coupon has reached its maximum total redemptions limit.",
      discountAmount: 0,
      freeShipping: false,
    };
  }

  // 5. Per-Customer Usage Limit Check
  const perCustomerLimit = coupon.per_customer_usage_limit ?? coupon.per_user_limit ?? 1;
  const userRedemptions = context.userRedemptionCount || 0;
  if (userRedemptions >= perCustomerLimit) {
    return {
      valid: false,
      message: `You have reached the redemption limit (${perCustomerLimit} ${perCustomerLimit === 1 ? "use" : "uses"}) for this voucher.`,
      discountAmount: 0,
      freeShipping: false,
    };
  }

  // 6. First-Order Only Restriction
  if (coupon.first_order_only && context.isFirstOrder === false) {
    return {
      valid: false,
      message: "This welcome promotion is exclusively valid on your first order.",
      discountAmount: 0,
      freeShipping: false,
    };
  }

  // 7. Customer Whitelist / Blacklist Targeting
  if (context.userId) {
    if (coupon.allowed_customer_ids && coupon.allowed_customer_ids.length > 0) {
      if (!coupon.allowed_customer_ids.includes(context.userId)) {
        return {
          valid: false,
          message: "This promo code is restricted to selected VIP customer accounts.",
          discountAmount: 0,
          freeShipping: false,
        };
      }
    }

    if (coupon.excluded_customer_ids && coupon.excluded_customer_ids.length > 0) {
      if (coupon.excluded_customer_ids.includes(context.userId)) {
        return {
          valid: false,
          message: "Your account is not eligible to redeem this promotion.",
          discountAmount: 0,
          freeShipping: false,
        };
      }
    }
  }

  // 8. Filter Items Based on Scope & Product Inclusions/Exclusions
  const targetCategoryIds = coupon.target_category_ids || [];
  const targetBrandIds = coupon.target_brand_ids || [];
  const includedProductIds = coupon.included_product_ids || [];
  const excludedProductIds = coupon.excluded_product_ids || [];

  const eligibleItems = items.filter((item) => {
    // Excluded products are never eligible
    if (excludedProductIds.includes(item.productId) || excludedProductIds.includes(item.id)) {
      return false;
    }

    const scope = coupon.scope || "all";
    if (scope === "all" || scope === "cart") {
      return true;
    }
    if (scope === "category") {
      return item.categoryId ? targetCategoryIds.includes(item.categoryId) : true;
    }
    if (scope === "brand") {
      return item.brandId ? targetBrandIds.includes(item.brandId) : true;
    }
    if (scope === "product") {
      return (
        includedProductIds.includes(item.productId) ||
        includedProductIds.includes(item.id)
      );
    }
    return true;
  });

  if (eligibleItems.length === 0) {
    return {
      valid: false,
      message: "None of the items in your cart qualify for this promotion.",
      discountAmount: 0,
      freeShipping: false,
    };
  }

  const eligibleSubtotal = eligibleItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 9. Minimum Order Spend Threshold Check
  const minSpend = coupon.min_order_amount ?? coupon.min_spend ?? 0;
  if (minSpend > 0 && eligibleSubtotal < minSpend) {
    return {
      valid: false,
      message: `Minimum purchase of $${minSpend.toFixed(2)} USDT required for this voucher (current eligible: $${eligibleSubtotal.toFixed(2)}).`,
      discountAmount: 0,
      freeShipping: false,
    };
  }

  // 10. Calculate Discount by Type
  const discountType = coupon.discount_type || coupon.type || "percentage";
  const discountVal = Number(coupon.discount_value ?? coupon.value) || 0;
  let calculatedDiscount = 0;
  let isFreeShipping = false;

  if (discountType === "percentage") {
    calculatedDiscount = eligibleSubtotal * (discountVal / 100);
    if (coupon.max_discount_amount && coupon.max_discount_amount > 0) {
      calculatedDiscount = Math.min(calculatedDiscount, Number(coupon.max_discount_amount));
    }
  } else if (discountType === "fixed" || discountType === "fixed_amount") {
    calculatedDiscount = Math.min(discountVal, eligibleSubtotal);
  } else if (discountType === "free_shipping") {
    isFreeShipping = true;
    calculatedDiscount = shippingCost;
  } else if (discountType === "bogo") {
    const buyQty = coupon.bogo_buy_qty || 1;
    const getQty = coupon.bogo_get_qty || 1;
    const bogoPercent = (coupon.bogo_discount_percent || 100) / 100;

    // Expand items into single units sorted by price (ascending so lowest gets discounted)
    const unitPrices: number[] = [];
    for (const item of eligibleItems) {
      for (let i = 0; i < item.quantity; i++) {
        unitPrices.push(item.price);
      }
    }
    unitPrices.sort((a, b) => a - b);

    const groupSize = buyQty + getQty;
    const totalGroups = Math.floor(unitPrices.length / groupSize);

    for (let g = 0; g < totalGroups; g++) {
      for (let k = 0; k < getQty; k++) {
        const itemPrice = unitPrices[g * getQty + k];
        if (itemPrice) {
          calculatedDiscount += itemPrice * bogoPercent;
        }
      }
    }
  } else if (discountType === "tiered") {
    const totalEligibleQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
    const tierRules: TierRule[] = Array.isArray(coupon.tier_rules)
      ? (coupon.tier_rules as TierRule[])
      : [];

    // Find highest matching tier
    const sortedTiers = [...tierRules].sort((a, b) => b.min_qty - a.min_qty);
    const matchedTier = sortedTiers.find((t) => totalEligibleQty >= t.min_qty);

    if (matchedTier) {
      if (matchedTier.discount_type === "fixed") {
        calculatedDiscount = Math.min(matchedTier.discount, eligibleSubtotal);
      } else {
        calculatedDiscount = eligibleSubtotal * (matchedTier.discount / 100);
      }
    }
  }

  // Sanitize and round discount
  const finalDiscount = Math.max(0, Math.round(calculatedDiscount * 100) / 100);

  return {
    valid: true,
    message: isFreeShipping
      ? "Free Express Air Shipping applied!"
      : `Promotion applied: saved $${finalDiscount.toFixed(2)} USDT!`,
    discountAmount: finalDiscount,
    freeShipping: isFreeShipping,
    coupon,
    appliedScopeItems: eligibleItems.map((i) => i.id),
  };
}

/**
 * Scans a list of active automatic promotions and applies the best discount.
 */
export function evaluateBestAutomaticPromotion(
  promotions: Coupon[],
  items: EvaluationItem[],
  context: EvaluationContext = {}
): ValidationResult | null {
  const automaticPromos = promotions.filter(
    (p) => p.is_automatic && p.is_active && (!p.status || p.status === "active")
  );

  if (automaticPromos.length === 0) {
    return null;
  }

  let bestResult: ValidationResult | null = null;

  for (const promo of automaticPromos) {
    const result = evaluatePromotion(promo, items, context);
    if (result.valid) {
      if (!bestResult || result.discountAmount > bestResult.discountAmount) {
        bestResult = result;
      }
    }
  }

  return bestResult;
}
