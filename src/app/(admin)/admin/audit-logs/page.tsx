"use client";

import React, { useState } from "react";
import {
  Download,
  Eye,
  Lock,
  Clock,
  FileCode,
  Copy,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption } from "@/components/admin/AdminDataTable";
import { BadgeTone } from "@/components/admin/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatDateTime, cn } from "@/utils/helpers";

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminName: string;
  action:
    | "STAFF_INVITED"
    | "ROLE_CHANGED"
    | "ACCOUNT_STATUS_CHANGED"
    | "PASSWORD_RESET_TRIGGERED"
    | "SETTINGS_CHANGED"
    | "PRODUCT_CREATED"
    | "SUPPLIER_REGISTERED"
    | "REFUND_ISSUED";
  entityType: "staff" | "user_role" | "product" | "supplier" | "store_settings" | "order";
  entityId: string;
  changes: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "aud-101",
    timestamp: "2026-08-24T06:14:22.000Z",
    adminEmail: "arifur.lead@lennoxchinamall.com",
    adminName: "Arifur Rahman (Admin Lead)",
    action: "ROLE_CHANGED",
    entityType: "user_role",
    entityId: "stf-3",
    changes: {
      field: "role",
      previous: "support_agent",
      current: "order_manager",
      reason: "Promoted to oversee air cargo fulfillment operations",
    },
    ipAddress: "116.6.98.14",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/127.0.0.0",
  },
  {
    id: "aud-102",
    timestamp: "2026-08-24T05:30:10.000Z",
    adminEmail: "arifur.lead@lennoxchinamall.com",
    adminName: "Arifur Rahman (Admin Lead)",
    action: "SETTINGS_CHANGED",
    entityType: "store_settings",
    entityId: "settings_global",
    changes: {
      freeAirShippingThreshold: { previous: 80.0, current: 75.0 },
      maintenanceMode: { previous: false, current: false },
    },
    ipAddress: "116.6.98.14",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/127.0.0.0",
  },
  {
    id: "aud-103",
    timestamp: "2026-08-23T22:45:00.000Z",
    adminEmail: "chen.wei@lennoxchinamall.com",
    adminName: "Chen Wei (Catalogue)",
    action: "PRODUCT_CREATED",
    entityType: "product",
    entityId: "prod-1",
    changes: {
      title: "Eachine EX5 4K GPS Drone",
      sku: "EAC-EX5-4K-BLK",
      base_price: 89.99,
      supplier_code: "SUP-GZ-4419",
      dual_video_count: 2,
    },
    ipAddress: "183.14.132.88",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
  {
    id: "aud-104",
    timestamp: "2026-08-23T18:12:30.000Z",
    adminEmail: "arifur.lead@lennoxchinamall.com",
    adminName: "Arifur Rahman (Admin Lead)",
    action: "STAFF_INVITED",
    entityType: "staff",
    entityId: "stf-4",
    changes: {
      email: "sarah.lin@lennoxchinamall.com",
      role: "support_agent",
      invitedBy: "arifur.lead@lennoxchinamall.com",
    },
    ipAddress: "116.6.98.14",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "aud-105",
    timestamp: "2026-08-23T14:05:12.000Z",
    adminEmail: "marcus.vance@lennoxchinamall.com",
    adminName: "Marcus Vance (Fulfilment)",
    action: "REFUND_ISSUED",
    entityType: "order",
    entityId: "LCM-20260812-44DD",
    changes: {
      rmaNumber: "RMA-2026-0812",
      amountUSDT: 59.99,
      reason: "Right channel subwoofer distortion confirmed via video",
    },
    ipAddress: "24.180.44.190",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "aud-106",
    timestamp: "2026-08-22T09:20:45.000Z",
    adminEmail: "chen.wei@lennoxchinamall.com",
    adminName: "Chen Wei (Catalogue)",
    action: "SUPPLIER_REGISTERED",
    entityType: "supplier",
    entityId: "SUP-GZ-4419",
    changes: {
      code: "SUP-GZ-4419",
      name: "Guangzhou Eachine Drone Mfg",
      platform: "1688 Direct B2B",
      region: "Guangzhou, Guangdong",
    },
    ipAddress: "183.14.132.88",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "aud-107",
    timestamp: "2026-08-21T16:40:19.000Z",
    adminEmail: "arifur.lead@lennoxchinamall.com",
    adminName: "Arifur Rahman (Admin Lead)",
    action: "PASSWORD_RESET_TRIGGERED",
    entityType: "staff",
    entityId: "stf-2",
    changes: {
      targetUser: "chen.wei@lennoxchinamall.com",
      status: "reset_link_dispatched",
    },
    ipAddress: "116.6.98.14",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "aud-108",
    timestamp: "2026-08-20T11:15:02.000Z",
    adminEmail: "arifur.lead@lennoxchinamall.com",
    adminName: "Arifur Rahman (Admin Lead)",
    action: "ACCOUNT_STATUS_CHANGED",
    entityType: "staff",
    entityId: "user-suspend-09",
    changes: {
      targetUser: "former.contractor@external.io",
      status: "suspended",
      reason: "Contract expired",
    },
    ipAddress: "116.6.98.14",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
];

export default function AdminAuditLogsPage() {
  const [logs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = ["Timestamp", "Admin Email", "Admin Name", "Action", "Entity Type", "Entity ID", "IP Address", "Changes JSON"];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.adminEmail}"`,
      `"${l.adminName}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.ipAddress}"`,
      `"${JSON.stringify(l.changes).replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LCM_Immutable_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Audit logs exported to CSV.");
  };

  // Action Badge Helper
  const renderActionBadge = (action: AuditLogItem["action"]) => {
    const config: Record<
      AuditLogItem["action"],
      { label: string; tone: BadgeTone; bg: string; text: string; border: string }
    > = {
      STAFF_INVITED: { label: "STAFF INVITED", tone: "blue", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
      ROLE_CHANGED: { label: "ROLE CHANGED", tone: "purple", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
      ACCOUNT_STATUS_CHANGED: { label: "STATUS CHANGED", tone: "amber", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
      PASSWORD_RESET_TRIGGERED: { label: "PASSWORD RESET", tone: "amber", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
      SETTINGS_CHANGED: { label: "SETTINGS SAVED", tone: "cyan", bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/30" },
      PRODUCT_CREATED: { label: "PRODUCT CREATED", tone: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
      SUPPLIER_REGISTERED: { label: "SUPPLIER REGISTERED", tone: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
      REFUND_ISSUED: { label: "REFUND ISSUED", tone: "red", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
    };

    const c = config[action] || { label: action, bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700" };

    return (
      <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 font-mono", c.bg, c.text, c.border)}>
        <span>{c.label}</span>
      </span>
    );
  };

  // Columns Definition
  const columns: Column<AuditLogItem>[] = [
    {
      header: "Timestamp (UTC)",
      accessorKey: "timestamp",
      sortable: true,
      className: "w-44",
      cell: (row) => (
        <div className="space-y-0.5 font-mono">
          <div className="text-xs font-bold text-slate-200">{formatDate(row.timestamp)}</div>
          <div className="text-[10px] text-slate-500">
            {new Date(row.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} UTC
          </div>
        </div>
      ),
    },
    {
      header: "Admin Operator",
      accessorKey: "adminEmail",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-white text-xs">{row.adminName}</div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <span>{row.adminEmail}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Action Executed",
      accessorKey: "action",
      sortable: true,
      cell: (row) => renderActionBadge(row.action),
    },
    {
      header: "Entity Type",
      accessorKey: "entityType",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[11px] uppercase text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {row.entityType}
        </span>
      ),
    },
    {
      header: "Entity ID",
      accessorKey: "entityId",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-[#FF1028]">
          {row.entityId}
        </span>
      ),
    },
    {
      header: "Changes Summary",
      accessorKey: "changes",
      className: "max-w-[220px]",
      cell: (row) => {
        const previewStr = JSON.stringify(row.changes).replace(/"/g, "").slice(1, -1);
        return (
          <span className="font-mono text-[11px] text-slate-400 line-clamp-1 truncate block bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
            {previewStr}
          </span>
        );
      },
    },
    {
      header: "IP Address",
      accessorKey: "ipAddress",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-400">{row.ipAddress}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-24",
      cell: (row) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setSelectedLog(row)}
            className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      ),
    },
  ];

  // Filters Definition
  const filters: FilterOption[] = [
    {
      key: "action",
      label: "Action Type",
      options: [
        { value: "STAFF_INVITED", label: "Staff Invited" },
        { value: "ROLE_CHANGED", label: "Role Changed" },
        { value: "ACCOUNT_STATUS_CHANGED", label: "Status Changed" },
        { value: "PASSWORD_RESET_TRIGGERED", label: "Password Reset" },
        { value: "SETTINGS_CHANGED", label: "Settings Changed" },
        { value: "PRODUCT_CREATED", label: "Product Created" },
        { value: "SUPPLIER_REGISTERED", label: "Supplier Registered" },
        { value: "REFUND_ISSUED", label: "Refund Issued" },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Audit Logs & System History"
        subtitle="Immutable security trail logging all administrative role alterations, factory PO approvals, and global setting modifications."
        badge={{ text: "READ-ONLY AUDIT", variant: "blue" }}
        breadcrumbs={[{ label: "Audit Logs" }]}
        actions={[
          {
            label: "Export Audit CSV",
            onClick: handleExportCsv,
            icon: Download,
            variant: "primary",
          },
        ]}
      />

      {/* ── 2. Header Security Banner ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Cryptographic Integrity Active
            </h4>
            <p className="text-xs text-slate-400">
              Audit records are written directly to immutable Supabase Postgres logs with RLS protection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Retention: 365 Days</span>
        </div>
      </div>

      {/* ── 3. Data Table (Read-Only) ── */}
      <AdminDataTable<AuditLogItem>
        data={logs}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search logs by admin email, entity ID, or type..."
        searchFields={["adminEmail", "adminName", "entityId", "entityType", "ipAddress"]}
        filters={filters}
        defaultSortKey="timestamp"
        defaultSortDirection="desc"
        onExportCsv={handleExportCsv}
        emptyTitle="No audit logs found"
        emptyDescription="All administrative events and role changes will automatically appear here."
      />

      {/* ── 4. Detailed JSON Modal ── */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Event Inspection"
        size="xl"
      >
        {selectedLog && (
          <div className="space-y-6 pt-2 text-xs">
            {/* Operator and Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Admin Operator</span>
                <div className="font-bold text-white text-xs">{selectedLog.adminName}</div>
                <div className="font-mono text-slate-400">{selectedLog.adminEmail}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Action & Entity</span>
                <div>{renderActionBadge(selectedLog.action)}</div>
                <div className="font-mono text-slate-300 mt-1">
                  Entity: <span className="text-[#FF1028] font-bold">{selectedLog.entityType} ({selectedLog.entityId})</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Timestamp (UTC)</span>
                <div className="font-mono text-slate-200">{formatDateTime(selectedLog.timestamp)}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">IP Origin</span>
                <div className="font-mono text-slate-200">{selectedLog.ipAddress}</div>
              </div>
            </div>

            {/* Changes JSON Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>Payload Diff (JSON Changes)</span>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedLog.changes, null, 2));
                    showToast("JSON payload copied to clipboard.");
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1 font-normal text-[11px] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </button>
              </div>

              <pre className="bg-slate-950 border border-slate-800 p-4 rounded-2xl font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-64 leading-relaxed">
                {JSON.stringify(selectedLog.changes, null, 2)}
              </pre>
            </div>

            {/* User Agent String */}
            <div className="space-y-1 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Client User Agent
              </span>
              <span className="font-mono text-[11px] text-slate-400 break-all">
                {selectedLog.userAgent}
              </span>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── 5. Toast Notification Bar ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span>✓ {toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
