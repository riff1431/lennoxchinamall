import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/roles";
import { getPublicStoreSettings } from "@/lib/settings";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { DynamicFavicon } from "@/components/common/DynamicFavicon";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const publicSettings = await getPublicStoreSettings();

  // If not authenticated as an admin (e.g. on /admin/login), render children cleanly
  if (!session || !isAdminRole(session.role)) {
    return (
      <SettingsProvider initialSettings={publicSettings}>
        <DynamicFavicon initialSettings={publicSettings} />
        {children}
      </SettingsProvider>
    );
  }

  const userProfile = {
    id: session.id,
    email: session.email,
    display_name: session.displayName,
    role: session.role,
    is_active: true,
  };

  return (
    <SettingsProvider initialSettings={publicSettings}>
      <DynamicFavicon initialSettings={publicSettings} />
      <AdminLayoutClient userProfile={userProfile}>
        {children}
      </AdminLayoutClient>
    </SettingsProvider>
  );
}
