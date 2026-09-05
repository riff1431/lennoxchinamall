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

export const getLocalizedFooterTrustItems = (isSpanish: boolean): TrustItem[] => [
  {
    id: "usdt-escrow",
    icon: Coins,
    title: isSpanish ? "Pago Seguro en USDT" : "USDT Escrow Checkout",
    subtitle: isSpanish ? "Liquidación con Binance Pay sin comisiones y custodia criptográfica 100%." : "Zero-fee Binance Pay settlement with 100% cryptographic escrow.",
    colorClass: "text-[#FF1028]",
    bgClass: "bg-red-50 border-red-200/80",
  },
  {
    id: "factory-direct",
    icon: ShieldCheck,
    title: isSpanish ? "Abastecimiento Directo Fábrica" : "Direct Factory Sourcing",
    subtitle: isSpanish ? "Alianzas directas con fábricas verificadas en Shenzhen y Ningbo." : "Direct partnerships with verified plants in Shenzhen & Ningbo.",
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50 border-blue-200/80",
  },
  {
    id: "air-cargo",
    icon: Truck,
    title: isSpanish ? "5–8 Días Carga Aérea Global" : "5-8 Days Global Air Cargo",
    subtitle: isSpanish ? "Envío urgente puerta a puerta rastreado vía DHL y YunExpress." : "Door-to-door tracked expedited shipping via DHL & YunExpress.",
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50 border-emerald-200/80",
  },
  {
    id: "warranty",
    icon: Headphones,
    title: isSpanish ? "Garantía de Calidad 30 Días" : "30-Day QC Warranty",
    subtitle: isSpanish ? "Reembolsos directos en USDT y mesa de soporte VIP de compras." : "Direct USDT refunds & dedicated VIP sourcing dispute desk.",
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50 border-amber-200/80",
  },
];

export const getLocalizedFooterSections = (isSpanish: boolean): FooterSection[] => [
  {
    id: "departments",
    title: isSpanish ? "Departamentos" : "Shop Departments",
    links: [
      { label: isSpanish ? "Electrónica de Consumo" : "Consumer Electronics", href: "/categories/consumer-electronics" },
      { label: isSpanish ? "Drones 4K y Sistemas FPV" : "4K Drones & FPV Systems", href: "/categories/rc-drones-toys", badge: isSpanish ? "POPULAR" : "HOT" },
      { label: isSpanish ? "Impresoras 3D y Herramientas CNC" : "3D Printers & CNC Tools", href: "/categories/tools-diy-hardware" },
      { label: isSpanish ? "Hogar Inteligente y Robótica" : "Smart Home & IoT Robotics", href: "/categories/smart-home-living" },
      { label: isSpanish ? "Ofertas Flash y Descuentos" : "Flash Deals & Daily Drops", href: "/categories/flash-deals", badge: isSpanish ? "OFERTAS" : "DEALS" },
      { label: isSpanish ? "Nuevas Llegadas de Fábrica" : "New Factory Arrivals", href: "/categories/new-arrivals" },
    ],
  },
  {
    id: "customer-service",
    title: isSpanish ? "Servicio al Cliente" : "Customer Support",
    links: [
      { label: isSpanish ? "Soporte de Abastecimiento 24/7" : "24/7 Sourcing Support Desk", href: "/account/support" },
      { label: isSpanish ? "Rastrear Envío de Carga Aérea" : "Track Air Cargo Shipment", href: "/account/orders" },
      { label: isSpanish ? "Política de Envío Internacional" : "Cross-Border Shipping Policy", href: "/pages/shipping-policy" },
      { label: isSpanish ? "Garantía 30 Días y Reembolso USDT" : "30-Day Return & USDT Refund", href: "/account/returns" },
      { label: isSpanish ? "Preguntas Frecuentes (FAQ)" : "Frequently Asked Questions", href: "/pages/faq" },
      { label: isSpanish ? "Guía de Pago Binance Pay USDT" : "Binance Pay USDT Guide", href: "/pages/faq" },
    ],
  },
  {
    id: "sourcing-network",
    title: isSpanish ? "Red de Abastecimiento" : "Sourcing & Network",
    links: [
      { label: isSpanish ? "Acerca de China Mall" : "About China Mall", href: "/pages/about" },
      { label: isSpanish ? "Hub Logístico de Shenzhen" : "Shenzhen Logistics Hub", href: "/pages/about" },
      { label: isSpanish ? "Red de Proveedores Verificados" : "Verified Supplier Network", href: "/categories" },
      { label: isSpanish ? "Pedidos Mayoristas y VIP" : "Wholesale & VIP Bulk Orders", href: "/account/support" },
      { label: isSpanish ? "Programa de Afiliados" : "Affiliate & Partner Program", href: "/pages/about" },
    ],
  },
  {
    id: "legal-compliance",
    title: isSpanish ? "Legal y Confianza" : "Legal & Trust",
    links: [
      { label: isSpanish ? "Política de Privacidad" : "Privacy Policy", href: "/pages/privacy-policy" },
      { label: isSpanish ? "Términos de Servicio" : "Terms of Service", href: "/pages/terms" },
      { label: isSpanish ? "Acuerdo de Custodia USDT" : "USDT Escrow Agreement", href: "/pages/terms" },
      { label: isSpanish ? "Despacho de Aduanas y Exportación" : "Customs & Export Clearance", href: "/pages/shipping-policy" },
      { label: isSpanish ? "Preferencias de Cookies" : "Cookie Preferences", href: "/pages/privacy-policy" },
    ],
  },
];

export const FOOTER_TRUST_ITEMS: TrustItem[] = getLocalizedFooterTrustItems(false);
export const FOOTER_SECTIONS: FooterSection[] = getLocalizedFooterSections(false);

export const getLocalizedFooterContacts = (isSpanish: boolean): ContactInfo[] => [
  {
    type: "email",
    label: isSpanish ? "Correo de Soporte VIP" : "VIP Support Email",
    value: "support@lennoxchinamall.com",
    copyable: true,
    href: "mailto:support@lennoxchinamall.com",
  },
  {
    type: "phone",
    label: isSpanish ? "WhatsApp / Teléfono Global" : "Global WhatsApp / Phone",
    value: "+86 755 8329 1800",
    copyable: true,
    href: "https://wa.me/8675583291800",
  },
  {
    type: "address",
    label: isSpanish ? "Centro Logístico" : "Logistics Hub",
    value: isSpanish ? "Parque Logístico Bao'an, Shenzhen, China" : "Bao'an Logistics Park, Shenzhen, China",
  },
];

export const FOOTER_CONTACTS: ContactInfo[] = getLocalizedFooterContacts(false);

