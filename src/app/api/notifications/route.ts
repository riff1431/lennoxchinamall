import { NextRequest, NextResponse } from "next/server";
import { getUserNotifications, getUnreadNotificationsCount } from "@/app/actions/notifications";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const countOnly = searchParams.get("countOnly") === "true";
  const category = searchParams.get("category") || undefined;
  const status = (searchParams.get("status") as "all" | "unread" | "archived" | "read") || undefined;
  const search = searchParams.get("search") || undefined;

  if (countOnly) {
    const count = await getUnreadNotificationsCount();
    return NextResponse.json({ unreadCount: count });
  }

  const result = await getUserNotifications({ category, status, search });
  return NextResponse.json(result);
}
