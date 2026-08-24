import React from "react";
import { getAnalyticsData, getReportSchedules } from "@/app/actions/admin-analytics";
import { AnalyticsDashboardClient } from "@/components/admin/analytics/AnalyticsDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [analyticsRes, schedulesRes] = await Promise.all([
    getAnalyticsData({ timeRange: "30d", compareWithPrevious: true }),
    getReportSchedules(),
  ]);

  if (!analyticsRes.success || !analyticsRes.data) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto my-12 text-slate-200 font-montserrat">
        <h2 className="text-xl font-black text-red-400">Failed to Load Telemetry</h2>
        <p className="text-xs text-slate-400">
          {analyticsRes.error || "An error occurred while communicating with the database."}
        </p>
      </div>
    );
  }

  return (
    <AnalyticsDashboardClient
      initialData={analyticsRes.data}
      initialSchedules={schedulesRes.data || []}
    />
  );
}
