"use client";

import React, { useMemo } from "react";
import { Check, Plane, Sparkles, Clock, ShieldCheck, Zap } from "lucide-react";
import { CourierLogo, CourierCode } from "./CourierLogo";

export interface CourierOption {
  id: "yunexpress" | "sf_express" | "dhl" | string;
  name: string;
  courierCode: CourierCode;
  deliveryTime: string;
  minDays: number;
  maxDays: number;
  routeDescription: string;
  cost: number;
  originalCost?: number;
  badge?: string;
  badgeType?: "popular" | "fast" | "value" | "default";
  features?: string[];
  imageUrl?: string;
}

interface CourierSelectorProps {
  selectedCourier: string;
  onSelectCourier: (id: "yunexpress" | "sf_express" | "dhl") => void;
  baseShippingCost: number;
  isFreeShipping: boolean;
}

export function CourierSelector({
  selectedCourier,
  onSelectCourier,
  baseShippingCost,
  isFreeShipping,
}: CourierSelectorProps) {
  // Helper to calculate approximate arrival date string
  const getEstimatedDates = (minDays: number, maxDays: number) => {
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
  };

  const couriers: CourierOption[] = useMemo(
    () => [
      {
        id: "yunexpress",
        name: "YunExpress Tracked Line",
        courierCode: "yunexpress",
        deliveryTime: "7–12 Business Days",
        minDays: 7,
        maxDays: 12,
        routeDescription: "Shenzhen Air Hub • Local USPS / National Post Handover",
        cost: baseShippingCost,
        originalCost: baseShippingCost === 0 ? 4.99 : undefined,
        badge: "Best Value",
        badgeType: "value",
        features: ["DDP Tax Cleared", "Door-to-Door Tracking"],
      },
      {
        id: "sf_express",
        name: "SF International Priority",
        courierCode: "sf_express",
        deliveryTime: "5–8 Business Days",
        minDays: 5,
        maxDays: 8,
        routeDescription: "Direct Hong Kong Daily Cargo Flight • Priority Sorting",
        cost: isFreeShipping ? 0 : 8.99,
        originalCost: isFreeShipping ? 8.99 : undefined,
        badge: "Most Popular",
        badgeType: "popular",
        features: ["Guaranteed Air Cargo Slot", "Fast Customs Clearance"],
      },
      {
        id: "dhl",
        name: "DHL Worldwide Express",
        courierCode: "dhl",
        deliveryTime: "3–5 Business Days",
        minDays: 3,
        maxDays: 5,
        routeDescription: "VIP Dedicated Air Express • VIP Direct Customs Priority",
        cost: 18.99,
        badge: "Fastest Express",
        badgeType: "fast",
        features: ["Ultra Fast Transit", "Signature on Delivery"],
      },
    ],
    [baseShippingCost, isFreeShipping]
  );

  return (
    <div
      role="radiogroup"
      aria-label="Select Air Freight Courier"
      className="space-y-3.5"
    >
      {couriers.map((courier) => {
        const isSelected = selectedCourier === courier.id;
        const estDelivery = getEstimatedDates(courier.minDays, courier.maxDays);

        return (
          <div
            key={courier.id}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => onSelectCourier(courier.id as "yunexpress" | "sf_express" | "dhl")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectCourier(courier.id as "yunexpress" | "sf_express" | "dhl");
              }
            }}
            className={`group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 cursor-pointer transition-all duration-200 outline-none select-none ${
              isSelected
                ? "border-[#00143D] bg-gradient-to-r from-slate-50/90 via-white to-blue-50/20 shadow-md ring-2 ring-[#00143D]/10"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              {/* Left Section: Logo & Carrier Info */}
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Dynamic Brand Logo */}
                <CourierLogo
                  courier={courier.courierCode}
                  name={courier.name}
                  imageUrl={courier.imageUrl}
                  size="md"
                />

                {/* Carrier Information */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-heading font-black text-sm sm:text-base text-slate-900 leading-tight">
                      {courier.name}
                    </span>

                    {/* Dynamic Tag / Badge */}
                    {courier.badge && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight border ${
                          courier.badgeType === "popular"
                            ? "bg-red-50 text-[#FF1028] border-red-200/80"
                            : courier.badgeType === "fast"
                            ? "bg-amber-50 text-amber-900 border-amber-300/80 font-mono"
                            : courier.badgeType === "value"
                            ? "bg-blue-50 text-blue-700 border-blue-200/80"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {courier.badgeType === "popular" && <Sparkles className="w-2.5 h-2.5" />}
                        {courier.badgeType === "fast" && <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />}
                        {courier.badge}
                      </span>
                    )}
                  </div>

                  {/* Route & Delivery Estimate */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {courier.deliveryTime}
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="text-[11px] sm:text-xs text-slate-500">
                      Est. Arrival: <strong className="text-slate-800 font-bold">{estDelivery}</strong>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 hidden sm:block">
                    {courier.routeDescription}
                  </p>
                </div>
              </div>

              {/* Right Section: Price & Radio Selection Indicator */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Price Display */}
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-1.5">
                    {courier.originalCost !== undefined && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ${courier.originalCost.toFixed(2)}
                      </span>
                    )}
                    {courier.cost === 0 ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 font-mono font-black text-sm border border-emerald-200/80">
                        FREE
                      </span>
                    ) : (
                      <span className="font-mono font-black text-base sm:text-lg text-slate-900">
                        ${courier.cost.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    USDT Airfreight
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

            {/* Mobile Sub-features Pills */}
            {courier.features && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                {courier.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md"
                  >
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    {feat}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CourierSelector;
