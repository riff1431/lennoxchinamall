import React from "react";
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
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#00143D] text-slate-300 border-t border-[#000B24] mt-16 pb-20 sm:pb-8 font-montserrat">
      {/* ── 1. Banggood-Style Sourcing Trust Strip ── */}
      <div className="border-b border-[#002366] py-10 bg-[#000B24]/70">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF1028]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#FF1028]/15 border border-[#FF1028]/30 text-[#FF1028] flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white mb-1">
                USDT (Binance Pay) Zero-Fee
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant cryptographic QR payment with zero bank fees and automated settlement.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF1028]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white mb-1">
                Direct China Factory Sourcing
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lennox purchases directly from verified manufacturers in Shenzhen, Ningbo, and Yiwu.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF1028]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white mb-1">
                Air Freight 7-12 Days
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Door-to-door tracked transit via FedEx, DHL, YunExpress, and 4PX cargo lines.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF1028]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white mb-1">
                30-Day Lennox Assurance
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Factory warranty coverage, verified dispute desk, and direct USDT refund policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Navigation Columns & Newsletter ── */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Information & Logo */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md border border-white/20 bg-white">
              <Image
                src="/logo-lennoxchinamall.jpeg"
                alt="Lennox China Mall Logo"
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
              <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">
                Direct China Wholesale Portal
              </span>
            </div>
          </Link>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Lennox ChinaMall bridges consumers directly with high-grade China manufacturers. Enjoy transparent wholesale pricing, verified dual-video hardware demos, and secure Binance Pay USDT settlement.
          </p>

          {/* Newsletter Box */}
          <div className="pt-2">
            <span className="text-xs font-bold text-white block mb-2">
              Subscribe for VIP Factory Drops & Coupons
            </span>
            <form className="flex gap-2 max-w-md">
              <input
                type="email"
                placeholder="Enter your email..."
                className="bg-[#000B24] border border-slate-700 text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl text-xs flex-1 focus:outline-none focus:border-[#FF1028]"
              />
              <button
                type="button"
                className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-colors shrink-0"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h5 className="text-xs font-black tracking-wider text-white uppercase border-b border-[#002366] pb-2">
            Customer Care
          </h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link href="/account/orders" className="hover:text-white transition-colors">
                Track Sourcing Order
              </Link>
            </li>
            <li>
              <Link href="/account/returns" className="hover:text-white transition-colors">
                30-Day Return & Warranty
              </Link>
            </li>
            <li>
              <Link href="/account/support" className="hover:text-white transition-colors">
                24/7 Sourcing Ticket Desk
              </Link>
            </li>
            <li>
              <Link href="/pages/shipping-guide" className="hover:text-white transition-colors">
                Shipping & Delivery Timelines
              </Link>
            </li>
            <li>
              <Link href="/pages/usdt-payment-guide" className="hover:text-white transition-colors">
                Binance Pay Payment Guide
              </Link>
            </li>
          </ul>
        </div>

        {/* Sourcing Hubs */}
        <div className="space-y-3">
          <h5 className="text-xs font-black tracking-wider text-white uppercase border-b border-[#002366] pb-2">
            China Sourcing Hubs
          </h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link href="/categories/rc-drones-toys" className="hover:text-white transition-colors">
                Shenzhen Drone Cluster
              </Link>
            </li>
            <li>
              <Link href="/categories/tools-diy-hardware" className="hover:text-white transition-colors">
                Ningbo Tool & 3D Factories
              </Link>
            </li>
            <li>
              <Link href="/categories/consumer-electronics" className="hover:text-white transition-colors">
                Dongguan Audio & Smart Tech
              </Link>
            </li>
            <li>
              <Link href="/categories/automotive-parts" className="hover:text-white transition-colors">
                Guangzhou Automotive OBD2
              </Link>
            </li>
            <li>
              <Link href="/pages/sourcing-model" className="hover:text-white transition-colors">
                Single-Vendor Assurance Model
              </Link>
            </li>
          </ul>
        </div>

        {/* Lennox Guarantee */}
        <div className="space-y-3">
          <h5 className="text-xs font-black tracking-wider text-white uppercase border-b border-[#002366] pb-2">
            Lennox Portal
          </h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link href="/pages/about" className="hover:text-white transition-colors">
                About Lennox ChinaMall
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-white transition-colors">
                Customer Sign In
              </Link>
            </li>
            <li>
              <Link href="/auth/register" className="hover:text-white transition-colors">
                Create Sourcing Account
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard" className="hover:text-amber-400 transition-colors">
                Admin Management Hub
              </Link>
            </li>
            <li>
              <Link href="/pages/terms" className="hover:text-white transition-colors">
                Privacy & Buyer Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ── 3. Bottom Copyright & Security Badges ── */}
      <div className="border-t border-[#000B24] bg-[#00081C] py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Lennox ChinaMall Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#10B981]" /> 256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">Binance Pay Verified Merchant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
