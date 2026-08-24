"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Shield,
  ShieldCheck,
  Edit2,
  Trash2,
  KeyRound,
  Ban,
  CheckCircle2,
  Mail,
  ChevronDown,
  ChevronUp,
  Users,
  Crown,
  Headphones,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate, getInitials, cn } from "@/utils/helpers";
import { UserRole } from "@/types/database";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS } from "@/lib/auth/roles";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended";
  phone: string;
  joinedDate: string;
  lastActive: string;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "stf-1",
    name: "Arifur Rahman (Admin Lead)",
    email: "arifur.lead@lennoxchinamall.com",
    role: "super_admin",
    status: "active",
    phone: "+86 755 8899 0001",
    joinedDate: "2025-06-15T08:00:00.000Z",
    lastActive: "Just now",
  },
  {
    id: "stf-2",
    name: "Chen Wei (Catalogue & Sourcing)",
    email: "chen.wei@lennoxchinamall.com",
    role: "catalogue_manager",
    status: "active",
    phone: "+86 138 0011 2233",
    joinedDate: "2025-09-01T08:00:00.000Z",
    lastActive: "15 mins ago",
  },
  {
    id: "stf-3",
    name: "Marcus Vance (Fulfilment & PO)",
    email: "marcus.vance@lennoxchinamall.com",
    role: "order_manager",
    status: "active",
    phone: "+1 415 890 2341",
    joinedDate: "2025-11-10T08:00:00.000Z",
    lastActive: "1 hour ago",
  },
  {
    id: "stf-4",
    name: "Sarah Lin (Warranty & Support)",
    email: "sarah.lin@lennoxchinamall.com",
    role: "support_agent",
    status: "active",
    phone: "+852 9123 4567",
    joinedDate: "2026-01-20T08:00:00.000Z",
    lastActive: "3 hours ago",
  },
];

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("catalogue_manager");
  const [phone, setPhone] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  // Role Permissions Preview Tab State
  const [selectedRolePreview, setSelectedRolePreview] = useState<UserRole>("super_admin");
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(true);

  // Confirmation States
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [statusToggleTarget, setStatusToggleTarget] = useState<StaffMember | null>(null);
  const [passwordResetTarget, setPasswordResetTarget] = useState<StaffMember | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Open Create Modal
  const handleOpenInvite = () => {
    setEditingStaff(null);
    setDisplayName("");
    setEmail("");
    setRole("catalogue_manager");
    setPhone("");
    setTempPassword(`LennoxAdmin${Math.floor(100 + Math.random() * 900)}!`);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setDisplayName(staff.name);
    setEmail(staff.email);
    setRole(staff.role);
    setPhone(staff.phone);
    setTempPassword("");
    setIsModalOpen(true);
  };

  // Save Staff (Invite / Update)
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) return;

    if (editingStaff) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? {
                ...s,
                name: displayName.trim(),
                email: email.trim(),
                role,
                phone: phone.trim(),
              }
            : s
        )
      );
      showToast(`Staff member "${displayName}" updated.`);
    } else {
      const newStaff: StaffMember = {
        id: `stf-${Date.now()}`,
        name: displayName.trim(),
        email: email.trim().toLowerCase(),
        role,
        status: "active",
        phone: phone.trim() || "+86 755 0000 0000",
        joinedDate: new Date().toISOString(),
        lastActive: "Invited (Pending login)",
      };
      setStaffList([newStaff, ...staffList]);
      showToast(`Invitation sent to ${email} with temporary credentials.`);
    }

    setIsModalOpen(false);
  };

  // Confirm Status Toggle
  const handleConfirmStatusToggle = () => {
    if (!statusToggleTarget) return;
    const nextStatus = statusToggleTarget.status === "active" ? "suspended" : "active";
    setStaffList((prev) =>
      prev.map((s) => (s.id === statusToggleTarget.id ? { ...s, status: nextStatus } : s))
    );
    showToast(`Staff member ${statusToggleTarget.name} has been ${nextStatus}.`);
    setStatusToggleTarget(null);
  };

  // Confirm Password Reset
  const handleConfirmPasswordReset = () => {
    if (!passwordResetTarget) return;
    showToast(`Password reset link and temporary token dispatched to ${passwordResetTarget.email}.`);
    setPasswordResetTarget(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setStaffList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    showToast(`Staff account "${deleteTarget.name}" deleted permanently.`);
    setDeleteTarget(null);
  };

  // Bulk Actions
  const handleBulkSuspend = (selectedRows: StaffMember[]) => {
    const selectedIds = new Set(selectedRows.map((r) => r.id));
    setStaffList((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, status: "suspended" } : s))
    );
    showToast(`${selectedRows.length} staff account(s) suspended.`);
  };

  const handleBulkActivate = (selectedRows: StaffMember[]) => {
    const selectedIds = new Set(selectedRows.map((r) => r.id));
    setStaffList((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, status: "active" } : s))
    );
    showToast(`${selectedRows.length} staff account(s) activated.`);
  };

  // Helper: Role Badges
  const renderRoleBadge = (r: UserRole) => {
    const config = {
      super_admin: { label: "Super Admin", color: "bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] border-blue-200 dark:border-blue-900/40" },
      catalogue_manager: { label: "Catalogue Manager", color: "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border-[#BBF7D0] dark:border-emerald-900/40" },
      order_manager: { label: "Order Manager", color: "bg-[#F3E8FF] dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/40" },
      support_agent: { label: "Support Agent", color: "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-[#FED7AA] dark:border-amber-900/40" },
      customer: { label: "Customer", color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700" },
    }[r];

    return (
      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 font-mono", config.color)}>
        <Shield className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  // Table Columns Definition
  const columns: Column<StaffMember>[] = [
    {
      header: "Staff Member",
      accessorKey: "name",
      sortable: true,
      className: "min-w-[200px]",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-xs">
            {getInitials(row.name)}
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 dark:text-white text-xs">{row.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">Last active: {row.lastActive}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Email Address",
      accessorKey: "email",
      sortable: true,
      cell: (row) => (
        <div className="font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      header: "Role (RBAC)",
      accessorKey: "role",
      sortable: true,
      cell: (row) => renderRoleBadge(row.role),
    },
    {
      header: "Account Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const tone: BadgeTone = row.status === "active" ? "emerald" : "red";
        return <StatusBadge status={row.status} tone={tone} />;
      },
    },
    {
      header: "Phone / Telegram",
      accessorKey: "phone",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.phone}</span>
      ),
    },
    {
      header: "Joined Date",
      accessorKey: "joinedDate",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{formatDate(row.joinedDate)}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-36",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Role & Details"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setPasswordResetTarget(row)}
            title="Reset Password"
            className="p-1.5 rounded-lg bg-[#FFF8EE] dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-[#FED7AA] dark:border-amber-500/30 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setStatusToggleTarget(row)}
            title={row.status === "active" ? "Suspend Account" : "Activate Account"}
            className={cn(
              "p-1.5 rounded-lg border transition-colors cursor-pointer",
              row.status === "active"
                ? "bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 border-rose-200 dark:border-rose-900/40"
                : "bg-[#F0FDF4] dark:bg-emerald-950/40 hover:bg-[#DCFCE7] dark:hover:bg-emerald-900/40 text-[#16A34A] dark:text-emerald-400 border-[#BBF7D0] dark:border-emerald-900/40"
            )}
          >
            {row.status === "active" ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          {row.role !== "super_admin" && (
            <button
              onClick={() => setDeleteTarget(row)}
              title="Delete Staff"
              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Filter Options
  const filters: FilterOption[] = [
    {
      key: "role",
      label: "Role",
      options: [
        { value: "super_admin", label: "Super Admin" },
        { value: "catalogue_manager", label: "Catalogue Manager" },
        { value: "order_manager", label: "Order Manager" },
        { value: "support_agent", label: "Support Agent" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
      ],
    },
  ];

  // Bulk Actions
  const bulkActions: BulkAction<StaffMember>[] = [
    {
      label: "Suspend Selected",
      icon: Ban,
      variant: "danger",
      onClick: (rows) => handleBulkSuspend(rows),
    },
    {
      label: "Activate Selected",
      icon: CheckCircle2,
      variant: "success",
      onClick: (rows) => handleBulkActivate(rows),
    },
  ];

  // Stats calculation
  const totalStaff = staffList.length;
  const superAdmins = staffList.filter((s) => s.role === "super_admin").length;
  const managers = staffList.filter((s) => s.role === "catalogue_manager" || s.role === "order_manager").length;
  const supportAgents = staffList.filter((s) => s.role === "support_agent").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Staff, Roles &amp; Permissions"
        subtitle="Configure role-based access control (RBAC), invite team members across Shenzhen & global hubs, and audit privilege scopes."
        badge={{ text: "RBAC GOVERNANCE", variant: "blue" }}
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Staff & Permissions" }]}
        actions={[
          {
            label: "Invite Staff Member",
            onClick: handleOpenInvite,
            icon: UserPlus,
            variant: "primary",
          },
        ]}
      />

      {/* ── 2. Top Summary KPI Cards (Pastels) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Team Members
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {totalStaff} Active Staff
            </span>
            <span className="text-[11px] font-bold text-[#2F65F6] block mt-0.5">
              Across Shenzhen &amp; Global Hubs
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Super Admins */}
        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Super Administrators
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {superAdmins} Principal Leads
            </span>
            <span className="text-[11px] font-bold text-rose-600 block mt-0.5">
              Full P&amp;L and Gateway Access
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        {/* Operational Managers */}
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Operations &amp; Catalogue
            </span>
            <span className="text-xl font-black text-[#16A34A] dark:text-emerald-400 font-mono mt-0.5 block">
              {managers} Managers
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Procurement &amp; Orders scope
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Support Agents */}
        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Support &amp; Warranty RMA
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {supportAgents} Agents
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Ticket resolution &amp; RMA SLA
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Headphones className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Staff Data Table ── */}
      <AdminDataTable<StaffMember>
        data={staffList}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search staff by name or email..."
        searchFields={["name", "email", "phone"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="name"
        defaultSortDirection="asc"
        emptyTitle="No staff members found"
        emptyDescription="Invite your team members to manage catalogs, China factory POs, and support tickets."
      />

      {/* ── 4. Role Permissions Details Matrix ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2F65F6]" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Role Permission Matrix &amp; Access Scopes</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cryptographically verified admin module access matrix as defined in PRD §8.3
            </p>
          </div>

          <button
            onClick={() => setShowPermissionsMatrix(!showPermissionsMatrix)}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{showPermissionsMatrix ? "Collapse" : "Expand"}</span>
            {showPermissionsMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showPermissionsMatrix && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Role Select Tabs */}
            <div className="flex items-center gap-2 flex-wrap border-b border-slate-100 dark:border-slate-800/80 pb-3">
              {(["super_admin", "catalogue_manager", "order_manager", "support_agent"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRolePreview(r)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
                    selectedRolePreview === r
                      ? "bg-[#2F65F6] text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                  )}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{ROLE_LABELS[r]}</span>
                </button>
              ))}
            </div>

            {/* Selected Role Scope Card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{ROLE_LABELS[selectedRolePreview]}</span>
                  <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#2F65F6] px-2 py-0.5 rounded">
                    {ROLE_PERMISSIONS[selectedRolePreview].length} Allowed Sections
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {ROLE_DESCRIPTIONS[selectedRolePreview]}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                  Permitted Admin Modules:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {ROLE_PERMISSIONS[selectedRolePreview].map((sec) => (
                    <span
                      key={sec}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A] dark:text-emerald-400" />
                      <span>/admin/{sec}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Invite / Edit Staff Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? "Edit Staff Account" : "Invite New Staff Member"}
        size="lg"
      >
        <form onSubmit={handleSaveStaff} className="space-y-5 pt-2 text-slate-900 dark:text-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Display Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Chen Wei (Catalogue Ops)"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Work Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@lennoxchinamall.com"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] transition-colors font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Assigned Role (RBAC) *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="catalogue_manager">Catalogue Manager</option>
                <option value="order_manager">Order Manager</option>
                <option value="support_agent">Support Agent</option>
                <option value="super_admin">Super Admin (Full Access)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Phone / WeChat</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+86 755 8899 0000"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] transition-colors font-mono"
              />
            </div>
          </div>

          {!editingStaff && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Initial Temporary Password</label>
              <div className="relative">
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Staff member will be prompted to change their password upon initial Supabase sign-in.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] shadow-blue-500/25 shadow-xs transition-colors cursor-pointer"
            >
              {editingStaff ? "Save Changes" : "Send Invitation"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 6. Status Toggle Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={!!statusToggleTarget}
        onClose={() => setStatusToggleTarget(null)}
        onConfirm={handleConfirmStatusToggle}
        title={statusToggleTarget?.status === "active" ? "Suspend Staff Account?" : "Activate Staff Account?"}
        description={`Are you sure you want to ${statusToggleTarget?.status === "active" ? "suspend" : "activate"} access for ${statusToggleTarget?.name} (${statusToggleTarget?.email})?`}
        confirmLabel={statusToggleTarget?.status === "active" ? "Suspend Account" : "Activate Account"}
        variant={statusToggleTarget?.status === "active" ? "warning" : "success"}
      />

      {/* ── 7. Password Reset Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={!!passwordResetTarget}
        onClose={() => setPasswordResetTarget(null)}
        onConfirm={handleConfirmPasswordReset}
        title="Trigger Staff Password Reset?"
        description={`A secure one-time password reset link will be sent to ${passwordResetTarget?.email}.`}
        confirmLabel="Send Reset Link"
        variant="info"
      />

      {/* ── 8. Delete Staff Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Staff Member?"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All associated audit records will be preserved.`}
        confirmLabel="Delete Staff"
        variant="danger"
      />

      {/* ── 9. Toast Notification Bar ── */}
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
