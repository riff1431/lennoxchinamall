"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  Tag,
  Coins,
  Menu,
  X,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/utils/helpers";
import { Profile, UserRole } from "@/types/database";
import { hasPermission, ROLE_LABELS } from "@/lib/auth/roles";
import { signout } from "@/app/actions/auth";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  userProfile?: Partial<Profile> | null;
}

export function AdminLayoutClient({
  children,
  userProfile,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const userRole = (userProfile?.role as UserRole) || "super_admin";

  const allNavSections = [
    {
      title: "Operations & Procurement",
      items: [
        {
          label: "Dashboard & Funnel",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          section: "dashboard" as const,
          badge: null,
        },
        {
          label: "Sourcing & Suppliers",
          href: "/admin/suppliers",
          icon: Truck,
          section: "suppliers" as const,
          badge: "PRIVATE",
        },
        {
          label: "Orders & Fulfilment",
          href: "/admin/orders",
          icon: ShoppingCart,
          section: "orders" as const,
          badge: "Live",
        },
        {
          label: "Binance Pay USDT",
          href: "/admin/payments",
          icon: CreditCard,
          section: "payments" as const,
          badge: "0-Fee",
        },
      ],
    },
    {
      title: "Catalogue & Campaigns",
      items: [
        {
          label: "Product Dual-Videos",
          href: "/admin/products",
          icon: Package,
          section: "products" as const,
          badge: null,
        },
        {
          label: "Flash Deals & Coupons",
          href: "/admin/promotions",
          icon: Tag,
          section: "promotions" as const,
          badge: "Hot",
        },
      ],
    },
    {
      title: "Governance & Security",
      items: [
        {
          label: "Team & Customers",
          href: "/admin/customers",
          icon: Users,
          section: "customers" as const,
          badge: "RBAC",
        },
      ],
    },
  ];

  // Filter navigation items by role permissions
  const navSections = allNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        hasPermission(userRole, item.section)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const displayName = userProfile?.display_name || "Lennox Admin";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "LA";

  const roleLabel = ROLE_LABELS[userRole] || "Super Admin";

  const handleSignOut = async () => {
    await signout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased font-sans select-none">
      {/* ── Top Admin Bar ── */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-white shrink-0">
              <Image
                src="/logo-lennoxchinamall.jpeg"
                alt="Lennox Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block font-heading">
                LENNOX SOURCING OS
              </span>
              <span className="text-[9px] font-mono text-[#FF1028] tracking-wider uppercase block font-bold">
                Single-Vendor Private Admin
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/"
            target="_blank"
            className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700 font-heading"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-[#FF1028] text-white font-black text-xs flex items-center justify-center shadow-xs font-heading">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-bold text-white block leading-none font-heading">
                {displayName}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {roleLabel}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign out of admin"
            className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Mobile Slide-Over Drawer Navigation ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-0 bottom-0 left-0 w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/20 bg-white">
                    <Image src="/logo-lennoxchinamall.jpeg" alt="Logo" fill className="object-cover" />
                  </div>
                  <span className="font-black text-white text-xs font-heading">LENNOX OS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {navSections.map((sec) => (
                <div key={sec.title} className="space-y-2">
                  <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase px-2 block font-heading">
                    {sec.title}
                  </span>
                  <nav className="space-y-1">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all font-heading",
                            isActive
                              ? "bg-[#FF1028] text-white shadow-md"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded font-mono font-black uppercase",
                                isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-xl font-bold font-heading transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Admin</span>
              </button>

              <div className="text-[11px] text-slate-400 space-y-1">
                <span className="text-[#10B981] font-bold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> Binance Pay Gateway Active
                </span>
                <p className="text-[10px]">Zero network gas fee settlement.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout (Desktop Sidebar + Content) ── */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase px-3 block font-heading">
                  {sec.title}
                </span>
                <nav className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all font-heading",
                          isActive
                            ? "bg-[#FF1028] text-white shadow-md"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded font-mono font-black uppercase",
                              isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 py-2 rounded-xl text-xs font-bold font-heading transition-colors cursor-pointer border border-slate-700/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Admin</span>
            </button>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-[11px] space-y-1">
              <span className="font-bold text-[#10B981] flex items-center gap-1.5 font-heading">
                <Coins className="w-3.5 h-3.5" /> Binance Webhook Live
              </span>
              <p className="text-slate-400 text-[10px]">
                Signature verification: HMAC-SHA512 active.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Surface */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 bg-slate-950 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
