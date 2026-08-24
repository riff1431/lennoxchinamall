"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  Coins,
  Headphones,
  CheckCircle2,
  Lock,
  ArrowRight,
  Mail,
  Zap,
  Globe,
  Plane,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ArrowUp,
  AlertCircle,
  Check,
  Send,
  Radio,
  FileText,
  Award,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { subscribeNewsletter, NewsletterResult } from "@/app/actions/newsletter";

interface FooterLinkSection {
  title: string;
  id: string;
  links: { label: string; href: string; badge?: string }[];
}

const FOOTER_SECTIONS: FooterLinkSection[] = [
  {
    title: "Shop Departments",
    id: "shop",
    links: [
      { label: "Consumer Electronics", href: "/categories/consumer-electronics" },
      { label: "4K Aerial Drones & FPV", href: "/categories/rc-drones-toys", badge: "HOT" },
      { label: "3D Printers & CNC Tools", href: "/categories/tools-diy-hardware" },
      { label: "Smart Home & Robotics", href: "/categories/smart-home-living" },
      { label: "Flash Deals & Daily Drops", href: "/categories/flash-deals", badge: "DEALS" },
      { label: "New Factory Arrivals", href: "/categories/new-arrivals" },
      { label: "Best Selling Sourcing Items", href: "/categories/consumer-electronics" },
    ],
  },
  {
    title: "Customer Service",
    id: "service",
    links: [
      { label: "24/7 Sourcing Support Desk", href: "/account/support" },
      { label: "Track Air Cargo Shipment", href: "/account/orders" },
      { label: "Cross-Border Shipping Policy", href: "/pages/shipping-policy" },
      { label: "30-Day Return & USDT Refund", href: "/account/returns" },
      { label: "Frequently Asked Questions", href: "/pages/faq" },
      { label: "Binance Pay USDT Guide", href: "/pages/faq" },
      { label: "Factory Gate QC Inspection", href: "/pages/about" },
    ],
  },
  {
    title: "Company & Sourcing",
    id: "company",
    links: [
      { label: "About China Mall", href: "/pages/about" },
      { label: "Shenzhen & Ningbo Hubs", href: "/admin/sourcing" },
      { label: "Verified Factory Network", href: "/admin/suppliers" },
      { label: "Wholesale & VIP Bulk Orders", href: "/admin/sourcing" },
      { label: "Affiliate & Partner Program", href: "/pages/about" },
      { label: "Careers in Cross-Border E-Com", href: "/pages/about" },
    ],
  },
  {
    title: "Legal & Compliance",
    id: "legal",
    links: [
      { label: "Privacy Policy", href: "/pages/privacy-policy" },
      { label: "Terms of Service", href: "/pages/terms" },
      { label: "USDT Escrow Agreement", href: "/pages/terms" },
      { label: "Customs & Export Clearance", href: "/pages/shipping-policy" },
      { label: "Cookie Preferences", href: "/pages/privacy-policy" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterFeedback, setNewsletterFeedback] = useState<NewsletterResult | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setNewsletterFeedback(null);

    const res = await subscribeNewsletter(email);
    setNewsletterFeedback(res);
    setIsSubmitting(false);

    if (res.success && res.status === "success") {
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#00143D] text-slate-300 border-t border-[#000B24] mt-20 font-sans relative z-10">
      {/* ── 1. Top Value-Prop Trust Strip ── */}
      <div className="border-b border-[#002366] py-8 bg-[#000B24]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Trust Item 1 */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF1028]/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[#FF1028]/15 border border-[#FF1028]/30 text-[#FF1028] flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-0.5">
                USDT Binance Pay Zero-Fee
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Instant cryptographic escrow settlement with 0% credit card chargeback risks.
              </p>
            </div>
          </div>

          {/* Trust Item 2 */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF1028]/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-0.5">
                Direct Factory Sourcing
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sourced direct from verified factory lines in Shenzhen, Ningbo, and Yiwu.
              </p>
            </div>
          </div>

          {/* Trust Item 3 */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF1028]/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-0.5">
                Air Freight 5-8 Days
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Door-to-door tracked transit via YunExpress, SF International, and DHL Express.
              </p>
            </div>
          </div>

          {/* Trust Item 4 */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF1028]/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-0.5">
                30-Day Money-Back Warranty
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Verified hardware dispute desk with direct USDT refund if items fail quality standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Newsletter Subscription Banner ── */}
      <div className="border-b border-[#002366] py-10 bg-gradient-to-r from-[#00143D] via-[#001d54] to-[#00143D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-1.5 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF1028]/20 text-[#FF1028] border border-[#FF1028]/30 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Direct Factory Drops &amp; Wholesales</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
              Get Weekly Factory Catalogs &amp; 10% Off
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Subscribe to receive weekly Shenzhen tech drops, newly verified hardware batches, and private wholesale discounts.
            </p>
          </div>

          {/* Newsletter Form */}
          <div className="w-full lg:w-auto flex-1 max-w-md space-y-2">
            <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#FF1028] disabled:opacity-50"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-3 rounded-xl text-xs font-black font-heading uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Newsletter Feedback Alerts */}
            {newsletterFeedback && (
              <div
                className={`p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2 animate-in fade-in ${
                  newsletterFeedback.status === "success"
                    ? "bg-emerald-500/20 text-[#10B981] border border-emerald-500/30"
                    : newsletterFeedback.status === "duplicate"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {newsletterFeedback.status === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {newsletterFeedback.status === "duplicate" && <AlertCircle className="w-4 h-4 shrink-0" />}
                {newsletterFeedback.status === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{newsletterFeedback.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Main Footer Links & Company Details ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Info & Contact Card (2 Cols on Desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-white/20 bg-white group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src="/logo-lennoxchinamall.jpeg"
                  alt="China Mall Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black tracking-tight text-white leading-none">
                    CHINA
                  </span>
                  <span className="text-xl font-black text-[#FF1028] leading-none">
                    MALL
                  </span>
                </div>
                <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">
                  Direct China Sourcing Gateway
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed">
              China Mall connects international consumers and wholesale buyers directly with verified manufacturers in Shenzhen, Ningbo, and Yiwu. Enjoy true factory-gate prices and zero-fee Binance Pay USDT escrow.
            </p>

            {/* Direct Contact Info */}
            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF1028] shrink-0" />
                <span className="text-[11px]">Baoan International Airport Logistics Park, Shenzhen, China</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-mono font-bold">+86 755 8329 1800 (WhatsApp / Global Desk)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[11px] font-mono">support@lennoxchinamall.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px]">24/7 Mon–Sun Global Airfreight Operations</span>
              </div>
            </div>

            {/* Mobile App Download Styling */}
            <div className="pt-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 font-mono">
                Mobile Sourcing App
              </span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-[10px] font-bold flex items-center gap-1.5 cursor-pointer hover:border-slate-500 transition-colors">
                  <span>📱 Google Play</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-[10px] font-bold flex items-center gap-1.5 cursor-pointer hover:border-slate-500 transition-colors">
                  <span>🍏 App Store</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Link Sections (Desktop: 4 columns, Mobile: Accordion) */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.id} className="space-y-3">
                {/* Desktop Title */}
                <h4 className="hidden md:block font-heading font-black text-sm text-white uppercase tracking-wider">
                  {section.title}
                </h4>

                {/* Mobile Accordion Header */}
                <button
                  onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
                  className="md:hidden w-full flex items-center justify-between py-2 border-b border-slate-800 text-xs font-black text-white uppercase tracking-wider"
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openAccordion === section.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Link List */}
                <ul
                  className={`space-y-2 text-xs text-slate-400 ${
                    openAccordion === section.id ? "block pt-1 pb-3" : "hidden md:block"
                  }`}
                >
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.href}
                        className="hover:text-white transition-colors flex items-center gap-1.5 group py-0.5"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                        {link.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#FF1028] text-white uppercase">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Accepted Payment Methods & Security Seals ── */}
      <div className="border-t border-[#002366] py-6 bg-[#000B24]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Payment Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Accepted Payment:</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>USDT (Binance Pay)</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 font-mono text-[11px] border border-blue-500/20">
              BTC
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 font-mono text-[11px] border border-purple-500/20">
              ETH
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-mono text-[11px] border border-emerald-500/20">
              USDC
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
              Credit Cards (Web3 Onramp)
            </span>
          </div>

          {/* Security Badges */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Escrow Protected
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. Bottom Copyright Bar & Back-to-Top ── */}
      <div className="border-t border-[#001D54] py-5 bg-[#00081C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} China Mall Inc. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-400">Direct China Sourcing • Transparent Wholesale Pricing</span>
          </div>

          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-[#FF1028] px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
            aria-label="Scroll back to top"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
