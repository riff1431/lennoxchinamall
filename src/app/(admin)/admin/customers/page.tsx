"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Mail,
  User,
  History,
  Shield,
  Clock,
  Eye,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { SlideOver } from "@/components/admin/SlideOver";
import { Modal } from "@/components/ui/Modal";
import {
  AdminInput,
  AdminSelect,
  AdminFormSection,
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { Profile } from "@/types/database";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/auth/roles";
import {
  getUsersAndStaff,
  inviteStaffMember,
  updateUserRole,
  toggleUserStatus,
  triggerPasswordReset,
  getAuditLogs,
} from "@/app/actions/admin-users";
import { formatDate, cn } from "@/utils/helpers";

interface AuditLogEntry {
  id: string;
  admin_id?: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export default function AdminCustomersPage() {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<"staff" | "customers" | "audit">("staff");
  const [users, setUsers] = useState<Profile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals & SlideOver
  const [isInviteSlideOverOpen, setIsInviteSlideOverOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<Profile | null>(null);
  const [selectedRoleToAssign, setSelectedRoleToAssign] = useState<string>("support_agent");
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogEntry | null>(null);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDisplayName, setInviteDisplayName] = useState("");
  const [inviteRole, setInviteRole] = useState("support_agent");

  const loadData = useCallback(() => {
    setIsLoading(true);
    getUsersAndStaff()
      .then((res) => {
        if (res.success && res.users) {
          setUsers(res.users);
        }
      })
      .finally(() => setIsLoading(false));

    getAuditLogs().then((res) => {
      if (res.success && res.logs) {
        setAuditLogs(res.logs as unknown as AuditLogEntry[]);
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.warning("Please enter a work email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("email", inviteEmail.trim());
      fd.append("role", inviteRole);
      fd.append("display_name", inviteDisplayName.trim());
      const res = await inviteStaffMember(fd);
      if (res.success) {
        toast.success(res.message || `Invitation dispatched to ${inviteEmail}.`);
        setIsInviteSlideOverOpen(false);
        setInviteEmail("");
        setInviteDisplayName("");
        loadData();
      } else {
        toast.error(res.error || "Failed to invite staff member.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleModalUser) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("user_id", roleModalUser.id);
      fd.append("role", selectedRoleToAssign);
      const res = await updateUserRole(fd);
      if (res.success) {
        toast.success(res.message || `Updated role for ${roleModalUser.email}.`);
        setRoleModalUser(null);
        loadData();
      } else {
        toast.error(res.error || "Failed to update user role.");
      }
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: Profile) => {
    try {
      const fd = new FormData();
      fd.append("user_id", user.id);
      fd.append("is_active", (!user.is_active).toString());
      const res = await toggleUserStatus(fd);
      if (res.success) {
        toast.success(res.message || `User ${user.email} status updated.`);
        loadData();
      } else {
        toast.error(res.error || "Status toggle failed.");
      }
    } catch {
      toast.error("Failed to toggle status.");
    }
  };

  const handleResetPassword = async (user: Profile) => {
    try {
      const fd = new FormData();
      fd.append("email", user.email);
      const res = await triggerPasswordReset(fd);
      if (res.success) {
        toast.success(res.message || `Password reset link dispatched to ${user.email}.`);
      } else {
        toast.error(res.error || "Failed to send reset link.");
      }
    } catch {
      toast.error("Failed to dispatch reset link.");
    }
  };

  const staffUsers = useMemo(
    () => users.filter((u) => u.role !== "customer"),
    [users]
  );
  const customerUsers = useMemo(
    () => users.filter((u) => u.role === "customer"),
    [users]
  );

  // Columns for Staff & Customers
  const userColumns: Column<Profile>[] = [
    {
      header: "User Identity",
      accessorKey: "email",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00143D] to-[#2F65F6] text-white flex items-center justify-center font-bold font-mono text-xs shrink-0 shadow-xs">
            {(row.display_name || row.email || "U").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block font-heading text-xs">
              {row.display_name || "Lennox Customer"}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Assigned Role",
      accessorKey: "role",
      sortable: true,
      cell: (row) => {
        const roleLabel = ROLE_LABELS[row.role] || row.role;
        const isSuper = row.role === "super_admin";
        return (
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider border",
              isSuper
                ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border-purple-200"
                : "bg-blue-50 dark:bg-blue-950/50 text-[#2F65F6] border-blue-200"
            )}
          >
            {roleLabel}
          </span>
        );
      },
    },
    {
      header: "Account Status",
      accessorKey: "is_active",
      cell: (row) => {
        const tone: BadgeTone = row.is_active ? "emerald" : "rose";
        return <StatusBadge status={row.is_active ? "active" : "suspended"} tone={tone} />;
      },
    },
    {
      header: "Joined Date",
      accessorKey: "created_at",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-500 font-mono">
          {formatDate(row.created_at)}
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
            itemTitle={`user "${row.email}"`}
            onEdit={() => {
              setRoleModalUser(row);
              setSelectedRoleToAssign(row.role);
            }}
            customActions={[
              {
                label: "Send Password Reset",
                icon: KeyRound,
                onClick: () => handleResetPassword(row),
              },
              {
                label: row.is_active ? "Suspend Access" : "Re-activate Access",
                icon: ShieldCheck,
                variant: row.is_active ? "danger" : "default",
                requiresConfirmation: true,
                confirmTitle: row.is_active ? "Suspend Account" : "Re-activate Account",
                confirmMessage: `Are you sure you want to ${row.is_active ? "suspend" : "activate"} ${row.email}?`,
                onClick: () => handleToggleStatus(row),
                divider: true,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  // Columns for Audit Logs
  const auditColumns: Column<AuditLogEntry>[] = [
    {
      header: "Operator",
      accessorKey: "admin_email",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
          {row.admin_email}
        </span>
      ),
    },
    {
      header: "Action Performed",
      accessorKey: "action",
      sortable: true,
      cell: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.action}
        </span>
      ),
    },
    {
      header: "Entity Scope",
      accessorKey: "entity_type",
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {row.entity_type} {row.entity_id ? `(#${row.entity_id.slice(0, 8)})` : ""}
        </span>
      ),
    },
    {
      header: "Timestamp",
      accessorKey: "created_at",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-500 font-mono">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      header: "Details",
      className: "text-right w-20",
      cell: (row) => (
        <button
          type="button"
          onClick={() => setSelectedAuditLog(row)}
          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          title="Inspect Payload"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const userFilters: FilterOption[] = [
    {
      key: "role",
      label: "Role",
      options: [
        { value: "super_admin", label: "Super Admin" },
        { value: "catalogue_manager", label: "Catalogue Manager" },
        { value: "order_manager", label: "Order Manager" },
        { value: "support_agent", label: "Support Agent" },
        { value: "customer", label: "Customer" },
      ],
    },
  ];

  const userBulkActions: BulkAction<Profile>[] = [
    {
      label: "Bulk Password Reset",
      icon: KeyRound,
      variant: "default",
      requiresConfirmation: true,
      confirmTitle: "Reset Passwords",
      confirmMessage: "Send password reset links to all selected accounts?",
      onClick: (selected) => {
        selected.forEach((u) => handleResetPassword(u));
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Header ── */}
      <AdminPageHeader
        title="Team &amp; Customer Governance"
        subtitle="Manage staff roles, customer accounts, module permissions, and view immutable security audit logs."
        badge={{ text: "Role-Based Access Control Active", variant: "blue" }}
        breadcrumbs={[
          { label: "Customers & CRM", href: "/admin/customers" },
          { label: "Accounts & Roles" },
        ]}
        actions={[
          {
            label: "Invite Staff Member",
            icon: UserPlus,
            variant: "primary",
            onClick: () => setIsInviteSlideOverOpen(true),
          },
        ]}
      />

      {/* ── 2. KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Staff Members
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {staffUsers.length} Active Staff
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Managers &amp; Support Agents</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Registered Customers
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {customerUsers.length} Accounts
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Verified USDT buyers</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Suspended Accounts
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {users.filter((u) => !u.is_active).length} Barred
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Restricted from portal login</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F3E8FF] dark:bg-[#28183B] border border-[#E9D5FF]/50 dark:border-purple-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Audit Trail Entries
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {auditLogs.length} Events
            </span>
            <span className="text-[11px] text-purple-500 block mt-0.5">Immutable governance ledger</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "staff"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Staff &amp; Roles ({staffUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "customers"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customer Accounts ({customerUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "audit"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ── 4. Main Tables By Tab ── */}
      {activeTab === "staff" && (
        <AdminDataTable<Profile>
          data={staffUsers}
          columns={userColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search staff by email or name..."
          searchFields={["email", "display_name"]}
          filters={userFilters}
          bulkActions={userBulkActions}
          defaultSortKey="created_at"
          defaultSortDirection="desc"
          isLoading={isLoading}
          emptyTitle="No staff members found"
          emptyDescription="Invite your first operations manager or customer service agent."
          emptyAction={{
            label: "Invite Staff",
            onClick: () => setIsInviteSlideOverOpen(true),
          }}
        />
      )}

      {activeTab === "customers" && (
        <AdminDataTable<Profile>
          data={customerUsers}
          columns={userColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search customer accounts by email or name..."
          searchFields={["email", "display_name"]}
          filters={userFilters}
          bulkActions={userBulkActions}
          defaultSortKey="created_at"
          defaultSortDirection="desc"
          isLoading={isLoading}
          emptyTitle="No customer accounts found"
          emptyDescription="Customer accounts will appear as buyers register on the storefront."
        />
      )}

      {activeTab === "audit" && (
        <AdminDataTable<AuditLogEntry>
          data={auditLogs}
          columns={auditColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search audit trail by operator or action..."
          searchFields={["admin_email", "action", "entity_type"]}
          defaultSortKey="created_at"
          defaultSortDirection="desc"
          isLoading={isLoading}
          emptyTitle="Audit ledger is clean"
          emptyDescription="Administrative operations and permission modifications will be logged here."
        />
      )}

      {/* ── 5. Slide-Over Panel: Staff Member Invitation ── */}
      <SlideOver
        isOpen={isInviteSlideOverOpen}
        onClose={() => setIsInviteSlideOverOpen(false)}
        title="Invite New Staff Operator"
        description="Grant role-based access permissions to administrative modules."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsInviteSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleInviteSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Dispatching..." : "Send Invitation"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleInviteSubmit} className="space-y-5">
          <AdminFormSection title="Operator Profile">
            <AdminInput
              label="Work Email Address"
              type="email"
              required
              leftIcon={Mail}
              placeholder="e.g. agent@lennoxchinamall.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <AdminInput
              label="Full Name / Display Name"
              leftIcon={User}
              placeholder="e.g. John Doe (Procurement)"
              value={inviteDisplayName}
              onChange={(e) => setInviteDisplayName(e.target.value)}
            />
            <AdminSelect
              label="Assigned System Role"
              required
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              options={Object.entries(ROLE_LABELS)
                .filter(([r]) => r !== "customer" && r !== "vip_customer")
                .map(([value, label]) => ({
                  value,
                  label: `${label} — ${ROLE_DESCRIPTIONS[value as keyof typeof ROLE_DESCRIPTIONS] || ""}`,
                }))}
            />
          </AdminFormSection>
        </form>
      </SlideOver>

      {/* ── 6. Role Assignment Modal ── */}
      <Modal
        isOpen={Boolean(roleModalUser)}
        onClose={() => setRoleModalUser(null)}
        title={`Change Role: ${roleModalUser?.email || ""}`}
        size="md"
      >
        <div className="space-y-4 pt-1 text-slate-800 dark:text-slate-200">
          <AdminSelect
            label="Select New System Role"
            value={selectedRoleToAssign}
            onChange={(e) => setSelectedRoleToAssign(e.target.value)}
            options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
              value,
              label: `${label} — ${ROLE_DESCRIPTIONS[value as keyof typeof ROLE_DESCRIPTIONS] || ""}`,
            }))}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRoleModalUser(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleUpdateRole}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00143D] hover:bg-[#002266] transition-colors shadow-xs cursor-pointer font-heading uppercase"
            >
              {isSubmitting ? "Updating..." : "Save Role Assignment"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── 7. Audit Payload Inspection Modal ── */}
      <Modal
        isOpen={Boolean(selectedAuditLog)}
        onClose={() => setSelectedAuditLog(null)}
        title={`Audit Event: ${selectedAuditLog?.action || ""}`}
        size="lg"
      >
        {selectedAuditLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Admin Operator</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedAuditLog.admin_email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Timestamp</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDate(selectedAuditLog.created_at)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 font-heading">
                State Changes / Payload Manifest
              </span>
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800">
                {JSON.stringify(selectedAuditLog.changes, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
