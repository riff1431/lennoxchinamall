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

export type AdminSection =
  | "dashboard"
  | "products"
  | "categories"
  | "brands"
  | "attributes"
  | "inventory"
  | "media"
  | "suppliers"
  | "sourcing"
  | "orders"
  | "payments"
  | "shipping"
  | "returns"
  | "customers"
  | "reviews"
  | "support"
  | "coupons"
  | "flash-deals"
  | "promotions"
  | "homepage-sections"
  | "pages"
  | "menus"
  | "seo"
  | "notifications"
  | "analytics"
  | "staff"
  | "audit-logs"
  | "integrations"
  | "settings"
  | "security";

export const ROLE_PERMISSIONS: Record<UserRole, AdminSection[]> = {
  super_admin: [
    "dashboard",
    "products",
    "categories",
    "brands",
    "attributes",
    "inventory",
    "media",
    "suppliers",
    "sourcing",
    "orders",
    "payments",
    "shipping",
    "returns",
    "customers",
    "reviews",
    "support",
    "coupons",
    "flash-deals",
    "promotions",
    "homepage-sections",
    "pages",
    "menus",
    "seo",
    "notifications",
    "analytics",
    "staff",
    "audit-logs",
    "integrations",
    "settings",
    "security",
  ],
  catalogue_manager: [
    "dashboard",
    "products",
    "categories",
    "brands",
    "attributes",
    "inventory",
    "media",
    "suppliers",
    "flash-deals",
    "coupons",
    "promotions",
    "homepage-sections",
    "pages",
    "menus",
    "seo",
    "reviews",
  ],
  order_manager: [
    "dashboard",
    "orders",
    "payments",
    "shipping",
    "sourcing",
    "returns",
    "inventory",
    "suppliers",
    "customers",
    "support",
    "analytics",
  ],
  support_agent: [
    "dashboard",
    "orders",
    "shipping",
    "returns",
    "customers",
    "reviews",
    "support",
    "notifications",
  ],
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
  const section = segments[0] as AdminSection;

  const validSections: AdminSection[] = [
    "dashboard",
    "products",
    "categories",
    "brands",
    "attributes",
    "inventory",
    "media",
    "suppliers",
    "sourcing",
    "orders",
    "payments",
    "shipping",
    "returns",
    "customers",
    "reviews",
    "support",
    "coupons",
    "flash-deals",
    "promotions",
    "homepage-sections",
    "pages",
    "menus",
    "seo",
    "notifications",
    "analytics",
    "staff",
    "audit-logs",
    "integrations",
    "settings",
    "security",
  ];

  return validSections.includes(section) ? section : "dashboard";
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

/**
 * Detailed role descriptions for permission inspection.
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: "Full unrestricted platform control, staff governance, role assignment, and financial logs.",
  catalogue_manager: "Manages product catalog, dual-video media, private supplier links, and promotional campaigns.",
  order_manager: "Handles order fulfilment, air express tracking numbers, Binance Pay USDT ledger, and supplier POs.",
  support_agent: "Handles customer inquiries, 30-day warranty claims, returns inspection, and order issue resolution.",
  customer: "Standard verified customer account for factory-direct hardware ordering and USDT escrow checkout.",
};
