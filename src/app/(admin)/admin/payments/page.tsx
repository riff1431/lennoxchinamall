"use client";

import React, { useState } from "react";
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatCurrency, formatDateTime } from "@/utils/helpers";

interface PaymentRecord {
  id: string;
  orderNumber: string;
  merchantTradeNo: string;
  gatewayTxnId: string;
  amount: number;
  status: "paid" | "pending" | "refunded";
  signatureValid: boolean;
  createdAt: string;
}

const INITIAL_PAYMENTS: PaymentRecord[] = [
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
  const toast = useAdminToast();
  const [payments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);

  const columns: Column<PaymentRecord>[] = [
    {
      header: "Order & Trade ID",
      accessorKey: "orderNumber",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-slate-900 dark:text-white block text-xs">
            #{row.orderNumber}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span>{row.merchantTradeNo}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(row.merchantTradeNo);
                toast.info(`Copied trade number.`);
              }}
              className="text-slate-400 hover:text-[#2F65F6] p-0.5 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      header: "Binance Txn ID",
      accessorKey: "gatewayTxnId",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2F65F6] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/40">
          {row.gatewayTxnId}
        </span>
      ),
    },
    {
      header: "Settlement (USDT)",
      accessorKey: "amount",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: "HMAC-SHA512 Signature",
      accessorKey: "signatureValid",
      cell: (row) =>
        row.signatureValid ? (
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            <CheckCircle2 className="w-3 h-3" /> VALID
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            INVALID
          </span>
        ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <StatusBadge
          status={row.status}
          tone={row.status === "paid" ? "emerald" : "amber"}
        />
      ),
    },
    {
      header: "Timestamp",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-500">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={`txn "${row.gatewayTxnId}"`}
            customActions={[
              {
                label: "Copy Txn ID",
                icon: Copy,
                onClick: () => {
                  navigator.clipboard.writeText(row.gatewayTxnId);
                  toast.info("Copied transaction ID.");
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: "status",
      label: "Settlement Status",
      options: [
        { value: "paid", label: "Paid & Settled" },
        { value: "pending", label: "Pending Confirmation" },
      ],
    },
  ];

  const bulkActions: BulkAction<PaymentRecord>[] = [
    {
      label: "Export Selected",
      icon: Download,
      variant: "default",
      onClick: (selected) => {
        const headers = "OrderNumber,MerchantTradeNo,TxnID,Amount,Status\n";
        const rows = selected.map((s) => `"${s.orderNumber}","${s.merchantTradeNo}","${s.gatewayTxnId}",${s.amount},"${s.status}"`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "payments_export.csv";
        a.click();
        toast.success(`Exported ${selected.length} payment records.`);
      },
    },
  ];

  const totalSettled = payments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Binance Pay USDT Settlement Ledger"
        subtitle="Real-time HMAC-SHA512 webhook signature validation, idempotency audit logs, and crypto transaction reconciliation."
        badge={{ text: "HMAC-SHA512 Webhook Online", variant: "emerald" }}
        breadcrumbs={[
          { label: "Orders & Fulfilment", href: "/admin/orders" },
          { label: "Payment Ledger" },
        ]}
      />

      {/* ── 2. Top KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Settled (USDT)
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {formatCurrency(totalSettled)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              HMAC Signature Validity
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              100% Verified
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Gateway Idempotency
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              Zero Collisions
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Reusable AdminDataTable ── */}
      <AdminDataTable<PaymentRecord>
        data={payments}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by Order #, Merchant Trade No, or Binance Txn..."
        searchFields={["orderNumber", "merchantTradeNo", "gatewayTxnId"]}
        filters={filterOptions}
        bulkActions={bulkActions}
        defaultSortKey="createdAt"
        defaultSortDirection="desc"
        emptyTitle="No payment transactions found"
        emptyDescription="Completed USDT customer settlements will be recorded here."
      />
    </div>
  );
}
