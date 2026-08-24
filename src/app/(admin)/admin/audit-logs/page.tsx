"use client";

import React, { useState } from "react";
import {
  Download,
  Eye,
  Lock,
  Clock,
  FileCode,
  Copy,
  ShieldAlert,
  Sliders,
  Package,
  Activity,
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
      STAFF_INVITED: { label: "STAFF INVITED", tone: "blue", bg: "bg-[#EEF4FF] dark:bg-blue-950/60", text: "text-[#2F65F6]", border: "border-blue-200 dark:border-blue-900/40" },
      ROLE_CHANGED: { label: "ROLE CHANGED", tone: "purple", bg: "bg-[#F3E8FF] dark:bg-purple-950/60", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-900/40" },
      ACCOUNT_STATUS_CHANGED: { label: "STATUS CHANGED", tone: "amber", bg: "bg-[#FFF8EE] dark:bg-amber-950/60", text: "text-amber-600 dark:text-amber-400", border: "border-[#FED7AA] dark:border-amber-900/40" },
      PASSWORD_RESET_TRIGGERED: { label: "PASSWORD RESET", tone: "amber", bg: "bg-[#FFF8EE] dark:bg-amber-950/60", text: "text-amber-600 dark:text-amber-400", border: "border-[#FED7AA] dark:border-amber-900/40" },
      SETTINGS_CHANGED: { label: "SETTINGS SAVED", tone: "cyan", bg: "bg-[#EEF4FF] dark:bg-blue-950/60", text: "text-[#2F65F6]", border: "border-blue-200 dark:border-blue-900/40" },
      PRODUCT_CREATED: { label: "PRODUCT CREATED", tone: "emerald", bg: "bg-[#F0FDF4] dark:bg-emerald-950/60", text: "text-[#16A34A] dark:text-emerald-400", border: "border-[#BBF7D0] dark:border-emerald-900/40" },
      SUPPLIER_REGISTERED: { label: "SUPPLIER REGISTERED", tone: "emerald", bg: "bg-[#F0FDF4] dark:bg-emerald-950/60", text: "text-[#16A34A] dark:text-emerald-400", border: "border-[#BBF7D0] dark:border-emerald-900/40" },
      REFUND_ISSUED: { label: "REFUND ISSUED", tone: "red", bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-900/40" },
    };

    const c = config[action] || { label: action, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" };

    return (
      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 font-mono", c.bg, c.text, c.border)}>
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
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatDate(row.timestamp)}</div>
          <div className="text-[10px] text-slate-400">
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
          <div className="font-bold text-slate-900 dark:text-white text-xs">{row.adminName}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
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
        <span className="font-mono text-[11px] uppercase text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          {row.entityType}
        </span>
      ),
    },
    {
      header: "Entity ID",
      accessorKey: "entityId",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-[#2F65F6]">
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
          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 truncate block bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded border border-slate-200 dark:border-slate-800/80">
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
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.ipAddress}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-24",
      cell: (row) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setSelectedLog(row)}
            className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
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

  // Stats calculation
  const totalEvents = logs.length;
  const staffChanges = logs.filter((l) => l.action.includes("STAFF") || l.action.includes("ROLE") || l.action.includes("ACCOUNT") || l.action.includes("PASSWORD")).length;
  const settingChanges = logs.filter((l) => l.action.includes("SETTINGS")).length;
  const catalogChanges = logs.filter((l) => l.action.includes("PRODUCT") || l.action.includes("SUPPLIER")).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Audit Logs &amp; System History"
        subtitle="Immutable security trail logging all administrative role alterations, factory PO approvals, and global setting modifications."
        badge={{ text: "READ-ONLY AUDIT", variant: "blue" }}
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Audit Logs" }]}
        actions={[
          {
            label: "Export Audit CSV",
            onClick: handleExportCsv,
            icon: Download,
            variant: "primary",
          },
        ]}
      />

      {/* ── 2. Top Summary KPI Cards (Pastels) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Logged Events
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {totalEvents} Audit Records
            </span>
            <span className="text-[11px] font-bold text-[#2F65F6] block mt-0.5">
              100% Immutable Trail
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Staff & Governance Changes */}
        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Staff &amp; RBAC Events
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {staffChanges} Permissions Logged
            </span>
            <span className="text-[11px] font-bold text-rose-600 block mt-0.5">
              Role &amp; access adjustments
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* System Settings Changes */}
        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              System Settings Saved
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {settingChanges} Adjustments
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Thresholds &amp; maintenance
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        {/* Catalogue & Sourcing */}
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Catalogue &amp; Sourcing
            </span>
            <span className="text-xl font-black text-[#16A34A] dark:text-emerald-400 font-mono mt-0.5 block">
              {catalogChanges} Factory Events
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Products &amp; supplier POs
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Header Security Banner ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EEF4FF] dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/30 text-[#2F65F6] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Cryptographic Integrity Active
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit records are written directly to immutable Supabase Postgres logs with RLS protection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5 text-[#2F65F6]" />
          <span>Retention: 365 Days</span>
        </div>
      </div>

      {/* ── 4. Data Table (Read-Only) ── */}
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

      {/* ── 5. Detailed JSON Modal ── */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Event Inspection"
        size="xl"
      >
        {selectedLog && (
          <div className="space-y-5 pt-1 text-xs text-slate-900 dark:text-slate-100">
            {/* Operator and Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Admin Operator</span>
                <div className="font-bold text-slate-900 dark:text-white text-xs">{selectedLog.adminName}</div>
                <div className="font-mono text-slate-500 dark:text-slate-400">{selectedLog.adminEmail}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Action &amp; Entity</span>
                <div>{renderActionBadge(selectedLog.action)}</div>
                <div className="font-mono text-slate-600 dark:text-slate-300 mt-1">
                  Entity: <span className="text-[#2F65F6] font-bold">{selectedLog.entityType} ({selectedLog.entityId})</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Timestamp (UTC)</span>
                <div className="font-mono text-slate-700 dark:text-slate-200">{formatDateTime(selectedLog.timestamp)}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">IP Origin</span>
                <div className="font-mono text-slate-700 dark:text-slate-200">{selectedLog.ipAddress}</div>
              </div>
            </div>

            {/* Changes JSON Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#16A34A] dark:text-emerald-400" />
                  <span>Payload Diff (JSON Changes)</span>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedLog.changes, null, 2));
                    showToast("JSON payload copied to clipboard.");
                  }}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 font-normal text-[11px] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </button>
              </div>

              <pre className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl font-mono text-[11px] text-[#16A34A] dark:text-emerald-300 overflow-x-auto max-h-64 leading-relaxed">
                {JSON.stringify(selectedLog.changes, null, 2)}
              </pre>
            </div>

            {/* User Agent String */}
            <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                Client User Agent
              </span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all">
                {selectedLog.userAgent}
              </span>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] shadow-blue-500/25 shadow-xs transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── 6. Toast Notification Bar ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
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
