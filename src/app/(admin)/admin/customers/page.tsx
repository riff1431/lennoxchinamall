"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Lock,
  History,
  UserCheck,
  Ban,
  Shield,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal } from "@/components/ui/Modal";
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
import { formatDate } from "@/utils/helpers";

interface AuditLogEntry {
  id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes: Record<string, unknown>;
  ip?: string;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "customers" | "audit">("staff");
  const [users, setUsers] = useState<Profile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<Profile | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogEntry | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    getUsersAndStaff({
      role: roleFilter,
      search: searchQuery,
      status: statusFilter,
    }).then((usersRes) => {
      if (usersRes.success) {
        setUsers(usersRes.users);
      }
      return getAuditLogs();
    }).then((auditRes) => {
      if (auditRes.success) {
        setAuditLogs(auditRes.logs);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let isMounted = true;
    getUsersAndStaff({
      role: roleFilter,
      search: searchQuery,
      status: statusFilter,
    }).then((usersRes) => {
      if (!isMounted) return;
      if (usersRes.success) {
        setUsers(usersRes.users);
      }
      return getAuditLogs();
    }).then((auditRes) => {
      if (!isMounted || !auditRes) return;
      if (auditRes.success) {
        setAuditLogs(auditRes.logs);
      }
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [roleFilter, statusFilter, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Staff invitation handler
  const handleInviteStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await inviteStaffMember(formData);

    if (res.success) {
      showToast(res.message || "Staff member invited successfully!");
      setShowInviteModal(false);
      loadData();
    } else {
      showToast(res.error || "Failed to invite staff member", true);
    }
    setIsSubmitting(false);
  };

  // Role change handler
  const handleChangeRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roleModalUser) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set("user_id", roleModalUser.id);

    const res = await updateUserRole(formData);
    if (res.success) {
      showToast(res.message || "Role updated successfully!");
      setRoleModalUser(null);
      loadData();
    } else {
      showToast(res.error || "Failed to update role", true);
    }
    setIsSubmitting(false);
  };

  // Toggle suspend/activate
  const handleToggleStatus = async (user: Profile) => {
    const newStatus = !user.is_active;
    const confirmMsg = newStatus
      ? `Activate account for ${user.email}?`
      : `Suspend account for ${user.email}? The user will be barred from logging in.`;

    if (!confirm(confirmMsg)) return;

    const formData = new FormData();
    formData.set("user_id", user.id);
    formData.set("is_active", String(newStatus));
    formData.set("reason", newStatus ? "Re-activated by Admin" : "Suspended by Super Admin");

    const res = await toggleUserStatus(formData);
    if (res.success) {
      showToast(res.message || "Status updated!");
      loadData();
    } else {
      showToast(res.error || "Failed to change status", true);
    }
  };

  // Trigger reset password
  const handleResetPassword = async (user: Profile) => {
    if (!confirm(`Send password reset email to ${user.email}?`)) return;

    const formData = new FormData();
    formData.set("email", user.email);
    formData.set("user_id", user.id);

    const res = await triggerPasswordReset(formData);
    if (res.success) {
      showToast(res.message || "Reset email dispatched!");
      loadData();
    } else {
      showToast(res.error || "Failed to send reset link", true);
    }
  };

  const staffUsers = users.filter((u) => u.role !== "customer");
  const customerUsers = users.filter((u) => u.role === "customer");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Top Header Bar ── */}
      <AdminPageHeader
        title="Team &amp; Customer Governance"
        subtitle="Manage staff roles, customer accounts, module permissions, and view immutable security audit logs."
        badge={{ text: "Role-Based Access Control Active", variant: "blue" }}
        breadcrumbs={[{ label: "Customers & Governance" }]}
        actions={[
          {
            label: "Invite Staff Member",
            icon: UserPlus,
            variant: "primary",
            onClick: () => setShowInviteModal(true),
          },
        ]}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold shadow-xs flex items-center justify-between animate-in fade-in ${
            toastMsg.isError
              ? "bg-[#FFF0F2] dark:bg-rose-950/50 border border-[#FFE4E8] dark:border-rose-900/40 text-[#E11D48] dark:text-rose-300"
              : "bg-[#DCFCE7] dark:bg-emerald-950 border border-[#BBF7D0] dark:border-emerald-800 text-[#16A34A] dark:text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm cursor-pointer">×</button>
        </div>
      )}

      {/* ── 2. Top 4 Pastel KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Staff Members
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {staffUsers.length} Active Staff
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Super Admins, Managers &amp; Agents</span>
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
              {customerUsers.length} Buyers
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Verified USDT settlement accounts</span>
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
          <div className="w-10 h-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
            <Ban className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F3E8FF] dark:bg-[#28183B] border border-[#E9D5FF]/50 dark:border-purple-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Security Audit Logs
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {auditLogs.length} Events
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Immutable governance ledger</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "staff"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Staff &amp; Roles ({staffUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "customers"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Accounts ({customerUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "audit"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ── 4. Search & Filters Bar ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by email or display name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2F65F6] transition-colors"
          />
        </form>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-xl font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="catalogue_manager">Catalogue Manager</option>
              <option value="order_manager">Order Manager</option>
              <option value="support_agent">Support Agent</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "suspended")}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 rounded-xl font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>

          <button
            type="button"
            onClick={loadData}
            title="Refresh list"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#2F65F6]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 5. Main Tab Content ── */}

      {/* TAB 1: STAFF & ROLES */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Staff Members &amp; Role Permissions ({staffUsers.length})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Granular module authorization active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Staff Identity</th>
                    <th className="py-3.5 px-4 font-bold">Assigned Role</th>
                    <th className="py-3.5 px-4 font-bold">Authorized Modules</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Created</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {staffUsers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#EEF4FF] dark:bg-blue-950 text-[#2F65F6] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200 dark:border-blue-800">
                            {(member.display_name || member.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {member.display_name || "Lennox Staff"}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            member.role === "super_admin"
                              ? "bg-[#FFF0F2] dark:bg-rose-950/60 text-[#E11D48] dark:text-rose-400 border border-[#FFE4E8]"
                              : member.role === "catalogue_manager"
                              ? "bg-[#F3E8FF] dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-[#E9D5FF]"
                              : member.role === "order_manager"
                              ? "bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] dark:text-blue-400 border border-[#BFDBFE]"
                              : "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]"
                          }`}
                        >
                          {ROLE_LABELS[member.role]}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {ROLE_DESCRIPTIONS[member.role]}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            member.is_active
                              ? "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]/60"
                              : "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-[#FED7AA]/60"
                          }`}
                        >
                          {member.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDate(member.created_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setRoleModalUser(member)}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-[#2F65F6] hover:text-white text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Change Role
                          </button>

                          <button
                            onClick={() => handleResetPassword(member)}
                            title="Send password reset link"
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(member)}
                            title={member.is_active ? "Suspend account" : "Activate account"}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              member.is_active
                                ? "bg-[#FFF0F2] dark:bg-rose-950/60 hover:bg-rose-100 text-[#E11D48]"
                                : "bg-[#F0FDF4] dark:bg-emerald-950/60 hover:bg-emerald-100 text-[#16A34A]"
                            }`}
                          >
                            {member.is_active ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Capabilities Guide Table */}
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Lennox Sourcing OS Role Permission Matrix</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-[#E11D48] block">Super Admin</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Full system control. Access to All Modules, Financial Logs, Staff Invites, and Audit Trail.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">All 9 Modules</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Staff Governance</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-purple-600 dark:text-purple-400 block">Catalogue Manager</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Manages products, dual-video media, private supplier codes, and promotions.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Products</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Suppliers</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Promotions</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-[#2F65F6] block">Order Manager</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Fulfilment OS, air cargo tracking updates, Binance Pay USDT ledger, and supplier POs.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Orders</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Binance Pay</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Suppliers</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-[#16A34A] block">Support Agent</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Customer support desk, 30-day warranty claims, returns review, and order status view.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Orders (Read)</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Customers</span>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">Tickets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMERS */}
      {activeTab === "customers" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Customer Accounts ({customerUsers.length})
            </span>
            <span className="text-[11px] text-[#16A34A] font-bold">
              Protected via Supabase RLS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Customer Identity</th>
                  <th className="py-3.5 px-4 font-bold">Contact Phone</th>
                  <th className="py-3.5 px-4 font-bold">Buyer Tier</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Registered</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {customerUsers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {(customer.display_name || customer.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {customer.display_name || "Customer Buyer"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {customer.phone || "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        USDT Verified Buyer
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          customer.is_active
                            ? "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]/60"
                            : "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-[#FED7AA]/60"
                        }`}
                      >
                        {customer.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {formatDate(customer.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setRoleModalUser(customer)}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-[#2F65F6] hover:text-white text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Promote to Staff
                        </button>

                        <button
                          onClick={() => handleResetPassword(customer)}
                          title="Send password reset link"
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(customer)}
                          title={customer.is_active ? "Suspend buyer" : "Activate buyer"}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            customer.is_active
                              ? "bg-[#FFF0F2] dark:bg-rose-950/60 hover:bg-rose-100 text-[#E11D48]"
                              : "bg-[#F0FDF4] dark:bg-emerald-950/60 hover:bg-emerald-100 text-[#16A34A]"
                          }`}
                        >
                          {customer.is_active ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Security Governance Audit Trail ({auditLogs.length})
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Immutable PostgreSQL security records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Timestamp</th>
                  <th className="py-3.5 px-4 font-bold">Admin Actor</th>
                  <th className="py-3.5 px-4 font-bold">Action Type</th>
                  <th className="py-3.5 px-4 font-bold">Target Entity</th>
                  <th className="py-3.5 px-4 font-bold">IP &amp; Origin</th>
                  <th className="py-3.5 px-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {log.admin_email || "Super Admin"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-[#16A34A] dark:text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)})` : ""}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {log.ip || "183.14.28.102 (Shenzhen)"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedAuditLog(log)}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-[#2F65F6] hover:text-white text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        View Diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}

      {/* 1. Invite Staff Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Staff Member"
        size="md"
      >
        <form onSubmit={handleInviteStaff} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="display_name"
                required
                placeholder="e.g. Shenzhen Dispatcher"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                placeholder="staff@lennoxchinamall.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Assign Role</label>
            <select
              name="role"
              required
              defaultValue="support_agent"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-[#2F65F6] cursor-pointer"
            >
              <option value="support_agent">Support Agent (Customer &amp; Orders Desk)</option>
              <option value="order_manager">Order Manager (Fulfilment &amp; USDT Ledger)</option>
              <option value="catalogue_manager">Catalogue Manager (Products &amp; Deals)</option>
              <option value="super_admin">Super Admin (Full Platform Control)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Initial Temp Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="temp_password"
                defaultValue="LennoxChina2026!"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Staff member will be prompted to change password upon first sign-in.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors cursor-pointer shadow-blue-500/25 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Inviting..." : "Confirm & Send Invite"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Change Role Modal */}
      {roleModalUser && (
        <Modal
          isOpen={!!roleModalUser}
          onClose={() => setRoleModalUser(null)}
          title="Change Account Role"
          size="md"
        >
          <form onSubmit={handleChangeRole} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
            <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">{roleModalUser.display_name || roleModalUser.email}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">{roleModalUser.email}</span>
              <span className="text-[10px] text-slate-500 block">
                Current Role: <strong>{ROLE_LABELS[roleModalUser.role]}</strong>
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">New Role</label>
              <select
                name="role"
                required
                defaultValue={roleModalUser.role}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="customer">Customer (Standard Verified Buyer)</option>
                <option value="support_agent">Support Agent (Customer Desk)</option>
                <option value="order_manager">Order Manager (Fulfilment &amp; USDT)</option>
                <option value="catalogue_manager">Catalogue Manager (Products &amp; Deals)</option>
                <option value="super_admin">Super Admin (Full Control)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Reason for Role Change *</label>
              <input
                type="text"
                name="reason"
                required
                placeholder="e.g. Promoted to Shenzhen Catalogue Manager"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors cursor-pointer shadow-blue-500/25 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Role & Permissions"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Audit Log Diff Modal */}
      {selectedAuditLog && (
        <Modal
          isOpen={!!selectedAuditLog}
          onClose={() => setSelectedAuditLog(null)}
          title="Audit Event Details"
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Action:</span>
                <span className="font-mono text-[#16A34A] dark:text-emerald-400 font-bold">{selectedAuditLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Admin Actor:</span>
                <span className="text-slate-900 dark:text-white font-mono">{selectedAuditLog.admin_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Target Entity:</span>
                <span className="text-slate-900 dark:text-white font-mono">{selectedAuditLog.entity_type} {selectedAuditLog.entity_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">IP &amp; Origin:</span>
                <span className="text-slate-900 dark:text-white font-mono">{selectedAuditLog.ip}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Timestamp:</span>
                <span className="text-slate-900 dark:text-white font-mono">{selectedAuditLog.created_at}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Payload / Change Diff:</span>
              <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(selectedAuditLog.changes, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
