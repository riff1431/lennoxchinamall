"use client";

import React, { useState } from "react";
import {
  Bell,
  Send,
  Plus,
  Edit2,
  Trash2,
  Users,
  Radio,
  Sparkles,
  ShieldAlert,
  Wrench,
  TrendingDown,
  Megaphone,
  Clock,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate, cn } from "@/utils/helpers";
import { MOCK_NOTIFICATIONS, AdminNotificationItem } from "@/lib/mockData";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(MOCK_NOTIFICATIONS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminNotificationItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState<AdminNotificationItem["targetAudience"]>("all_users");
  const [type, setType] = useState<AdminNotificationItem["type"]>("announcement");
  const [status, setStatus] = useState<AdminNotificationItem["status"]>("draft");

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<AdminNotificationItem | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<AdminNotificationItem[]>([]);

  // Trigger Toast Helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle("");
    setMessage("");
    setTargetAudience("all_users");
    setType("announcement");
    setStatus("draft");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: AdminNotificationItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setMessage(item.message);
    setTargetAudience(item.targetAudience);
    setType(item.type);
    setStatus(item.status);
    setIsModalOpen(true);
  };

  // Save Notification (Create or Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (editingItem) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === editingItem.id
            ? {
                ...n,
                title: title.trim(),
                message: message.trim(),
                targetAudience,
                type,
                status,
                sentAt: status === "sent" && n.status !== "sent" ? new Date().toISOString() : n.sentAt,
                sentCount: status === "sent" && n.status !== "sent" ? 1850 : n.sentCount,
                openRate: status === "sent" && n.status !== "sent" ? "54.8%" : n.openRate,
              }
            : n
        )
      );
      showToast(`Notification "${title}" updated successfully.`);
    } else {
      const isSentNow = status === "sent";
      const newItem: AdminNotificationItem = {
        id: `notif-${Date.now()}`,
        title: title.trim(),
        message: message.trim(),
        targetAudience,
        type,
        sentCount: isSentNow ? 2150 : 0,
        openRate: isSentNow ? "58.2%" : "—",
        status,
        sentAt: isSentNow ? new Date().toISOString() : "2026-08-25T10:00:00.000Z",
      };
      setNotifications([newItem, ...notifications]);
      showToast(isSentNow ? `Broadcast notification dispatched to ${targetAudience}!` : `Notification saved as ${status}.`);
    }

    setIsModalOpen(false);
  };

  // Send Now Trigger
  const handleSendNow = (item: AdminNotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === item.id
          ? {
              ...n,
              status: "sent",
              sentAt: new Date().toISOString(),
              sentCount: n.sentCount > 0 ? n.sentCount : 1750,
              openRate: n.openRate === "—" ? "49.6%" : n.openRate,
            }
          : n
      )
    );
    showToast(`Broadcast "${item.title}" dispatched live!`);
  };

  // Delete Single
  const handleConfirmDeleteSingle = () => {
    if (!deleteTarget) return;
    setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    showToast(`Notification "${deleteTarget.title}" deleted.`);
    setDeleteTarget(null);
  };

  // Bulk Delete
  const handleConfirmBulkDelete = () => {
    const idsToDelete = new Set(bulkDeleteTargets.map((n) => n.id));
    setNotifications((prev) => prev.filter((n) => !idsToDelete.has(n.id)));
    showToast(`${bulkDeleteTargets.length} notification(s) removed.`);
    setBulkDeleteTargets([]);
  };

  // Bulk Send Action
  const handleBulkSend = (selectedRows: AdminNotificationItem[]) => {
    const selectedIds = new Set(selectedRows.map((r) => r.id));
    setNotifications((prev) =>
      prev.map((n) =>
        selectedIds.has(n.id)
          ? {
              ...n,
              status: "sent",
              sentAt: new Date().toISOString(),
              sentCount: n.sentCount > 0 ? n.sentCount : 1600,
              openRate: n.openRate === "—" ? "52.3%" : n.openRate,
            }
          : n
      )
    );
    showToast(`${selectedRows.length} notification(s) broadcasted successfully.`);
  };

  // Helper: Audience Badges
  const renderAudienceBadge = (audience: AdminNotificationItem["targetAudience"]) => {
    const config = {
      all_users: { label: "All Users", color: "bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] dark:text-blue-400 border-blue-200 dark:border-blue-900/50" },
      vip_customers: { label: "VIP Customers", color: "bg-[#F3E8FF] dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-[#E9D5FF] dark:border-purple-900/50" },
      staff_only: { label: "Staff Only", color: "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-[#FED7AA] dark:border-amber-900/50" },
    }[audience] || { label: audience, color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700" };

    return (
      <span className={cn("text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1", config.color)}>
        <Users className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  // Helper: Type Badges
  const renderTypeBadge = (t: AdminNotificationItem["type"]) => {
    const config = {
      announcement: { label: "Announcement", icon: Megaphone, color: "bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] dark:text-blue-400 border-blue-200 dark:border-blue-900/50" },
      price_drop: { label: "Price Drop", icon: TrendingDown, color: "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border-[#BBF7D0] dark:border-emerald-900/50" },
      security_alert: { label: "Security Alert", icon: ShieldAlert, color: "bg-[#FFF0F2] dark:bg-rose-950/60 text-[#E11D48] dark:text-rose-400 border-[#FFE4E8] dark:border-rose-900/50" },
      system_maintenance: { label: "Maintenance", icon: Wrench, color: "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-[#FED7AA] dark:border-amber-900/50" },
    }[t] || { label: t, icon: Bell, color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700" };

    const Icon = config.icon;
    return (
      <span className={cn("text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5", config.color)}>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  // Table Columns Definition
  const columns: Column<AdminNotificationItem>[] = [
    {
      header: "Title & Preview",
      accessorKey: "title",
      sortable: true,
      className: "min-w-[240px]",
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
      header: "Target Audience",
      accessorKey: "targetAudience",
      sortable: true,
      cell: (row) => renderAudienceBadge(row.targetAudience),
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      cell: (row) => renderTypeBadge(row.type),
    },
    {
      header: "Sent Count",
      accessorKey: "sentCount",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">
          {row.sentCount > 0 ? row.sentCount.toLocaleString() : "—"}
        </span>
      ),
    },
    {
      header: "Open Rate",
      accessorKey: "openRate",
      sortable: true,
      cell: (row) => (
        <span className={cn(
          "font-mono text-xs font-bold",
          row.openRate !== "—" ? "text-[#16A34A] dark:text-emerald-400" : "text-slate-400"
        )}>
          {row.openRate}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const tone: BadgeTone =
          row.status === "sent" ? "emerald" : row.status === "scheduled" ? "blue" : "slate";
        return <StatusBadge status={row.status} tone={tone} />;
      },
    },
    {
      header: "Sent / Scheduled",
      accessorKey: "sentAt",
      sortable: true,
      cell: (row) => (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(row.sentAt)}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {new Date(row.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
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
              title="Broadcast Live"
              className="p-1.5 rounded-lg bg-[#F0FDF4] dark:bg-emerald-950/40 hover:bg-emerald-100 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0] dark:border-emerald-900/40 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleSendNow(row)}
              title="Resend Broadcast"
              className="p-1.5 rounded-lg bg-[#EEF4FF] dark:bg-blue-950/40 hover:bg-blue-100 text-[#2F65F6] dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Notification"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDeleteTarget(row)}
            title="Delete Notification"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-400 hover:text-[#E11D48] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Filters Definition
  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "sent", label: "Sent" },
        { value: "scheduled", label: "Scheduled" },
        { value: "draft", label: "Draft" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { value: "announcement", label: "Announcement" },
        { value: "price_drop", label: "Price Drop" },
        { value: "security_alert", label: "Security Alert" },
        { value: "system_maintenance", label: "Maintenance" },
      ],
    },
    {
      key: "targetAudience",
      label: "Audience",
      options: [
        { value: "all_users", label: "All Users" },
        { value: "vip_customers", label: "VIP Customers" },
        { value: "staff_only", label: "Staff Only" },
      ],
    },
  ];

  // Bulk Actions Definition
  const bulkActions: BulkAction<AdminNotificationItem>[] = [
    {
      label: "Send Selected",
      icon: Send,
      variant: "default",
      onClick: (rows) => handleBulkSend(rows),
    },
    {
      label: "Delete Selected",
      icon: Trash2,
      variant: "danger",
      onClick: (rows) => setBulkDeleteTargets(rows),
    },
  ];

  // Stats calculation
  const totalSentCount = notifications.filter((n) => n.status === "sent").reduce((sum, n) => sum + n.sentCount, 0);
  const activeScheduled = notifications.filter((n) => n.status === "scheduled").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Broadcast Notifications"
        subtitle="Manage customer push announcements, hardware flash drop alerts, and staff security broadcasts across web & Telegram."
        badge={{ text: "BROADCAST HUB", variant: "blue" }}
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Notifications" }]}
        actions={[
          {
            label: "Create Notification",
            onClick: handleOpenCreate,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      {/* ── 2. Header KPI Stats (Pastel NETIC Style) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total Recipients</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">{totalSentCount.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Across all delivered campaigns</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Average Open Rate</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">55.3%</span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Hardware &amp; drop notifications</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Scheduled Broadcasts</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">{activeScheduled} Pending</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Queued for automated delivery</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <AdminDataTable<AdminNotificationItem>
          data={notifications}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search broadcasts by title or message..."
          searchFields={["title", "message"]}
          filters={filters}
          bulkActions={bulkActions}
          defaultSortKey="sentAt"
          defaultSortDirection="desc"
          emptyTitle="No notifications found"
          emptyDescription="Create a new broadcast campaign to notify users about flash drops, price decreases, or maintenance."
          emptyAction={{
            label: "Create First Notification",
            onClick: handleOpenCreate,
          }}
        />
      </div>

      {/* ── 4. Create / Edit Notification Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Notification Broadcast" : "Create New Broadcast"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1 text-slate-800 dark:text-slate-200">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Notification Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ⚡ Flash Sourcing Drop: Eachine 4K Drones Restocked"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Message Body *</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the full broadcast text for web banners, customer notifications, and mobile alerts..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3.5 outline-none focus:border-[#2F65F6] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as AdminNotificationItem["targetAudience"])}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="all_users">All Users</option>
                <option value="vip_customers">VIP Customers Only</option>
                <option value="staff_only">Staff Only (Private)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AdminNotificationItem["type"])}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="announcement">Announcement</option>
                <option value="price_drop">Price Drop</option>
                <option value="security_alert">Security Alert</option>
                <option value="system_maintenance">System Maintenance</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Publish Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminNotificationItem["status"])}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Send Immediately</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors shadow-blue-500/25 shadow-xs cursor-pointer"
            >
              {editingItem ? "Update Broadcast" : status === "sent" ? "Dispatch Now" : "Save Notification"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Delete Confirm Dialog (Single) ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteSingle}
        title="Delete Notification Broadcast?"
        description={`Are you sure you want to permanently remove "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Broadcast"
        variant="danger"
      />

      {/* ── 6. Bulk Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={bulkDeleteTargets.length > 0}
        onClose={() => setBulkDeleteTargets([])}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Selected Notifications?"
        description={`Are you sure you want to delete ${bulkDeleteTargets.length} selected notification broadcast(s)?`}
        confirmLabel="Delete Selected"
        variant="danger"
      />

      {/* ── 7. Toast Notification Bar ── */}
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
