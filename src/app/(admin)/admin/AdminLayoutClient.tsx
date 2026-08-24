"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Award,
  Layers,
  Boxes,
  Image as ImageIcon,
  Factory,
  ClipboardCheck,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  Users,
  Star,
  Headphones,
  Ticket,
  Zap,
  Megaphone,
  LayoutGrid,
  FileText,
  Menu as MenuIcon,
  Globe,
  Bell,
  BarChart3,
  UserCheck,
  History,
  Cpu,
  Settings,
  ShieldCheck,
  X,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Coins,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/utils/helpers";
import { Profile, UserRole } from "@/types/database";
import { hasPermission, ROLE_LABELS, AdminSection } from "@/lib/auth/roles";
import { signout } from "@/app/actions/auth";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  userProfile?: Partial<Profile> | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  section: AdminSection;
  badge?: string | null;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AdminLayoutClient({
  children,
  userProfile,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  // Close mobile menu on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const userRole = (userProfile?.role as UserRole) || "super_admin";

  const allNavSections: NavGroup[] = [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          section: "dashboard",
          badge: null,
        },
      ],
    },
    {
      title: "Catalogue & Inventory",
      items: [
        {
          label: "Products",
          href: "/admin/products",
          icon: Package,
          section: "products",
          badge: "Dual-Video",
        },
        {
          label: "Categories",
          href: "/admin/categories",
          icon: FolderTree,
          section: "categories",
          badge: null,
        },
        {
          label: "Brands",
          href: "/admin/brands",
          icon: Award,
          section: "brands",
          badge: null,
        },
        {
          label: "Attributes & Variants",
          href: "/admin/attributes",
          icon: Layers,
          section: "attributes",
          badge: null,
        },
        {
          label: "Inventory",
          href: "/admin/inventory",
          icon: Boxes,
          section: "inventory",
          badge: "Alerts",
        },
        {
          label: "Media Library",
          href: "/admin/media",
          icon: ImageIcon,
          section: "media",
          badge: null,
        },
      ],
    },
    {
      title: "Procurement & Sourcing",
      items: [
        {
          label: "Suppliers & Private Codes",
          href: "/admin/suppliers",
          icon: Factory,
          section: "suppliers",
          badge: "PRIVATE",
        },
        {
          label: "Sourcing & Purchases",
          href: "/admin/sourcing",
          icon: ClipboardCheck,
          section: "sourcing",
          badge: "China PO",
        },
      ],
    },
    {
      title: "Orders & Fulfilment",
      items: [
        {
          label: "Orders",
          href: "/admin/orders",
          icon: ShoppingCart,
          section: "orders",
          badge: "Live",
        },
        {
          label: "Payments & Reconciliation",
          href: "/admin/payments",
          icon: CreditCard,
          section: "payments",
          badge: "USDT",
        },
        {
          label: "Shipping & Tracking",
          href: "/admin/shipping",
          icon: Truck,
          section: "shipping",
          badge: "Air Cargo",
        },
        {
          label: "Returns & Refunds",
          href: "/admin/returns",
          icon: RotateCcw,
          section: "returns",
          badge: "30-Day",
        },
      ],
    },
    {
      title: "Customer & Support",
      items: [
        {
          label: "Customers",
          href: "/admin/customers",
          icon: Users,
          section: "customers",
          badge: null,
        },
        {
          label: "Reviews",
          href: "/admin/reviews",
          icon: Star,
          section: "reviews",
          badge: "UGC",
        },
        {
          label: "Support Tickets",
          href: "/admin/support",
          icon: Headphones,
          section: "support",
          badge: "Desk",
        },
      ],
    },
    {
      title: "Marketing & Campaigns",
      items: [
        {
          label: "Coupons",
          href: "/admin/coupons",
          icon: Ticket,
          section: "coupons",
          badge: null,
        },
        {
          label: "Flash Deals",
          href: "/admin/flash-deals",
          icon: Zap,
          section: "flash-deals",
          badge: "Hot",
        },
        {
          label: "Banners & Promotions",
          href: "/admin/promotions",
          icon: Megaphone,
          section: "promotions",
          badge: null,
        },
      ],
    },
    {
      title: "Storefront & Content",
      items: [
        {
          label: "Homepage Sections",
          href: "/admin/homepage-sections",
          icon: LayoutGrid,
          section: "homepage-sections",
          badge: null,
        },
        {
          label: "Pages & Content",
          href: "/admin/pages",
          icon: FileText,
          section: "pages",
          badge: "CMS",
        },
        {
          label: "Menus",
          href: "/admin/menus",
          icon: MenuIcon,
          section: "menus",
          badge: null,
        },
        {
          label: "SEO & Redirects",
          href: "/admin/seo",
          icon: Globe,
          section: "seo",
          badge: "301",
        },
      ],
    },
    {
      title: "Governance & Security",
      items: [
        {
          label: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
          section: "notifications",
          badge: null,
        },
        {
          label: "Reports & Analytics",
          href: "/admin/analytics",
          icon: BarChart3,
          section: "analytics",
          badge: "P&L",
        },
        {
          label: "Staff, Roles & Permissions",
          href: "/admin/staff",
          icon: UserCheck,
          section: "staff",
          badge: "RBAC",
        },
        {
          label: "Audit Logs",
          href: "/admin/audit-logs",
          icon: History,
          section: "audit-logs",
          badge: "Logs",
        },
        {
          label: "Integrations",
          href: "/admin/integrations",
          icon: Cpu,
          section: "integrations",
          badge: "API",
        },
        {
          label: "Store Settings",
          href: "/admin/settings",
          icon: Settings,
          section: "settings",
          badge: null,
        },
        {
          label: "Security & System Health",
          href: "/admin/security",
          icon: ShieldCheck,
          section: "security",
          badge: "SSL",
        },
      ],
    },
  ];

  // Filter navigation items by role permissions and nav search query
  const navSections = useMemo(() => {
    return allNavSections
      .map((section) => {
        const permittedItems = section.items.filter((item) =>
          hasPermission(userRole, item.section)
        );

        if (!navSearch.trim()) {
          return { ...section, items: permittedItems };
        }

        const filtered = permittedItems.filter(
          (item) =>
            item.label.toLowerCase().includes(navSearch.toLowerCase()) ||
            item.section.toLowerCase().includes(navSearch.toLowerCase())
        );

        return { ...section, items: filtered };
      })
      .filter((section) => section.items.length > 0);
  }, [allNavSections, userRole, navSearch]);

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
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>

          {/* Desktop sidebar collapse toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white items-center justify-center transition-colors cursor-pointer border border-slate-700"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Brand Logo & Tag */}
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
                China Hardware & USDT Commerce
              </span>
            </div>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/"
            target="_blank"
            className="text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold transition-colors bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-heading"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-[#FF1028] text-white font-black text-xs flex items-center justify-center shadow-xs font-heading">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-bold text-white block leading-none font-heading text-xs">
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
            className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Mobile Slide-Over Drawer Navigation ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-0 bottom-0 left-0 w-80 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
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

              {/* Mobile Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Filter admin menus..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 outline-none focus:border-[#FF1028]"
                />
              </div>

              {/* Mobile Sections */}
              <div className="space-y-5 pb-6">
                {navSections.map((sec) => (
                  <div key={sec.title} className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase px-2 block font-heading">
                      {sec.title}
                    </span>
                    <nav className="space-y-0.5">
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
                              "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all font-heading",
                              isActive
                                ? "bg-[#FF1028] text-white shadow-md"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4 shrink-0" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={cn(
                                  "text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase",
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
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-xl font-bold font-heading transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout: Desktop Sidebar + Content ── */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar (Collapsible) */}
        <aside
          className={cn(
            "bg-slate-900 border-r border-slate-800 p-3 hidden lg:flex flex-col justify-between shrink-0 transition-all duration-300 relative z-20",
            isSidebarCollapsed ? "w-[72px]" : "w-64"
          )}
        >
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 custom-scrollbar">
            {/* Search within sidebar (expanded only) */}
            {!isSidebarCollapsed && (
              <div className="relative px-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Quick jump menu..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-2.5 py-1.5 outline-none focus:border-[#FF1028]"
                />
              </div>
            )}

            {/* Navigation Groups */}
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                {!isSidebarCollapsed && (
                  <span className="text-[9px] font-black text-slate-500 tracking-wider uppercase px-3 block font-heading pt-1">
                    {sec.title}
                  </span>
                )}
                <nav className="space-y-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center rounded-xl text-xs font-bold transition-all font-heading group relative",
                          isSidebarCollapsed
                            ? "justify-center p-2.5"
                            : "justify-between px-3 py-2",
                          isActive
                            ? "bg-[#FF1028] text-white shadow-md shadow-red-950/40"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          {!isSidebarCollapsed && (
                            <span className="truncate max-w-[130px]">{item.label}</span>
                          )}
                        </div>

                        {!isSidebarCollapsed && item.badge && (
                          <span
                            className={cn(
                              "text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed Tooltip Hover */}
                        {isSidebarCollapsed && (
                          <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg border border-slate-700 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar Footer Controls */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            {!isSidebarCollapsed && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1">
                <span className="font-bold text-[#10B981] flex items-center gap-1.5 font-heading">
                  <Coins className="w-3.5 h-3.5 shrink-0" /> Binance Pay USDT
                </span>
                <p className="text-slate-400 text-[9px] leading-tight">
                  Zero gas fees. Webhook active.
                </p>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center gap-2 bg-slate-800/80 hover:bg-red-950/40 text-slate-400 hover:text-red-400 py-2 rounded-xl text-xs font-bold font-heading transition-colors cursor-pointer border border-slate-700/50",
                isSidebarCollapsed ? "justify-center px-0" : "justify-center px-3"
              )}
              title="Sign Out Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
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
