"use client";

import React, { useMemo, useState } from "react";
import { Check, Plane, Ship, Sparkles, Clock, ShieldCheck, Zap, Box, Layers, ChevronDown, ChevronUp, Info, Scale } from "lucide-react";
import { CourierLogo } from "./CourierLogo";
import {
  calculateComprehensiveShipping,
  ComprehensiveShippingResult,
  FREIGHT_CONFIGS,
  FreightModeConfig,
  getEstimatedFreightDeliveryDate,
  normalizeFreightMethod,
} from "@/utils/shipping";

interface CourierSelectorProps {
  selectedCourier: "air" | "sea" | string;
  onSelectCourier: (id: "air" | "sea") => void;
  totalUnits?: number;
  items?: Array<any>;
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
  const [showFormulaBreakdown, setShowFormulaBreakdown] = useState(false);
  const activeMethod = normalizeFreightMethod(selectedCourier);

  const shippingResult: ComprehensiveShippingResult = useMemo(() => {
    const input = items && items.length > 0 ? items : (explicitTotalUnits || 1);
    return calculateComprehensiveShipping(input, {
      isFreeShippingPromo: isFreeShipping,
      orderSubtotal,
    });
  }, [items, explicitTotalUnits, isFreeShipping, orderSubtotal]);

  const freightOptions = [
    {
      ...FREIGHT_CONFIGS.air,
      breakdown: shippingResult.air,
      cost: shippingResult.air.totalCost,
      originalCost: isFreeShipping ? shippingResult.air.rawTotalCost : undefined,
    },
    {
      ...FREIGHT_CONFIGS.sea,
      breakdown: shippingResult.sea,
      cost: shippingResult.sea.totalCost,
      originalCost: isFreeShipping ? shippingResult.sea.rawTotalCost : undefined,
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Select Freight Shipping Method"
      className="space-y-4"
    >
      {/* 1. Multi-Product Cargo Aggregation Summary Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-xs space-y-2.5 font-montserrat">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-heading flex items-center gap-2 text-slate-200 uppercase tracking-wider">
            <Box className="w-4 h-4 text-blue-400" />
            Consolidated Procurement Cargo ({shippingResult.totalUnits} {shippingResult.totalUnits === 1 ? "Item" : "Items"})
          </span>
          <button
            type="button"
            onClick={() => setShowFormulaBreakdown((prev) => !prev)}
            className="text-[11px] font-mono text-blue-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{showFormulaBreakdown ? "Hide Formula" : "View Logistics Breakdown"}</span>
            {showFormulaBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Total Gross Weight</span>
            <span className="font-bold text-white text-xs sm:text-sm">{shippingResult.totalGrossWeight.toFixed(2)} KG</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Air Volumetric Wt</span>
            <span className="font-bold text-amber-300 text-xs sm:text-sm">{shippingResult.totalVolumetricWeight.toFixed(2)} KG</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Total Volume (CBM)</span>
            <span className="font-bold text-blue-400 text-xs sm:text-sm">{shippingResult.totalCbm.toFixed(4)} m³</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Air Cargo DG Class</span>
            <span className="font-bold text-emerald-400 text-xs sm:text-sm">
              {shippingResult.hasBatteryOrDG ? "Lithium DG Pass" : "General Cargo"}
            </span>
          </div>
        </div>

        {/* Expandable itemized sizing list */}
        {showFormulaBreakdown && shippingResult.items.length > 0 && (
          <div className="mt-2 pt-2.5 border-t border-slate-800 space-y-1.5 text-[11px] animate-in fade-in duration-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-heading">
              Item-by-Item Physical Sizing Breakdown
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-slate-300 text-[10px]">
              {shippingResult.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/50 border border-slate-800/80">
                  <span className="truncate max-w-[200px] text-slate-200">{item.quantity}x {item.title}</span>
                  <span className="text-slate-400">
                    {item.length}×{item.width}×{item.height} cm • {(item.totalGrossWeight).toFixed(2)}kg • {(item.totalCbm).toFixed(4)}m³
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Air vs Sea Freight Options */}
      {freightOptions.map((freight) => {
        const isSelected = activeMethod === freight.id;
        const estDelivery = getEstimatedFreightDeliveryDate(freight.minDays, freight.maxDays);
        const b = freight.breakdown;

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
            className={`group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 cursor-pointer transition-all duration-200 outline-none select-none font-montserrat ${
              isSelected
                ? "border-[#00143D] bg-gradient-to-r from-slate-50/90 via-white to-blue-50/20 shadow-md ring-2 ring-[#00143D]/10"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              {/* Left Section: Logo & Logistics Info */}
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
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

                  {/* Calculation formula pill */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {freight.id === "air"
                        ? `Chargeable: ${b.chargeableMetric} KG (${b.chargeType})`
                        : `Chargeable: ${b.chargeableMetric} CBM (${b.chargeType})`}
                    </span>
                    <span className="text-slate-400">
                      Formula: ${b.baseFee.toFixed(2)} Base + ({b.chargeableMetric} × ${b.ratePerUnit.toFixed(2)}/{b.chargeableMetricLabel})
                      {b.surcharges > 0 ? ` + $${b.surcharges.toFixed(2)} DG Surcharge` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section: Price & Radio Selection Indicator */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
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
                    USDT ({shippingResult.totalUnits} {shippingResult.totalUnits === 1 ? "unit" : "units"} calculated)
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
          </div>
        );
      })}
    </div>
  );
}

export default CourierSelector;
