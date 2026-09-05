"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  Plane,
  Ship,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  Box,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { CourierLogo } from "./CourierLogo";
import {
  calculateComprehensiveShipping,
  ComprehensiveShippingResult,
  FREIGHT_CONFIGS,
  getEstimatedFreightDeliveryDate,
  normalizeFreightMethod,
} from "@/utils/shipping";
import { useTranslation } from "@/lib/i18n/useTranslation";

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
  const { isSpanish } = useTranslation();
  const [showCargoSpecs, setShowCargoSpecs] = useState(false);
  const activeMethod = normalizeFreightMethod(selectedCourier);

  const shippingResult: ComprehensiveShippingResult = useMemo(() => {
    const input = items && items.length > 0 ? items : explicitTotalUnits || 1;
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
      className="space-y-3 font-sans"
    >
      {/* ── Shipping Options Selection ── */}
      <div className="space-y-2.5">
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
              className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 outline-none select-none cursor-pointer ${
                isSelected
                  ? "border-slate-900 bg-slate-50/70 shadow-xs ring-1 ring-slate-900/10"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40"
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-3.5">
                {/* Left Section: Logo & Carrier Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <CourierLogo
                    courier={freight.id}
                    name={freight.name}
                    size="md"
                    className="shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-bold text-sm sm:text-base text-slate-900 leading-tight">
                        {isSpanish
                          ? freight.id === "air"
                            ? "Carga Aérea Directa Express"
                            : "Carga Marítima Consolidada"
                          : freight.name}
                      </span>

                      {freight.badge && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                            freight.badgeType === "fast"
                              ? "bg-sky-50 text-sky-700 border-sky-200/80"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                          }`}
                        >
                          {freight.badgeType === "fast" ? (
                            <Zap className="w-2.5 h-2.5 fill-sky-600 text-sky-600" />
                          ) : (
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          )}
                          {isSpanish
                            ? freight.badgeType === "fast"
                              ? "Más Rápido"
                              : "Económico"
                            : freight.badge}
                        </span>
                      )}
                    </div>

                    {/* Timeline & Transit Days */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {isSpanish
                          ? freight.id === "air"
                            ? "5–8 Días de Tránsito"
                            : "20–30 Días de Tránsito"
                          : freight.deliveryTime}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">
                        {isSpanish ? "Entrega est.:" : "Est. arrival:"}{" "}
                        <span className="font-semibold text-slate-800">{estDelivery}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section: Price & Radio Check */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {freight.originalCost !== undefined && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          ${freight.originalCost.toFixed(2)}
                        </span>
                      )}
                      {freight.cost === 0 ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200/70">
                          {isSpanish ? "GRATIS" : "FREE"}
                        </span>
                      ) : (
                        <span className="font-heading font-bold text-sm sm:text-base text-slate-900 tabular-nums">
                          ${freight.cost.toFixed(2)}{" "}
                          <span className="text-xs font-medium text-slate-500">USDT</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {shippingResult.totalUnits}{" "}
                      {shippingResult.totalUnits === 1
                        ? isSpanish
                          ? "artículo"
                          : "item"
                        : isSpanish
                        ? "artículos"
                        : "items"}
                    </span>
                  </div>

                  {/* Clean Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-150 shrink-0 ${
                      isSelected
                        ? "bg-slate-950 border-slate-950 text-white shadow-xs"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Collapsible Technical Cargo & Customs Sizing ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-all duration-200">
        <button
          type="button"
          onClick={() => setShowCargoSpecs((prev) => !prev)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs text-slate-600 hover:bg-slate-50/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Box className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">
              {isSpanish ? "Detalles de Carga y Especificaciones Aduaneras" : "Cargo Specifications & Customs Data"}
            </span>
            <span className="text-[11px] text-slate-400">
              ({shippingResult.totalGrossWeight.toFixed(2)} kg • {shippingResult.totalCbm.toFixed(4)} m³)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <span>{showCargoSpecs ? (isSpanish ? "Ocultar" : "Hide") : (isSpanish ? "Ver" : "View")}</span>
            {showCargoSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showCargoSpecs && (
          <div className="p-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs animate-in fade-in duration-150">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {isSpanish ? "Peso Bruto" : "Gross Weight"}
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {shippingResult.totalGrossWeight.toFixed(2)} KG
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {isSpanish ? "Peso Volumétrico" : "Volumetric Wt"}
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {shippingResult.totalVolumetricWeight.toFixed(2)} KG
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {isSpanish ? "Volumen CBM" : "Total Volume"}
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {shippingResult.totalCbm.toFixed(4)} m³
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {isSpanish ? "Estado de Carga" : "Cargo Clearance"}
                </span>
                <span className="font-semibold text-emerald-700 text-[11px] truncate block">
                  {shippingResult.hasBatteryOrDG
                    ? isSpanish
                      ? "Batería Litio Aprobada"
                      : "Lithium Safe Pass"
                    : isSpanish
                    ? "Carga General Estándar"
                    : "Standard Cargo"}
                </span>
              </div>
            </div>

            {/* Individual Item Sizing */}
            {shippingResult.items.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  {isSpanish ? "Desglose por Artículo" : "Itemized Dimensions"}
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-[11px] text-slate-600">
                  {shippingResult.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60"
                    >
                      <span className="truncate max-w-[200px] sm:max-w-[280px] font-medium text-slate-800">
                        {item.quantity}× {item.title}
                      </span>
                      <span className="text-slate-400 text-[10px] tabular-nums shrink-0">
                        {item.length}×{item.width}×{item.height} cm • {item.totalGrossWeight.toFixed(2)} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourierSelector;
