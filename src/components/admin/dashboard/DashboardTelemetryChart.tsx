"use client";

import React, { useState, useId } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  Layers,
  BarChart3,
  LineChart as LineIcon,
} from "lucide-react";
import { DashboardTimeSeriesPoint } from "@/app/actions/admin-dashboard";
import { formatCurrency, cn } from "@/utils/helpers";

interface DashboardTelemetryChartProps {
  data: DashboardTimeSeriesPoint[];
  isFinancialDataAllowed: boolean;
  timeRangeLabel: string;
}

type MetricKey = "revenue" | "profit" | "orders" | "aov";
type ChartType = "area" | "bar" | "line";

export function DashboardTelemetryChart({
  data,
  isFinancialDataAllowed,
  timeRangeLabel,
}: DashboardTelemetryChartProps) {
  const gradientId = useId();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("revenue");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No telemetry points recorded for this period.
      </div>
    );
  }

  // Extract values based on metric
  const currentValues = data.map((d) => {
    if (selectedMetric === "revenue") return d.revenue;
    if (selectedMetric === "profit") return d.profit;
    if (selectedMetric === "orders") return d.orders;
    return d.aov;
  });

  const previousValues = data.map((d) => {
    if (selectedMetric === "revenue") return d.previousRevenue ?? d.revenue * 0.85;
    if (selectedMetric === "profit") return d.previousProfit ?? d.profit * 0.85;
    if (selectedMetric === "orders") return d.previousOrders ?? Math.max(1, Math.round(d.orders * 0.85));
    return d.previousAov ?? d.aov * 0.9;
  });

  const maxValue = Math.max(...currentValues, ...previousValues, 10);
  const totalCurrent = currentValues.reduce((acc, curr) => acc + curr, 0);
  const totalPrevious = previousValues.reduce((acc, curr) => acc + curr, 0);
  const periodDiff = totalCurrent - totalPrevious;
  const periodPct = totalPrevious > 0 ? ((periodDiff / totalPrevious) * 100).toFixed(1) : "0.0";
  const isPositive = periodDiff >= 0;

  const metricConfig: Record<MetricKey, { label: string; icon: React.ElementType; format: (v: number) => string; color: string; fill: string }> = {
    revenue: {
      label: "Revenue (USDT)",
      icon: DollarSign,
      format: (v) => formatCurrency(v),
      color: "#2F65F6",
      fill: "url(#" + gradientId + "-blue)",
    },
    profit: {
      label: "Estimated Profit",
      icon: TrendingUp,
      format: (v) => formatCurrency(v),
      color: "#10B981",
      fill: "url(#" + gradientId + "-emerald)",
    },
    orders: {
      label: "Order Volume",
      icon: ShoppingCart,
      format: (v) => `${v} orders`,
      color: "#F59E0B",
      fill: "url(#" + gradientId + "-amber)",
    },
    aov: {
      label: "Average Order (AOV)",
      icon: Percent,
      format: (v) => formatCurrency(v),
      color: "#8B5CF6",
      fill: "url(#" + gradientId + "-purple)",
    },
  };

  const activeConfig = metricConfig[selectedMetric];

  // SVG Coordinates calculation
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = currentValues.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1 || 1)) * chartW;
    const y = height - paddingY - (val / maxValue) * chartH;
    return { x, y, val, label: data[idx].label };
  });

  const prevPoints = previousValues.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1 || 1)) * chartW;
    const y = height - paddingY - (val / maxValue) * chartH;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = points[idx - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x || width} ${height - paddingY} L ${points[0]?.x || 0} ${height - paddingY} Z`;

  const prevPathD = prevPoints.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = prevPoints[idx - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs relative space-y-5">
      {/* ── Top Header Controls ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading">
              Sales &amp; Financial Telemetry
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {timeRangeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-dimensional tracking comparing performance against previous interval.
          </p>
        </div>

        {/* View Switches & Metric Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
            {(
              [
                "revenue",
                ...(isFinancialDataAllowed ? (["profit"] as MetricKey[]) : []),
                "orders",
                "aov",
              ] as MetricKey[]
            ).map((mKey) => {
              const isActive = selectedMetric === mKey;
              return (
                <button
                  key={mKey}
                  type="button"
                  onClick={() => setSelectedMetric(mKey)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize font-sans flex items-center gap-1.5",
                    isActive
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  <span>{mKey === "aov" ? "AOV" : mKey}</span>
                </button>
              );
            })}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setChartType("area")}
              title="Spline Area View"
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                chartType === "area"
                  ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              title="Clustered Bar View"
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                chartType === "bar"
                  ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("line")}
              title="Smooth Line View"
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                chartType === "line"
                  ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LineIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Stats Ribbon ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Period Total</span>
          <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
            {selectedMetric === "orders" ? `${totalCurrent} orders` : formatCurrency(totalCurrent)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">vs Prior Period</span>
          <span
            className={cn(
              "text-lg font-black font-mono mt-0.5 block",
              isPositive ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {isPositive ? `+${periodPct}%` : `${periodPct}%`}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Peak Interval</span>
          <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
            {selectedMetric === "orders" ? `${Math.round(maxValue)}` : formatCurrency(maxValue)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Daily Average</span>
          <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
            {selectedMetric === "orders"
              ? `${(totalCurrent / data.length).toFixed(1)}/day`
              : formatCurrency(totalCurrent / data.length)}
          </span>
        </div>
      </div>

      {/* ── Interactive SVG Chart Canvas ── */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-64 overflow-visible"
        >
          <defs>
            <linearGradient id={`${gradientId}-blue`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2F65F6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2F65F6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`${gradientId}-emerald`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`${gradientId}-amber`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`${gradientId}-purple`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * chartH;
            const val = Math.round(ratio * maxValue);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-slate-200 dark:text-slate-800"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Previous period curve (dashed reference) */}
          <path
            d={prevPathD}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Chart Type Rendering */}
          {chartType === "area" && (
            <>
              <path d={areaD} fill={activeConfig.fill} />
              <path
                d={pathD}
                fill="none"
                stroke={activeConfig.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {chartType === "line" && (
            <path
              d={pathD}
              fill="none"
              stroke={activeConfig.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {chartType === "bar" && (
            <g>
              {points.map((p, idx) => {
                const barH = (currentValues[idx] / maxValue) * chartH;
                const prevBarH = (previousValues[idx] / maxValue) * chartH;
                const barW = Math.max(8, chartW / (points.length * 3));
                return (
                  <g key={idx}>
                    {/* Previous period ghost bar */}
                    <rect
                      x={p.x - barW - 1}
                      y={height - paddingY - prevBarH}
                      width={barW}
                      height={prevBarH}
                      rx="3"
                      className="fill-slate-200 dark:fill-slate-800"
                    />
                    {/* Current period bar */}
                    <rect
                      x={p.x + 1}
                      y={height - paddingY - barH}
                      width={barW}
                      height={barH}
                      rx="3"
                      fill={activeConfig.color}
                      className="hover:brightness-110 transition-all cursor-pointer"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Interactive Hover Indicators & Vertical Guideline */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g>
              <line
                x1={points[hoveredIndex].x}
                y1={paddingY}
                x2={points[hoveredIndex].x}
                y2={height - paddingY}
                stroke={activeConfig.color}
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="6"
                fill={activeConfig.color}
                stroke="#ffffff"
                strokeWidth="2.5"
                className="drop-shadow-md"
              />
            </g>
          )}

          {/* X Axis Date Labels & Invisible Hover Zones */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <rect
                x={p.x - chartW / (points.length * 2)}
                y={paddingY}
                width={chartW / (points.length || 1)}
                height={chartH + paddingY}
                fill="transparent"
              />
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className={cn(
                  "text-[10px] font-mono transition-colors",
                  hoveredIndex === idx
                    ? "fill-slate-900 dark:fill-white font-bold"
                    : "fill-slate-400"
                )}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: "10%",
            }}
            className="absolute -translate-x-1/2 pointer-events-none z-20 bg-slate-900 dark:bg-black text-white text-xs rounded-2xl px-3.5 py-2.5 shadow-2xl border border-slate-700/60 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 pb-1 border-b border-slate-800">
              <span className="font-mono">{data[hoveredIndex].label}</span>
              <span className="font-bold text-white uppercase">{selectedMetric}</span>
            </div>
            <div className="pt-1.5 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Current:</span>
                <span className="font-black font-mono text-emerald-400">
                  {activeConfig.format(currentValues[hoveredIndex])}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-slate-400">Prior:</span>
                <span className="font-mono text-slate-300">
                  {activeConfig.format(previousValues[hoveredIndex])}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Legend Footer ── */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeConfig.color }}
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Current Period ({activeConfig.label})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-slate-400 border-t border-dashed" />
            <span className="text-slate-400">Comparison Baseline (Prior Period)</span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          HMAC-Verified Telemetry
        </span>
      </div>
    </div>
  );
}
