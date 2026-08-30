/**
 * Lennox ChinaMall — Enterprise Logistics & Freight Shipping Calculation Engine
 * 
 * Implements two distinct international logistics rules:
 * 
 * 1. AIR CARGO EXPRESS (Direct Air Freight)
 *    - Formula based on Chargeable Weight: max(Total Gross Weight KG, Total Volumetric Weight KG).
 *    - Volumetric Weight = (Length * Width * Height cm) / 5000 * Quantity.
 *    - Air Cost = Base Fee ($4.99) + (Chargeable Weight * $6.50/KG) + DG Surcharge ($2.50 if battery/liquid).
 *    - Fast delivery SLA: 5–8 Business Days.
 * 
 * 2. OCEAN SEA FREIGHT (Container Cargo)
 *    - Formula based on Chargeable Volume (CBM) / Revenue Tons: max(Total CBM m³, Weight in Metric Tons).
 *    - CBM = (Length * Width * Height cm) / 1,000,000 * Quantity.
 *    - Sea Cost = max($15.00, Base Terminal Fee ($12.00) + (Chargeable CBM * $45.00/CBM)).
 *    - Economical bulk delivery SLA: 20–30 Business Days.
 */

import { MOCK_PRODUCTS } from "@/lib/mockData";
import { Product } from "@/types/database";

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
  baseCost: number; // Base rate (USDT)
  ratePerUnitMetric: number; // $/KG for Air, $/CBM for Sea
  unitMetricLabel: string;
  freeThreshold?: number; // Optional order value threshold for free shipping
  badge: string;
  badgeType: "popular" | "fast" | "value" | "default";
  features: string[];
}

export const FREIGHT_CONFIGS: Record<"air" | "sea", FreightModeConfig> = {
  air: {
    id: "air",
    name: "Direct Air Freight (Priority Express Cargo)",
    shortName: "Air Cargo",
    serviceType: "Air Express Direct Flight",
    deliveryTime: "5–8 Business Days",
    minDays: 5,
    maxDays: 8,
    routeDescription: "Shenzhen (SZX) / HKG Air Hub • Priority Air Cargo Flight • Expedited Customs Clearance",
    baseCost: 4.99,
    ratePerUnitMetric: 6.50, // $6.50 / KG
    unitMetricLabel: "per KG billable",
    freeThreshold: 150.0,
    badge: "Fast Delivery",
    badgeType: "fast",
    features: ["Guaranteed Air Cargo Slot", "DDP Fast Customs Clearance", "Door-to-Door Flight Tracking"],
  },
  sea: {
    id: "sea",
    name: "Ocean Sea Freight (Container Bulk Cargo)",
    shortName: "Sea Cargo",
    serviceType: "Ocean Container Freight",
    deliveryTime: "20–30 Business Days",
    minDays: 20,
    maxDays: 30,
    routeDescription: "Shenzhen / Ningbo Port • Ocean Container Freight • Economical Bulk Pallet Space",
    baseCost: 12.00,
    ratePerUnitMetric: 45.00, // $45.00 / CBM
    unitMetricLabel: "per CBM volume",
    freeThreshold: 250.0,
    badge: "Best for Bulk",
    badgeType: "value",
    features: ["Ocean Container Space", "Bulk Pallet Protection", "Economical for Multi-Product Cartons"],
  },
};

export interface ShippingCalculationItem {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  length: number; // cm
  width: number; // cm
  height: number; // cm
  unitGrossWeight: number; // kg
  totalGrossWeight: number; // kg
  unitVolumetricWeight: number; // kg (L*W*H / 5000)
  totalVolumetricWeight: number; // kg
  unitCbm: number; // m3 (L*W*H / 1000000)
  totalCbm: number; // m3
  cargoType: string;
  isBatteryOrDangerousGoods: boolean;
}

export interface FreightModeBreakdown {
  methodId: "air" | "sea";
  methodName: string;
  deliveryTime: string;
  minDays: number;
  maxDays: number;
  estimatedDeliveryDate: string;
  chargeableMetric: number;
  chargeableMetricLabel: string;
  chargeType: string;
  baseFee: number;
  ratePerUnit: number;
  surcharges: number;
  rawTotalCost: number;
  totalCost: number;
  isFree: boolean;
  savingsVsAir?: number;
}

export interface ComprehensiveShippingResult {
  items: ShippingCalculationItem[];
  totalUnits: number;
  totalGrossWeight: number; // KG
  totalVolumetricWeight: number; // KG
  totalCbm: number; // m3
  hasBatteryOrDG: boolean;
  air: FreightModeBreakdown;
  sea: FreightModeBreakdown;
  recommendedMethod: "air" | "sea";
}

/**
 * Normalizes any legacy or courier ID to either "air" or "sea".
 */
export function normalizeFreightMethod(method?: string): "air" | "sea" {
  if (!method) return "air";
  const m = method.toLowerCase();
  if (m.includes("sea") || m.includes("ocean") || m.includes("container") || m.includes("boat") || m.includes("maritime")) {
    return "sea";
  }
  return "air";
}

/**
 * Resolve dimensions and weight for an item from provided properties or product catalogue.
 */
export function resolveItemLogisticsSpecs(item: any): {
  length: number;
  width: number;
  height: number;
  grossWeight: number;
  cargoType: string;
} {
  // If item already contains dimensions and weight
  const explicitDims = item.dimensions || item;
  let length = Number(explicitDims?.length) || 0;
  let width = Number(explicitDims?.width) || 0;
  let height = Number(explicitDims?.height) || 0;
  let grossWeight = Number(item.weight ?? item.unitGrossWeight ?? item.gross_weight) || 0;
  let cargoType = item.cargoType || item.cargo_type || "";

  // If missing, look up from catalog
  if ((!length || !grossWeight) && item.productId) {
    const catalogProd = MOCK_PRODUCTS.find((p) => p.id === item.productId || p.slug === item.productId || p.sku === item.productId);
    if (catalogProd) {
      if (!length && catalogProd.dimensions && typeof catalogProd.dimensions === "object") {
        const d = catalogProd.dimensions as any;
        length = Number(d.length) || 30;
        width = Number(d.width) || 20;
        height = Number(d.height) || 12;
      }
      if (!grossWeight) {
        grossWeight = Number(catalogProd.weight) || 0.85;
      }
      if (!cargoType) {
        cargoType = catalogProd.cargo_type || "general";
      }
    }
  }

  // Fallbacks if still zero
  if (!length) length = 28;
  if (!width) width = 18;
  if (!height) height = 10;
  if (!grossWeight) grossWeight = 0.65;
  if (!cargoType) cargoType = "general";

  return { length, width, height, grossWeight, cargoType };
}

/**
 * Comprehensive calculation of all items in the cart/order for both Air and Sea shipping rules.
 */
export function calculateComprehensiveShipping(
  itemsInput: Array<any> | number,
  options?: {
    isFreeShippingPromo?: boolean;
    orderSubtotal?: number;
    destinationCountry?: string;
  }
): ComprehensiveShippingResult {
  let itemsList: any[] = [];

  if (typeof itemsInput === "number") {
    // Single mock product with quantity
    itemsList = [{ productId: "default", quantity: itemsInput, title: "Order Package" }];
  } else if (Array.isArray(itemsInput)) {
    itemsList = itemsInput;
  }

  if (itemsList.length === 0) {
    const emptyBreakdown = (id: "air" | "sea"): FreightModeBreakdown => ({
      methodId: id,
      methodName: FREIGHT_CONFIGS[id].name,
      deliveryTime: FREIGHT_CONFIGS[id].deliveryTime,
      minDays: FREIGHT_CONFIGS[id].minDays,
      maxDays: FREIGHT_CONFIGS[id].maxDays,
      estimatedDeliveryDate: getEstimatedFreightDeliveryDate(FREIGHT_CONFIGS[id].minDays, FREIGHT_CONFIGS[id].maxDays),
      chargeableMetric: 0,
      chargeableMetricLabel: id === "air" ? "KG" : "CBM",
      chargeType: "zero",
      baseFee: 0,
      ratePerUnit: 0,
      surcharges: 0,
      rawTotalCost: 0,
      totalCost: 0,
      isFree: false,
    });

    return {
      items: [],
      totalUnits: 0,
      totalGrossWeight: 0,
      totalVolumetricWeight: 0,
      totalCbm: 0,
      hasBatteryOrDG: false,
      air: emptyBreakdown("air"),
      sea: emptyBreakdown("sea"),
      recommendedMethod: "air",
    };
  }

  // 1. Process each item and calculate physical metrics
  const calculatedItems: ShippingCalculationItem[] = itemsList.map((item, idx) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const { length, width, height, grossWeight, cargoType } = resolveItemLogisticsSpecs(item);

    const unitVolumetricWeight = Number(((length * width * height) / 5000).toFixed(3));
    const totalVolumetricWeight = Number((unitVolumetricWeight * qty).toFixed(3));

    const unitCbm = Number(((length * width * height) / 1000000).toFixed(5));
    const totalCbm = Number((unitCbm * qty).toFixed(5));

    const totalGrossWeight = Number((grossWeight * qty).toFixed(3));
    const isBatteryOrDangerousGoods =
      cargoType === "lithium_built_in" ||
      cargoType === "lithium_pure" ||
      cargoType === "liquid_cream" ||
      cargoType === "magnetic" ||
      cargoType === "powder";

    return {
      id: item.id || `item-${idx}`,
      productId: item.productId || item.id || `prod-${idx}`,
      title: item.title || "Hardware Item",
      quantity: qty,
      length,
      width,
      height,
      unitGrossWeight: grossWeight,
      totalGrossWeight,
      unitVolumetricWeight,
      totalVolumetricWeight,
      unitCbm,
      totalCbm,
      cargoType,
      isBatteryOrDangerousGoods,
    };
  });

  // 2. Aggregate Cart Totals
  const totalUnits = calculatedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalGrossWeight = Number(calculatedItems.reduce((sum, item) => sum + item.totalGrossWeight, 0).toFixed(2));
  const totalVolumetricWeight = Number(calculatedItems.reduce((sum, item) => sum + item.totalVolumetricWeight, 0).toFixed(2));
  const totalCbm = Number(calculatedItems.reduce((sum, item) => sum + item.totalCbm, 0).toFixed(4));
  const hasBatteryOrDG = calculatedItems.some((item) => item.isBatteryOrDangerousGoods);

  // 3. Apply RULE 1: AIR CARGO
  const airChargeableWeight = Number(Math.max(totalGrossWeight, totalVolumetricWeight).toFixed(2));
  const airChargeType = totalVolumetricWeight > totalGrossWeight ? "Volumetric Weight (Dimensional Size)" : "Gross Actual Weight";
  const airBaseFee = FREIGHT_CONFIGS.air.baseCost; // $4.99
  const airRatePerKg = FREIGHT_CONFIGS.air.ratePerUnitMetric; // $6.50
  const airDgSurcharge = hasBatteryOrDG ? 2.50 : 0.0; // Battery handling fee
  const rawAirTotal = Number((airBaseFee + airChargeableWeight * airRatePerKg + airDgSurcharge).toFixed(2));

  let finalAirCost = rawAirTotal;
  let isAirFree = false;

  if (options?.isFreeShippingPromo) {
    finalAirCost = 0;
    isAirFree = true;
  } else if (
    options?.orderSubtotal !== undefined &&
    FREIGHT_CONFIGS.air.freeThreshold &&
    options.orderSubtotal >= FREIGHT_CONFIGS.air.freeThreshold
  ) {
    finalAirCost = 0;
    isAirFree = true;
  }

  const airBreakdown: FreightModeBreakdown = {
    methodId: "air",
    methodName: FREIGHT_CONFIGS.air.name,
    deliveryTime: FREIGHT_CONFIGS.air.deliveryTime,
    minDays: FREIGHT_CONFIGS.air.minDays,
    maxDays: FREIGHT_CONFIGS.air.maxDays,
    estimatedDeliveryDate: getEstimatedFreightDeliveryDate(FREIGHT_CONFIGS.air.minDays, FREIGHT_CONFIGS.air.maxDays),
    chargeableMetric: airChargeableWeight,
    chargeableMetricLabel: "KG",
    chargeType: airChargeType,
    baseFee: airBaseFee,
    ratePerUnit: airRatePerKg,
    surcharges: airDgSurcharge,
    rawTotalCost: rawAirTotal,
    totalCost: finalAirCost,
    isFree: isAirFree,
  };

  // 4. Apply RULE 2: OCEAN SEA FREIGHT
  // Ocean revenue tons = max(CBM, Weight in Metric Tons)
  const weightInMetricTons = Number((totalGrossWeight / 1000).toFixed(4));
  const seaChargeableCbm = Number(Math.max(totalCbm, weightInMetricTons, 0.05).toFixed(4)); // Minimum 0.05 CBM billable
  const seaChargeType = totalCbm >= weightInMetricTons ? "CBM Volume" : "Metric Weight Ton";
  const seaBaseFee = FREIGHT_CONFIGS.sea.baseCost; // $12.00 port handling
  const seaRatePerCbm = FREIGHT_CONFIGS.sea.ratePerUnitMetric; // $45.00/CBM

  // Sea freight has minimum base of $15.00
  const rawSeaTotal = Number(Math.max(15.0, seaBaseFee + seaChargeableCbm * seaRatePerCbm).toFixed(2));

  let finalSeaCost = rawSeaTotal;
  let isSeaFree = false;

  if (options?.isFreeShippingPromo) {
    finalSeaCost = 0;
    isSeaFree = true;
  } else if (
    options?.orderSubtotal !== undefined &&
    FREIGHT_CONFIGS.sea.freeThreshold &&
    options.orderSubtotal >= FREIGHT_CONFIGS.sea.freeThreshold
  ) {
    finalSeaCost = 0;
    isSeaFree = true;
  }

  const seaBreakdown: FreightModeBreakdown = {
    methodId: "sea",
    methodName: FREIGHT_CONFIGS.sea.name,
    deliveryTime: FREIGHT_CONFIGS.sea.deliveryTime,
    minDays: FREIGHT_CONFIGS.sea.minDays,
    maxDays: FREIGHT_CONFIGS.sea.maxDays,
    estimatedDeliveryDate: getEstimatedFreightDeliveryDate(FREIGHT_CONFIGS.sea.minDays, FREIGHT_CONFIGS.sea.maxDays),
    chargeableMetric: seaChargeableCbm,
    chargeableMetricLabel: "CBM (m³)",
    chargeType: seaChargeType,
    baseFee: seaBaseFee,
    ratePerUnit: seaRatePerCbm,
    surcharges: 0,
    rawTotalCost: rawSeaTotal,
    totalCost: finalSeaCost,
    isFree: isSeaFree,
    savingsVsAir: Math.max(0, Number((finalAirCost - finalSeaCost).toFixed(2))),
  };

  // Recommended: For lighter / faster items recommend Air, for large volume/heavy items (>20kg or >0.15 CBM) recommend Sea
  const recommendedMethod = totalGrossWeight > 25 || totalCbm > 0.2 ? "sea" : "air";

  return {
    items: calculatedItems,
    totalUnits,
    totalGrossWeight,
    totalVolumetricWeight,
    totalCbm,
    hasBatteryOrDG,
    air: airBreakdown,
    sea: seaBreakdown,
    recommendedMethod,
  };
}

/**
 * Standard calculateFreightCost entry point used across Cart, Checkout, and Orders.
 */
export function calculateFreightCost(
  totalUnitsOrItems: number | Array<any>,
  method: string = "air",
  options?: {
    isFreeShippingPromo?: boolean;
    orderSubtotal?: number;
    destinationCountry?: string;
  }
): number {
  const normalized = normalizeFreightMethod(method);
  const result = calculateComprehensiveShipping(totalUnitsOrItems, options);

  if (normalized === "sea") {
    return result.sea.totalCost;
  }
  return result.air.totalCost;
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

