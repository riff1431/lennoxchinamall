"use client";

import React from "react";
import {
  RotateCcw,
  Check,
  EyeOff,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export type WidgetId =
  | "kpis"
  | "chart"
  | "tasks"
  | "recentOrders"
  | "topProducts"
  | "lowStock"
  | "sourcing"
  | "payments"
  | "orderDistribution";

export interface WidgetConfig {
  id: WidgetId;
  label: string;
  description: string;
  enabled: boolean;
  category: "analytics" | "operations" | "financial" | "inventory";
}

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "kpis",
    label: "Key Performance Indicators (KPIs)",
    description: "Revenue, orders, customer signups, profit margin, pending USDT & low stock cards.",
    enabled: true,
    category: "financial",
  },
  {
    id: "tasks",
    label: "Action Required / Priority Queue",
    description: "Automated queue for pending sourcing dispatches, out-of-stock alerts, and urgent tasks.",
    enabled: true,
    category: "operations",
  },
  {
    id: "chart",
    label: "Sales & Financial Telemetry Chart",
    description: "Interactive spline/bar/line graph with metric switching and comparison baseline.",
    enabled: true,
    category: "analytics",
  },
  {
    id: "recentOrders",
    label: "Recent Customer Orders Ledger",
    description: "Live feed of newest orders with customer, payment, waybill carrier, and action menu.",
    enabled: true,
    category: "operations",
  },
  {
    id: "sourcing",
    label: "China Supply Chain & Sourcing Queue",
    description: "Pending 1688 manufacturer purchases, Shenzhen/Guangzhou export hubs, and lead times.",
    enabled: true,
    category: "operations",
  },
  {
    id: "topProducts",
    label: "Top-Selling Hardware Catalog",
    description: "Leaderboard of top drones, smart devices, and cameras by revenue and units sold.",
    enabled: true,
    category: "inventory",
  },
  {
    id: "lowStock",
    label: "Low-Stock Inventory SKU Alerts",
    description: "Safety threshold monitoring with instant restock and supplier reorder triggers.",
    enabled: true,
    category: "inventory",
  },
  {
    id: "payments",
    label: "Binance Pay USDT Settlement Stream",
    description: "HMAC-SHA512 verified crypto transactions, on-chain confirmations, and gateway audits.",
    enabled: true,
    category: "financial",
  },
  {
    id: "orderDistribution",
    label: "Order Status Lifecycle Distribution",
    description: "Breakdown of orders across Paid, Sourcing, QC Packaging, In Flight, and Delivered.",
    enabled: true,
    category: "analytics",
  },
];

interface DashboardLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onUpdateWidgets: (newWidgets: WidgetConfig[]) => void;
}

export function DashboardLayoutModal({
  isOpen,
  onClose,
  widgets,
  onUpdateWidgets,
}: DashboardLayoutModalProps) {
  const handleToggleWidget = (id: WidgetId) => {
    onUpdateWidgets(
      widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;
    const newWidgets = [...widgets];
    const temp = newWidgets[index];
    newWidgets[index] = newWidgets[targetIndex];
    newWidgets[targetIndex] = temp;
    onUpdateWidgets(newWidgets);
  };

  const handleResetDefaults = () => {
    onUpdateWidgets(DEFAULT_WIDGETS);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Admin Dashboard Layout"
      size="lg"
    >
      <div className="space-y-5 pt-1">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">
            Rearrange and toggle visibility of overview widgets. Your preferences are saved automatically.
          </p>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-slate-500 hover:text-[#2F65F6] font-bold text-xs cursor-pointer shrink-0 ml-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {widgets.map((widget, idx) => (
            <div
              key={widget.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                widget.enabled
                  ? "bg-slate-50/80 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                  : "bg-slate-50/30 dark:bg-slate-950/40 border-dashed border-slate-200 dark:border-slate-800/60 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleWidget(widget.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                    widget.enabled
                      ? "bg-[#2F65F6] text-white shadow-xs"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {widget.enabled ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs font-heading">
                      {widget.label}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500">
                      {widget.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md">
                    {widget.description}
                  </p>
                </div>
              </div>

              {/* Order buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === widgets.length - 1}
                  onClick={() => handleMove(idx, "down")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer"
          >
            Apply Layout
          </button>
        </div>
      </div>
    </Modal>
  );
}
