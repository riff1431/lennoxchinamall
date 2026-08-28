import { LucideIcon, Coins, ShieldCheck, Truck, Headphones } from "lucide-react";

export interface FooterLink {
  label: string;
  href: string;
  badge?: string;
  isExternal?: boolean;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface TrustItem {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  colorClass: string;
  bgClass: string;
}

export interface ContactInfo {
  type: "address" | "phone" | "email" | "hours";
  label: string;
  value: string;
  copyable?: boolean;
  href?: string;
}

export const FOOTER_TRUST_ITEMS: TrustItem[] = [
  {
    id: "usdt-escrow",
    icon: Coins,
    title: "USDT Escrow Checkout",
    subtitle: "Zero-fee Binance Pay settlement with 100% cryptographic escrow.",
    colorClass: "text-[#FF1028]",
    bgClass: "bg-[#FF1028]/10 border-[#FF1028]/20",
  },
  {
    id: "factory-direct",
    icon: ShieldCheck,
    title: "Direct Factory Sourcing",
    subtitle: "Direct partnerships with verified plants in Shenzhen & Ningbo.",
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "air-cargo",
    icon: Truck,
    title: "5-8 Days Global Air Cargo",
    subtitle: "Door-to-door tracked expedited shipping via DHL & YunExpress.",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "warranty",
    icon: Headphones,
    title: "30-Day QC Warranty",
    subtitle: "Direct USDT refunds & dedicated VIP sourcing dispute desk.",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10 border-amber-500/20",
  },
];

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    id: "departments",
    title: "Shop Departments",
    links: [
      { label: "Consumer Electronics", href: "/categories/consumer-electronics" },
      { label: "4K Drones & FPV Systems", href: "/categories/rc-drones-toys", badge: "HOT" },
      { label: "3D Printers & CNC Tools", href: "/categories/tools-diy-hardware" },
      { label: "Smart Home & IoT Robotics", href: "/categories/smart-home-living" },
      { label: "Flash Deals & Daily Drops", href: "/categories/flash-deals", badge: "DEALS" },
      { label: "New Factory Arrivals", href: "/categories/new-arrivals" },
    ],
  },
  {
    id: "customer-service",
    title: "Customer Support",
    links: [
      { label: "24/7 Sourcing Support Desk", href: "/account/support" },
      { label: "Track Air Cargo Shipment", href: "/account/orders" },
      { label: "Cross-Border Shipping Policy", href: "/pages/shipping-policy" },
      { label: "30-Day Return & USDT Refund", href: "/account/returns" },
      { label: "Frequently Asked Questions", href: "/pages/faq" },
      { label: "Binance Pay USDT Guide", href: "/pages/faq" },
    ],
  },
  {
    id: "sourcing-network",
    title: "Sourcing & Network",
    links: [
      { label: "About China Mall", href: "/pages/about" },
      { label: "Shenzhen Logistics Hub", href: "/pages/about" },
      { label: "Verified Supplier Network", href: "/categories" },
      { label: "Wholesale & VIP Bulk Orders", href: "/account/support" },
      { label: "Affiliate & Partner Program", href: "/pages/about" },
    ],
  },
  {
    id: "legal-compliance",
    title: "Legal & Trust",
    links: [
      { label: "Privacy Policy", href: "/pages/privacy-policy" },
      { label: "Terms of Service", href: "/pages/terms" },
      { label: "USDT Escrow Agreement", href: "/pages/terms" },
      { label: "Customs & Export Clearance", href: "/pages/shipping-policy" },
      { label: "Cookie Preferences", href: "/pages/privacy-policy" },
    ],
  },
];

export const FOOTER_CONTACTS: ContactInfo[] = [
  {
    type: "email",
    label: "VIP Support Email",
    value: "support@lennoxchinamall.com",
    copyable: true,
    href: "mailto:support@lennoxchinamall.com",
  },
  {
    type: "phone",
    label: "Global WhatsApp / Phone",
    value: "+86 755 8329 1800",
    copyable: true,
    href: "https://wa.me/8675583291800",
  },
  {
    type: "address",
    label: "Logistics Hub",
    value: "Bao'an Logistics Park, Shenzhen, China",
  },
];
