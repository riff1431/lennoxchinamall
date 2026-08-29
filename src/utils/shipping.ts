/**
 * Lennox ChinaMall — Logistics & Freight Shipping Calculation Engine
 * 
 * Provides dynamic quantity-based calculation for two core logistics channels:
 * 1. Direct Air Freight (Express Air Cargo) — Fast transit via Shenzhen/HK air hubs
 * 2. Ocean Sea Freight (Container Cargo) — Economical bulk transit for larger volumes
 */

export type ShippingFreightMethod = "air" | "sea" | "yunexpress" | "sf_express" | "dhl" | string;

export interface FreightModeConfig {
  id: "air" | "sea";
  name: string;
  shortName: string;
  serviceType: string;
  deliveryTime: string;
  minDays: number;
  maxDays: number;
  routeDescription: string;
  baseCost: number; // Base rate for first unit (USDT)
  perUnitCost: number; // Incremental rate per additional unit (USDT)
  freeThreshold?: number; // Optional order value threshold for free shipping
  badge: string;
  badgeType: "popular" | "fast" | "value" | "default";
  features: string[];
}

export const FREIGHT_CONFIGS: Record<"air" | "sea", FreightModeConfig> = {
  air: {
    id: "air",
    name: "Direct Air Freight (Express Cargo)",
    shortName: "Air Cargo",
    serviceType: "Air Express Direct",
    deliveryTime: "5–8 Business Days",
    minDays: 5,
    maxDays: 8,
    routeDescription: "Shenzhen / HK International Air Hub • Direct Cargo Flight • Priority Customs",
    baseCost: 7.99,
    perUnitCost: 1.80,
    freeThreshold: 150.0,
    badge: "Fast Delivery",
    badgeType: "fast",
    features: ["Guaranteed Air Cargo Slot", "DDP Fast Customs Clearance", "Door-to-Door Flight Tracking"],
  },
  sea: {
    id: "sea",
    name: "Ocean Sea Freight (Container Cargo)",
    shortName: "Sea Cargo",
    serviceType: "Ocean Bulk Container",
    deliveryTime: "20–30 Business Days",
    minDays: 20,
    maxDays: 30,
    routeDescription: "Ningbo / Shenzhen Port • Ocean Container Freight • Economical Bulk Pallet Space",
    baseCost: 14.99,
    perUnitCost: 0.60,
    freeThreshold: 250.0,
    badge: "Best for Bulk",
    badgeType: "value",
    features: ["Ocean Container Space", "Bulk Pallet Protection", "Economical Per-Unit Scaling"],
  },
};

/**
 * Normalizes any legacy or courier ID to either "air" or "sea".
 */
export function normalizeFreightMethod(method?: string): "air" | "sea" {
  if (!method) return "air";
  const m = method.toLowerCase();
  if (m.includes("sea") || m.includes("ocean") || m.includes("container") || m.includes("boat")) {
    return "sea";
  }
  return "air";
}

/**
 * Calculate dynamic shipping cost based on item units and selected freight mode.
 * 
 * Formula:
 * Total Units = sum of all quantities
 * If totalUnits <= 0 => 0
 * If freeShipping flag or order qualifies for free promo => 0
 * Else: Base Cost + (Total Units - 1) * Per Unit Cost
 */
export function calculateFreightCost(
  totalUnitsOrItems: number | Array<{ quantity: number }>,
  method: string = "air",
  options?: {
    isFreeShippingPromo?: boolean;
    orderSubtotal?: number;
  }
): number {
  const normalized = normalizeFreightMethod(method);
  const config = FREIGHT_CONFIGS[normalized];

  const totalUnits = typeof totalUnitsOrItems === "number"
    ? totalUnitsOrItems
    : Array.isArray(totalUnitsOrItems)
    ? totalUnitsOrItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
    : 0;

  if (totalUnits <= 0) return 0;

  // Check explicit free shipping promo
  if (options?.isFreeShippingPromo) {
    return 0;
  }

  // Check threshold if applicable
  if (options?.orderSubtotal !== undefined && config.freeThreshold && options.orderSubtotal >= config.freeThreshold) {
    return 0;
  }

  // Dynamic quantity-based calculation
  const additionalUnits = Math.max(0, totalUnits - 1);
  const totalCost = config.baseCost + additionalUnits * config.perUnitCost;

  return Math.round(totalCost * 100) / 100;
}

/**
 * Computes arrival window string for freight methods (e.g., "Sep 4 – Sep 7")
 */
export function getEstimatedFreightDeliveryDate(minDays: number, maxDays: number): string {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);

  const minMonth = minDate.toLocaleDateString("en-US", { month: "short" });
  const minDay = minDate.getDate();
  const maxMonth = maxDate.toLocaleDateString("en-US", { month: "short" });
  const maxDay = maxDate.getDate();

  if (minMonth === maxMonth) {
    return `${minMonth} ${minDay} – ${maxDay}`;
  }
  return `${minMonth} ${minDay} – ${maxMonth} ${maxDay}`;
}
