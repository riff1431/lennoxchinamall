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
  ChevronDown,
  Search,
  MessageSquare,
  Building2,
  FolderKanban,
  Calendar,
  CheckSquare,
  Contact,
  Sun,
  Moon,
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
  children?: { label: string; href: string }[];
}

interface NavGroup {
  title?: string;
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    Ecommerce: false,
    Customers: false,
    CRM: false,
    Projects: false,
    Contacts: false,
  });

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("lennox_admin_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    localStorage.setItem("lennox_admin_theme", dark ? "dark" : "light");
  };

  // Close mobile menu on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const userRole = (userProfile?.role as UserRole) || "super_admin";

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Navigation structure matching reference layout & comprehensive Lennox store operations
  const allNavSections: NavGroup[] = [
    {
      items: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          section: "dashboard",
        },
        {
          label: "Ecommerce",
          href: "/admin/products",
          icon: ShoppingCart,
          section: "products",
          children: [
            { label: "Products", href: "/admin/products" },
            { label: "Categories", href: "/admin/categories" },
            { label: "Brands", href: "/admin/brands" },
            { label: "Attributes", href: "/admin/attributes" },
            { label: "Inventory", href: "/admin/inventory" },
            { label: "Media Library", href: "/admin/media" },
          ],
        },
        {
          label: "Customers",
          href: "/admin/customers",
          icon: Users,
          section: "customers",
          children: [
            { label: "Customer List", href: "/admin/customers" },
            { label: "Reviews & UGC", href: "/admin/reviews" },
          ],
        },
        {
          label: "CRM",
          href: "/admin/orders",
          icon: Users,
          section: "orders",
          children: [
            { label: "Orders Fulfilment", href: "/admin/orders" },
            { label: "USDT Payments", href: "/admin/payments" },
            { label: "Air Cargo Tracking", href: "/admin/shipping" },
            { label: "Returns & Refunds", href: "/admin/returns" },
          ],
        },
        {
          label: "Chat",
          href: "/admin/support",
          icon: MessageSquare,
          section: "support",
          badge: "3",
        },
        {
          label: "Companies",
          href: "/admin/suppliers",
          icon: Building2,
          section: "suppliers",
        },
        {
          label: "Projects",
          href: "/admin/sourcing",
          icon: FolderKanban,
          section: "sourcing",
          children: [
            { label: "China Sourcing PO", href: "/admin/sourcing" },
            { label: "Homepage Sections", href: "/admin/homepage-sections" },
            { label: "Banners & Promos", href: "/admin/promotions" },
            { label: "Flash Deals", href: "/admin/flash-deals" },
          ],
        },
        {
          label: "Calendar",
          href: "/admin/coupons",
          icon: Calendar,
          section: "coupons",
        },
        {
          label: "Tasks",
          href: "/admin/audit-logs",
          icon: CheckSquare,
          section: "audit-logs",
        },
        {
          label: "Contacts",
          href: "/admin/staff",
          icon: Contact,
          section: "staff",
          children: [
            { label: "Staff & RBAC", href: "/admin/staff" },
            { label: "Store Settings", href: "/admin/settings" },
            { label: "Integrations & API", href: "/admin/integrations" },
            { label: "Analytics & P&L", href: "/admin/analytics" },
          ],
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
            item.section.toLowerCase().includes(navSearch.toLowerCase()) ||
            item.children?.some((c) =>
              c.label.toLowerCase().includes(navSearch.toLowerCase())
            )
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
    <div
      className={cn(
        "min-h-screen flex antialiased font-sans select-none transition-colors duration-200",
        isDarkMode ? "bg-[#0B0F19] text-slate-100" : "bg-[#F3F4F7] text-slate-900"
      )}
    >
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "sticky top-0 h-screen hidden lg:flex flex-col justify-between shrink-0 transition-all duration-300 z-30",
          isDarkMode
            ? "bg-[#111827] border-r border-slate-800"
            : "bg-white border-r border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
          isSidebarCollapsed ? "w-[80px] p-3" : "w-[240px] p-5"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header Logo */}
          <div className="flex items-center justify-between pb-6 pt-1">
            <Link
              href="/admin/dashboard"
              className={cn(
                "flex items-center gap-2.5 transition-transform hover:opacity-90",
                isSidebarCollapsed && "justify-center w-full"
              )}
            >
              {/* Connected Geometric Modern Logo Icon */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="16" cy="16" r="3.5" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {!isSidebarCollapsed && (
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-xl font-black tracking-wider uppercase font-heading",
                      isDarkMode ? "text-white" : "text-[#2563EB]"
                    )}
                  >
                    NETIC
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    OS
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Nav List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pr-0.5">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <nav className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin/dashboard" && pathname.startsWith(item.href)) ||
                      (item.children && item.children.some((c) => pathname.startsWith(c.href)));

                    const hasSubmenu = item.children && item.children.length > 0;
                    const isSubmenuOpen = !!openSubmenus[item.label];

                    return (
                      <div key={item.label} className="space-y-1">
                        <div
                          onClick={() => {
                            if (hasSubmenu && !isSidebarCollapsed) {
                              toggleSubmenu(item.label);
                            }
                          }}
                          className={cn(
                            "flex items-center justify-between rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer group",
                            isSidebarCollapsed ? "p-3 justify-center" : "px-3.5 py-2.5",
                            isActive
                              ? "bg-[#2F65F6] text-white shadow-md shadow-blue-500/25"
                              : isDarkMode
                              ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                          )}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 flex-1 min-w-0",
                              isSidebarCollapsed && "justify-center"
                            )}
                            onClick={(e) => {
                              if (hasSubmenu && !isSidebarCollapsed) {
                                // Allow click through or toggle
                              }
                            }}
                          >
                            <Icon
                              className={cn(
                                "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                                isActive
                                  ? "text-white"
                                  : isDarkMode
                                  ? "text-slate-400"
                                  : "text-slate-400 group-hover:text-slate-600"
                              )}
                            />
                            {!isSidebarCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </Link>

                          {!isSidebarCollapsed && (
                            <div className="flex items-center gap-1.5 ml-2">
                              {item.badge && (
                                <span
                                  className={cn(
                                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                                    isActive
                                      ? "bg-white/20 text-white"
                                      : "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                              {hasSubmenu && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubmenu(item.label);
                                  }}
                                  className="p-0.5 opacity-70 hover:opacity-100"
                                >
                                  <ChevronDown
                                    className={cn(
                                      "w-3.5 h-3.5 transition-transform duration-200",
                                      isSubmenuOpen && "rotate-180"
                                    )}
                                  />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Expandable Submenu Items */}
                        {!isSidebarCollapsed && hasSubmenu && isSubmenuOpen && (
                          <div className="pl-9 pr-2 py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                            {item.children?.map((child) => {
                              const isChildActive = pathname === child.href;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "block px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                    isChildActive
                                      ? "text-[#2F65F6] font-bold bg-blue-50/50 dark:bg-blue-950/40"
                                      : isDarkMode
                                      ? "text-slate-400 hover:text-white hover:bg-slate-800/40"
                                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar Bottom: Light / Dark Toggle */}
          <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800/80">
            {!isSidebarCollapsed ? (
              <div
                className={cn(
                  "p-1 rounded-full flex items-center justify-between transition-colors border",
                  isDarkMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-100/80 border-slate-200/60"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleTheme(false)}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    !isDarkMode
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleTheme(true)}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    isDarkMode
                      ? "bg-[#2F65F6] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => toggleTheme(!isDarkMode)}
                className="w-full p-2.5 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Slide-Over Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            className={cn(
              "fixed top-0 bottom-0 left-0 w-72 p-5 flex flex-col justify-between overflow-y-auto z-50 animate-in slide-in-from-left duration-250",
              isDarkMode ? "bg-slate-900 border-r border-slate-800" : "bg-white"
            )}
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#2F65F6] flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/25">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="8" cy="8" r="3.5" strokeWidth="2.5" />
                      <circle cx="16" cy="16" r="3.5" strokeWidth="2.5" />
                      <path d="M10.5 10.5L13.5 13.5" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="font-black text-[#2563EB] dark:text-white text-lg tracking-wider font-heading">
                    NETIC
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Search navigation..."
                  className={cn(
                    "w-full text-xs rounded-xl pl-8 pr-3 py-2 outline-none border transition-colors",
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-[#2F65F6]"
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:border-[#2F65F6]"
                  )}
                />
              </div>

              {/* Mobile Menu Items */}
              <nav className="space-y-1 pb-6">
                {navSections.map((sec) =>
                  sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                          isActive
                            ? "bg-[#2F65F6] text-white shadow-md shadow-blue-500/20"
                            : isDarkMode
                            ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })
                )}
              </nav>
            </div>

            {/* Mobile Footer Theme Toggle */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div
                className={cn(
                  "p-1 rounded-full flex items-center justify-between border",
                  isDarkMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-100 border-slate-200"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleTheme(false)}
                  className={cn(
                    "flex-1 py-1 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5",
                    !isDarkMode ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"
                  )}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleTheme(true)}
                  className={cn(
                    "flex-1 py-1 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5",
                    isDarkMode ? "bg-[#2F65F6] text-white shadow-xs" : "text-slate-500"
                  )}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Body ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* ── Top Header Navigation Bar ── */}
        <header
          className={cn(
            "sticky top-0 z-20 px-6 lg:px-8 py-4 flex items-center justify-between transition-colors",
            isDarkMode
              ? "bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80"
              : "bg-[#F3F4F7]/90 backdrop-blur-md"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={cn(
                "lg:hidden w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border",
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-slate-200"
                  : "bg-white border-slate-200 text-slate-700 shadow-xs"
              )}
              aria-label="Open menu"
            >
              <MenuIcon className="w-4 h-4" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={cn(
                "hidden lg:flex w-8 h-8 rounded-lg items-center justify-center transition-colors cursor-pointer border",
                isDarkMode
                  ? "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                  : "bg-white border-slate-200/80 text-slate-400 hover:text-slate-800 shadow-xs"
              )}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Page Title */}
            <h1
              className={cn(
                "text-2xl font-bold tracking-tight font-heading",
                isDarkMode ? "text-white" : "text-[#0F172A]"
              )}
            >
              Dashboard
            </h1>
          </div>

          {/* Top Right Utilities */}
          <div className="flex items-center gap-3">
            {/* Search Icon Button */}
            <button
              type="button"
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/80"
              )}
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              className={cn(
                "relative w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/80"
              )}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF1028] ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* User Profile Avatar with dropdown chevron */}
            <div className="flex items-center gap-1.5 pl-1.5 cursor-pointer group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500/20 bg-amber-100 flex items-center justify-center text-amber-900 font-bold text-xs">
                <span className="font-heading">{initials}</span>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  isDarkMode ? "text-slate-400 group-hover:text-white" : "text-slate-400 group-hover:text-slate-700"
                )}
              />
            </div>
          </div>
        </header>

        {/* ── Main Dynamic Content Canvas ── */}
        <main className="flex-1 p-6 lg:p-8 pt-2 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

