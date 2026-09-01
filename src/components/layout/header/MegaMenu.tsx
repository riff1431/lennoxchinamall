"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Category } from "@/types/database";

interface MegaMenuCategory extends Partial<Category> {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  iconName?: string;
  subcategories?: string[];
}

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  rootCategories: MegaMenuCategory[];
}

export function MegaMenu({ isOpen, onClose, rootCategories }: MegaMenuProps) {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const selectedId = hoveredCategory || rootCategories?.[0]?.id;
  const activeCategory = rootCategories?.find((c) => c.id === selectedId) || rootCategories?.[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 top-full mt-1.5 w-[780px] bg-white rounded-3xl border border-slate-200 shadow-2xl grid grid-cols-12 overflow-hidden z-50"
          role="menu"
        >
          {/* Left Column: Category Tabs */}
          <div className="col-span-5 bg-slate-50 p-3 border-r border-slate-200 space-y-1 h-[450px] overflow-y-auto overflow-x-hidden">
            {rootCategories.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full px-3.5 py-3 rounded-xl flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-slate-200" />
                    <div className="h-4 bg-slate-200 rounded w-24" />
                  </div>
                  <div className="w-3.5 h-3.5 bg-slate-200 rounded" />
                </div>
              ))
            ) : (
              rootCategories.map((cat) => {
                const isHovered = selectedId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onClick={() => {
                      onClose();
                      router.push(`/categories/${cat.slug}`);
                    }}
                    role="menuitem"
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isHovered
                        ? "bg-white text-[#FF1028] shadow-sm border border-slate-200 font-black"
                        : "text-slate-700 hover:text-[#00143D]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-white border border-slate-200/80 flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                        <CategoryIcon
                          icon={cat.icon || cat.iconName}
                          name={cat.name}
                          className="w-3.5 h-3.5 text-[#FF1028]"
                        />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${isHovered ? "text-[#FF1028]" : "text-slate-400"}`} />
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Subcategories & Banner */}
          <div className="col-span-7 p-6 space-y-4 flex flex-col justify-between h-[450px]">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <h4 className="font-heading font-black text-sm text-[#00143D]">
                  {activeCategory?.name || "Subcategories"}
                </h4>
                {activeCategory && (
                  <Link
                    href={`/categories/${activeCategory.slug}`}
                    onClick={onClose}
                    className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Explore All</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {activeCategory?.subcategories && activeCategory.subcategories.length > 0 ? (
                  activeCategory.subcategories.map((sub: string, i: number) => (
                    <Link
                      key={i}
                      href={`/categories/${activeCategory.slug}`}
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-[#00143D] font-medium transition-colors block cursor-pointer"
                    >
                      {sub}
                    </Link>
                  ))
                ) : (
                  <div className="col-span-2 text-slate-400 text-xs py-4">No subcategories available.</div>
                )}
              </div>
            </div>

            {/* Featured Factory Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00143D] to-[#002366] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-300">
                  Direct Factory Deal
                </span>
                <h5 className="font-heading font-black text-xs">USDT Zero Fee Settlement</h5>
              </div>
              <Link
                href="/categories/flash-deals"
                onClick={onClose}
                className="bg-gradient-to-r from-[#FF1028] to-[#E00B20] hover:from-[#E00B20] hover:to-[#CC0A1B] text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer inline-block"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
