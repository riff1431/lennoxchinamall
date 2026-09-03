"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSpanish } = useTranslation();
  const dynamicLogo = useSettingsStore((s) => s.settings.branding?.primary_logo_url) || "/logo-lennoxchinamall.png";
  const dynamicStoreName = useSettingsStore((s) => s.settings.store_info?.store_name) || SITE_NAME;

  return (
    <div className="min-h-screen bg-[#000B24] flex flex-col justify-between p-4 sm:p-6 text-slate-100 font-montserrat">
      <div className="max-w-md w-full mx-auto pt-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <div className="relative h-16 w-[200px] sm:h-20 sm:w-[250px] mx-auto group-hover:scale-[1.03] transition-transform">
              <Image
                src={dynamicLogo}
                alt={`${dynamicStoreName} Logo`}
                fill
                sizes="250px"
                className="object-contain"
                priority
                unoptimized={dynamicLogo.startsWith("data:") || dynamicLogo.startsWith("blob:")}
              />
            </div>
          </Link>
          <p className="text-xs text-slate-400 mt-3 font-semibold">
            {isSpanish ? "De Las Fábricas A Tus Manos" : "From Factories Directly To Your Hands"}
          </p>
        </div>

        {children}
      </div>

      <div className="text-center text-xs text-slate-500 py-4">
        © {new Date().getFullYear()} {SITE_NAME}.{" "}
        {isSpanish ? "Protegido con encriptación SSL de 256 bits." : "Secured with 256-bit SSL encryption."}
      </div>
    </div>
  );
}
