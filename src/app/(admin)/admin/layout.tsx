"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  Users,
  Tag,
  FileText,
  Settings,
  ShieldAlert,
  Coins,
  Menu,
  X,
  ExternalLink,
  Bell,
  Search,
} from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/helpers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* ── Top Admin Bar ── */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-white shrink-0">
              <Image
                src="/logo-lennoxchinamall.jpeg"
                alt="Lennox Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">
                LENNOX SOURCING OS
              </span>
              <span className="text-[9px] font-mono text-[#FF1028] tracking-wider uppercase block font-bold">
                Single-Vendor Private Admin
              </span>
            </div>
          </Link>

          <Badge variant="deal" size="sm" className="hidden sm:inline-flex">
            🔒 SECRET SUPPLIER CODES ACTIVE
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            target="_blank"
            className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-orange-400 font-black text-xs flex items-center justify-center border border-slate-700">
              LR
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-bold text-white block leading-none">
                Lennox Roach
              </span>
              <span className="text-[10px] text-slate-400">Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* ── Desktop Sidebar Navigation (Fixed width) ── */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase px-3 block mb-2">
                Operations & Procurement
              </span>
              <nav className="space-y-1">
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    pathname === "/admin/dashboard"
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard & Funnel</span>
                </Link>

                <Link
                  href="/admin/suppliers"
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    pathname.startsWith("/admin/suppliers")
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Sourcing & Suppliers</span>
                  </div>
                  <span className="text-[10px] bg-orange-950 text-orange-300 px-1.5 py-0.5 rounded font-mono font-black">
                    PRIVATE
                  </span>
                </Link>

                <Link
                  href="/admin/orders"
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    pathname.startsWith("/admin/orders")
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Orders & Fulfilment</span>
                  </div>
                  <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                    3 active
                  </span>
                </Link>

                <Link
                  href="/admin/payments"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    pathname.startsWith("/admin/payments")
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Binance Pay USDT</span>
                </Link>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase px-3 block mb-2">
                Catalogue & Content
              </span>
              <nav className="space-y-1">
                <Link
                  href="/admin/products"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    pathname.startsWith("/admin/products")
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Package className="w-4 h-4" />
                  <span>Product Dual-Videos</span>
                </Link>

                <Link
                  href="/admin/promotions"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    pathname.startsWith("/admin/promotions")
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Tag className="w-4 h-4" />
                  <span>Flash Deals & Coupons</span>
                </Link>

                <Link
                  href="/admin/settings"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    pathname.startsWith("/admin/settings")
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span>Store Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> Binance Webhook Live
            </span>
            <p className="text-slate-400 text-[10px]">
              Signature verification: HMAC-SHA256 active.
            </p>
          </div>
        </aside>

        {/* ── Main Admin Content Surface ── */}
        <main className="flex-1 p-4 sm:p-8 bg-slate-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
