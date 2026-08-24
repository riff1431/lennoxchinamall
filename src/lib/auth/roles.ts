/**
 * Lennox ChinaMall — Role Constants & Permission Map
 *
 * Authorization is based on `app_metadata.role` (set server-side, not user-editable).
 * NEVER use `user_metadata` for authorization decisions — it is user-editable.
 */

import type { UserRole } from "@/types/database";

// ─── Role Hierarchy ─────────────────────────────────────────────────────────

export const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "catalogue_manager",
  "order_manager",
  "support_agent",
];

export function isAdminRole(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}

// ─── Granular Permission Map ────────────────────────────────────────────────

type AdminSection =
  | "dashboard"
  | "products"
  | "orders"
  | "payments"
  | "suppliers"
  | "promotions"
  | "customers"
  | "content"
  | "settings";

const ROLE_PERMISSIONS: Record<UserRole, AdminSection[]> = {
  super_admin: [
    "dashboard",
    "products",
    "orders",
    "payments",
    "suppliers",
    "promotions",
    "customers",
    "content",
    "settings",
  ],
  catalogue_manager: ["dashboard", "products", "suppliers", "promotions"],
  order_manager: ["dashboard", "orders", "payments", "suppliers"],
  support_agent: ["dashboard", "orders", "customers"],
  customer: [], // Customers have no admin access
};

/**
 * Check if a role has access to a specific admin section.
 */
export function hasPermission(
  role: UserRole | null | undefined,
  section: AdminSection
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(section) ?? false;
}

/**
 * Get all permitted admin sections for a role.
 */
export function getPermittedSections(
  role: UserRole | null | undefined
): AdminSection[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Map an admin pathname to a section key for permission checking.
 */
export function getAdminSectionFromPath(
  pathname: string
): AdminSection | null {
  const segments = pathname.replace(/^\/admin\/?/, "").split("/");
  const section = segments[0];

  const sectionMap: Record<string, AdminSection> = {
    dashboard: "dashboard",
    products: "products",
    orders: "orders",
    payments: "payments",
    suppliers: "suppliers",
    promotions: "promotions",
    customers: "customers",
    content: "content",
    settings: "settings",
  };

  return sectionMap[section] || "dashboard";
}

/**
 * Human-readable role labels for UI display.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  catalogue_manager: "Catalogue Manager",
  order_manager: "Order Manager",
  support_agent: "Support Agent",
  customer: "Customer",
};
