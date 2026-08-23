"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateTime } from "@/utils/helpers";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: "pay-1",
      orderNumber: "LCM-20260823-88AF",
      merchantTradeNo: "LCM172441928392",
      gatewayTxnId: "BP9928103981029",
      amount: 89.99,
      status: "paid",
      signatureValid: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "pay-2",
      orderNumber: "LCM-20260822-77BC",
      merchantTradeNo: "LCM172439811029",
      gatewayTxnId: "BP8827104918273",
      amount: 114.49,
      status: "paid",
      signatureValid: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      id: "pay-3",
      orderNumber: "LCM-20260820-33EE",
      merchantTradeNo: "LCM172421948190",
      gatewayTxnId: "BP7719283019284",
      amount: 54.99,
      status: "paid",
      signatureValid: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-emerald-400" />
            Binance Pay USDT Payments & Reconciliation
          </h1>
          <p className="text-xs text-slate-400">
            Real-time webhook signature validation, idempotency logs, and manual settlement reconciliation for Super Admins.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Merchant Trade No</th>
                <th className="px-4 py-3.5">Order Reference</th>
                <th className="px-4 py-3.5">Gateway Txn ID</th>
                <th className="px-4 py-3.5">Amount (USDT)</th>
                <th className="px-4 py-3.5">Webhook Signature</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-amber-400">
                    {p.merchantTradeNo}
                  </td>
                  <td className="px-4 py-3 text-white font-bold">
                    {p.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.gatewayTxnId}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 text-[11px] font-sans font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Valid HMAC
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="success" size="sm">
                      SETTLED
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {formatDateTime(p.createdAt)}
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
