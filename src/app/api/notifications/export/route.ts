import { NextRequest, NextResponse } from "next/server";
import { getNotificationDeliveryLogs } from "@/app/actions/admin-notifications";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const channel = searchParams.get("channel") || undefined;
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;

  const { logs } = await getNotificationDeliveryLogs({
    status,
    channel,
    category,
    search,
    limit: 1000,
  });

  // Convert logs to CSV
  const headers = [
    "Log ID",
    "Recipient Email",
    "Channel",
    "Category",
    "Status",
    "Provider",
    "Subject",
    "Sent At",
    "Delivered At",
    "Opened At",
    "Clicked At",
    "Retry Count",
    "Last Error",
  ];

  const escapeCSV = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = (logs || []).map((l) => [
    escapeCSV(l.id),
    escapeCSV(l.recipient_email || ""),
    escapeCSV(l.channel),
    escapeCSV(l.category),
    escapeCSV(l.status),
    escapeCSV(l.provider || ""),
    escapeCSV(l.subject || ""),
    escapeCSV(l.sent_at || ""),
    escapeCSV(l.delivered_at || ""),
    escapeCSV(l.opened_at || ""),
    escapeCSV(l.clicked_at || ""),
    escapeCSV(l.retry_count || 0),
    escapeCSV(l.last_error || ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lennox-notification-logs-${Date.now()}.csv"`,
    },
  });
}
