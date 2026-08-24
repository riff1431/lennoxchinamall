"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  Clock,
  Send,
  Plus,
  Flame,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { SlideOver } from "@/components/admin/SlideOver";
import {
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminFormSection,
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatDate, cn } from "@/utils/helpers";
import { MOCK_TICKETS, AdminTicket } from "@/lib/mockData";

const AGENT_OPTIONS = [
  "Unassigned",
  "Support Agent Desk",
  "Shenzhen Tech Specialist",
  "Guangzhou Logistics Desk",
  "Binance Settlement Desk",
  "Factory QA Engineer",
];

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
];

export default function AdminSupportPage() {
  const toast = useAdminToast();
  const [tickets, setTickets] = useState<AdminTicket[]>(INITIAL_TICKETS);

  // Selected Ticket for Chat Thread SlideOver
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [isThreadSlideOverOpen, setIsThreadSlideOverOpen] = useState(false);
  const [isCreateSlideOverOpen, setIsCreateSlideOverOpen] = useState(false);

  // Editable Form State in Thread SlideOver
  const [ticketStatus, setTicketStatus] = useState<AdminTicket["status"]>("open");
  const [ticketPriority, setTicketPriority] = useState<AdminTicket["priority"]>("medium");
  const [ticketAgent, setTicketAgent] = useState<string>("Support Agent Desk");
  const [replyText, setReplyText] = useState("");
  const [ticketHistory, setTicketHistory] = useState<
    Array<{ id: string; sender: string; role: "customer" | "agent"; text: string; time: string }>
  >([]);

  // Create Form State
  const [newSubject, setNewSubject] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [newCategory, setNewCategory] = useState<AdminTicket["category"]>("Air Shipping & Tracking");
  const [newPriority, setNewPriority] = useState<AdminTicket["priority"]>("medium");
  const [newAssignedAgent, setNewAssignedAgent] = useState("Support Agent Desk");
  const [newInitialMessage, setNewInitialMessage] = useState("");

  const handleOpenThread = (ticket: AdminTicket) => {
    setSelectedTicket(ticket);
    setTicketStatus(ticket.status);
    setTicketPriority(ticket.priority);
    setTicketAgent(ticket.assignedAgent || "Support Agent Desk");
    setReplyText("");

    setTicketHistory([
      {
        id: "msg-1",
        sender: ticket.customerName,
        role: "customer",
        text: `Inquiry regarding: ${ticket.subject}. Order reference: ${ticket.orderNumber || "Direct Inquiry"}.`,
        time: formatDate(ticket.createdAt),
      },
      ...(ticket.lastReply
        ? [
            {
              id: "msg-2",
              sender: ticket.assignedAgent || "Support Desk",
              role: "agent" as const,
              text: ticket.lastReply,
              time: "Recent Update",
            },
          ]
        : []),
    ]);

    setIsThreadSlideOverOpen(true);
  };

  const handleSendReply = () => {
    if (!selectedTicket) return;
    const trimmed = replyText.trim();
    if (trimmed) {
      setTicketHistory((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: ticketAgent,
          role: "agent",
          text: trimmed,
          time: "Just now",
        },
      ]);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                status: ticketStatus,
                priority: ticketPriority,
                assignedAgent: ticketAgent,
                lastReply: trimmed,
                messagesCount: t.messagesCount + 1,
              }
            : t
        )
      );
      setReplyText("");
      toast.success("Merchant response dispatched to buyer email.");
    } else {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                status: ticketStatus,
                priority: ticketPriority,
                assignedAgent: ticketAgent,
              }
            : t
        )
      );
      toast.success("Ticket details saved.");
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newCustomerName.trim() || !newCustomerEmail.trim()) {
      toast.warning("Subject, Name, and Email are required.");
      return;
    }

    const newNum = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket: AdminTicket = {
      id: `tck-${Date.now()}`,
      ticketNumber: newNum,
      subject: newSubject.trim(),
      customerName: newCustomerName.trim(),
      customerEmail: newCustomerEmail.trim(),
      orderNumber: newOrderNumber.trim() || undefined,
      category: newCategory,
      priority: newPriority,
      status: "open",
      assignedAgent: newAssignedAgent,
      messagesCount: 1,
      lastReply: newInitialMessage.trim() || "Inquiry opened via Support Desk.",
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);
    toast.success(`Support ticket #${newNum} created!`);
    setIsCreateSlideOverOpen(false);

    setNewSubject("");
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewOrderNumber("");
    setNewInitialMessage("");
  };

  const handleDeleteTicket = (ticket: AdminTicket) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    toast.success(`Ticket #${ticket.ticketNumber} deleted.`);
  };

  // Metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const urgentTickets = tickets.filter((t) => t.priority === "urgent" && t.status !== "resolved").length;

  const columns: Column<AdminTicket>[] = [
    {
      header: "Ticket # & Customer",
      accessorKey: "ticketNumber",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-slate-900 dark:text-white block text-xs">
            #{row.ticketNumber}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {row.customerName} ({row.customerEmail})
          </span>
        </div>
      ),
    },
    {
      header: "Subject & Category",
      accessorKey: "subject",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-sm">
          <span className="font-bold text-slate-900 dark:text-white block font-heading text-xs truncate">
            {row.subject}
          </span>
          <span className="text-[10px] text-[#2F65F6] font-bold block">
            {row.category}
          </span>
        </div>
      ),
    },
    {
      header: "Priority SLA",
      accessorKey: "priority",
      sortable: true,
      cell: (row) => {
        const isUrgent = row.priority === "urgent";
        const isHigh = row.priority === "high";
        return (
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono border",
              isUrgent
                ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200"
                : isHigh
                ? "bg-amber-50 dark:bg-amber-950 text-amber-600 border-amber-200"
                : "bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-200"
            )}
          >
            {row.priority}
          </span>
        );
      },
    },
    {
      header: "Assigned Desk",
      accessorKey: "assignedAgent",
      cell: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.assignedAgent || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const tone: BadgeTone =
          row.status === "open"
            ? "amber"
            : row.status === "in_progress"
            ? "blue"
            : "emerald";
        return <StatusBadge status={row.status} tone={tone} />;
      },
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={`ticket #${row.ticketNumber}`}
            onView={() => handleOpenThread(row)}
            onEdit={() => handleOpenThread(row)}
            onDelete={() => handleDeleteTicket(row)}
            customActions={[
              {
                label: "Mark Resolved",
                onClick: () => {
                  setTickets((prev) =>
                    prev.map((t) => (t.id === row.id ? { ...t, status: "resolved" } : t))
                  );
                  toast.success(`Ticket #${row.ticketNumber} marked as resolved.`);
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
      label: "Ticket Status",
      options: [
        { value: "open", label: "Open Tickets" },
        { value: "in_progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" },
      ],
    },
  ];

  const bulkActions: BulkAction<AdminTicket>[] = [
    {
      label: "Mark Selected Resolved",
      variant: "success",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setTickets((prev) =>
          prev.map((t) => (ids.has(t.id) ? { ...t, status: "resolved" } : t))
        );
        toast.success(`Resolved ${selected.length} support tickets.`);
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Customer Help Desk &amp; Warranties"
        subtitle="Manage customer inquiries, 30-day factory replacement claims, and air freight tracking support."
        badge={{ text: `${openTickets} Open Tickets`, variant: "amber" }}
        breadcrumbs={[
          { label: "Customers & CRM", href: "/admin/customers" },
          { label: "Support Desk" },
        ]}
        actions={[
          {
            label: "Open Support Ticket",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsCreateSlideOverOpen(true),
          },
        ]}
      />

      {/* ── 2. Top Metric KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Inquiries
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {totalTickets}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Awaiting Action
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {openTickets}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Urgent SLA Tickets
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {urgentTickets}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Reusable AdminDataTable ── */}
      <AdminDataTable<AdminTicket>
        data={tickets}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search tickets by ID, buyer, or subject..."
        searchFields={["ticketNumber", "customerName", "subject", "customerEmail"]}
        filters={filterOptions}
        bulkActions={bulkActions}
        defaultSortKey="createdAt"
        defaultSortDirection="desc"
        emptyTitle="No support tickets"
        emptyDescription="All customer inquiries are currently resolved."
      />

      {/* ── 4. Slide-Over Panel: Ticket Thread & Quick Reply ── */}
      <SlideOver
        isOpen={isThreadSlideOverOpen}
        onClose={() => setIsThreadSlideOverOpen(false)}
        title={`Ticket #${selectedTicket?.ticketNumber || ""}`}
        description={selectedTicket?.subject || "Customer inquiry conversation"}
        size="xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsThreadSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSendReply}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Response</span>
            </button>
          </div>
        }
      >
        {selectedTicket && (
          <div className="space-y-6">
            <AdminFormSection title="Ticket Controls">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdminSelect
                  label="Status"
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value as AdminTicket["status"])}
                  options={[
                    { value: "open", label: "Open & Pending" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "resolved", label: "Resolved" },
                    { value: "closed", label: "Closed" },
                  ]}
                />
                <AdminSelect
                  label="Priority SLA"
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as AdminTicket["priority"])}
                  options={[
                    { value: "low", label: "Low Priority" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High Priority" },
                    { value: "urgent", label: "Urgent SLA" },
                  ]}
                />
                <AdminSelect
                  label="Assigned Specialist"
                  value={ticketAgent}
                  onChange={(e) => setTicketAgent(e.target.value)}
                  options={AGENT_OPTIONS.map((a) => ({ value: a, label: a }))}
                />
              </div>
            </AdminFormSection>

            {/* Conversation Log */}
            <AdminFormSection title="Conversation Trail">
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {ticketHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-4 rounded-2xl text-xs space-y-1",
                      msg.role === "customer"
                        ? "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                        : "bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 ml-6"
                    )}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold font-heading">{msg.sender}</span>
                      <span className="text-slate-400 font-mono">{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <AdminTextarea
                  label="Compose Merchant Response"
                  rows={3}
                  placeholder="Type your response to the buyer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </AdminFormSection>
          </div>
        )}
      </SlideOver>

      {/* ── 5. Slide-Over Panel: Open Support Ticket ── */}
      <SlideOver
        isOpen={isCreateSlideOverOpen}
        onClose={() => setIsCreateSlideOverOpen(false)}
        title="Open Support Ticket"
        description="Create an internal warranty or logistics inquiry on behalf of a buyer."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsCreateSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTicket}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer"
            >
              Create Ticket
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateTicket} className="space-y-5">
          <AdminFormSection title="Buyer Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="Customer Full Name"
                required
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Alex Harrison"
              />
              <AdminInput
                label="Customer Work / Personal Email"
                type="email"
                required
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                placeholder="alex@example.com"
              />
            </div>
            <AdminInput
              label="Order Number (Optional)"
              value={newOrderNumber}
              onChange={(e) => setNewOrderNumber(e.target.value)}
              placeholder="e.g. LCM-20260823-88AF"
            />
          </AdminFormSection>

          <AdminFormSection title="Inquiry Classification">
            <AdminInput
              label="Subject Headline"
              required
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Gimbal motor replacement under 30-day factory warranty"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AdminSelect
                label="Inquiry Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as AdminTicket["category"])}
                options={[
                  { value: "Air Shipping & Tracking", label: "Air Shipping & Tracking" },
                  { value: "Factory Warranty 30-Day", label: "Factory Warranty 30-Day" },
                  { value: "Binance Pay USDT", label: "Binance Pay USDT Settlement" },
                  { value: "Technical Setup", label: "Technical Setup & Specs" },
                ]}
              />
              <AdminSelect
                label="Priority SLA"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as AdminTicket["priority"])}
                options={[
                  { value: "low", label: "Low Priority" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High Priority" },
                  { value: "urgent", label: "Urgent SLA" },
                ]}
              />
              <AdminSelect
                label="Assigned Specialist Desk"
                value={newAssignedAgent}
                onChange={(e) => setNewAssignedAgent(e.target.value)}
                options={AGENT_OPTIONS.map((a) => ({ value: a, label: a }))}
              />
            </div>
            <AdminTextarea
              label="Initial Problem Description"
              rows={4}
              value={newInitialMessage}
              onChange={(e) => setNewInitialMessage(e.target.value)}
              placeholder="Describe the issue reported by the buyer..."
            />
          </AdminFormSection>
        </form>
      </SlideOver>
    </div>
  );
}
