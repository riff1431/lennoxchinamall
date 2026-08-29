"use client";

import React, { useMemo } from "react";
import { Check, Plane, Ship, Sparkles, Clock, ShieldCheck, Zap, Box, Layers } from "lucide-react";
import { CourierLogo } from "./CourierLogo";
import {
  calculateFreightCost,
  FREIGHT_CONFIGS,
  FreightModeConfig,
  getEstimatedFreightDeliveryDate,
  normalizeFreightMethod,
} from "@/utils/shipping";

export interface FreightOption extends FreightModeConfig {
  cost: number;
  originalCost?: number;
  perUnitRate: number;
}

interface CourierSelectorProps {
  selectedCourier: "air" | "sea" | string;
  onSelectCourier: (id: "air" | "sea") => void;
  totalUnits?: number;
  items?: Array<{ quantity: number }>;
  isFreeShipping?: boolean;
  orderSubtotal?: number;
}

export function CourierSelector({
  selectedCourier,
  onSelectCourier,
  totalUnits: explicitTotalUnits,
  items,
  isFreeShipping = false,
  orderSubtotal = 0,
}: CourierSelectorProps) {
  const totalUnits = useMemo(() => {
    if (explicitTotalUnits !== undefined) return explicitTotalUnits;
    if (items && items.length > 0) {
      return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    }
    return 1;
  }, [explicitTotalUnits, items]);

  const activeMethod = normalizeFreightMethod(selectedCourier);

  const freightOptions: FreightOption[] = useMemo(() => {
    const airCost = calculateFreightCost(totalUnits, "air", {
      isFreeShippingPromo: isFreeShipping,
      orderSubtotal,
    });
    const seaCost = calculateFreightCost(totalUnits, "sea", {
      isFreeShippingPromo: isFreeShipping,
      orderSubtotal,
    });

    return [
      {
        ...FREIGHT_CONFIGS.air,
        cost: airCost,
        originalCost: isFreeShipping ? FREIGHT_CONFIGS.air.baseCost + (totalUnits - 1) * FREIGHT_CONFIGS.air.perUnitCost : undefined,
        perUnitRate: FREIGHT_CONFIGS.air.perUnitCost,
      },
      {
        ...FREIGHT_CONFIGS.sea,
        cost: seaCost,
        originalCost: isFreeShipping ? FREIGHT_CONFIGS.sea.baseCost + (totalUnits - 1) * FREIGHT_CONFIGS.sea.perUnitCost : undefined,
        perUnitRate: FREIGHT_CONFIGS.sea.perUnitCost,
      },
    ];
  }, [totalUnits, isFreeShipping, orderSubtotal]);

  return (
    <div
      role="radiogroup"
      aria-label="Select Freight Shipping Method"
      className="space-y-3.5"
    >
      {/* Unit & Volume Context Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Box className="w-3.5 h-3.5 text-blue-600" />
          Procurement Cargo Volume: <strong className="text-slate-900 font-mono font-bold">{totalUnits} {totalUnits === 1 ? "Unit" : "Units"}</strong>
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          Dynamic space &amp; weight scaling
        </span>
      </div>

      {freightOptions.map((freight) => {
        const isSelected = activeMethod === freight.id;
        const estDelivery = getEstimatedFreightDeliveryDate(freight.minDays, freight.maxDays);

        return (
          <div
            key={freight.id}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => onSelectCourier(freight.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectCourier(freight.id);
              }
            }}
            className={`group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 cursor-pointer transition-all duration-200 outline-none select-none ${
              isSelected
                ? "border-[#00143D] bg-gradient-to-r from-slate-50/90 via-white to-blue-50/20 shadow-md ring-2 ring-[#00143D]/10"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              {/* Left Section: Logo & Logistics Info */}
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Dynamic Freight Vector Badge */}
                <CourierLogo
                  courier={freight.id}
                  name={freight.name}
                  size="md"
                />

                {/* Carrier Information */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-heading font-black text-sm sm:text-base text-slate-900 leading-tight">
                      {freight.name}
                    </span>

                    {/* Dynamic Tag / Badge */}
                    {freight.badge && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight border ${
                          freight.badgeType === "fast"
                            ? "bg-blue-50 text-blue-700 border-blue-200/80 font-mono"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-mono"
                        }`}
                      >
                        {freight.badgeType === "fast" ? (
                          <Zap className="w-2.5 h-2.5 fill-blue-500 text-blue-600" />
                        ) : (
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        )}
                        {freight.badge}
                      </span>
                    )}
                  </div>

                  {/* Route & Delivery Estimate */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {freight.deliveryTime}
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="text-[11px] sm:text-xs text-slate-500">
                      Est. Arrival: <strong className="text-slate-800 font-bold">{estDelivery}</strong>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 hidden sm:block">
                    {freight.routeDescription}
                  </p>
                </div>
              </div>

              {/* Right Section: Price & Radio Selection Indicator */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Price Display */}
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-1.5">
                    {freight.originalCost !== undefined && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ${freight.originalCost.toFixed(2)}
                      </span>
                    )}
                    {freight.cost === 0 ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 font-mono font-black text-sm border border-emerald-200/80">
                        FREE
                      </span>
                    ) : (
                      <span className="font-mono font-black text-base sm:text-lg text-slate-900">
                        ${freight.cost.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    USDT ({totalUnits} {totalUnits === 1 ? "unit" : "units"} calculated)
                  </span>
                </div>

                {/* Custom Animated Radio Checkbox */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 shrink-0 ${
                    isSelected
                      ? "bg-[#00143D] border-[#00143D] text-white shadow-xs scale-105"
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* Sub-features Pills */}
            {freight.features && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                {freight.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md"
                  >
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    {feat}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-blue-50/60 text-blue-700 px-2 py-0.5 rounded-md ml-auto">
                  <Layers className="w-2.5 h-2.5" />
                  +${freight.perUnitRate.toFixed(2)} / addl unit
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CourierSelector;
