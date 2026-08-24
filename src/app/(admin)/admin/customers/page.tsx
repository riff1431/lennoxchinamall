"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  User,
  Lock,
  Clock,
  History,
  Coins,
  Sparkles,
  ChevronRight,
  UserCheck,
  Ban,
  Shield,
  Eye,
} from "lucide-react";
import { Profile, UserRole } from "@/types/database";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ADMIN_ROLES } from "@/lib/auth/roles";
import {
  getUsersAndStaff,
  inviteStaffMember,
  updateUserRole,
  toggleUserStatus,
  triggerPasswordReset,
  getAuditLogs,
} from "@/app/actions/admin-users";
import { formatDate } from "@/utils/helpers";

export default function AdminCustomersPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "customers" | "audit">("staff");
  const [users, setUsers] = useState<Profile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<Profile | null>(null);
  const [inspectUser, setInspectUser] = useState<Profile | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const usersRes = await getUsersAndStaff({
      role: roleFilter,
      search: searchQuery,
      status: statusFilter,
    });
    if (usersRes.success) {
      setUsers(usersRes.users);
    }

    const auditRes = await getAuditLogs();
    if (auditRes.success) {
      setAuditLogs(auditRes.logs);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [roleFilter, statusFilter]);

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
      showToast(res.message || "User role updated!");
      setRoleModalUser(null);
      loadData();
    } else {
      showToast(res.error || "Failed to update role", true);
    }
    setIsSubmitting(false);
  };

  // Toggle user active status
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
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── 1. Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading">
              LENNOX GOVERNANCE OS
            </span>
            <span className="text-xs text-[#10B981] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role-Based Access Control Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
            Team & Customer Governance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage staff roles, customer accounts, module permissions, and view immutable security audit logs.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2.5 rounded-xl text-xs font-black font-heading flex items-center gap-2 transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in ${
            toastMsg.isError
              ? "bg-red-500 text-white"
              : "bg-[#10B981] text-slate-950"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Staff Members</span>
            <Shield className="w-4 h-4 text-[#FF1028]" />
          </div>
          <span className="text-2xl font-black text-white block font-heading price-tag">
            {staffUsers.length} Active Staff
          </span>
          <span className="text-[10px] text-slate-400">Super Admins, Managers & Agents</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Registered Customers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-white block font-heading price-tag">
            {customerUsers.length} Buyers
          </span>
          <span className="text-[10px] text-[#10B981]">Verified USDT Settlement Accounts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Suspended Accounts</span>
            <Ban className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400 block font-heading price-tag">
            {users.filter((u) => !u.is_active).length} Barred
          </span>
          <span className="text-[10px] text-slate-400">Restricted from portal login</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Security Audit Logs</span>
            <History className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-white block font-heading price-tag">
            {auditLogs.length} Events
          </span>
          <span className="text-[10px] text-slate-400">Immutable governance ledger</span>
        </div>
      </div>

      {/* ── 3. Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-2 rounded-xl text-xs font-black font-heading transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "staff"
              ? "bg-[#00143D] text-white border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4 text-[#FF1028]" />
          <span>Staff & Roles ({staffUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2 rounded-xl text-xs font-black font-heading transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "customers"
              ? "bg-[#00143D] text-white border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          <span>Customer Accounts ({customerUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-black font-heading transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "audit"
              ? "bg-[#00143D] text-white border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <History className="w-4 h-4 text-emerald-400" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ── 4. Search & Filters Bar ── */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by email or display name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
          />
        </form>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] font-bold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white px-2.5 py-1.5 rounded-xl font-semibold focus:outline-none cursor-pointer"
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
            <span className="text-slate-400 text-[11px] font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-white px-2.5 py-1.5 rounded-xl font-semibold focus:outline-none cursor-pointer"
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
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 5. Main Tab Content ── */}

      {/* TAB 1: STAFF & ROLES */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-heading text-xs font-black text-white uppercase tracking-wider">
                Staff Members & Role Permissions ({staffUsers.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Granular module authorization active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Staff Identity</th>
                    <th className="py-3.5 px-4 font-bold">Assigned Role</th>
                    <th className="py-3.5 px-4 font-bold">Authorized Modules</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Created</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {staffUsers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#00143D] text-white flex items-center justify-center font-bold text-xs font-heading shrink-0 border border-slate-700">
                            {(member.display_name || member.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block font-heading">
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
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-heading ${
                            member.role === "super_admin"
                              ? "bg-red-500/10 text-[#FF1028] border border-red-500/20"
                              : member.role === "catalogue_manager"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : member.role === "order_manager"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-emerald-500/10 text-[#10B981] border border-emerald-500/20"
                          }`}
                        >
                          {ROLE_LABELS[member.role]}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {ROLE_DESCRIPTIONS[member.role]}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            member.is_active
                              ? "bg-emerald-500/10 text-[#10B981]"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {member.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDate(member.created_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setRoleModalUser(member)}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Change Role
                          </button>

                          <button
                            onClick={() => handleResetPassword(member)}
                            title="Send password reset link"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(member)}
                            title={member.is_active ? "Suspend account" : "Activate account"}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              member.is_active
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981]"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-heading text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Lennox Sourcing OS Role Permission Matrix</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-black text-[#FF1028] font-heading block">Super Admin</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Full system control. Access to All Modules, Financial Logs, Staff Invites, and Audit Trail.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">All 9 Modules</span>
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Staff Governance</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-black text-purple-400 font-heading block">Catalogue Manager</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Manages products, dual-video media, private supplier codes, and promotions.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Products</span>
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Suppliers</span>
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Promotions</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-black text-blue-400 font-heading block">Order Manager</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Fulfilment OS, air cargo tracking updates, Binance Pay USDT ledger, and supplier POs.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Orders</span>
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Binance Pay</span>
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Suppliers</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-black text-[#10B981] font-heading block">Support Agent</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Customer support desk, 30-day warranty claims, returns review, and order status view.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Orders (Read)</span>
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Customers</span>
                  <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded">Tickets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMERS */}
      {activeTab === "customers" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="font-heading text-xs font-black text-white uppercase tracking-wider">
              Customer Accounts ({customerUsers.length})
            </span>
            <span className="text-[11px] text-[#10B981] font-bold">
              Protected via Supabase RLS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Customer Identity</th>
                  <th className="py-3.5 px-4 font-bold">Contact Phone</th>
                  <th className="py-3.5 px-4 font-bold">Buyer Tier</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Registered</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {customerUsers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs font-heading shrink-0">
                          {(customer.display_name || customer.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white block font-heading">
                            {customer.display_name || "Customer Buyer"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {customer.phone || "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        USDT Verified Buyer
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          customer.is_active
                            ? "bg-emerald-500/10 text-[#10B981]"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {customer.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDate(customer.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setRoleModalUser(customer)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Promote to Staff
                        </button>

                        <button
                          onClick={() => handleResetPassword(customer)}
                          title="Send password reset link"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(customer)}
                          title={customer.is_active ? "Suspend buyer" : "Activate buyer"}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            customer.is_active
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981]"
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="font-heading text-xs font-black text-white uppercase tracking-wider">
              Security Governance Audit Trail ({auditLogs.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Immutable PostgreSQL security records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Timestamp</th>
                  <th className="py-3.5 px-4 font-bold">Admin Actor</th>
                  <th className="py-3.5 px-4 font-bold">Action Type</th>
                  <th className="py-3.5 px-4 font-bold">Target Entity</th>
                  <th className="py-3.5 px-4 font-bold">IP & Origin</th>
                  <th className="py-3.5 px-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block font-heading">
                        {log.admin_email || "Super Admin"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-800 text-[#10B981] font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)})` : ""}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {log.ip || "183.14.28.102 (Shenzhen)"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedAuditLog(log)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
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
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FF1028]" />
                <h3 className="font-heading font-black text-white text-base">
                  Invite Staff Member
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteStaff} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="display_name"
                    required
                    placeholder="e.g. Shenzhen Dispatcher"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="staff@lennoxchinamall.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Assign Role</label>
                <select
                  name="role"
                  required
                  defaultValue="support_agent"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-[#FF1028]"
                >
                  <option value="support_agent">Support Agent (Customer & Orders Desk)</option>
                  <option value="order_manager">Order Manager (Fulfilment & USDT Ledger)</option>
                  <option value="catalogue_manager">Catalogue Manager (Products & Deals)</option>
                  <option value="super_admin">Super Admin (Full Platform Control)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Initial Temp Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="temp_password"
                    defaultValue="LennoxChina2026!"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#FF1028]"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Staff member will be prompted to change password upon first sign-in.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-2.5 rounded-xl font-black font-heading text-xs transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Inviting..." : "Confirm & Send Invite"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Change Role Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FF1028]" />
                <h3 className="font-heading font-black text-white text-base">
                  Change Account Role
                </h3>
              </div>
              <button
                onClick={() => setRoleModalUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangeRole} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-white block">{roleModalUser.display_name || roleModalUser.email}</span>
                <span className="text-[11px] text-slate-400 font-mono block">{roleModalUser.email}</span>
                <span className="text-[10px] text-slate-500 block">
                  Current Role: <strong>{ROLE_LABELS[roleModalUser.role]}</strong>
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">New Role</label>
                <select
                  name="role"
                  required
                  defaultValue={roleModalUser.role}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-[#FF1028]"
                >
                  <option value="customer">Customer (Standard Verified Buyer)</option>
                  <option value="support_agent">Support Agent (Customer Desk)</option>
                  <option value="order_manager">Order Manager (Fulfilment & USDT)</option>
                  <option value="catalogue_manager">Catalogue Manager (Products & Deals)</option>
                  <option value="super_admin">Super Admin (Full Control)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Reason for Role Change *</label>
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="e.g. Promoted to Shenzhen Catalogue Manager"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-2.5 rounded-xl font-black font-heading text-xs transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Role & Permissions"}
                </button>
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Audit Log Diff Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-black text-white text-base">
                  Audit Event Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Action:</span>
                <span className="font-mono text-[#10B981] font-bold">{selectedAuditLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Admin Actor:</span>
                <span className="text-white font-mono">{selectedAuditLog.admin_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Entity:</span>
                <span className="text-white font-mono">{selectedAuditLog.entity_type} {selectedAuditLog.entity_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">IP & Origin:</span>
                <span className="text-white font-mono">{selectedAuditLog.ip}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-white font-mono">{selectedAuditLog.created_at}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-300 block">Payload / Change Diff:</span>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(selectedAuditLog.changes, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => setSelectedAuditLog(null)}
              className="w-full bg-slate-800 text-white py-2 rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
