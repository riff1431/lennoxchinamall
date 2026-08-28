"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ChevronDown } from "lucide-react";
import { MegaMenu } from "./MegaMenu";
import { NAV_LINKS } from "@/components/layout/header/headerConfig";
import { useCategoryStore } from "@/store/useCategoryStore";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { useMounted } from "@/hooks/useMounted";

export function NavigationBar() {
  const pathname = usePathname();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const isMounted = useMounted();
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const { getRootCategories } = useCategoryStore();

  const rootCategories = isMounted ? getRootCategories() : MOCK_CATEGORIES;

  return (
    <div className="bg-white border-b border-slate-200 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 sm:gap-8 h-12">
          {/* Mega Menu Toggle Button */}
          <div className="relative h-full flex items-center" ref={megaMenuRef}>
            <button
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="flex items-center gap-2.5 bg-gradient-to-r from-[#FF1028] to-[#E00B20] hover:from-[#E00B20] hover:to-[#CC0A1B] text-white px-5 py-2.5 rounded-xl font-black font-heading text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              aria-expanded={isMegaMenuOpen}
              aria-haspopup="true"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? "rotate-180" : ""}`} />
            </button>

            <MegaMenu
              isOpen={isMegaMenuOpen}
              onClose={() => setIsMegaMenuOpen(false)}
              rootCategories={rootCategories}
            />
          </div>

          {/* Main Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-6 text-xs font-bold text-slate-700 h-full">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative h-full flex items-center gap-1.5 transition-colors group px-1 cursor-pointer ${
                    isActive ? "text-[#FF1028] font-black" : "hover:text-[#FF1028]"
                  }`}
                >
                  {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${link.badgeColor || "bg-amber-100 text-amber-700"}`}>
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF1028] rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
