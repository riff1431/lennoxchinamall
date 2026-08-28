"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Package,
  Heart,
  RotateCcw,
  MessageCircle,
  MapPin,
  Star,
  LogOut,
  ShieldCheck,
  Bell,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { cn } from "@/utils/helpers";
import { useAuth } from "@/components/providers/AuthProvider";
import { signout } from "@/app/actions/auth";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, displayName, role, isLoading } = useAuth();

  const navLinks = [
    { label: "Account Overview", href: "/account", icon: LayoutDashboard },
    { label: "Notifications & Alerts", href: "/account/notifications", icon: Bell },
    { label: "My Profile & Security", href: "/account/profile", icon: User },
    { label: "Orders & Live Tracking", href: "/account/orders", icon: Package },
    { label: "Shipping Addresses", href: "/account/addresses", icon: MapPin },
    { label: "My Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Historial de Navegación", href: "/account/history", icon: Clock },
    { label: "Verified Reviews", href: "/account/reviews", icon: Star },
    { label: "Support Tickets", href: "/account/support", icon: MessageCircle },
    { label: "Returns & Refunds", href: "/account/returns", icon: RotateCcw },
  ];

  const email = user?.email || "";
  const name = displayName || email.split("@")[0] || "User";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const emailVerified = !!user?.email_confirmed_at;

  const handleSignOut = async () => {
    await signout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Email Verification Banner */}
        {user && !emailVerified && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <span className="font-bold text-amber-800">Verify your email address</span>
              <p className="text-amber-600 mt-0.5">
                Please check your inbox for a verification link to activate all account features.
              </p>
            </div>
            <Link
              href="/auth/verify-email"
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              Resend
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Account Sidebar (4 cols) */}
          <aside className="md:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 sticky top-24">
            {/* User Profile Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#00143D] to-[#002366] text-white font-black text-base flex items-center justify-center shadow-md border-2 border-white shrink-0 font-heading">
                {isLoading ? "..." : initials}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-black text-[#00143D] block truncate font-heading">
                  {isLoading ? "Loading..." : name}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {email}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#10B981] font-extrabold mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {emailVerified ? "Verified Buyer" : "Email Pending"}
                </span>
              </div>
            </div>

            {/* Nav list */}
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href === "/account" && pathname === "/account");

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                      isActive
                        ? "bg-[#00143D] text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-50 hover:text-[#FF1028]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-[#FF1028]" : "text-slate-400"
                      )}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content Area (8 cols) */}
          <div className="md:col-span-8 min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
    </div>
  );
}
