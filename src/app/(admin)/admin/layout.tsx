import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/roles";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Route security gate
  if (!session || !isAdminRole(session.role)) {
    redirect("/auth/admin-login?redirect=/admin/dashboard");
  }

  const userProfile = {
    id: session.id,
    email: session.email,
    display_name: session.displayName,
    role: session.role,
    is_active: true,
  };

  return (
    <AdminLayoutClient userProfile={userProfile}>
      {children}
    </AdminLayoutClient>
  );
}
