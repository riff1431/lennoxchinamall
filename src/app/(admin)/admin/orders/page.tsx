"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";
import { MOCK_ORDERS, MOCK_PRODUCTS } from "@/lib/mockData";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-500" />
            Order Sourcing & Fulfilment Management
          </h1>
          <p className="text-xs text-slate-400">
            Track customer orders, move lifecycle status from paid → sourcing → shipped, and record courier tracking numbers.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Order Number</th>
                <th className="px-4 py-3.5">Customer & Items</th>
                <th className="px-4 py-3.5">Settlement (USDT)</th>
                <th className="px-4 py-3.5">Sourcing Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-orange-400">
                    {o.order_number}
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-bold text-white block">John Doe</span>
                    <span className="text-[10px] text-slate-400">
                      1x Eachine EX5 4K GPS Drone
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {formatCurrency(o.total)}
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        o.status === "shipped"
                          ? "success"
                          : o.status === "sourcing"
                          ? "warning"
                          : "info"
                      }
                      size="sm"
                    >
                      {ORDER_STATUS_LABELS[o.status] || o.status}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-slate-400">
                    {formatDate(o.created_at)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        onClick={() =>
                          alert(`Update tracking for ${o.order_number}`)
                        }
                        variant="outline"
                        size="sm"
                        className="text-xs bg-slate-950 border-slate-800 text-slate-200"
                      >
                        Update Tracking
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
