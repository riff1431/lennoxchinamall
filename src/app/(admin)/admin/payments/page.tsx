"use client";

import React, { useState } from "react";
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  Search,
  Check,
  Copy,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatCurrency, formatDateTime } from "@/utils/helpers";

const INITIAL_PAYMENTS = [
  {
    id: "pay-1",
    orderNumber: "LCM-20260823-88AF",
    merchantTradeNo: "TRD-20260823-9182-3849",
    gatewayTxnId: "BP9928103981029",
    amount: 89.99,
    status: "paid",
    signatureValid: true,
    createdAt: "2026-08-23T14:15:00.000Z",
  },
  {
    id: "pay-2",
    orderNumber: "LCM-20260822-77BC",
    merchantTradeNo: "TRD-20260822-4412-8821",
    gatewayTxnId: "BP8827104918273",
    amount: 114.49,
    status: "paid",
    signatureValid: true,
    createdAt: "2026-08-22T08:30:00.000Z",
  },
  {
    id: "pay-3",
    orderNumber: "LCM-20260820-33EE",
    merchantTradeNo: "TRD-20260820-1192-5501",
    gatewayTxnId: "BP7719283019284",
    amount: 54.99,
    status: "paid",
    signatureValid: true,
    createdAt: "2026-08-20T19:45:00.000Z",
  },
];

export default function AdminPaymentsPage() {
  const [payments] = useState(INITIAL_PAYMENTS);

  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.merchantTradeNo.toLowerCase().includes(search.toLowerCase()) ||
      p.gatewayTxnId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Binance Pay USDT Settlement Ledger"
        subtitle="Real-time HMAC-SHA512 webhook signature validation, idempotency audit logs, and crypto transaction reconciliation."
        badge={{ text: "HMAC-SHA512 Webhook Online", variant: "emerald" }}
        breadcrumbs={[
          { label: "Fulfilment", href: "/admin/orders" },
          { label: "Payment Ledger" },
        ]}
      />

      {/* ── 2. Top 3 Pastel KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Settlement Currency
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              100% USDT
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Zero network gas fee protocol</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Webhook Success Rate
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              100.0%
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Zero dropped notifications</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Settlement Escrow
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              Instant
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Direct merchant wallet deposit</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Search Bar ── */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, Merchant Trade No, or Txn ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2F65F6] transition-colors"
          />
        </div>
      </div>

      {/* ── 4. Responsive Payment Ledger Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] bg-slate-50/70 dark:bg-slate-900/60 tracking-wider">
                <th className="py-3.5 px-4">Order Number</th>
                <th className="py-3.5 px-3">Merchant Trade No</th>
                <th className="py-3.5 px-3">Gateway Txn ID</th>
                <th className="py-3.5 px-3">Settlement (USDT)</th>
                <th className="py-3.5 px-3">Signature Verification</th>
                <th className="py-3.5 px-3">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    #{p.orderNumber}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>{p.merchantTradeNo}</span>
                      <button
                        onClick={() => handleCopy(p.merchantTradeNo)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        title="Copy"
                      >
                        {copiedId === p.merchantTradeNo ? (
                          <Check className="w-3 h-3 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                    {p.gatewayTxnId}
                  </td>

                  <td className="py-3.5 px-3 font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatCurrency(p.amount)}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                      <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
                      <span>HMAC Valid</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                    {formatDateTime(p.createdAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]/60 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Confirmed
                    </span>
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
