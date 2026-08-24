import React from "react";
import { getDashboardOverviewData } from "@/app/actions/admin-dashboard";
import { DashboardClient } from "@/components/admin/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const result = await getDashboardOverviewData({ timeRange: "30d" });

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto my-12 text-slate-800 dark:text-slate-200 font-montserrat shadow-md">
        <h2 className="text-xl font-black text-rose-500">Failed to Load Dashboard Telemetry</h2>
        <p className="text-xs text-slate-400">
          {result.error || "An error occurred while connecting with the database."}
        </p>
      </div>
    );
  }

  return <DashboardClient initialData={result.data} />;
}
