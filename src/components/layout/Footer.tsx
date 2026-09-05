"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Mail,
  Send,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { useSettingsStore } from "@/store/useSettingsStore";
import { BrandLogo } from "@/components/common/BrandLogo";
import { subscribeNewsletter, NewsletterResult } from "@/app/actions/newsletter";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  FOOTER_SECTIONS,
  FooterSection,
  getLocalizedFooterTrustItems,
  getLocalizedFooterSections,
  getLocalizedFooterContacts,
} from "./footerData";

/* ──────────────────────────────────────────────────────────
   PREMIUM VECTOR ICONS (Zero Emojis)
   ────────────────────────────────────────────────────────── */

function AppleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.03-.51 2.68-1.26z" />
    </svg>
  );
}

function GooglePlayIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.61-1.63V3.444c0-.624.225-1.2.609-1.63zm11.242 11.243l2.49 2.49-11.83 6.76 9.34-9.25zm0-2.114L5.511 1.693l11.83 6.76-2.49 2.49zm1.414 1.057l3.705 2.117c1.173.67 1.173 1.764 0 2.434l-3.705 2.117-2.695-2.696 2.695-2.695z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.49 0-2.95-.4-4.22-1.16l-.3-.18-3.13.82.84-3.05-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.25-8.22 8.25zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29z" />
    </svg>
  );
}

function TwitterXIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function UsdtBadgeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1.2 5.5h3.6v1.8h-3.6v.9c2.3.1 4 .5 4 1.1s-1.7 1-4 1.1v4.1h-2.4v-4.1c-2.3-.1-4-.5-4-1.1s1.7-1 4-1.1v-.9H7.2V7.5h3.6V6h2.4v1.5z" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   PROPS & COMPONENT DEFINITION
   ────────────────────────────────────────────────────────── */

export interface FooterProps {
  storeName?: string;
  logoUrl?: string;
  darkLogoUrl?: string;
  sections?: FooterSection[];
}

export function Footer({
  storeName = SITE_NAME,
  logoUrl,
  sections = FOOTER_SECTIONS,
}: FooterProps = {}) {
  const { locale, setLocale, t, isSpanish } = useTranslation();
  const settingsStoreName = useSettingsStore((s) => s.settings.store_info?.store_name);
  const settingsLogo = useSettingsStore((s) => s.settings.branding?.primary_logo_url);

  const effectiveStoreName = storeName || settingsStoreName || SITE_NAME;
  const effectiveFooterLogo =
    (logoUrl && logoUrl.trim() ? logoUrl : null) ||
    (settingsLogo && settingsLogo.trim() ? settingsLogo : null) ||
    "/logo-lennoxchinamall.png";

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterFeedback, setNewsletterFeedback] = useState<NewsletterResult | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const trustItems = getLocalizedFooterTrustItems(isSpanish);
  const activeSections = sections === FOOTER_SECTIONS ? getLocalizedFooterSections(isSpanish) : sections;
  const activeContacts = getLocalizedFooterContacts(isSpanish);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setNewsletterFeedback(null);

    try {
      const res = await subscribeNewsletter(email);
      setNewsletterFeedback(res);
      if (res.success && res.status === "success") {
        setEmail("");
      }
    } catch {
      setNewsletterFeedback({
        success: false,
        status: "error",
        message: isSpanish
          ? "Error al conectar con el servidor de suscripción. Por favor reintente."
          : "Failed to connect to subscription server. Please retry.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-b from-slate-50 via-white to-slate-100/70 text-slate-600 border-t border-slate-200/80 font-sans relative z-10 pb-28 md:pb-8 mt-16 selection:bg-[#FF1028] selection:text-white">
      
      {/* ──────────────────────────────────────────────────────────
          TIER 1: MINIMAL VALUE-PROPS & NEWSLETTER INTEGRATION
          ────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200/80 bg-slate-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          
          {/* Trust Value Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${item.bgClass} ${item.colorClass} group-hover:scale-105 transition-transform duration-200 shadow-2xs`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading tracking-tight truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug line-clamp-1 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Minimalist Light Newsletter Banner */}
          <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-sm p-5 sm:p-7 flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1028] via-rose-500 to-amber-500" />

            <div className="space-y-1.5 text-center lg:text-left max-w-xl">
              <h3 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900 tracking-tight">
                {t.footer.newsletterTitle}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.footer.newsletterDesc}
              </p>
            </div>

            {/* Newsletter Input Form */}
            <div className="w-full lg:w-auto flex-1 max-w-md space-y-2">
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder={t.footer.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:border-[#FF1028] focus:ring-2 focus:ring-[#FF1028]/15 disabled:opacity-50 transition-all shadow-2xs"
                    aria-label="Email address for newsletter"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF1028] hover:bg-[#E00B20] active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-xs font-bold font-heading uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-red-500/20 hover:shadow-red-500/30"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t.footer.subscribe}</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Animated Newsletter Feedback */}
              <AnimatePresence>
                {newsletterFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2 ${
                      newsletterFeedback.status === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : newsletterFeedback.status === "duplicate"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {newsletterFeedback.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <span>
                      {isSpanish
                        ? newsletterFeedback.status === "success"
                          ? "¡Gracias por suscribirte! Tu cupón del 10% LENNOX10 ha sido activado."
                          : newsletterFeedback.status === "duplicate"
                          ? "¡Ya estás suscrito al boletín directo de fábrica!"
                          : "Por favor ingresa un correo electrónico válido."
                        : newsletterFeedback.message}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          TIER 2: BRAND CORE & DYNAMIC RESPONSIVE NAVIGATION
          ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand Info & Contacts (4 Columns on Desktop) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block group focus:outline-none" aria-label={effectiveStoreName}>
              <div className="relative h-12 w-[190px] sm:h-14 sm:w-[230px] group-hover:scale-[1.01] transition-transform">
                <BrandLogo
                  variant="primary"
                  customUrl={effectiveFooterLogo}
                  alt={`${effectiveStoreName} Logo`}
                  priority
                  className="w-full h-full"
                  sizes="(max-width: 640px) 190px, 230px"
                  imageClassName="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              {isSpanish
                ? "Lennox China Mall conecta a compradores internacionales directamente con fabricantes certificados en Shenzhen, Ningbo y Yiwu con custodia criptográfica en USDT sin comisiones."
                : "Lennox China Mall connects international buyers directly to verified manufacturers across Shenzhen, Ningbo, and Yiwu with zero-fee USDT cryptographic escrow."}
            </p>

            {/* Interactive Contact Items with Clipboard Copy */}
            <div className="space-y-2 pt-1 text-xs">
              {activeContacts.map((contact) => (
                <div
                  key={contact.label}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-2xs transition-all"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
                      {contact.label}
                    </span>
                    {contact.href ? (
                      <a
                        href={contact.href}
                        target={contact.href.startsWith("http") ? "_blank" : undefined}
                        rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-xs font-semibold text-slate-800 hover:text-[#FF1028] transition-colors truncate block"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-slate-800 truncate block">
                        {contact.value}
                      </span>
                    )}
                  </div>

                  {contact.copyable && (
                    <button
                      onClick={() => copyToClipboard(contact.value, contact.label)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all shrink-0 cursor-pointer relative"
                      title={`Copy ${contact.label}`}
                      aria-label={`Copy ${contact.label}`}
                    >
                      {copiedKey === contact.label ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 animate-in fade-in">
                          <Check className="w-3.5 h-3.5" />
                          <span>{isSpanish ? "Copiado" : "Copied"}</span>
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Navigation Columns & App Section (8 Columns on Desktop) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {activeSections.map((section) => {
                const isOpen = openAccordion === section.id;
                return (
                  <div key={section.id} className="space-y-3">
                    
                    {/* Desktop Header */}
                    <h4 className="hidden md:block font-heading font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200/90 pb-2.5">
                      {section.title}
                    </h4>

                    {/* Mobile Accordion Header */}
                    <button
                      onClick={() => setOpenAccordion(isOpen ? null : section.id)}
                      className="md:hidden w-full flex items-center justify-between py-3 border-b border-slate-200 text-xs font-bold text-slate-900 uppercase tracking-wider cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span>{section.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#FF1028]" : ""
                        }`}
                      />
                    </button>

                    {/* Desktop Links List */}
                    <ul className="hidden md:space-y-2 md:block text-xs text-slate-500">
                      {section.links.map((link, idx) => (
                        <li key={idx}>
                          <Link
                            href={link.href}
                            className="hover:text-[#FF1028] transition-all duration-150 flex items-center gap-1.5 group py-0.5"
                          >
                            <span className="group-hover:translate-x-1 transition-transform duration-150 text-slate-600 group-hover:text-[#FF1028]">
                              {link.label}
                            </span>
                            {link.badge && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-50 text-[#FF1028] border border-red-200/60 uppercase font-heading">
                                {link.badge}
                              </span>
                            )}
                            {link.isExternal && (
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#FF1028]" />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* Mobile Animated Accordion Content */}
                    <div className="md:hidden">
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden space-y-2 text-xs text-slate-500 pt-1 pb-3"
                          >
                            {section.links.map((link, idx) => (
                              <li key={idx}>
                                <Link
                                  href={link.href}
                                  className="hover:text-[#FF1028] text-slate-600 transition-colors flex items-center gap-1.5 py-1"
                                >
                                  <span>{link.label}</span>
                                  {link.badge && (
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-50 text-[#FF1028] border border-red-200/60 uppercase font-heading">
                                      {link.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Premium Vector App Store Badges */}
            <div className="mt-8 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block font-mono">
                  {isSpanish ? "App Móvil de Compras" : "Mobile Sourcing App"}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isSpanish ? "Abastecimiento directo de fábrica en dispositivos iOS y Android." : "Direct factory sourcing on iOS and Android devices."}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href="#app-store"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 text-slate-900 transition-all group shadow-2xs"
                  aria-label="Download on App Store"
                >
                  <AppleIcon className="w-4 h-4 text-slate-900 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="text-[8px] text-slate-400 block leading-none">{isSpanish ? "Descargar en" : "Download on"}</span>
                    <span className="text-[11px] font-bold font-heading leading-tight text-slate-900">App Store</span>
                  </div>
                </a>

                <a
                  href="#google-play"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 text-slate-900 transition-all group shadow-2xs"
                  aria-label="Get it on Google Play"
                >
                  <GooglePlayIcon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="text-[8px] text-slate-400 block leading-none">{isSpanish ? "Disponible en" : "Get it on"}</span>
                    <span className="text-[11px] font-bold font-heading leading-tight text-slate-900">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          TIER 3: MINIMAL UTILITY BAR, PAYMENT BADGES & SOCIAL DOCK
          ────────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200/80 bg-slate-100/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          
          {/* Left: Copyright & Legal Quick Links */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-center lg:text-left">
            <span>&copy; {new Date().getFullYear()} Lennox China Mall. {isSpanish ? "Todos los derechos reservados." : "All rights reserved."}</span>
            <span className="hidden sm:inline text-slate-300">&bull;</span>
            <Link href="/pages/privacy-policy" className="hover:text-slate-900 transition-colors">
              {isSpanish ? "Privacidad" : "Privacy"}
            </Link>
            <Link href="/pages/terms" className="hover:text-slate-900 transition-colors">
              {isSpanish ? "Términos" : "Terms"}
            </Link>
            <Link href="/pages/shipping-policy" className="hover:text-slate-900 transition-colors">
              {isSpanish ? "Envíos y Aduanas" : "Shipping & Customs"}
            </Link>
          </div>

          {/* Center: Sleek Payment Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-1 shadow-2xs">
              <UsdtBadgeIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>USDT (Binance Pay)</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold shadow-2xs">
              BTC
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold shadow-2xs">
              ETH
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold shadow-2xs">
              USDC
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
              {isSpanish ? "Garantía Web3" : "Web3 Escrow"}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-sans flex items-center gap-1 shadow-2xs">
              <Lock className="w-3 h-3 text-blue-600" />
              <span>256-Bit SSL</span>
            </span>
          </div>

          {/* Right: Language Switcher, Social Media Dock & Smooth Back to Top */}
          <div className="flex items-center gap-3">
            {/* Bilingual Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  locale === "en" ? "bg-[#FF1028] text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale("es")}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  locale === "es" ? "bg-[#FF1028] text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                ES
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Social Icons */}
            <div className="flex items-center gap-1">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="p-2 rounded-lg text-slate-400 hover:text-[#FF1028] hover:bg-white transition-all hover:-translate-y-0.5 border border-transparent hover:border-slate-200 hover:shadow-2xs"
              >
                <TelegramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/8675583291800"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="p-2 rounded-lg text-slate-400 hover:text-[#FF1028] hover:bg-white transition-all hover:-translate-y-0.5 border border-transparent hover:border-slate-200 hover:shadow-2xs"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter X"
                className="p-2 rounded-lg text-slate-400 hover:text-[#FF1028] hover:bg-white transition-all hover:-translate-y-0.5 border border-transparent hover:border-slate-200 hover:shadow-2xs"
              >
                <TwitterXIcon className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="p-2 rounded-lg text-slate-400 hover:text-[#FF1028] hover:bg-white transition-all hover:-translate-y-0.5 border border-transparent hover:border-slate-200 hover:shadow-2xs"
              >
                <DiscordIcon className="w-4 h-4" />
              </a>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-white bg-white hover:bg-[#FF1028] px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#FF1028] shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
              aria-label={isSpanish ? "Volver arriba" : "Scroll back to top"}
            >
              <span>{isSpanish ? "Inicio" : "Top"}</span>
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </div>

    </footer>
  );
}
