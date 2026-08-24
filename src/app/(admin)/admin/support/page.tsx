"use client";

import React, { useState, useMemo } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  UserCheck,
  Plus,
  Trash2,
  Shield,
  Plane,
  Coins,
  Wrench,
  Flame,
  RefreshCw,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatDateTime } from "@/utils/helpers";
import { MOCK_TICKETS, AdminTicket } from "@/lib/mockData";
import { cn } from "@/utils/helpers";

const AGENT_OPTIONS = [
  "Unassigned",
  "Support Agent Desk",
  "Shenzhen Tech Specialist",
  "Guangzhou Logistics Desk",
  "Binance Settlement Desk",
  "Factory QA Engineer",
];

// Rich initial list extending MOCK_TICKETS
const INITIAL_TICKETS: AdminTicket[] = [
  ...MOCK_TICKETS,
  {
    id: "tck-4",
    ticketNumber: "TCK-88228",
    subject: "Factory 30-Day Warranty replacement for defective gimbal motor",
    customerName: "Nathaniel Price",
    customerEmail: "nathan.p@aerialvision.co",
    orderNumber: "LCM-20260820-99CC",
    category: "Factory Warranty 30-Day",
    priority: "urgent",
    status: "open",
    assignedAgent: "Factory QA Engineer",
    messagesCount: 2,
    lastReply: "Customer uploaded video of pitch motor error code 0x4A. Awaiting return shipping label confirmation.",
    createdAt: "2026-08-24T14:00:00.000Z",
  },
  {
    id: "tck-5",
    ticketNumber: "TCK-88231",
    subject: "Tax customs invoice PDF request for Germany entry clearance",
    customerName: "Hans Zimmer",
    customerEmail: "h.zimmer@munich-tech.de",
    orderNumber: "LCM-20260821-44DD",
    category: "Air Shipping & Tracking",
    priority: "medium",
    status: "in_progress",
    assignedAgent: "Guangzhou Logistics Desk",
    messagesCount: 3,
    lastReply: "Export HS code stamped commercial declaration dispatched via email.",
    createdAt: "2026-08-24T02:00:00.000Z",
  },
  {
    id: "tck-6",
    ticketNumber: "TCK-88235",
    subject: "Binance Pay USDT overpayment refund inquiry (Polygon network)",
    customerName: "Chloe Vance",
    customerEmail: "chloe.vance@crypto-hub.org",
    orderNumber: "LCM-20260819-33EF",
    category: "Binance Pay USDT",
    priority: "high",
    status: "open",
    assignedAgent: "Binance Settlement Desk",
    messagesCount: 1,
    lastReply: "TxHash verified on Polygonscan, 25.00 USDT refund scheduled.",
    createdAt: "2026-08-24T15:30:00.000Z",
  },
  {
    id: "tck-7",
    ticketNumber: "TCK-88150",
    subject: "Bluetooth pairing instruction for BW-WA3 speaker dual TWS mode",
    customerName: "George Taylor",
    customerEmail: "gtaylor@audiophile.net",
    orderNumber: "LCM-20260815-12AB",
    category: "Technical Setup",
    priority: "low",
    status: "closed",
    assignedAgent: "Shenzhen Tech Specialist",
    messagesCount: 5,
    lastReply: "Customer confirmed both units paired in stereo mode successfully.",
    createdAt: "2026-08-20T12:00:00.000Z",
  },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>(INITIAL_TICKETS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Thread & Edit Modal State
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [ticketStatus, setTicketStatus] = useState<"open" | "in_progress" | "resolved" | "closed">("open");
  const [ticketPriority, setTicketPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [ticketAgent, setTicketAgent] = useState<string>("Support Agent Desk");
  const [replyInput, setReplyInput] = useState("");

  // Simulated thread history
  const [ticketHistory, setTicketHistory] = useState<
    Array<{ id: string; sender: string; role: "customer" | "agent"; text: string; time: string }>
  >([]);

  // Create Ticket Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [newCategory, setNewCategory] = useState<
    "Air Shipping & Tracking" | "Binance Pay USDT" | "Factory Warranty 30-Day" | "Technical Setup"
  >("Air Shipping & Tracking");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newAssignedAgent, setNewAssignedAgent] = useState("Support Agent Desk");
  const [newInitialMessage, setNewInitialMessage] = useState("");

  // Delete Confirm Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<AdminTicket | null>(null);
  const [bulkTicketsToDelete, setBulkTicketsToDelete] = useState<AdminTicket[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const closed = tickets.filter((t) => t.status === "closed").length;
    const urgent = tickets.filter((t) => t.priority === "urgent" && t.status !== "closed").length;
    return { total, open, inProgress, resolved, closed, urgent };
  }, [tickets]);

  // Open Ticket Thread & Moderation Modal
  const handleOpenThreadModal = (ticket: AdminTicket) => {
    setSelectedTicket(ticket);
    setTicketStatus(ticket.status);
    setTicketPriority(ticket.priority);
    setTicketAgent(ticket.assignedAgent);
    setReplyInput("");

    // Generate contextual mock history for this ticket
    setTicketHistory([
      {
        id: "msg-1",
        sender: ticket.customerName,
        role: "customer",
        text: `Hello Lennox ChinaMall support desk, inquiry regarding [${ticket.subject}]. Order reference: ${
          ticket.orderNumber || "Not provided"
        }. Please assist as soon as possible.`,
        time: formatDate(ticket.createdAt),
      },
      ...(ticket.messagesCount > 1
        ? [
            {
              id: "msg-2",
              sender: ticket.assignedAgent !== "Unassigned" ? ticket.assignedAgent : "Lennox Helpdesk",
              role: "agent" as const,
              text: ticket.lastReply,
              time: "Recent reply",
            },
          ]
        : []),
    ]);

    setIsThreadModalOpen(true);
  };

  // Send Reply & Update Ticket State
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const trimmedReply = replyInput.trim();

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            status: ticketStatus,
            priority: ticketPriority,
            assignedAgent: ticketAgent,
            messagesCount: trimmedReply ? t.messagesCount + 1 : t.messagesCount,
            lastReply: trimmedReply ? trimmedReply : t.lastReply,
          };
        }
        return t;
      })
    );

    if (trimmedReply) {
      setTicketHistory((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: ticketAgent !== "Unassigned" ? ticketAgent : "Lennox Staff",
          role: "agent",
          text: trimmedReply,
          time: "Just now",
        },
      ]);
    }

    showToast(`Ticket #${selectedTicket.ticketNumber} updated successfully!`);
    setIsThreadModalOpen(false);
    setSelectedTicket(null);
  };

  // Quick Status Changes
  const handleQuickStatusChange = (id: string, status: "resolved" | "closed" | "in_progress") => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    showToast(`Ticket status updated to ${status.replace("_", " ").toUpperCase()}.`);
  };

  // Delete Action
  const handleOpenDeleteModal = (ticket: AdminTicket) => {
    setTicketToDelete(ticket);
    setBulkTicketsToDelete([]);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ticketToDelete) {
      setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete.id));
      showToast("Support ticket record deleted.");
      setTicketToDelete(null);
    } else if (bulkTicketsToDelete.length > 0) {
      const idsToDelete = new Set(bulkTicketsToDelete.map((r) => r.id));
      setTickets((prev) => prev.filter((t) => !idsToDelete.has(t.id)));
      showToast(`${bulkTicketsToDelete.length} tickets deleted permanently.`);
      setBulkTicketsToDelete([]);
    }
    setIsDeleteDialogOpen(false);
  };

  // Create Ticket Handler
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newCustomerName.trim() || !newCustomerEmail.trim()) return;

    const newTicketNumber = "TCK-88250";

    const newTicketItem: AdminTicket = {
      id: `tck-${Date.now()}`,
      ticketNumber: newTicketNumber,
      subject: newSubject.trim(),
      customerName: newCustomerName.trim(),
      customerEmail: newCustomerEmail.trim(),
      orderNumber: newOrderNumber.trim() ? newOrderNumber.trim() : undefined,
      category: newCategory,
      priority: newPriority,
      status: "open",
      assignedAgent: newAssignedAgent,
      messagesCount: 1,
      lastReply: newInitialMessage.trim()
        ? newInitialMessage.trim()
        : "Inquiry opened via Admin Support Portal.",
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicketItem, ...prev]);
    showToast(`Support ticket #${newTicketNumber} opened successfully!`);
    setIsCreateModalOpen(false);

    // Reset Form
    setNewSubject("");
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewOrderNumber("");
    setNewCategory("Air Shipping & Tracking");
    setNewPriority("medium");
    setNewAssignedAgent("Support Agent Desk");
    setNewInitialMessage("");
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priority: "low" | "medium" | "high" | "urgent") => {
    const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
      urgent: {
        bg: "bg-[#FFF0F2] dark:bg-rose-950/60",
        text: "text-[#E11D48] dark:text-rose-400",
        border: "border-[#FFE4E8] dark:border-rose-900/50",
        label: "Urgent SLA",
      },
      high: {
        bg: "bg-[#FFF8EE] dark:bg-amber-950/60",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-[#FED7AA] dark:border-amber-900/50",
        label: "High Priority",
      },
      medium: {
        bg: "bg-[#EEF4FF] dark:bg-blue-950/60",
        text: "text-[#2F65F6] dark:text-blue-400",
        border: "border-[#BFDBFE] dark:border-blue-900/50",
        label: "Medium",
      },
      low: {
        bg: "bg-slate-100 dark:bg-slate-800/80",
        text: "text-slate-600 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700",
        label: "Low",
      },
    };
    const c = config[priority] || config.low;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
          c.bg,
          c.text,
          c.border
        )}
      >
        {priority === "urgent" && <Flame className="w-3 h-3 text-[#E11D48]" />}
        {c.label}
      </span>
    );
  };

  // Category Badge Helper
  const renderCategoryBadge = (category: AdminTicket["category"]) => {
    const config: Record<string, { bg: string; text: string; border: string; Icon: React.ElementType }> = {
      "Air Shipping & Tracking": {
        bg: "bg-[#EEF4FF] dark:bg-blue-950/60",
        text: "text-[#2F65F6] dark:text-blue-400",
        border: "border-[#BFDBFE] dark:border-blue-900/50",
        Icon: Plane,
      },
      "Binance Pay USDT": {
        bg: "bg-[#FFF8EE] dark:bg-amber-950/60",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-[#FED7AA] dark:border-amber-900/50",
        Icon: Coins,
      },
      "Factory Warranty 30-Day": {
        bg: "bg-[#F3E8FF] dark:bg-purple-950/60",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-[#E9D5FF] dark:border-purple-900/50",
        Icon: Shield,
      },
      "Technical Setup": {
        bg: "bg-slate-100 dark:bg-slate-800/70",
        text: "text-slate-600 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700",
        Icon: Wrench,
      },
    };
    const c = config[category] || config["Technical Setup"];
    const Icon = c.Icon;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap",
          c.bg,
          c.text,
          c.border
        )}
      >
        <Icon className="w-3 h-3" />
        <span>{category}</span>
      </span>
    );
  };

  // Table Columns Definition
  const columns: Column<AdminTicket>[] = [
    {
      header: "Ticket #",
      accessorKey: "ticketNumber",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
          {row.ticketNumber}
        </span>
      ),
    },
    {
      header: "Subject",
      accessorKey: "subject",
      sortable: true,
      cell: (row) => (
        <div className="max-w-[210px]">
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate leading-snug" title={row.subject}>
            {row.subject}
          </div>
          {row.orderNumber && (
            <div className="text-[10px] font-mono text-[#16A34A] dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <span>Order: {row.orderNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      sortable: true,
      cell: (row) => (
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2 max-w-[130px]">
          <div className="w-6 h-6 rounded-full bg-[#EEF4FF] dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[10px] font-bold text-[#2F65F6] shrink-0">
            {row.customerName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate" title={row.customerName}>
            {row.customerName}
          </span>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "customerEmail",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 max-w-[140px] truncate block" title={row.customerEmail}>
          {row.customerEmail}
        </span>
      ),
    },
    {
      header: "Order #",
      accessorKey: "orderNumber",
      sortable: true,
      cell: (row) =>
        row.orderNumber ? (
          <span className="font-mono text-[11px] font-bold text-[#16A34A] dark:text-emerald-400 bg-[#F0FDF4] dark:bg-emerald-950/40 border border-[#BBF7D0] dark:border-emerald-800/60 px-1.5 py-0.5 rounded">
            {row.orderNumber}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono text-center block">—</span>
        ),
    },
    {
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (row) => renderCategoryBadge(row.category),
    },
    {
      header: "Priority",
      accessorKey: "priority",
      sortable: true,
      cell: (row) => renderPriorityBadge(row.priority),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const toneMap: Record<string, "amber" | "blue" | "emerald" | "slate"> = {
          open: "amber",
          in_progress: "blue",
          resolved: "emerald",
          closed: "slate",
        };
        return (
          <StatusBadge
            status={row.status}
            tone={toneMap[row.status] || "slate"}
            label={row.status.replace("_", " ")}
          />
        );
      },
    },
    {
      header: "Assigned Agent",
      accessorKey: "assignedAgent",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs max-w-[140px]">
          <UserCheck
            className={cn(
              "w-3.5 h-3.5 shrink-0",
              row.assignedAgent === "Unassigned" ? "text-amber-500" : "text-[#2F65F6]"
            )}
          />
          <span
            className={cn(
              "truncate font-medium",
              row.assignedAgent === "Unassigned" ? "text-amber-600 dark:text-amber-400 italic font-semibold" : "text-slate-800 dark:text-slate-200"
            )}
            title={row.assignedAgent}
          >
            {row.assignedAgent}
          </span>
        </div>
      ),
    },
    {
      header: "Messages",
      accessorKey: "messagesCount",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60 w-fit">
          <MessageSquare className="w-3 h-3 text-slate-400" />
          <span>{row.messagesCount}</span>
        </div>
      ),
    },
    {
      header: "Last Reply",
      accessorKey: "lastReply",
      cell: (row) => (
        <div className="text-xs text-slate-500 dark:text-slate-400 italic max-w-[190px] truncate" title={row.lastReply}>
          &quot;{row.lastReply}&quot;
        </div>
      ),
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => handleOpenThreadModal(row)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#2F65F6] bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="View Ticket Conversation &amp; Reply"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          {row.status !== "resolved" && (
            <button
              onClick={() => handleQuickStatusChange(row.id, "resolved")}
              className="p-1.5 rounded-lg text-[#16A34A] dark:text-emerald-400 hover:text-emerald-600 bg-[#F0FDF4] dark:bg-emerald-950/40 hover:bg-emerald-100 border border-[#BBF7D0] dark:border-emerald-800/60 transition-colors cursor-pointer"
              title="Mark as Resolved"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
          {row.status !== "closed" && (
            <button
              onClick={() => handleQuickStatusChange(row.id, "closed")}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Close Ticket"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => handleOpenDeleteModal(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#E11D48] bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Delete Ticket"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Filters Configuration
  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "open", label: "Open" },
        { value: "in_progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { value: "urgent", label: "Urgent" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: [
        { value: "Air Shipping & Tracking", label: "Air Shipping & Tracking" },
        { value: "Binance Pay USDT", label: "Binance Pay USDT" },
        { value: "Factory Warranty 30-Day", label: "Factory Warranty 30-Day" },
        { value: "Technical Setup", label: "Technical Setup" },
      ],
    },
  ];

  // Bulk Actions Configuration
  const bulkActions: BulkAction<AdminTicket>[] = [
    {
      label: "Assign: Support Desk",
      icon: UserCheck,
      variant: "default",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setTickets((prev) =>
          prev.map((t) =>
            ids.has(t.id) ? { ...t, assignedAgent: "Support Agent Desk", status: "in_progress" } : t
          )
        );
        showToast(`${selected.length} tickets assigned to Support Agent Desk.`);
      },
    },
    {
      label: "Assign: Shenzhen Tech",
      icon: Wrench,
      variant: "default",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setTickets((prev) =>
          prev.map((t) =>
            ids.has(t.id) ? { ...t, assignedAgent: "Shenzhen Tech Specialist", status: "in_progress" } : t
          )
        );
        showToast(`${selected.length} tickets routed to Shenzhen Tech Specialist.`);
      },
    },
    {
      label: "Close Selected",
      icon: XCircle,
      variant: "default",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setTickets((prev) =>
          prev.map((t) => (ids.has(t.id) ? { ...t, status: "closed" } : t))
        );
        showToast(`${selected.length} tickets marked as Closed.`);
      },
    },
    {
      label: "Delete Selected",
      icon: Trash2,
      variant: "danger",
      onClick: (selected) => {
        setBulkTicketsToDelete(selected);
        setTicketToDelete(null);
        setIsDeleteDialogOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Support Helpdesk &amp; Tickets"
        subtitle="Manage cross-border customer inquiries, factory warranty claims, Binance Pay transaction verifications, and logistics tracking disputes."
        badge={{ text: "HELPDESK & SLA OS", variant: "blue" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Support Tickets" },
        ]}
        actions={[
          {
            label: "Open Support Ticket",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsCreateModalOpen(true),
          },
        ]}
      />

      {/* ── 2. Top 5 Pastel Stat Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Tickets */}
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Inquiries
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {stats.total}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">All customer tickets</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>

        {/* Open Tickets */}
        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Open &amp; Awaiting
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {stats.open}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Requires agent reply</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Urgent SLA */}
        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Urgent SLA
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {stats.urgent}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">&lt; 4h priority response</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              In Progress
            </span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
              {stats.inProgress}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Under specialist review</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        {/* Resolved & Closed */}
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Resolved / Closed
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {stats.resolved + stats.closed}
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Successfully handled</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <AdminDataTable
          data={tickets}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search ticket #, subject, customer name or email..."
          searchFields={["ticketNumber", "subject", "customerName", "customerEmail", "orderNumber"]}
          filters={filters}
          bulkActions={bulkActions}
          defaultSortKey="createdAt"
          defaultSortDirection="desc"
          emptyTitle="No support tickets found"
          emptyDescription="There are no helpdesk inquiries matching your query or filter parameters."
          emptyAction={{
            label: "Create Manual Ticket",
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      </div>

      {/* ── 4. Ticket Conversation Thread & Update Modal ── */}
      {selectedTicket && (
        <Modal
          isOpen={isThreadModalOpen}
          onClose={() => setIsThreadModalOpen(false)}
          title={`Ticket #${selectedTicket.ticketNumber} — ${selectedTicket.subject}`}
          size="xl"
        >
          <form onSubmit={handleSendReply} className="space-y-5 pt-1 text-slate-800 dark:text-slate-200">
            {/* Ticket Header Metadata Bar */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EEF4FF] dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-xs text-[#2F65F6]">
                    {selectedTicket.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedTicket.customerName}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-normal">
                        ({selectedTicket.customerEmail})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Opened: {formatDateTime(selectedTicket.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {renderCategoryBadge(selectedTicket.category)}
                  {renderPriorityBadge(ticketPriority)}
                </div>
              </div>

              {/* Order Reference Strip */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Order Reference:</span>
                  {selectedTicket.orderNumber ? (
                    <span className="font-mono font-bold text-[#16A34A] dark:text-emerald-400 bg-[#F0FDF4] dark:bg-emerald-950/60 border border-[#BBF7D0] px-2 py-0.5 rounded">
                      {selectedTicket.orderNumber}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono italic">No Order Attached</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned To:</span>
                  <span className="font-bold text-[#2F65F6]">{ticketAgent}</span>
                </div>
              </div>
            </div>

            {/* Conversation History Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#2F65F6]" />
                  <span>Conversation History ({ticketHistory.length} entries)</span>
                </span>
                <span className="text-[10px] text-slate-500">Live synchronized</span>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {ticketHistory.map((item) => {
                  const isAgent = item.role === "agent";
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-3.5 rounded-2xl border text-xs space-y-1.5",
                        isAgent
                          ? "bg-[#EEF4FF] dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/50 text-slate-800 dark:text-slate-200 ml-6"
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 mr-6"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "font-bold text-[11px]",
                              isAgent ? "text-[#2F65F6]" : "text-slate-900 dark:text-slate-100"
                            )}
                          >
                            {item.sender}
                          </span>
                          {isAgent && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/40 text-[#2F65F6] border border-blue-200">
                              Lennox Staff
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Moderation Controls: Status, Priority, Agent Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {/* Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Update Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) =>
                    setTicketStatus(e.target.value as "open" | "in_progress" | "resolved" | "closed")
                  }
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#2F65F6] cursor-pointer"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Priority Level</label>
                <select
                  value={ticketPriority}
                  onChange={(e) =>
                    setTicketPriority(e.target.value as "low" | "medium" | "high" | "urgent")
                  }
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#2F65F6] cursor-pointer"
                >
                  <option value="urgent">Urgent SLA</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Agent */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Assign Agent Desk</label>
                <select
                  value={ticketAgent}
                  onChange={(e) => setTicketAgent(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#2F65F6] cursor-pointer"
                >
                  {AGENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Support Reply Composition Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#2F65F6]" />
                  <span>Send Helpdesk Response</span>
                </label>
                <span className="text-[10px] text-slate-500">Will notify customer email</span>
              </div>

              {/* Quick Canned Macros */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Insert Macro:</span>
                <button
                  type="button"
                  onClick={() =>
                    setReplyInput(
                      "Hello! We have contacted YunExpress Guangzhou sorting hub. Your shipment cleared international export and local tracking will activate upon USPS arrival."
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Air Tracking Info
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReplyInput(
                      "Your Binance Pay USDT transaction has been verified on our merchant portal. Order fulfillment status has progressed to Factory QC Gate."
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Binance Pay Confirmation
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReplyInput(
                      "Under our 30-day factory replacement warranty, a replacement unit has been pre-authorized. Please retain the original manufacturer packaging."
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Warranty RMA
                </button>
              </div>

              <textarea
                rows={3}
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Type your response to the customer..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 outline-none focus:border-[#2F65F6] transition-colors leading-relaxed placeholder-slate-400"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsThreadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors shadow-blue-500/25 shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Update Ticket &amp; Send Reply</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── 5. Create Ticket Modal ── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Open New Support Ticket"
        size="md"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 pt-1 text-slate-800 dark:text-slate-200">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Ticket Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Flight controller firmware update assistance request"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Mitchell"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Customer Email *</label>
              <input
                type="email"
                required
                placeholder="e.g. j.mitchell@example.com"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Related Order # (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. LCM-20260824-99AA"
                value={newOrderNumber}
                onChange={(e) => setNewOrderNumber(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[#16A34A] dark:text-emerald-400 font-bold text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Ticket Category *</label>
              <select
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(
                    e.target.value as
                      | "Air Shipping & Tracking"
                      | "Binance Pay USDT"
                      | "Factory Warranty 30-Day"
                      | "Technical Setup"
                  )
                }
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="Air Shipping & Tracking">Air Shipping &amp; Tracking</option>
                <option value="Binance Pay USDT">Binance Pay USDT</option>
                <option value="Factory Warranty 30-Day">Factory Warranty 30-Day</option>
                <option value="Technical Setup">Technical Setup</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Priority Level</label>
              <select
                value={newPriority}
                onChange={(e) =>
                  setNewPriority(e.target.value as "low" | "medium" | "high" | "urgent")
                }
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="urgent">Urgent SLA</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Assign Agent Desk</label>
              <select
                value={newAssignedAgent}
                onChange={(e) => setNewAssignedAgent(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                {AGENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Initial Issue Notes *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe customer issue, log details or shipment inquiries..."
              value={newInitialMessage}
              onChange={(e) => setNewInitialMessage(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 outline-none focus:border-[#2F65F6]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors shadow-blue-500/25 shadow-xs cursor-pointer"
            >
              Open Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 6. Delete Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={
          ticketToDelete
            ? `Delete Ticket #${ticketToDelete.ticketNumber}?`
            : `Delete ${bulkTicketsToDelete.length} Selected Tickets?`
        }
        description={
          ticketToDelete
            ? `Are you sure you want to permanently delete support ticket #${ticketToDelete.ticketNumber} (${ticketToDelete.subject})? This action cannot be undone.`
            : `Are you sure you want to delete these ${bulkTicketsToDelete.length} support tickets permanently?`
        }
        confirmLabel="Delete Ticket"
        variant="danger"
      />

      {/* ── 7. Floating Toast Notification ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span>✓ {toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 cursor-pointer ml-1"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
