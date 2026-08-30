"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  SlidersHorizontal,
  Boxes,
  Image as ImageIcon,
  ShoppingCart,
  Truck,
  RotateCcw,
  Coins,
  Factory,
  Building2,
  Users,
  Star,
  Headphones,
  Bell,
  Sparkles,
  TicketPercent,
  Zap,
  LayoutTemplate,
  Menu as MenuIcon,
  FileText,
  Globe,
  TrendingUp,
  ShieldCheck,
  ClipboardList,
  Lock,
  Radio,
  Settings2,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Sun,
  Moon,
  ExternalLink,
  Plus,
  CheckCheck,
  ArrowRight,
  Command,
  HelpCircle,
} from "lucide-react";
import { cn, formatTimeAgo } from "@/utils/helpers";
import { Profile, UserRole } from "@/types/database";
import { hasPermission, AdminSection } from "@/lib/auth/roles";
import { signout } from "@/app/actions/auth";
import { getAdminOperationalAlerts } from "@/app/actions/admin-notifications";
import { createClient } from "@/lib/supabase/client";
import { OperationalAlert } from "@/types/notifications";
import { ToastProvider } from "@/components/admin/ToastProvider";

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
  badgeVariant?: "blue" | "emerald" | "amber" | "rose";
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

// 30 Complete Admin Modules categorized into logical operational sections
const ALL_NAV_SECTIONS: NavGroup[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        section: "dashboard",
      },
    ],
  },
  {
    id: "catalogue",
    title: "Catalogue & Inventory",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
        section: "products",
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
        section: "categories",
      },
      {
        label: "Brands",
        href: "/admin/brands",
        icon: Tag,
        section: "brands",
      },
      {
        label: "Attributes & Specs",
        href: "/admin/attributes",
        icon: SlidersHorizontal,
        section: "attributes",
      },
      {
        label: "Inventory Stock",
        href: "/admin/inventory",
        icon: Boxes,
        section: "inventory",
      },
      {
        label: "Media Library",
        href: "/admin/media",
        icon: ImageIcon,
        section: "media",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders & Sourcing",
    items: [
      {
        label: "Orders Fulfilment",
        href: "/admin/orders",
        icon: ShoppingCart,
        section: "orders",
      },
      {
        label: "Air Cargo Logistics",
        href: "/admin/shipping",
        icon: Truck,
        section: "shipping",
      },
      {
        label: "Returns & RMA",
        href: "/admin/returns",
        icon: RotateCcw,
        section: "returns",
      },
      {
        label: "USDT Payments",
        href: "/admin/payments",
        icon: Coins,
        section: "payments",
      },
      {
        label: "China Factory Sourcing",
        href: "/admin/sourcing",
        icon: Factory,
        section: "sourcing",
      },
      {
        label: "Suppliers (1688 & OEM)",
        href: "/admin/suppliers",
        icon: Building2,
        section: "suppliers",
      },
    ],
  },
  {
    id: "customers",
    title: "Customers & CRM",
    items: [
      {
        label: "Customers",
        href: "/admin/customers",
        icon: Users,
        section: "customers",
      },
      {
        label: "Reviews & UGC",
        href: "/admin/reviews",
        icon: Star,
        section: "reviews",
      },
      {
        label: "Support Desk & Chat",
        href: "/admin/support",
        icon: Headphones,
        section: "support",
        badge: "3",
        badgeVariant: "rose",
      },
      {
        label: "Push Notifications",
        href: "/admin/notifications",
        icon: Bell,
        section: "notifications",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing & CMS",
    items: [
      {
        label: "Promotions & Banners",
        href: "/admin/promotions",
        icon: Sparkles,
        section: "promotions",
      },
      {
        label: "Coupons & Discounts",
        href: "/admin/coupons",
        icon: TicketPercent,
        section: "coupons",
      },
      {
        label: "Flash Deals",
        href: "/admin/flash-deals",
        icon: Zap,
        section: "flash-deals",
        badge: "LIVE",
        badgeVariant: "amber",
      },
      {
        label: "Homepage Builder",
        href: "/admin/homepage-sections",
        icon: LayoutTemplate,
        section: "homepage-sections",
      },
      {
        label: "Navigation Menus",
        href: "/admin/menus",
        icon: MenuIcon,
        section: "menus",
      },
      {
        label: "Custom Pages",
        href: "/admin/pages",
        icon: FileText,
        section: "pages",
      },
      {
        label: "SEO & 301 Redirects",
        href: "/admin/seo",
        icon: Globe,
        section: "seo",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Telemetry",
    items: [
      {
        label: "Analytics & P&L",
        href: "/admin/analytics",
        icon: TrendingUp,
        section: "analytics",
      },
    ],
  },
  {
    id: "governance",
    title: "Governance & Settings",
    items: [
      {
        label: "Staff & RBAC",
        href: "/admin/staff",
        icon: ShieldCheck,
        section: "staff",
      },
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: ClipboardList,
        section: "audit-logs",
      },
      {
        label: "Security & Health",
        href: "/admin/security",
        icon: Lock,
        section: "security",
      },
      {
        label: "Integrations & APIs",
        href: "/admin/integrations",
        icon: Radio,
        section: "integrations",
      },
      {
        label: "Store Settings",
        href: "/admin/settings",
        icon: Settings2,
        section: "settings",
      },
    ],
  },
];

// Mapping for page titles & breadcrumbs
const PAGE_META_MAP: Record<string, { title: string; group: string }> = {
  "/admin/dashboard": { title: "Dashboard Overview", group: "Overview" },
  "/admin/products": { title: "Products Catalogue", group: "Catalogue & Inventory" },
  "/admin/products/new": { title: "Add New Product", group: "Catalogue & Inventory" },
  "/admin/categories": { title: "Category Hierarchy", group: "Catalogue & Inventory" },
  "/admin/brands": { title: "Brand Directory", group: "Catalogue & Inventory" },
  "/admin/attributes": { title: "Attributes & Specs", group: "Catalogue & Inventory" },
  "/admin/inventory": { title: "Inventory Stock Control", group: "Catalogue & Inventory" },
  "/admin/media": { title: "Media Asset Library", group: "Catalogue & Inventory" },
  "/admin/orders": { title: "Orders Fulfilment", group: "Orders & Sourcing" },
  "/admin/shipping": { title: "Air Cargo & Logistics", group: "Orders & Sourcing" },
  "/admin/returns": { title: "Returns & Warranty RMA", group: "Orders & Sourcing" },
  "/admin/payments": { title: "USDT Payments Ledger", group: "Orders & Sourcing" },
  "/admin/sourcing": { title: "China Factory Sourcing", group: "Orders & Sourcing" },
  "/admin/suppliers": { title: "Suppliers & Factories", group: "Orders & Sourcing" },
  "/admin/customers": { title: "Customer Accounts", group: "Customers & CRM" },
  "/admin/reviews": { title: "Customer Reviews & UGC", group: "Customers & CRM" },
  "/admin/support": { title: "Support Desk & Chat", group: "Customers & CRM" },
  "/admin/notifications": { title: "Push Notifications", group: "Customers & CRM" },
  "/admin/promotions": { title: "Promotions & Banners", group: "Marketing & CMS" },
  "/admin/coupons": { title: "Coupons & Discounts", group: "Marketing & CMS" },
  "/admin/flash-deals": { title: "Flash Deals Campaign", group: "Marketing & CMS" },
  "/admin/homepage-sections": { title: "Homepage Builder", group: "Marketing & CMS" },
  "/admin/menus": { title: "Store Navigation Menus", group: "Marketing & CMS" },
  "/admin/pages": { title: "Custom CMS Pages", group: "Marketing & CMS" },
  "/admin/seo": { title: "SEO & 301 Redirects", group: "Marketing & CMS" },
  "/admin/analytics": { title: "Analytics & P&L Telemetry", group: "Analytics & Telemetry" },
  "/admin/staff": { title: "Staff, Roles & RBAC", group: "Governance & Settings" },
  "/admin/audit-logs": { title: "Immutable Audit Logs", group: "Governance & Settings" },
  "/admin/security": { title: "Security & System Health", group: "Governance & Settings" },
  "/admin/integrations": { title: "Third-Party Integrations", group: "Governance & Settings" },
  "/admin/settings": { title: "Storefront & System Settings", group: "Governance & Settings" },
};

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: "order" | "shipping" | "stock" | "support";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    title: "New USDT Order #LCM-44DD",
    desc: "$89.99 USDT confirmed via Binance Pay Merchant API",
    time: "2m ago",
    unread: true,
    type: "order",
  },
  {
    id: "n-2",
    title: "Air Cargo Dispatched (HKG1)",
    desc: "YunExpress tracking #YE8890123 assigned for 14 parcels",
    time: "18m ago",
    unread: true,
    type: "shipping",
  },
  {
    id: "n-3",
    title: "Low Stock Alert: 4K Drone",
    desc: "Shenzhen warehouse inventory dropped below 15 units",
    time: "1h ago",
    unread: true,
    type: "stock",
  },
  {
    id: "n-4",
    title: "RMA Ticket #TK-902 Received",
    desc: "Customer requested video inspection RMA for soundbar",
    time: "3h ago",
    unread: false,
    type: "support",
  },
];

export function AdminLayoutClient({
  children,
  userProfile,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Route Progress bar feedback
  const [isNavigating, setIsNavigating] = useState(false);

  // Mobile menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sidebar collapsed state (lazy initialized from localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lennox_admin_sidebar_collapsed");
      return saved === "true";
    }
    return false;
  });

  // Collapsible section state (lazy initialized from localStorage)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lennox_admin_sidebar_sections");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      overview: true,
      catalogue: true,
      orders: true,
      customers: true,
      marketing: true,
      analytics: true,
      governance: true,
    };
  });

  // Search in sidebar filter
  const [sidebarFilter, setSidebarFilter] = useState("");

  // Dark Mode (lazy initialized from localStorage)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lennox_admin_theme");
      return saved === "dark";
    }
    return false;
  });

  // Spotlight / Cmd+K search modal
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  // Dropdown states
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Notification items state
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Refs for click outside
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    const t = setTimeout(() => setToastMsg(null), 3500);
    return () => clearTimeout(t);
  }, []);

  // Sync DOM dark class on initial mount and theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Handle route change progress animation asynchronously
  useEffect(() => {
    const showTimer = setTimeout(() => setIsNavigating(true), 0);
    const hideTimer = setTimeout(() => setIsNavigating(false), 250);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  // Auto-expand the section that contains the current active route
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const group of ALL_NAV_SECTIONS) {
        const containsActive = group.items.some(
          (item) => pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
        );
        if (containsActive) {
          setOpenSections((prev) => {
            if (!prev[group.id]) {
              const next = { ...prev, [group.id]: true };
              try {
                localStorage.setItem("lennox_admin_sidebar_sections", JSON.stringify(next));
              } catch {}
              return next;
            }
            return prev;
          });
          break;
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Theme toggle
  const toggleTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    try {
      localStorage.setItem("lennox_admin_theme", dark ? "dark" : "light");
      if (dark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  };

  // Toggle sidebar collapse
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("lennox_admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Toggle single section
  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("lennox_admin_sidebar_sections", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Open Command Palette helper
  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
    setSelectedCommandIndex(0);
    setCommandQuery("");
    setTimeout(() => commandInputRef.current?.focus(), 50);
  }, []);

  // Global keyboard shortcut for Spotlight / Command Palette (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => {
          if (!prev) {
            setSelectedCommandIndex(0);
            setCommandQuery("");
            setTimeout(() => commandInputRef.current?.focus(), 50);
            return true;
          }
          return false;
        });
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setQuickActionsOpen(false);
        setNotificationsOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (quickActionsRef.current && !quickActionsRef.current.contains(target)) {
        setQuickActionsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userRole = (userProfile?.role as UserRole) || "super_admin";

  // Filter sections by RBAC permissions & search input
  const filteredNavSections = useMemo(() => {
    return ALL_NAV_SECTIONS.map((group) => {
      const permitted = group.items.filter((item) => hasPermission(userRole, item.section));

      if (!sidebarFilter.trim()) {
        return { ...group, items: permitted };
      }

      const query = sidebarFilter.toLowerCase();
      const matched = permitted.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.section.toLowerCase().includes(query)
      );

      return { ...group, items: matched };
    }).filter((group) => group.items.length > 0);
  }, [userRole, sidebarFilter]);

  // Flat list for Spotlight Command Palette
  const allSearchableItems = useMemo(() => {
    const items: Array<{
      label: string;
      href: string;
      group: string;
      icon: React.ElementType;
      badge?: string | null;
    }> = [];

    ALL_NAV_SECTIONS.forEach((group) => {
      group.items.forEach((item) => {
        if (hasPermission(userRole, item.section)) {
          items.push({
            label: item.label,
            href: item.href,
            group: group.title,
            icon: item.icon,
            badge: item.badge,
          });
        }
      });
    });

    // Add quick actions
    items.push({
      label: "Open Live Storefront",
      href: "/",
      group: "Quick Action",
      icon: Globe,
    });

    if (!commandQuery.trim()) {
      return items;
    }

    const q = commandQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q)
    );
  }, [userRole, commandQuery]);

  // Keyboard navigation inside Command Palette
  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedCommandIndex((prev) =>
        prev < allSearchableItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedCommandIndex((prev) =>
        prev > 0 ? prev - 1 : allSearchableItems.length - 1
      );
    } else if (e.key === "Enter" && allSearchableItems[selectedCommandIndex]) {
      e.preventDefault();
      const target = allSearchableItems[selectedCommandIndex];
      setCommandPaletteOpen(false);
      if (target.href === "/") {
        window.open("/", "_blank");
      } else {
        router.push(target.href);
      }
    }
  };

  const displayName = userProfile?.display_name || "Arifur Rahman";
  const userEmail = userProfile?.email || "admin@lennoxchinamall.com";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AR";

  const handleSignOut = async () => {
    await signout();
  };

  // Load real-time operational alerts
  useEffect(() => {
    let isMounted = true;
    const fetchAlerts = async () => {
      try {
        const res = await getAdminOperationalAlerts();
        if (isMounted && res.success && res.alerts) {
          const mapped: NotificationItem[] = (res.alerts as OperationalAlert[]).map((a: OperationalAlert) => ({
            id: a.id,
            title: a.title,
            desc: a.message,
            time: formatTimeAgo(a.created_at),
            unread: true,
            type: a.type === "low_stock" ? "stock" : a.type === "return_request" || a.type === "urgent_ticket" ? "support" : "order",
          }));
          if (mapped.length > 0) {
            setNotifications(mapped);
          }
        }
      } catch (err) {
        console.warn("Could not load operational alerts:", err);
      }
    };

    fetchAlerts();

    const supabase = createClient();
    const channel = supabase
      .channel("admin_operational_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchAlerts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "variants" },
        () => fetchAlerts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("All notifications marked as read.");
  };

  // Determine current page title & parent group
  const currentPageMeta = useMemo(() => {
    if (PAGE_META_MAP[pathname]) return PAGE_META_MAP[pathname];
    for (const [route, meta] of Object.entries(PAGE_META_MAP)) {
      if (route !== "/admin/dashboard" && pathname.startsWith(route)) {
        return meta;
      }
    }
    return { title: "Admin Console", group: "Management" };
  }, [pathname]);

  const renderBadgePill = (
    badge: string,
    variant: NavItem["badgeVariant"] = "blue",
    isActive = false
  ) => {
    if (isActive) {
      return (
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FF1028]/15 text-[#FF1028] font-mono">
          {badge}
        </span>
      );
    }

    const config = {
      blue: "bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] border border-blue-200 dark:border-blue-900/40",
      emerald: "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] border border-[#BBF7D0] dark:border-emerald-900/40",
      amber: "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-[#FED7AA] dark:border-amber-900/40",
      rose: "bg-[#FFF0F2] dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-[#FFE4E8] dark:border-rose-900/40",
    }[variant];

    return (
      <span className={cn("text-[9px] font-black px-1.5 py-0.2 rounded-full font-mono uppercase tracking-wider", config)}>
        {badge}
      </span>
    );
  };

  return (
    <ToastProvider>
      <div
        className={cn(
          "min-h-screen flex antialiased font-sans transition-colors duration-150",
          isDarkMode ? "bg-[#0B0F19] text-slate-100 dark" : "bg-[#F4F6F9] text-slate-900"
        )}
      >
      {/* ── Route Navigation Progress Bar Feedback ── */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#2F65F6] via-[#FF1028] to-[#2F65F6] animate-route-progress" />
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside
        aria-label="Admin Navigation"
        className={cn(
          "sticky top-0 h-screen hidden lg:flex flex-col justify-between shrink-0 transition-[width,padding] duration-200 ease-out z-30 select-none",
          isDarkMode
            ? "bg-[#111827] border-r border-slate-800/80"
            : "bg-white border-r border-slate-200/70 shadow-[1px_0_12px_rgba(0,0,0,0.02)]",
          isSidebarCollapsed ? "w-[68px] p-2.5" : "w-[240px] p-3.5"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* ── 1. Brand Header ── */}
          <div
            className={cn(
              "flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800/70",
              isSidebarCollapsed ? "justify-center" : "px-1.5"
            )}
          >
            <Link
              href="/admin/dashboard"
              className={cn(
                "flex items-center gap-2.5 group transition-transform duration-150 active:scale-98",
                isSidebarCollapsed && "justify-center"
              )}
              title="Lennox ChinaMall Operations"
            >
              {/* Lennox China Mall Official Brand Emblem */}
              <div className={cn(
                "relative rounded-xl overflow-hidden bg-white border border-slate-200 dark:border-slate-800 shadow-xs shrink-0 transition-transform duration-150 group-hover:scale-105",
                isSidebarCollapsed ? "w-9 h-9" : "w-9 h-9"
              )}>
                <Image
                  src="/logo-lennoxchinamall.png"
                  alt="Lennox China Mall"
                  fill
                  sizes="36px"
                  className="object-contain p-0.5"
                  priority
                />
              </div>

              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-base text-slate-900 dark:text-white tracking-tight">
                      Lennox
                    </span>
                    <span className="text-[9px] font-black font-mono uppercase px-1.5 py-0.2 rounded-md bg-red-50 dark:bg-red-950/50 text-[#FF1028] border border-red-200/60 dark:border-red-900/40">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold truncate -mt-0.5">
                    ChinaMall Operations
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse Toggle Button (Expanded mode) */}
            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Collapse sidebar (Narrow mode)"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── 2. Filter Modules in Sidebar (Expanded only) ── */}
          {!isSidebarCollapsed && (
            <div className="mb-2.5 px-0.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sidebarFilter}
                  onChange={(e) => setSidebarFilter(e.target.value)}
                  placeholder="Filter 30 modules..."
                  className={cn(
                    "w-full text-[11px] rounded-lg pl-8 pr-6 py-1.5 outline-none border transition-colors font-sans",
                    isDarkMode
                      ? "bg-slate-900/80 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-[#FF1028]/60"
                      : "bg-slate-50 border-slate-200/80 text-slate-800 placeholder:text-slate-400 focus:border-[#FF1028]/60"
                  )}
                />
                {sidebarFilter && (
                  <button
                    onClick={() => setSidebarFilter("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── 3. Navigation Sections (Scrollable) ── */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            {filteredNavSections.map((group) => {
              const isOpen = !!openSections[group.id];

              return (
                <div key={group.id} className="space-y-0.5">
                  {/* Collapsible Section Header */}
                  {!isSidebarCollapsed && (
                    <button
                      type="button"
                      onClick={() => toggleSection(group.id)}
                      className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-heading font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md transition-colors cursor-pointer group"
                    >
                      <span className="truncate">{group.title}</span>
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 transition-transform duration-200 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                          isOpen ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>
                  )}

                  {/* Section Items */}
                  {(isOpen || isSidebarCollapsed || sidebarFilter.trim().length > 0) && (
                    <nav className="space-y-0.5 animate-in fade-in duration-150">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                        return (
                          <div key={item.label} className="relative group">
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center rounded-xl text-xs transition-all duration-150 relative cursor-pointer font-heading tracking-tight",
                                isSidebarCollapsed
                                  ? "p-2.5 justify-center"
                                  : "px-2.5 py-1.5 gap-2.5 justify-between",
                                isActive
                                  ? "bg-red-50/80 dark:bg-red-950/20 text-slate-900 dark:text-white font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                              )}
                              title={isSidebarCollapsed ? item.label : undefined}
                            >
                              {/* Left Subtle Red Active Indicator */}
                              {isActive && (
                                <span className="w-1 h-4.5 rounded-full bg-[#FF1028] absolute left-1 top-1/2 -translate-y-1/2" />
                              )}

                              <div
                                className={cn(
                                  "flex items-center gap-2.5 min-w-0",
                                  isSidebarCollapsed && "justify-center"
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
                                    isActive
                                      ? "text-[#FF1028] font-bold"
                                      : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                  )}
                                />
                                {!isSidebarCollapsed && (
                                  <span className="truncate">{item.label}</span>
                                )}
                              </div>

                              {!isSidebarCollapsed && item.badge && (
                                <div className="ml-1 shrink-0">
                                  {renderBadgePill(item.badge, item.badgeVariant, isActive)}
                                </div>
                              )}
                            </Link>

                            {/* Floating Tooltip in Icon-only Collapsed Mode */}
                            {isSidebarCollapsed && (
                              <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-xl border border-slate-700/60 text-xs font-heading">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>{item.label}</span>
                                  {item.badge && (
                                    <span className="text-[9px] font-mono px-1 rounded bg-[#FF1028] text-white">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-sans font-normal">
                                  {group.title}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </nav>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── 4. Sidebar Bottom: Collapse Button + Theme Switcher + Profile ── */}
          <div className="pt-2.5 mt-auto border-t border-slate-100 dark:border-slate-800/80 space-y-2 shrink-0">
            {/* Expand / Collapse Control in Collapsed Mode */}
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="w-full p-2 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Light / Dark Mode Toggle */}
            {!isSidebarCollapsed ? (
              <div
                className={cn(
                  "p-0.5 rounded-xl flex items-center justify-between transition-colors border",
                  isDarkMode
                    ? "bg-slate-900/90 border-slate-800"
                    : "bg-slate-100/90 border-slate-200/70"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleTheme(false)}
                  className={cn(
                    "flex-1 py-1 px-2 rounded-lg text-[11px] font-heading font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    !isDarkMode
                      ? "bg-white text-slate-900 shadow-xs"
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
                    "flex-1 py-1 px-2 rounded-lg text-[11px] font-heading font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
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
                className="w-full p-2 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
              </button>
            )}

            {/* Compact Operator Card in Sidebar Bottom */}
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <Link
                  href="/admin/staff"
                  className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EEF4FF] dark:bg-blue-950 text-[#2F65F6] flex items-center justify-center font-black text-xs font-mono shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate font-heading">
                      {displayName}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">
                      {userRole.replace("_", " ")}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer ml-1"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Slide-Over Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            className={cn(
              "fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] p-4 flex flex-col justify-between overflow-y-auto z-50 shadow-2xl animate-in slide-in-from-left duration-250",
              isDarkMode ? "bg-slate-900 border-r border-slate-800" : "bg-white"
            )}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white font-bold shadow-xs">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="8" cy="8" r="3.5" strokeWidth="2.4" />
                      <circle cx="16" cy="16" r="3.5" strokeWidth="2.4" />
                      <path d="M10.5 10.5L13.5 13.5" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-base font-heading">
                      Lennox ChinaMall
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-1 font-mono">
                      Admin Ops
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 flex items-center justify-center cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Navigation List */}
              <div className="space-y-4 pb-4">
                {ALL_NAV_SECTIONS.map((group) => (
                  <div key={group.id} className="space-y-1">
                    <div className="px-2 text-[10px] font-black uppercase tracking-wider font-heading text-slate-400 dark:text-slate-500">
                      {group.title}
                    </div>
                    <nav className="space-y-0.5">
                      {group.items
                        .filter((i) => hasPermission(userRole, i.section))
                        .map((item) => {
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
                                "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-heading font-semibold transition-all relative min-h-[44px]",
                                isActive
                                  ? "bg-red-50/80 dark:bg-red-950/20 text-slate-900 dark:text-white font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                              )}
                            >
                              {isActive && (
                                <span className="w-1 h-4.5 rounded-full bg-[#FF1028] absolute left-1 top-1/2 -translate-y-1/2" />
                              )}
                              <div className="flex items-center gap-2.5">
                                <Icon
                                  className={cn(
                                    "w-4 h-4 shrink-0",
                                    isActive ? "text-[#FF1028]" : "text-slate-400"
                                  )}
                                />
                                <span>{item.label}</span>
                              </div>
                              {item.badge && renderBadgePill(item.badge, item.badgeVariant, isActive)}
                            </Link>
                          );
                        })}
                    </nav>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div
                className={cn(
                  "p-1 rounded-xl flex items-center justify-between border",
                  isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleTheme(false)}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 font-heading min-h-[38px]",
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
                    "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 font-heading min-h-[38px]",
                    isDarkMode ? "bg-[#2F65F6] text-white shadow-xs" : "text-slate-500"
                  )}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 py-2.5 rounded-xl text-xs font-bold transition-colors font-heading min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Dynamic Content Canvas ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* ── Sticky Modern Top Header Bar ── */}
        <header
          className={cn(
            "sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-colors duration-150 border-b",
            isDarkMode
              ? "bg-[#0B0F19]/95 backdrop-blur-md border-slate-800/80"
              : "bg-[#F4F6F9]/95 backdrop-blur-md border-slate-200/70"
          )}
        >
          {/* Left: Mobile Drawer Trigger + Dynamic Page Title & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={cn(
                "lg:hidden w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border shrink-0 min-h-[44px] min-w-[44px]",
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-slate-200"
                  : "bg-white border-slate-200 text-slate-700 shadow-xs"
              )}
              aria-label="Open mobile menu"
            >
              <MenuIcon className="w-4 h-4" />
            </button>

            {/* Dynamic Breadcrumb & Header Location */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="hidden sm:inline">Admin</span>
                <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden sm:inline">{currentPageMeta.group}</span>
                <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-900 dark:text-white font-bold font-heading truncate text-sm">
                  {currentPageMeta.title}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Functional Spotlight Search + Quick Actions + Notifications + Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 1. Global Spotlight Search Trigger (Cmd+K) */}
            <button
              type="button"
              onClick={openCommandPalette}
              className={cn(
                "flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer shadow-xs",
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                  : "bg-white border-slate-200/90 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              )}
              title="Search modules & actions (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline text-[11px]">Search...</span>
              <kbd
                className={cn(
                  "hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border",
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-slate-400"
                    : "bg-slate-100 border-slate-200 text-slate-500"
                )}
              >
                ⌘K
              </kbd>
            </button>

            {/* 2. Quick Actions Dropdown Menu */}
            <div className="relative" ref={quickActionsRef}>
              <button
                type="button"
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-xs border",
                  quickActionsOpen
                    ? "bg-[#2F65F6] text-white border-[#2F65F6]"
                    : isDarkMode
                    ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                    : "bg-white border-slate-200/90 text-slate-700 hover:text-slate-900"
                )}
                title="Quick creation & shortcut actions"
                aria-expanded={quickActionsOpen}
              >
                <Plus className="w-3.5 h-3.5 text-[#2F65F6] group-hover:text-white" />
                <span className="hidden md:inline font-heading text-[11px]">Quick Action</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", quickActionsOpen && "rotate-180")} />
              </button>

              {/* Quick Actions Dropdown Panel */}
              {quickActionsOpen && (
                <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                  <div className="px-2.5 py-1.5 text-[10px] font-heading font-black uppercase text-slate-400 tracking-wider">
                    Operational Shortcuts
                  </div>
                  <Link
                    href="/admin/products/new"
                    onClick={() => setQuickActionsOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Package className="w-4 h-4 text-[#2F65F6]" />
                    <span>Create New Product</span>
                  </Link>
                  <Link
                    href="/admin/flash-deals"
                    onClick={() => setQuickActionsOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Schedule Flash Deal</span>
                  </Link>
                  <Link
                    href="/admin/sourcing"
                    onClick={() => setQuickActionsOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Factory className="w-4 h-4 text-[#16A34A]" />
                    <span>New China Sourcing PO</span>
                  </Link>
                  <Link
                    href="/admin/staff"
                    onClick={() => setQuickActionsOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    <span>Invite Staff Member</span>
                  </Link>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setQuickActionsOpen(false)}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>Live Storefront</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}
            </div>

            {/* 3. Real-Time Notification Center Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={cn(
                  "relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer border shadow-xs",
                  notificationsOpen
                    ? "bg-[#2F65F6] text-white border-[#2F65F6]"
                    : isDarkMode
                    ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                    : "bg-white border-slate-200/90 text-slate-600 hover:text-slate-900"
                )}
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF1028] ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-heading font-black text-slate-900 dark:text-white">
                        Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-full bg-red-50 dark:bg-red-950/60 text-[#FF1028] border border-red-200 dark:border-red-900/40">
                          {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] font-bold text-[#2F65F6] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="py-2 space-y-1.5 max-h-72 overflow-y-auto no-scrollbar">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "p-2.5 rounded-xl text-xs transition-colors border space-y-0.5",
                          item.unread
                            ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30"
                            : "bg-slate-50/50 dark:bg-slate-900/40 border-transparent text-slate-500 dark:text-slate-400"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-bold font-heading",
                              item.unread
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link
                      href="/admin/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-bold text-[#2F65F6] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View all system notifications</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Operator Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                aria-expanded={profileDropdownOpen}
                aria-label="User profile menu"
              >
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#2F65F6] to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs font-mono">
                  <span>{initials}</span>
                  {/* Online beacon */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <ChevronDown
                  className={cn(
                    "hidden sm:block w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform",
                    profileDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Profile Dropdown Panel */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                  {/* Profile Header */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 mb-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-xs text-slate-900 dark:text-white truncate">
                        {displayName}
                      </span>
                      <span className="text-[9px] font-black font-mono uppercase px-1.5 py-0.2 rounded bg-[#EEF4FF] dark:bg-blue-950 text-[#2F65F6] border border-blue-200 dark:border-blue-900/40">
                        {userRole.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {userEmail}
                    </div>
                  </div>

                  {/* Navigation Shortcuts */}
                  <div className="space-y-0.5 text-xs">
                    <Link
                      href="/admin/staff"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-500" />
                      <span>Staff & Access Scopes</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      <Settings2 className="w-4 h-4 text-blue-500" />
                      <span>Storefront Settings</span>
                    </Link>
                    <Link
                      href="/admin/audit-logs"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      <ClipboardList className="w-4 h-4 text-[#16A34A]" />
                      <span>Audit Logs & History</span>
                    </Link>
                    <Link
                      href="/admin/integrations"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      <Radio className="w-4 h-4 text-amber-500" />
                      <span>API Gateways</span>
                    </Link>
                  </div>

                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Spotlight / Command Palette Modal (Cmd+K) ── */}
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setCommandPaletteOpen(false)}
            />

            {/* Modal Box */}
            <div
              className={cn(
                "relative w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden z-50 animate-in zoom-in-95 duration-150 font-sans",
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              )}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
                <Command className="w-5 h-5 text-slate-400" />
                <input
                  ref={commandInputRef}
                  type="text"
                  value={commandQuery}
                  onChange={(e) => {
                    setCommandQuery(e.target.value);
                    setSelectedCommandIndex(0);
                  }}
                  onKeyDown={handleCommandKeyDown}
                  placeholder="Type a command, page name, or shortcut..."
                  className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400 font-sans"
                />
                <kbd
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-mono rounded border text-slate-400",
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                  )}
                >
                  ESC
                </kbd>
              </div>

              {/* Search Results List */}
              <div className="p-2 max-h-80 overflow-y-auto no-scrollbar space-y-0.5">
                {allSearchableItems.length > 0 ? (
                  allSearchableItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isSelected = idx === selectedCommandIndex;

                    return (
                      <button
                        key={item.href + item.label}
                        type="button"
                        onClick={() => {
                          setCommandPaletteOpen(false);
                          if (item.href === "/") {
                            window.open("/", "_blank");
                          } else {
                            router.push(item.href);
                          }
                        }}
                        onMouseEnter={() => setSelectedCommandIndex(idx)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left",
                          isSelected
                            ? "bg-[#2F65F6] text-white font-bold"
                            : isDarkMode
                            ? "text-slate-300 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              isSelected ? "text-white" : "text-slate-400"
                            )}
                          />
                          <div className="min-w-0">
                            <div className="truncate font-heading">{item.label}</div>
                            <div
                              className={cn(
                                "text-[10px] font-sans",
                                isSelected ? "text-blue-100" : "text-slate-400"
                              )}
                            >
                              {item.group} • {item.href}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full",
                                isSelected ? "bg-white/20 text-white" : "bg-red-100 text-[#FF1028]"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight
                            className={cn(
                              "w-3.5 h-3.5 opacity-60",
                              isSelected && "opacity-100"
                            )}
                          />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-1">
                    <HelpCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">No modules or actions matching &quot;{commandQuery}&quot;</p>
                    <p className="text-[11px] text-slate-400">Try searching for &quot;orders&quot;, &quot;sourcing&quot;, &quot;settings&quot;, or &quot;staff&quot;</p>
                  </div>
                )}
              </div>

              {/* Command Palette Footer */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-3">
                  <span><strong className="text-slate-700 dark:text-slate-300">↑↓</strong> to navigate</span>
                  <span><strong className="text-slate-700 dark:text-slate-300">↵</strong> to select</span>
                </div>
                <span>{allSearchableItems.length} operational routes</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Dynamic Content Canvas ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-2 overflow-x-hidden min-w-0">
          {children}
        </main>

        {/* ── Global Toast Notification Bar ── */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
            <span>✓ {toastMsg}</span>
            <button
              onClick={() => setToastMsg(null)}
              className="font-bold text-sm hover:opacity-70 cursor-pointer ml-2"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
    </ToastProvider>
  );
}


