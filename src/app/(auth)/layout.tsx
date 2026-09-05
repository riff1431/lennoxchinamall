"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { BrandLogo } from "@/components/common/BrandLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSpanish } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-900 font-sans relative overflow-x-hidden selection:bg-[#FF1028]/10 selection:text-[#FF1028]">
      {/* Subtle Ambient Decorative Glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[280px] bg-red-500/[0.035] rounded-full blur-[90px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[420px] h-[240px] bg-blue-500/[0.025] rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header with Back Navigation */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pt-2 pb-4 sm:pt-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-full hover:bg-slate-100/80 active:scale-95"
          aria-label={isSpanish ? "Volver a la tienda" : "Return to store"}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isSpanish ? "Volver a la tienda" : "Back to store"}</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isSpanish ? "Portal Seguro SSL" : "Secure SSL Portal"}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[440px] w-full mx-auto my-auto py-4 sm:py-8 relative z-10">
        {/* Brand Logo & Tagline */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1028] rounded-xl">
            <div className="relative h-12 w-[180px] sm:h-14 sm:w-[220px] mx-auto group-hover:scale-[1.02] transition-transform duration-200">
              <BrandLogo
                variant="primary"
                priority
                sizes="(max-width: 640px) 180px, 220px"
                className="w-full h-full"
                imageClassName="object-contain"
              />
            </div>
          </Link>
          <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide">
            {isSpanish ? "De las fábricas directamente a tus manos" : "Direct factory sourcing & wholesale portal"}
          </p>
        </div>

        {children}
      </main>

      {/* Bottom Footer */}
      <footer className="max-w-5xl w-full mx-auto pt-6 pb-4 relative z-10 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <Link href="/pages/terms" className="hover:text-slate-800 transition-colors">
            {isSpanish ? "Términos del Servicio" : "Terms of Service"}
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/pages/privacy" className="hover:text-slate-800 transition-colors">
            {isSpanish ? "Privacidad" : "Privacy Policy"}
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/account/support" className="hover:text-slate-800 transition-colors">
            {isSpanish ? "Soporte" : "Help & Support"}
          </Link>
        </div>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} {SITE_NAME}.{" "}
          {isSpanish ? "Todos los derechos reservados." : "All rights reserved."}
        </p>
      </footer>
    </div>
  );
}
