"use client";

import React, { useState } from "react";
import { Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { changePassword } from "@/app/actions/auth";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export function SecurityPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.set("current_password", currentPassword);
    formData.set("new_password", newPassword);
    formData.set("confirm_password", confirmPassword);

    try {
      const result = await changePassword(formData);
      if (result && !result.success) {
        setError(result.error || "Failed to update password.");
      } else {
        setSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-[#FF1028]" />
        <h3 className="text-xs font-black text-[#00143D] uppercase font-heading">
          Change Account Password
        </h3>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#FF1028] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">Current Password</label>
          <input
            type={showPass ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#00143D]"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">New Password</label>
          <input
            type={showPass ? "text" : "password"}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#00143D]"
          />
        </div>

        {newPassword.length > 0 && <PasswordStrengthMeter password={newPassword} />}

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">Confirm New Password</label>
          <input
            type={showPass ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#00143D]"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPass ? "Hide Passwords" : "Show Passwords"}</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#00143D] hover:bg-[#002366] text-white py-2.5 rounded-xl text-xs font-black font-heading uppercase tracking-wider transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isLoading ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
