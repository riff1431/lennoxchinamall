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
                sentCount: status === "sent" && n.status !== "sent" ? Math.floor(1000 + Math.random() * 2000) : n.sentCount,
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
        sentCount: isSentNow ? Math.floor(1200 + Math.random() * 2500) : 0,
        openRate: isSentNow ? "58.2%" : "—",
        status,
        sentAt: isSentNow ? new Date().toISOString() : new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
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
              sentCount: n.sentCount > 0 ? n.sentCount : Math.floor(1500 + Math.random() * 1500),
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
              sentCount: n.sentCount > 0 ? n.sentCount : Math.floor(1400 + Math.random() * 1600),
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
      all_users: { label: "All Users", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
      vip_customers: { label: "VIP Customers", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
      staff_only: { label: "Staff Only", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    }[audience] || { label: audience, color: "bg-slate-800 text-slate-300 border-slate-700" };

    return (
      <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 font-mono", config.color)}>
        <Users className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  // Helper: Type Badges
  const renderTypeBadge = (t: AdminNotificationItem["type"]) => {
    const config = {
      announcement: { label: "Announcement", icon: Megaphone, color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" },
      price_drop: { label: "Price Drop", icon: TrendingDown, color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
      security_alert: { label: "Security Alert", icon: ShieldAlert, color: "bg-red-500/10 text-red-300 border-red-500/30" },
      system_maintenance: { label: "Maintenance", icon: Wrench, color: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
    }[t] || { label: t, icon: Bell, color: "bg-slate-800 text-slate-300 border-slate-700" };

    const Icon = config.icon;
    return (
      <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 font-mono", config.color)}>
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
          <div className="font-bold text-white text-xs flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-[#FF1028] shrink-0" />
            <span className="line-clamp-1">{row.title}</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
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
        <span className="font-mono text-xs text-slate-200 font-bold">
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
          row.openRate !== "—" ? "text-emerald-400" : "text-slate-500"
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
        <div className="text-[11px] text-slate-400 space-y-0.5">
          <div className="font-semibold text-slate-300">{formatDate(row.sentAt)}</div>
          <div className="text-[10px] text-slate-500 font-mono">
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
              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleSendNow(row)}
              title="Resend Broadcast"
              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Notification"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDeleteTarget(row)}
            title="Delete Notification"
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
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
      variant: "success",
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
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Broadcast Notifications"
        subtitle="Manage customer push announcements, hardware flash drop alerts, and staff security broadcasts across web & Telegram."
        badge={{ text: "BROADCAST HUB", variant: "red" }}
        breadcrumbs={[{ label: "Notifications" }]}
        actions={[
          {
            label: "Create Notification",
            onClick: handleOpenCreate,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      {/* ── 2. Header KPI Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Broadcast Recipients</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalSentCount.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Across all delivered campaigns</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Average Open Rate</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">55.3%</div>
          <div className="text-[11px] text-slate-500">Hardware & drop notifications</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Scheduled Broadcasts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{activeScheduled} Pending</div>
          <div className="text-[11px] text-slate-500">Queued for automated delivery</div>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
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

      {/* ── 4. Create / Edit Notification Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Notification Broadcast" : "Create New Broadcast"}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Notification Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ⚡ Flash Sourcing Drop: Eachine 4K Drones Restocked"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Message Body *</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the full broadcast text for web banners, customer notifications, and mobile alerts..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3.5 outline-none focus:border-[#FF1028] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as AdminNotificationItem["targetAudience"])}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028] cursor-pointer"
              >
                <option value="all_users">All Users</option>
                <option value="vip_customers">VIP Customers Only</option>
                <option value="staff_only">Staff Only (Private)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AdminNotificationItem["type"])}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028] cursor-pointer"
              >
                <option value="announcement">Announcement</option>
                <option value="price_drop">Price Drop</option>
                <option value="security_alert">Security Alert</option>
                <option value="system_maintenance">System Maintenance</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Publish Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminNotificationItem["status"])}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028] cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Send Immediately</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-md cursor-pointer"
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
