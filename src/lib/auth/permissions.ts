/**
 * Lennox ChinaMall — Granular Action Permission Engine
 *
 * Checks action-level authorization (view, create, update, delete, export, refund, payment, settings)
 * across operational domains for all 7 platform roles.
 */

import type { UserRole } from "@/types/database";
import { AdminSection, isSuperAdmin, isAdminRole } from "./roles";

export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "refund"
  | "payment"
  | "settings";

// Action permission rules per role per section
export const ACTION_PERMISSIONS: Record<
  UserRole,
  Partial<Record<AdminSection, PermissionAction[]>>
> = {
  super_admin: {
    dashboard: ["view", "export", "settings"],
    products: ["view", "create", "update", "delete", "export", "settings"],
    categories: ["view", "create", "update", "delete", "export", "settings"],
    brands: ["view", "create", "update", "delete", "export", "settings"],
    attributes: ["view", "create", "update", "delete", "settings"],
    inventory: ["view", "create", "update", "delete", "export", "settings"],
    media: ["view", "create", "update", "delete", "settings"],
    suppliers: ["view", "create", "update", "delete", "export", "settings"],
    sourcing: ["view", "create", "update", "delete", "export", "settings"],
    orders: ["view", "create", "update", "delete", "export", "refund", "payment", "settings"],
    payments: ["view", "create", "update", "delete", "export", "refund", "payment", "settings"],
    shipping: ["view", "create", "update", "delete", "export", "settings"],
    returns: ["view", "create", "update", "delete", "export", "refund", "settings"],
    customers: ["view", "create", "update", "delete", "export", "settings"],
    reviews: ["view", "create", "update", "delete", "export", "settings"],
    support: ["view", "create", "update", "delete", "export", "refund", "settings"],
    coupons: ["view", "create", "update", "delete", "export", "settings"],
    "flash-deals": ["view", "create", "update", "delete", "settings"],
    promotions: ["view", "create", "update", "delete", "export", "settings"],
    "homepage-sections": ["view", "create", "update", "delete", "settings"],
    pages: ["view", "create", "update", "delete", "settings"],
    menus: ["view", "create", "update", "delete", "settings"],
    seo: ["view", "create", "update", "delete", "settings"],
    notifications: ["view", "create", "update", "delete", "export", "settings"],
    analytics: ["view", "export", "settings"],
    staff: ["view", "create", "update", "delete", "export", "settings"],
    "audit-logs": ["view", "export"],
    integrations: ["view", "create", "update", "delete", "settings"],
    settings: ["view", "create", "update", "delete", "export", "settings"],
    security: ["view", "create", "update", "delete", "export", "settings"],
  },
  admin: {
    dashboard: ["view", "export"],
    products: ["view", "create", "update", "delete", "export"],
    categories: ["view", "create", "update", "delete", "export"],
    brands: ["view", "create", "update", "delete", "export"],
    attributes: ["view", "create", "update", "delete"],
    inventory: ["view", "create", "update", "delete", "export"],
    media: ["view", "create", "update", "delete"],
    suppliers: ["view", "create", "update", "delete", "export"],
    sourcing: ["view", "create", "update", "delete", "export"],
    orders: ["view", "create", "update", "delete", "export", "refund", "payment"],
    payments: ["view", "update", "export", "refund"],
    shipping: ["view", "create", "update", "export"],
    returns: ["view", "create", "update", "delete", "export", "refund"],
    customers: ["view", "create", "update", "export"],
    reviews: ["view", "create", "update", "delete"],
    support: ["view", "create", "update", "delete", "export", "refund"],
    coupons: ["view", "create", "update", "delete", "export"],
    "flash-deals": ["view", "create", "update", "delete"],
    promotions: ["view", "create", "update", "delete", "export"],
    "homepage-sections": ["view", "create", "update", "delete"],
    pages: ["view", "create", "update", "delete"],
    menus: ["view", "create", "update", "delete"],
    seo: ["view", "create", "update"],
    notifications: ["view", "create", "update", "delete", "export"],
    analytics: ["view", "export"],
    staff: ["view", "create", "update"],
    "audit-logs": ["view", "export"],
    integrations: ["view", "update"],
    settings: ["view", "update"],
    security: ["view", "update"],
  },
  finance_manager: {
    dashboard: ["view", "export"],
    orders: ["view", "export", "refund", "payment"],
    payments: ["view", "create", "update", "export", "refund", "payment"],
    shipping: ["view", "export"],
    returns: ["view", "update", "export", "refund"],
    customers: ["view", "export"],
    coupons: ["view", "create", "update", "export"],
    promotions: ["view", "export"],
    analytics: ["view", "export"],
    "audit-logs": ["view", "export"],
    settings: ["view"],
  },
  product_manager: {
    dashboard: ["view"],
    products: ["view", "create", "update", "delete", "export"],
    categories: ["view", "create", "update", "delete"],
    brands: ["view", "create", "update", "delete"],
    attributes: ["view", "create", "update", "delete"],
    inventory: ["view", "create", "update", "export"],
    media: ["view", "create", "update", "delete"],
    suppliers: ["view", "create", "update"],
    "flash-deals": ["view", "create", "update", "delete"],
    coupons: ["view", "create", "update"],
    promotions: ["view", "create", "update"],
    "homepage-sections": ["view", "create", "update"],
    pages: ["view", "create", "update"],
    menus: ["view", "create", "update"],
    seo: ["view", "update"],
    reviews: ["view", "update"],
  },
  catalogue_manager: {
    dashboard: ["view"],
    products: ["view", "create", "update", "delete", "export"],
    categories: ["view", "create", "update", "delete"],
    brands: ["view", "create", "update", "delete"],
    attributes: ["view", "create", "update", "delete"],
    inventory: ["view", "create", "update", "export"],
    media: ["view", "create", "update", "delete"],
    suppliers: ["view", "create", "update"],
    "flash-deals": ["view", "create", "update", "delete"],
    coupons: ["view", "create", "update"],
    promotions: ["view", "create", "update"],
    "homepage-sections": ["view", "create", "update"],
    pages: ["view", "create", "update"],
    menus: ["view", "create", "update"],
    seo: ["view", "update"],
    reviews: ["view", "update"],
  },
  order_manager: {
    dashboard: ["view"],
    orders: ["view", "create", "update", "export", "payment"],
    payments: ["view", "update", "export"],
    shipping: ["view", "create", "update", "export"],
    sourcing: ["view", "create", "update", "export"],
    returns: ["view", "create", "update", "export"],
    inventory: ["view", "update"],
    suppliers: ["view"],
    customers: ["view"],
    support: ["view", "create", "update"],
    analytics: ["view"],
  },
  support_agent: {
    dashboard: ["view"],
    orders: ["view", "update"],
    shipping: ["view"],
    returns: ["view", "create", "update"],
    customers: ["view"],
    reviews: ["view", "update"],
    support: ["view", "create", "update"],
    notifications: ["view"],
  },
  customer: {},
};

/**
 * Checks whether a role is authorized for a specific action within an admin module.
 */
export function hasActionPermission(
  role: UserRole | null | undefined,
  section: AdminSection,
  action: PermissionAction
): boolean {
  if (!role) return false;
  if (role === "super_admin") return true;

  const sectionPerms = ACTION_PERMISSIONS[role]?.[section];
  return sectionPerms?.includes(action) ?? false;
}

/**
 * Checks if a role can export sensitive data from a section.
 */
export function canExportData(
  role: UserRole | null | undefined,
  section: AdminSection
): boolean {
  return hasActionPermission(role, section, "export");
}

/**
 * Checks if a role can issue refunds or dispute resolutions.
 */
export function canIssueRefund(
  role: UserRole | null | undefined
): boolean {
  if (!role) return false;
  return ["super_admin", "admin", "finance_manager"].includes(role);
}

/**
 * Checks if a role can manage staff members and invites.
 */
export function canManageStaff(
  role: UserRole | null | undefined
): boolean {
  if (!role) return false;
  return ["super_admin", "admin"].includes(role);
}

/**
 * Checks if a role can modify platform root security settings.
 */
export function canModifySecurity(
  role: UserRole | null | undefined
): boolean {
  return isSuperAdmin(role);
}
