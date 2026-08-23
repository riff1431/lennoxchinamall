import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#000B24] flex flex-col justify-between p-4 sm:p-6 text-slate-100 font-montserrat">
      <div className="max-w-md w-full mx-auto pt-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/20 bg-white">
              <Image
                src="/logo-lennoxchinamall.jpeg"
                alt="Lennox China Mall Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-white tracking-tight">
                  LENNOX
                </span>
                <span className="text-xl font-black text-[#FF1028] tracking-tight">
                  CHINAMALL
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Direct China Wholesale Portal
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-400 mt-2">
            Direct China Sourcing & USDT Crypto Portal
          </p>
        </div>

        {children}
      </div>

      <div className="text-center text-xs text-slate-500 py-4">
        © {new Date().getFullYear()} Lennox ChinaMall. Secured with 256-bit SSL encryption.
      </div>
    </div>
  );
}
