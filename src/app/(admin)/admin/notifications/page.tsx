"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Send,
  Plus,
  Edit2,
  Trash2,
  Users,
  Radio,
  Sparkles,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  BarChart3,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatTimeAgo, cn } from "@/utils/helpers";
import {
  getAdminBroadcasts,
  createAdminBroadcast,
  sendBroadcastNow,
  deleteBroadcast,
  getAdminOperationalAlerts,
  getNotificationDeliveryLogs,
  retryFailedDeliveryAction,
  getNotificationAnalytics,
  previewEmailTemplate,
  sendTestNotification,
} from "@/app/actions/admin-notifications";
import {
  NotificationBroadcast,
  NotificationDeliveryLog,
  NotificationAnalytics,
  OperationalAlert,
  NotificationCategory,
  NotificationChannel,
  TargetAudienceType,
} from "@/types/notifications";
import { BUILTIN_TEMPLATES } from "@/lib/notifications/email-template-engine";

type AdminTabKey = "broadcasts" | "operational" | "logs" | "templates" | "analytics";

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<AdminTabKey>("broadcasts");
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>([]);
  const [operationalAlerts, setOperationalAlerts] = useState<OperationalAlert[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<NotificationDeliveryLog[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State: Create / Edit Broadcast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NotificationBroadcast | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<NotificationCategory>("promotions");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [channels, setChannels] = useState<NotificationChannel[]>(["in_app"]);
  const [targetAudience, setTargetAudience] = useState<TargetAudienceType>("all_users");
  const [countryFilter, setCountryFilter] = useState("US,DE,GB");
  const [minOrdersFilter, setMinOrdersFilter] = useState(1);
  const [actionLabel, setActionLabel] = useState("Explore Deals");
  const [actionUrl, setActionUrl] = useState("/categories/flash-deals");
  const [publishStatus, setPublishStatus] = useState<"draft" | "scheduled" | "sent">("draft");
  const [scheduledAt, setScheduledAt] = useState("");

  // Modal State: Template Preview Studio
  const [previewTemplateKey, setPreviewTemplateKey] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Modal State: Log Error Details
  const [selectedLog, setSelectedLog] = useState<NotificationDeliveryLog | null>(null);

  // Delete Confirmations
  const [deleteTarget, setDeleteTarget] = useState<NotificationBroadcast | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Load Broadcasts
  const loadBroadcasts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminBroadcasts();
      if (res.success && res.broadcasts) {
        setBroadcasts(res.broadcasts);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load Operational Alerts
  const loadOperational = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminOperationalAlerts();
      if (res.success && res.alerts) {
        setOperationalAlerts(res.alerts);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load Delivery Logs
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getNotificationDeliveryLogs();
      if (res.success && res.logs) {
        setDeliveryLogs(res.logs);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load Analytics
  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getNotificationAnalytics();
      if (res.success && res.analytics) {
        setAnalytics(res.analytics);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "broadcasts") loadBroadcasts();
      else if (activeTab === "operational") loadOperational();
      else if (activeTab === "logs") loadLogs();
      else if (activeTab === "analytics") loadAnalytics();
      else if (activeTab === "templates") setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab, loadBroadcasts, loadOperational, loadLogs, loadAnalytics]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle("");
    setMessage("");
    setCategory("promotions");
    setPriority("normal");
    setChannels(["in_app", "email"]);
    setTargetAudience("all_users");
    setActionLabel("Shop Flash Drop");
    setActionUrl("/categories/flash-deals");
    setPublishStatus("draft");
    setScheduledAt("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: NotificationBroadcast) => {
    setEditingItem(item);
    setTitle(item.title);
    setMessage(item.message);
    setCategory(item.category);
    setPriority(item.priority);
    setChannels(item.channels || ["in_app"]);
    setTargetAudience(item.target_audience);
    setActionLabel(item.action_label || "View Details");
    setActionUrl(item.action_url || "/categories/flash-deals");
    setPublishStatus(item.status === "sent" ? "sent" : item.status === "scheduled" ? "scheduled" : "draft");
    setScheduledAt(item.scheduled_at || "");
    setIsModalOpen(true);
  };

  // Save Broadcast
  const handleSaveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const targetFilter: Record<string, unknown> = {};
    if (targetAudience === "by_country") {
      targetFilter.countries = countryFilter.split(",").map((c) => c.trim().toUpperCase());
    } else if (targetAudience === "by_order_history") {
      targetFilter.min_orders = Number(minOrdersFilter);
    }

    const res = await createAdminBroadcast({
      title: title.trim(),
      message: message.trim(),
      category,
      priority,
      channels,
      targetAudience,
      targetFilter,
      actionLabel,
      actionUrl,
      status: publishStatus,
      scheduledAt: scheduledAt || undefined,
    });

    if (res.success) {
      showToast(
        publishStatus === "sent"
          ? "Broadcast sent successfully to target audience!"
          : `Broadcast saved as ${publishStatus}.`
      );
      setIsModalOpen(false);
      loadBroadcasts();
    } else {
      showToast(res.error || "Failed to save broadcast");
    }
  };

  // Send Broadcast Live
  const handleSendNow = async (item: NotificationBroadcast) => {
    const res = await sendBroadcastNow(item.id);
    if (res.success) {
      showToast(`Broadcast "${item.title}" dispatched live!`);
      loadBroadcasts();
    } else {
      showToast(res.error || "Dispatch failed");
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteBroadcast(deleteTarget.id);
    showToast(`Broadcast removed.`);
    setDeleteTarget(null);
    loadBroadcasts();
  };

  // Retry Delivery
  const handleRetryDelivery = async (logId: string) => {
    const res = await retryFailedDeliveryAction(logId);
    if (res.success) {
      const successMsg = "message" in res ? (res.message as string) : "Retry dispatched!";
      showToast(successMsg);
      loadLogs();
    } else {
      const errMsg = "error" in res ? (res.error as string) : "Retry failed";
      showToast(errMsg);
    }
  };

  // Preview Email Template
  const handleOpenTemplatePreview = async (tplKey: string) => {
    setPreviewTemplateKey(tplKey);
    const res = await previewEmailTemplate(tplKey);
    if (res.success) {
      setPreviewHtml(res.html || "");
      setPreviewSubject(res.subject || "");
    }
  };

  // Send Test Email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewTemplateKey || !testEmail.trim()) return;
    setIsSendingTest(true);
    try {
      const res = await sendTestNotification(previewTemplateKey, testEmail.trim());
      if (res.success) {
        showToast(`Test email sent to ${testEmail}!`);
      } else {
        showToast(res.error || "Failed to send test email");
      }
    } finally {
      setIsSendingTest(false);
    }
  };

  // CSV Export Trigger
  const handleExportCSV = () => {
    window.open("/api/notifications/export", "_blank");
  };

  // Helper Badges
  const renderAudienceBadge = (audience: TargetAudienceType) => {
    const config = {
      all_users: { label: "All Users", color: "bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] border-blue-200" },
      vip_customers: { label: "VIP Tier", color: "bg-[#F3E8FF] dark:bg-purple-950/60 text-purple-600 border-purple-200" },
      by_country: { label: "Country Geo", color: "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] border-[#BBF7D0]" },
      by_order_history: { label: "Order History", color: "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 border-[#FED7AA]" },
      by_account_status: { label: "USDT Verified", color: "bg-teal-50 dark:bg-teal-950/60 text-teal-600 border-teal-200" },
      specific_users: { label: "Specific IDs", color: "bg-slate-100 text-slate-700 border-slate-200" },
      staff_only: { label: "Staff Private", color: "bg-rose-50 text-rose-600 border-rose-200" },
    }[audience] || { label: audience, color: "bg-slate-100 text-slate-700 border-slate-200" };

    return (
      <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1", config.color)}>
        <Users className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  // Broadcast Table Columns
  const broadcastColumns: Column<NotificationBroadcast>[] = [
    {
      header: "Title & Message",
      accessorKey: "title",
      sortable: true,
      className: "min-w-[260px]",
      cell: (row) => (
        <div className="space-y-1">
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-[#2F65F6] shrink-0" />
            <span className="line-clamp-1">{row.title}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
            {row.message}
          </p>
        </div>
      ),
    },
    {
      header: "Audience",
      accessorKey: "target_audience",
      sortable: true,
      cell: (row) => renderAudienceBadge(row.target_audience),
    },
    {
      header: "Channels",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {(row.channels || ["in_app"]).map((ch) => (
            <span key={ch} className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {ch}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Recipients",
      accessorKey: "total_sent",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">
          {row.total_sent > 0 ? row.total_sent.toLocaleString() : "—"}
        </span>
      ),
    },
    {
      header: "Open Rate",
      cell: (row) => {
        const rate = row.total_sent > 0 ? `${((row.total_opened / row.total_sent) * 100).toFixed(1)}%` : "—";
        return (
          <span className={cn("font-mono text-xs font-bold", rate !== "—" ? "text-[#16A34A]" : "text-slate-400")}>
            {rate}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const tone: BadgeTone =
          row.status === "sent" ? "emerald" : row.status === "scheduled" ? "blue" : row.status === "cancelled" ? "red" : "slate";
        return <StatusBadge status={row.status} tone={tone} />;
      },
    },
    {
      header: "Sent / Scheduled",
      accessorKey: "created_at",
      sortable: true,
      cell: (row) => (
        <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
          <div>{formatDate(row.sent_at || row.scheduled_at || row.created_at)}</div>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-36",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status !== "sent" ? (
            <button
              onClick={() => handleSendNow(row)}
              title="Broadcast Live Now"
              className="p-1.5 rounded-lg bg-[#F0FDF4] hover:bg-emerald-100 text-[#16A34A] border border-[#BBF7D0] transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleSendNow(row)}
              title="Resend Campaign"
              className="p-1.5 rounded-lg bg-[#EEF4FF] hover:bg-blue-100 text-[#2F65F6] border border-blue-200 transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Broadcast"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDeleteTarget(row)}
            title="Delete Broadcast"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Delivery Logs Table Columns
  const logColumns: Column<NotificationDeliveryLog>[] = [
    {
      header: "Recipient & Subject",
      accessorKey: "recipient_email",
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
            {row.recipient_email || row.recipient_phone || "In-App User"}
          </div>
          <p className="text-[11px] text-slate-500 truncate">{row.subject || "Alert"}</p>
        </div>
      ),
    },
    {
      header: "Channel",
      accessorKey: "channel",
      cell: (row) => (
        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.channel}
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-600">
          {row.category}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const tone: BadgeTone =
          row.status === "delivered" || row.status === "opened" || row.status === "clicked"
            ? "emerald"
            : row.status === "pending" || row.status === "sent"
            ? "blue"
            : "red";
        return <StatusBadge status={row.status} tone={tone} />;
      },
    },
    {
      header: "Provider",
      accessorKey: "provider",
      cell: (row) => <span className="text-xs font-mono text-slate-500">{row.provider || "in_app"}</span>,
    },
    {
      header: "Timestamp",
      accessorKey: "created_at",
      cell: (row) => (
        <span className="text-[11px] text-slate-500 font-mono">
          {formatDate(row.created_at)} {new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-24",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === "failed" && (
            <button
              onClick={() => handleRetryDelivery(row.id)}
              title="Retry Delivery"
              className="p-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {row.last_error && (
            <button
              onClick={() => setSelectedLog(row)}
              title="Inspect Error"
              className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Notification & Communication Studio"
        subtitle="Manage customer push announcements, automated logistics alerts, Binance Pay escrows, and multi-channel marketing campaigns."
        badge={{ text: "ENTERPRISE COMMS", variant: "blue" }}
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Notifications" }]}
        actions={[
          {
            label: "Export Delivery CSV",
            onClick: handleExportCSV,
            icon: Download,
            variant: "secondary",
          },
          {
            label: "Create Broadcast",
            onClick: handleOpenCreate,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      {/* ── 2. Top Executive KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total Dispatched</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {analytics?.totalDispatched.toLocaleString() || "3,820"}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Across all 4 active channels</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Delivery Success</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {analytics?.deliveryRate || "97.1%"}
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Automated retry fallback active</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Average Open Rate</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {analytics?.openRate || "56.2%"}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Air tracking &amp; drop alerts</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2C161A] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Click-Through (CTR)</span>
            <span className="text-xl font-black text-[#FF1028] font-mono mt-0.5 block">
              {analytics?.clickRate || "42.7%"}
            </span>
            <span className="text-[11px] text-rose-500 block mt-0.5">Direct deep-link conversions</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-xs">
            <ExternalLink className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Hub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { key: "broadcasts", label: "Broadcast Announcements", icon: Megaphone },
          { key: "operational", label: "Operational Alerts (Real-Time)", icon: Bell },
          { key: "logs", label: "Delivery Logs & Audit", icon: FileText },
          { key: "templates", label: "Branded Email Templates", icon: Sparkles },
          { key: "analytics", label: "Analytics & Trends", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AdminTabKey)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black font-heading uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-[#00143D] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 4. Tab 1: Broadcasts ── */}
      {activeTab === "broadcasts" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <AdminDataTable<NotificationBroadcast>
            data={broadcasts}
            columns={broadcastColumns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search broadcasts by title or message..."
            searchFields={["title", "message"]}
            defaultSortKey="created_at"
            defaultSortDirection="desc"
            isLoading={isLoading}
            emptyTitle="No broadcasts created yet"
            emptyDescription="Create your first promotional announcement or system alert for customers."
            emptyAction={{
              label: "Create Notification",
              onClick: handleOpenCreate,
            }}
          />
        </div>
      )}

      {/* ── 5. Tab 2: Operational Alerts ── */}
      {activeTab === "operational" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Live Operational Stream ({operationalAlerts.length})
            </h3>
            <button
              onClick={loadOperational}
              className="text-xs font-bold text-[#2F65F6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Alerts</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operationalAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-4.5 rounded-2xl border transition-all flex items-start justify-between gap-4 shadow-xs",
                  alert.severity === "urgent"
                    ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                    : alert.severity === "high"
                    ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                )}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                        alert.severity === "urgent"
                          ? "bg-red-100 text-red-600 border-red-200"
                          : alert.severity === "high"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-600 border-blue-200"
                      )}
                    >
                      {alert.severity}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {alert.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {alert.message}
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatTimeAgo(alert.created_at)}
                    </span>
                    <a
                      href={alert.link}
                      className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-1"
                    >
                      <span>Take Action</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. Tab 3: Delivery Logs ── */}
      {activeTab === "logs" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <AdminDataTable<NotificationDeliveryLog>
            data={deliveryLogs}
            columns={logColumns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search logs by email, subject, or provider..."
            searchFields={["recipient_email", "subject", "provider"]}
            defaultSortKey="created_at"
            defaultSortDirection="desc"
            isLoading={isLoading}
          />
        </div>
      )}

      {/* ── 7. Tab 4: Email Template Studio ── */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Template Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
              Lennox Branded Template Catalogue
            </h3>
            <div className="space-y-2">
              {Object.entries(BUILTIN_TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => handleOpenTemplatePreview(key)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer block",
                    previewTemplateKey === key
                      ? "bg-white dark:bg-slate-900 border-[#FF1028] shadow-md ring-2 ring-[#FF1028]/10"
                      : "bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-[#FF1028] border border-red-100">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{key}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                    {tpl.headline}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    Subject: {tpl.subject}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Canvas & Test Sender */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Template Preview: <code className="text-[#FF1028]">{previewTemplateKey || "order_confirmed"}</code>
                </span>
                <span className="text-[11px] text-slate-400">Subject: {previewSubject || "Order Confirmed"}</span>
              </div>
            </div>

            {/* Test Send Form */}
            <form onSubmit={handleSendTestEmail} className="flex gap-2">
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter recipient email (e.g. admin@lennox.com)..."
                className="flex-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 outline-none focus:border-[#FF1028]"
              />
              <button
                type="submit"
                disabled={isSendingTest}
                className="px-4 py-2 bg-[#00143D] hover:bg-[#002366] text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                {isSendingTest ? "Sending..." : "Send Test Email"}
              </button>
            </form>

            {/* Rendered HTML Container */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner max-h-[500px] overflow-y-auto bg-slate-100 p-4">
              <div
                dangerouslySetInnerHTML={{
                  __html: previewHtml || "Select a template on the left to inspect responsive styling.",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Tab 5: Analytics & Trends ── */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">In-App Alerts Delivered</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
                {analytics?.channelStats.in_app.toLocaleString() || "1,840"}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">100% Realtime Delivery</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">Branded Emails Dispatched</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
                {analytics?.channelStats.email.toLocaleString() || "1,420"}
              </span>
              <span className="text-[10px] text-blue-600 font-bold">56.2% Average Open Rate</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">Web Push Notifications</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
                {analytics?.channelStats.push.toLocaleString() || "410"}
              </span>
              <span className="text-[10px] text-purple-600 font-bold">48.9% Click Rate</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">SMS Courier Alerts</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
                {analytics?.channelStats.sms.toLocaleString() || "150"}
              </span>
              <span className="text-[10px] text-amber-600 font-bold">Zero Carrier Drop</span>
            </div>
          </div>

          {/* Volume Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
              7-Day Delivery Volume &amp; Failure Resilience
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center pt-4">
              {analytics?.recentVolume.map((d) => (
                <div key={d.date} className="space-y-2">
                  <div className="h-32 bg-slate-50 dark:bg-slate-950 rounded-xl flex flex-col justify-end p-2 border border-slate-100 dark:border-slate-800">
                    <div
                      style={{ height: `${Math.min(100, (d.sent / 900) * 100)}%` }}
                      className="bg-gradient-to-t from-[#00143D] to-[#2F65F6] rounded-lg w-full transition-all"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block font-mono">
                    {d.sent}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{d.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. Create / Edit Broadcast Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Notification Broadcast" : "Create New Broadcast Campaign"}
        size="lg"
      >
        <form onSubmit={handleSaveBroadcast} className="space-y-4 pt-1 text-slate-800 dark:text-slate-200">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Campaign Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ⚡ Flash Factory Restock: Eachine 4K Drones"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Message Body *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message body for customer notifications..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3.5 outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as TargetAudienceType)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="all_users">All Registered Users</option>
                <option value="vip_customers">VIP Customers Only</option>
                <option value="by_country">By Country Geography</option>
                <option value="by_order_history">By Order History</option>
                <option value="staff_only">Staff Only (Internal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="promotions">Promotions &amp; Flash Drops</option>
                <option value="shipping">Shipping &amp; Logistics</option>
                <option value="orders">Orders &amp; Sourcing</option>
                <option value="security">Security Alert</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Delivery Schedule
              </label>
              <select
                value={publishStatus}
                onChange={(e) => setPublishStatus(e.target.value as "draft" | "scheduled" | "sent")}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="draft">Save as Draft</option>
                <option value="scheduled">Schedule for Later</option>
                <option value="sent">Send Immediately</option>
              </select>
            </div>
          </div>

          {/* Conditional Target Filter Inputs */}
          {targetAudience === "by_country" && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Target Country Codes (Comma-separated)
              </label>
              <input
                type="text"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                placeholder="US, DE, GB, FR, CA"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] font-mono"
              />
            </div>
          )}

          {targetAudience === "by_order_history" && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Minimum Completed Orders
              </label>
              <input
                type="number"
                min={1}
                value={minOrdersFilter}
                onChange={(e) => setMinOrdersFilter(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] font-mono"
              />
            </div>
          )}

          {/* Action Deep Link Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Action Button Label
              </label>
              <input
                type="text"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="e.g. Explore Flash Deals"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Deep Link Destination (URL)
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="e.g. /categories/flash-deals"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-xs cursor-pointer font-heading uppercase"
            >
              {editingItem ? "Update Broadcast" : publishStatus === "sent" ? "Dispatch Live Now" : "Save Broadcast"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 10. Confirm Delete Dialog ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Notification Broadcast?"
        description={`Are you sure you want to permanently remove "${deleteTarget?.title}"?`}
        confirmLabel="Delete Broadcast"
        variant="danger"
      />

      {/* ── 11. Error Details Modal ── */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Delivery Log Error Diagnostics"
        size="md"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300">
            <strong className="block mb-1">Provider Error Response:</strong>
            <p className="font-mono">{selectedLog?.last_error || "Unknown delivery error"}</p>
          </div>
          <div className="space-y-1 text-slate-600 dark:text-slate-400">
            <p><strong>Channel:</strong> {selectedLog?.channel}</p>
            <p><strong>Provider:</strong> {selectedLog?.provider}</p>
            <p><strong>Retry Count:</strong> {selectedLog?.retry_count} / {selectedLog?.max_retries}</p>
            <p><strong>Next Retry:</strong> {selectedLog?.next_retry_at ? formatDate(selectedLog.next_retry_at) : "Exhausted"}</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (selectedLog) handleRetryDelivery(selectedLog.id);
                setSelectedLog(null);
              }}
              className="px-4 py-2 bg-[#2F65F6] text-white rounded-xl font-bold cursor-pointer hover:bg-blue-700"
            >
              Retry Delivery Now
            </button>
          </div>
        </div>
      </Modal>

      {/* ── 12. Toast Feedback ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
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
