"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Lock,
  Coins,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateProfile, changePassword } from "@/app/actions/auth";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function AccountProfilePage() {
  const { user, displayName, role, isLoading } = useAuth();
  const { isSpanish } = useTranslation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("USDT");

  // Profile save state
  const [profileMsg, setProfileMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Initialize from auth context and fetch additional profile data
  useEffect(() => {
    if (user) {
      setName(displayName || "");
      const supabase = createClient();
      supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.phone) setPhone(data.phone);
        });
    }
  }, [user, displayName]);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);

    if (res.success) {
      setProfileMsg({
        text: isSpanish ? "¡Preferencias de perfil guardadas exitosamente!" : "Profile preferences saved successfully!",
        isError: false,
      });
    } else {
      setProfileMsg({
        text: res.error || (isSpanish ? "Error al actualizar el perfil" : "Failed to update profile"),
        isError: true,
      });
    }
    setIsSavingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({
        text: isSpanish ? "La nueva contraseña debe tener al menos 8 caracteres." : "New password must be at least 8 characters.",
        isError: true,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        text: isSpanish ? "Las contraseñas no coinciden." : "Passwords do not match.",
        isError: true,
      });
      return;
    }

    setIsChangingPassword(true);
    const formData = new FormData(e.currentTarget);
    const res = await changePassword(formData);

    if (res.success) {
      setPasswordMsg({
        text: isSpanish ? "¡Contraseña actualizada exitosamente!" : "Password updated successfully!",
        isError: false,
      });
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } else {
      setPasswordMsg({
        text: res.error || (isSpanish ? "Error al actualizar la contraseña" : "Failed to update password"),
        isError: true,
      });
    }
    setIsChangingPassword(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D] font-heading">
            {isSpanish ? "Mi Perfil y Seguridad de Cuenta" : "Account Profile & Security"}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isSpanish
              ? "Administra tus credenciales, configuraciones de seguridad y preferencias de Binance Pay."
              : "Manage your credentials, security settings, and Binance Pay preferences."}
          </p>
        </div>
        <span className="bg-emerald-50 text-[#10B981] text-xs font-black px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto font-heading">
          {role
            ? isSpanish
              ? (role === "admin" ? "Administrador" : role === "super_admin" ? "Super Administrador" : "Cliente")
              : ROLE_LABELS[role]
            : (isSpanish ? "Cliente" : "Customer")}
        </span>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-xl text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">
            {isSpanish ? "Nombre Completo" : "Full Name"}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="display_name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">
            {isSpanish ? "Correo Electrónico (ID Principal de Abastecimiento)" : "Email Address (Primary Sourcing ID)"}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              disabled
              value={user?.email || (isSpanish ? "Cargando..." : "Loading...")}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>
          <span className="text-[10px] text-slate-400 block">
            {isSpanish
              ? "Vinculado a tu correo verificado de Supabase. No se puede cambiar directamente."
              : "Tied to your Supabase verified email. Cannot be changed directly."}
          </span>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">
            {isSpanish ? "Número de Teléfono (para Rastreo Aéreo Express)" : "Phone Number (for Courier Air Express Tracking)"}
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">
            {isSpanish ? "Moneda de Liquidación Predeterminada" : "Default Settlement Currency"}
          </label>
          <div className="relative">
            <Coins className="w-4 h-4 text-[#10B981] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:border-[#00143D]"
            >
              <option value="USDT">
                {isSpanish ? "USDT (Binance Pay - Cero Comisión de Red)" : "USDT (Binance Pay - Zero Network Fee)"}
              </option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {profileMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              profileMsg.isError
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-[#10B981] border border-emerald-200"
            }`}
          >
            {profileMsg.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="bg-[#00143D] hover:bg-[#FF1028] text-white px-6 py-3 rounded-xl font-black text-xs font-heading transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSavingProfile
                ? (isSpanish ? "Guardando..." : "Saving...")
                : (isSpanish ? "Guardar Preferencias de Perfil" : "Save Profile Preferences")}
            </span>
          </button>
        </div>
      </form>

      {/* Security & Password Section */}
      <div className="pt-6 border-t border-slate-100 space-y-4 max-w-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#FF1028]" />
            <span className="font-heading font-black text-slate-900 text-sm">
              {isSpanish ? "Seguridad de Cuenta y Contraseña" : "Account Security & Password"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="text-xs font-bold text-[#00143D] hover:text-[#FF1028] transition-colors cursor-pointer"
          >
            {showPasswordSection
              ? (isSpanish ? "Cancelar" : "Cancel")
              : (isSpanish ? "Cambiar Contraseña" : "Change Password")}
          </button>
        </div>

        {showPasswordSection && (
          <form
            onSubmit={handlePasswordSubmit}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs animate-in fade-in"
          >
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                {isSpanish ? "Nueva Contraseña" : "New Password"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="new_password"
                  required
                  minLength={8}
                  placeholder={isSpanish ? "Mínimo 8 caracteres" : "Minimum 8 characters"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:border-[#00143D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                {isSpanish ? "Confirmar Nueva Contraseña" : "Confirm New Password"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  required
                  minLength={8}
                  placeholder={isSpanish ? "Vuelve a ingresar tu nueva contraseña" : "Re-enter your new password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:border-[#00143D]"
                />
              </div>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  passwordMsg.isError
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-[#10B981] border border-emerald-200"
                }`}
              >
                {passwordMsg.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl font-black font-heading text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isChangingPassword
                ? (isSpanish ? "Actualizando Contraseña..." : "Updating Password...")
                : (isSpanish ? "Actualizar Contraseña" : "Update Password")}
            </button>
          </form>
        )}

        {/* Security Info Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 font-heading">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>{isSpanish ? "Estado de Autenticación" : "Authentication Status"}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              ID: {user?.id.slice(0, 8)}...
            </span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            {isSpanish
              ? "Tu sesión está protegida con cookies HTTP-only y rotación criptográfica de tokens. Los permisos se aplican en el servidor mediante Supabase Row-Level Security (RLS)."
              : "Your session is secured with HTTP-only cookies and cryptographic token rotation. Role permissions are enforced server-side via Supabase Row-Level Security (RLS)."}
          </p>
        </div>
      </div>
    </div>
  );
}
