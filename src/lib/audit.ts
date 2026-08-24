/**
 * Lennox ChinaMall — Security Audit Logging Service
 *
 * Records all critical administrative actions (role changes, staff invites,
 * account status changes, security updates) into public.audit_logs.
 */

import { createClient, createServiceClient } from "@/lib/supabase/server";

export type AuditAction =
  | "STAFF_INVITED"
  | "ROLE_CHANGED"
  | "ACCOUNT_STATUS_CHANGED"
  | "PASSWORD_RESET_TRIGGERED"
  | "PERMISSIONS_UPDATED"
  | "USER_DELETED"
  | "SETTINGS_CHANGED"
  | "BROADCAST_CREATED";

export interface LogAuditParams {
  adminId: string;
  adminEmail?: string;
  action: AuditAction;
  entityType: "user" | "role" | "order" | "product" | "setting" | "inventory" | "notification_broadcast";
  entityId?: string;
  changes?: Record<string, unknown>;
  ip?: string;
}

export async function logAuditEvent(params: LogAuditParams): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("audit_logs").insert({
      admin_id: params.adminId,
      admin_email: params.adminEmail || "admin@lennoxchinamall.com",
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      changes: params.changes || {},
      ip: params.ip || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Could not insert audit log via standard client, falling back to service client:", error.message);
      // Fallback to service client if available
      try {
        const serviceClient = createServiceClient();
        await serviceClient.from("audit_logs").insert({
          admin_id: params.adminId,
          admin_email: params.adminEmail || "admin@lennoxchinamall.com",
          action: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId || null,
          changes: params.changes || {},
          ip: params.ip || null,
          created_at: new Date().toISOString(),
        });
      } catch (fallbackErr) {
        console.error("Audit log fallback failed:", fallbackErr);
      }
    }

    return true;
  } catch (err) {
    console.error("Failed to log audit event:", err);
    return false;
  }
}
