"use client";

import React, { useState } from "react";
import {
  Truck,
  Plus,
  Lock,
  ExternalLink,
  ShieldCheck,
  Building,
  Phone,
  Clock,
} from "lucide-react";
import { MOCK_SUPPLIERS, MOCK_PRODUCTS } from "@/lib/mockData";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-400" />
            Private Supplier Directory & Sourcing Codes
          </h1>
          <p className="text-xs text-slate-400">
            Confidential directory linking internal secret product codes to authenticated Chinese manufacturing lines.
          </p>
        </div>

        <Button
          onClick={() => alert("Open Add Supplier Modal")}
          variant="deal"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Factory Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-xs inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-500" />
                  {sup.code}
                </span>
                <h3 className="text-sm font-bold text-white mt-2 leading-snug">
                  {sup.name}
                </h3>
              </div>
              <Badge variant="success" size="sm">
                Active
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-500">Platform / Sourcing:</span>
                <span className="font-semibold text-slate-200">{sup.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Region:</span>
                <span className="text-slate-200">{sup.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Avg Factory Lead:</span>
                <span className="text-emerald-400 font-bold">
                  {sup.lead_time_days} business days
                </span>
              </div>
              <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                Contact: <strong className="text-slate-300">{sup.contact}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed italic">
              &ldquo;{sup.reliability_notes}&rdquo;
            </p>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <a
                href={sup.source_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Direct Supplier Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
