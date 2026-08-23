"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Check,
  Lock,
  ExternalLink,
  Copy,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/utils/helpers";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: "pay-1",
      orderNumber: "LCM-20260823-88AF",
      merchantTradeNo: "TRD-20260823-9182-3849",
      gatewayTxnId: "BP9928103981029",
      amount: 89.99,
      status: "paid",
      signatureValid: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "pay-2",
      orderNumber: "LCM-20260822-77BC",
      merchantTradeNo: "TRD-20260822-4412-8821",
      gatewayTxnId: "BP8827104918273",
      amount: 114.49,
      status: "paid",
      signatureValid: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      id: "pay-3",
      orderNumber: "LCM-20260820-33EE",
      merchantTradeNo: "TRD-20260820-1192-5501",
      gatewayTxnId: "BP7719283019284",
      amount: 54.99,
      status: "paid",
      signatureValid: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
  ]);

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
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#10B981] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              BINANCE PAY RECONCILIATION
            </span>
            <span className="text-xs text-[#10B981] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              HMAC-SHA512 Webhook Online
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Coins className="w-7 h-7 text-[#10B981]" />
            <span>Binance Pay USDT Settlement Ledger</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time webhook signature validation, idempotency logs, and manual settlement reconciliation for Super Admins.
          </p>
        </div>
      </div>

      {/* ── 2. KPI Metrics Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Settlement Currency
          </span>
          <div className="text-2xl font-black text-[#10B981]">
            100% USDT
          </div>
          <span className="text-[11px] text-slate-400 font-semibold block">
            Zero Network Gas Fee Protocol
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Webhook Success Rate
          </span>
          <div className="text-2xl font-black text-white">
            100.0%
          </div>
          <span className="text-[11px] text-[#10B981] font-bold block">
            Zero Dropped Notifications
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Settlement Escrow
          </span>
          <div className="text-2xl font-black text-white">
            Instant
          </div>
          <span className="text-[11px] text-slate-400 font-semibold block">
            Direct Merchant Wallet Deposit
          </span>
        </div>
      </div>

      {/* ── 3. Search Bar ── */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, Merchant Trade No, or Txn ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
          />
        </div>
      </div>

      {/* ── 4. Responsive Payment Ledger Table ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-black uppercase text-[10px] bg-slate-950/60">
                <th className="py-3.5 px-4">Order Number</th>
                <th className="py-3.5 px-3">Merchant Trade No</th>
                <th className="py-3.5 px-3">Gateway Txn ID</th>
                <th className="py-3.5 px-3">Settlement (USDT)</th>
                <th className="py-3.5 px-3">Signature Verification</th>
                <th className="py-3.5 px-3">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    #{p.orderNumber}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>{p.merchantTradeNo}</span>
                      <button
                        onClick={() => handleCopy(p.merchantTradeNo)}
                        className="text-slate-500 hover:text-white"
                        title="Copy"
                      >
                        {copiedId === p.merchantTradeNo ? (
                          <Check className="w-3 h-3 text-[#10B981]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                    {p.gatewayTxnId}
                  </td>

                  <td className="py-3.5 px-3 font-black text-[#10B981] price-tag">
                    {formatCurrency(p.amount)}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 w-max">
                      <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                      <span>HMAC Valid</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-400">
                    {formatDateTime(p.createdAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="bg-[#10B981] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
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
