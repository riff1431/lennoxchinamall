/**
 * Lennox ChinaMall — Role Constants & Permission Map
 *
 * Authorization is based on `app_metadata.role` (set server-side, not user-editable).
 * NEVER use `user_metadata` for authorization decisions — it is user-editable.
 */

import type { UserRole } from "@/types/database";

// ─── Role Hierarchy & Classification ───────────────────────────────────────

export const ADMIN_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "finance_manager",
  "product_manager",
  "catalogue_manager",
  "order_manager",
  "support_agent",
];

export const ROLE_HIERARCHY_LEVEL: Record<UserRole, number> = {
  super_admin: 100,
  admin: 90,
  finance_manager: 80,
  product_manager: 70,
  catalogue_manager: 70,
  order_manager: 60,
  support_agent: 50,
  customer: 10,
};

export function isAdminRole(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}

export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === "super_admin";
}

export function canManageRole(
  actorRole: UserRole | null | undefined,
  targetRole: UserRole
): boolean {
  if (!actorRole) return false;
  // Only super_admin and admin can manage roles, and cannot manage equal/higher roles
  if (actorRole !== "super_admin" && actorRole !== "admin") return false;
  return ROLE_HIERARCHY_LEVEL[actorRole] > ROLE_HIERARCHY_LEVEL[targetRole];
}

// ─── Granular Module Sections ───────────────────────────────────────────────

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
  admin: [
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
  finance_manager: [
    "dashboard",
    "orders",
    "payments",
    "shipping",
    "returns",
    "customers",
    "coupons",
    "promotions",
    "analytics",
    "audit-logs",
    "settings",
  ],
  product_manager: [
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
  customer: [],
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
  admin: "Administrator",
  finance_manager: "Finance Manager",
  product_manager: "Product Manager",
  catalogue_manager: "Catalogue Manager",
  order_manager: "Order Manager",
  support_agent: "Support Agent",
  customer: "Customer",
};

/**
 * Detailed role descriptions for permission inspection.
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: "Full unrestricted platform control, staff governance, role assignment, root security, and audit logs.",
  admin: "Comprehensive operations management across all catalog, orders, staff, customers, and configuration.",
  finance_manager: "Manages Binance Pay USDT transactions, settlements, refunds, dispute review, and tax exports.",
  product_manager: "Manages product hardware catalog, categories, attributes, inventory batches, and media benchmarks.",
  catalogue_manager: "Manages product catalog, dual-video media, private supplier links, and promotional campaigns.",
  order_manager: "Handles order fulfilment, air express tracking numbers, Binance Pay USDT ledger, and supplier POs.",
  support_agent: "Handles customer inquiries, 30-day warranty claims, returns inspection, and order issue resolution.",
  customer: "Standard verified customer account for factory-direct hardware ordering and USDT escrow checkout.",
};
