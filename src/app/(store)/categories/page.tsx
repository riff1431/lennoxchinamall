import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function CategoriesDirectoryPage() {
  return (
    <div className="space-y-6 pb-16">
      <Breadcrumbs items={[{ label: "All Departments & Sourcing Hubs" }]} />

      <div className="text-center max-w-xl mx-auto space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Direct China Factory Departments
        </h1>
        <p className="text-xs text-slate-500">
          Browse verified manufacturing categories directly connected to Lennox Sourcing Portal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src={cat.image_url || ""}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-lg font-black text-white">{cat.name}</h3>
                <span className="text-xs text-orange-400 font-bold">
                  {cat.product_count}+ Verified Items
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {cat.description}
              </p>

              {cat.subcategories && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  {cat.subcategories.map((sub, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}

              <Link
                href={`/categories/${cat.slug}`}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Explore Department</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
