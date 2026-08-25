/**
 * Lennox ChinaMall — Session & Device Manager
 *
 * Tracks active devices, records login audit history, detects novel devices,
 * and handles remote session revocation.
 */

import { createClient } from "@/lib/supabase/server";
import { UserRole, UserSession, AuthLoginHistory } from "@/types/database";

export interface DeviceInfo {
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet";
  deviceName: string;
}

/**
 * Parses user agent string into structured device metadata.
 */
export function parseUserAgent(uaString: string | null | undefined): DeviceInfo {
  if (!uaString) {
    return {
      browser: "Unknown Browser",
      os: "Unknown OS",
      deviceType: "desktop",
      deviceName: "Unknown Device",
    };
  }

  const ua = uaString.toLowerCase();

  // 1. Device Type
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = "tablet";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    deviceType = "mobile";
  }

  // 2. OS
  let os = "Unknown OS";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod") || ua.includes("ios")) os = "iOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("linux")) os = "Linux";

  // 3. Browser
  let browser = "Unknown Browser";
  if (ua.includes("edg/")) browser = "Microsoft Edge";
  else if (ua.includes("chrome") && !ua.includes("chromium")) browser = "Google Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Apple Safari";
  else if (ua.includes("firefox")) browser = "Mozilla Firefox";
  else if (ua.includes("opera") || ua.includes("opr/")) browser = "Opera";

  const deviceName = `${browser} on ${os}`;

  return { browser, os, deviceType, deviceName };
}

/**
 * Records a login event into the login history table and updates user profile stats.
 */
export async function recordLoginHistory(params: {
  userId?: string | null;
  email: string;
  ipAddress: string;
  userAgent?: string | null;
  status: "success" | "failed_credentials" | "failed_locked" | "failed_2fa" | "blocked";
  failureReason?: string;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const { browser, os, deviceType } = parseUserAgent(params.userAgent);

    // Insert history record
    await supabase.from("auth_login_history").insert({
      user_id: params.userId || null,
      email: params.email,
      ip_address: params.ipAddress,
      user_agent: params.userAgent || null,
      browser,
      os,
      device_type: deviceType,
      status: params.status,
      failure_reason: params.failureReason || null,
      is_suspicious: params.status === "failed_locked" || params.status === "blocked",
    });

    // If successful, update profile's last login stats
    if (params.status === "success" && params.userId) {
      await supabase
        .from("profiles")
        .update({
          last_login_at: new Date().toISOString(),
          last_login_ip: params.ipAddress,
          failed_login_attempts: 0,
          locked_until: null,
        })
        .eq("id", params.userId);

      // Register device in active user_sessions table
      await registerActiveSession({
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    }
  } catch (err) {
    // Non-blocking for auth flow
    console.error("Failed to record login history:", err);
  }
}

/**
 * Registers a new active session device in the database.
 */
export async function registerActiveSession(params: {
  userId: string;
  ipAddress: string;
  userAgent?: string | null;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const { browser, os, deviceType, deviceName } = parseUserAgent(params.userAgent);
    const sessionTokenHash = Buffer.from(
      `${params.userId}:${params.ipAddress}:${Date.now()}`
    ).toString("base64");

    await supabase.from("user_sessions").insert({
      user_id: params.userId,
      session_token_hash: sessionTokenHash,
      device_name: deviceName,
      device_type: deviceType,
      browser,
      os,
      ip_address: params.ipAddress,
      is_current: true,
      last_active_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to register active session:", err);
  }
}

/**
 * Logs a high-priority security event into security_audit_logs.
 */
export async function logSecurityAudit(params: {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: UserRole | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
  severity?: "info" | "warning" | "critical";
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("security_audit_logs").insert({
      actor_id: params.actorId || null,
      actor_email: params.actorEmail || null,
      actor_role: params.actorRole || null,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId || null,
      details: params.details || {},
      ip_address: params.ipAddress || null,
      severity: params.severity || "info",
    });
  } catch (err) {
    console.error("Failed to log security audit event:", err);
  }
}

/**
 * Fetches active sessions for a user.
 */
export async function getUserSessions(userId: string): Promise<UserSession[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .order("last_active_at", { ascending: false });

    if (error || !data) return [];
    return data as UserSession[];
  } catch {
    return [];
  }
}

/**
 * Fetches recent login history for a user.
 */
export async function getUserLoginHistory(
  userId: string,
  limit = 10
): Promise<AuthLoginHistory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("auth_login_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as AuthLoginHistory[];
  } catch {
    return [];
  }
}

/**
 * Revokes a specific session remotely.
 */
export async function revokeUserSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("user_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (!error) {
      await logSecurityAudit({
        actorId: userId,
        action: "SESSION_REVOKE",
        targetType: "session",
        targetId: sessionId,
        severity: "info",
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
