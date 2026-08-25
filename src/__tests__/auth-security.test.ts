import { describe, it } from "node:test";
import assert from "node:assert";

import { validatePasswordStrength } from "../app/actions/auth";
import { getSafeRedirectUrl } from "../utils/security";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getProgressiveDelayMs,
} from "../lib/auth/rate-limiter";
import {
  hasPermission,
  canManageRole,
  ROLE_PERMISSIONS,
  ADMIN_ROLES,
  isAdminRole,
} from "../lib/auth/roles";
import {
  hasActionPermission,
  canExportData,
  canIssueRefund,
  canManageStaff,
  canModifySecurity,
} from "../lib/auth/permissions";
import { parseUserAgent } from "../lib/auth/session-manager";

describe("Lennox China Mall Security & Auth Suite", () => {
  // ─── 1. Password Strength Policy ──────────────────────────────────────────
  describe("Password Strength Policy Validation", () => {
    it("should reject passwords shorter than 8 characters", () => {
      const res = validatePasswordStrength("Ab1!");
      assert.strictEqual(res.valid, false);
      assert.match(res.error || "", /at least 8 characters/i);
    });

    it("should reject passwords without uppercase letter", () => {
      const res = validatePasswordStrength("weakpass123!");
      assert.strictEqual(res.valid, false);
      assert.match(res.error || "", /uppercase/i);
    });

    it("should reject passwords without lowercase letter", () => {
      const res = validatePasswordStrength("ALLCAPS123!");
      assert.strictEqual(res.valid, false);
      assert.match(res.error || "", /lowercase/i);
    });

    it("should reject passwords without numbers", () => {
      const res = validatePasswordStrength("LettersOnly!@#");
      assert.strictEqual(res.valid, false);
      assert.match(res.error || "", /number/i);
    });

    it("should reject passwords without special symbols", () => {
      const res = validatePasswordStrength("ValidLetters1234");
      assert.strictEqual(res.valid, false);
      assert.match(res.error || "", /symbol/i);
    });

    it("should accept compliant strong passwords", () => {
      const res = validatePasswordStrength("LennoxChinaMall2026!#");
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.error, undefined);
    });
  });

  // ─── 2. Open Redirect Defense ─────────────────────────────────────────────
  describe("Open Redirect Attack Prevention", () => {
    it("should allow safe relative internal paths", () => {
      assert.strictEqual(getSafeRedirectUrl("/admin/dashboard"), "/admin/dashboard");
      assert.strictEqual(getSafeRedirectUrl("/account/profile"), "/account/profile");
      assert.strictEqual(getSafeRedirectUrl("/products/drone-4k"), "/products/drone-4k");
    });

    it("should neutralize absolute external URLs", () => {
      assert.strictEqual(getSafeRedirectUrl("https://evil-phishing.com"), "/account/profile");
      assert.strictEqual(getSafeRedirectUrl("http://attacker.org/steal"), "/account/profile");
      assert.strictEqual(getSafeRedirectUrl("javascript:alert(1)"), "/account/profile");
    });

    it("should neutralize protocol-relative URL attacks (//evil.com)", () => {
      assert.strictEqual(getSafeRedirectUrl("//evil.com/phish"), "/account/profile");
      assert.strictEqual(getSafeRedirectUrl("//lennoxchinamall.attacker.com"), "/account/profile");
    });

    it("should neutralize backslash bypass attacks", () => {
      assert.strictEqual(getSafeRedirectUrl("/\\evil.com"), "/account/profile");
    });

    it("should use custom fallback when provided", () => {
      assert.strictEqual(getSafeRedirectUrl(null, "/admin/dashboard"), "/admin/dashboard");
    });
  });

  // ─── 3. Rate Limiter & Brute-Force Defender ────────────────────────────────
  describe("Rate Limiting & Brute-Force Defense", () => {
    const testIp = "192.168.1.100";

    it("should allow initial attempts within threshold", () => {
      resetRateLimit(testIp);
      const status = checkRateLimit(testIp);
      assert.strictEqual(status.allowed, true);
      assert.strictEqual(status.isLocked, false);
      assert.strictEqual(status.attemptsLeft, 5);
    });

    it("should record failed attempts and decrement remaining count", () => {
      resetRateLimit(testIp);
      const r1 = recordFailedAttempt(testIp);
      assert.strictEqual(r1.attemptsLeft, 4);
      assert.strictEqual(r1.isLocked, false);

      const r2 = recordFailedAttempt(testIp);
      assert.strictEqual(r2.attemptsLeft, 3);
    });

    it("should engage temporary lockout after 5 failed attempts", () => {
      resetRateLimit(testIp);
      recordFailedAttempt(testIp); // 1
      recordFailedAttempt(testIp); // 2
      recordFailedAttempt(testIp); // 3
      recordFailedAttempt(testIp); // 4
      const lockRes = recordFailedAttempt(testIp); // 5

      assert.strictEqual(lockRes.isLocked, true);
      assert.strictEqual(lockRes.allowed, false);
      assert.strictEqual(lockRes.attemptsLeft, 0);
      assert.ok(lockRes.lockedUntilSeconds > 0);

      // Subsequent checks should be blocked
      const checkStatus = checkRateLimit(testIp);
      assert.strictEqual(checkStatus.allowed, false);
      assert.strictEqual(checkStatus.isLocked, true);
    });

    it("should reset rate limit after successful login", () => {
      resetRateLimit(testIp);
      const status = checkRateLimit(testIp);
      assert.strictEqual(status.allowed, true);
      assert.strictEqual(status.isLocked, false);
    });

    it("should calculate progressive delay for repeated attempts", () => {
      assert.strictEqual(getProgressiveDelayMs(1), 0);
      assert.strictEqual(getProgressiveDelayMs(2), 200);
      assert.strictEqual(getProgressiveDelayMs(4), 1000);
      assert.strictEqual(getProgressiveDelayMs(5), 2000);
    });
  });

  // ─── 4. Role Hierarchy & Module Access ────────────────────────────────────
  describe("7-Tier Role Hierarchy & Module Authorization", () => {
    it("should correctly identify admin vs customer roles", () => {
      assert.strictEqual(isAdminRole("super_admin"), true);
      assert.strictEqual(isAdminRole("admin"), true);
      assert.strictEqual(isAdminRole("finance_manager"), true);
      assert.strictEqual(isAdminRole("product_manager"), true);
      assert.strictEqual(isAdminRole("order_manager"), true);
      assert.strictEqual(isAdminRole("support_agent"), true);
      assert.strictEqual(isAdminRole("customer"), false);
      assert.strictEqual(isAdminRole(null), false);
    });

    it("should enforce hierarchical role management restrictions", () => {
      // Super admin can manage all subordinate roles
      assert.strictEqual(canManageRole("super_admin", "admin"), true);
      assert.strictEqual(canManageRole("super_admin", "order_manager"), true);
      assert.strictEqual(canManageRole("super_admin", "customer"), true);

      // Super admin cannot manage another super_admin
      assert.strictEqual(canManageRole("super_admin", "super_admin"), false);

      // Admin can manage staff below, but cannot manage super_admin or admin
      assert.strictEqual(canManageRole("admin", "support_agent"), true);
      assert.strictEqual(canManageRole("admin", "super_admin"), false);
      assert.strictEqual(canManageRole("admin", "admin"), false);

      // Customer / Staff cannot manage roles
      assert.strictEqual(canManageRole("customer", "customer"), false);
      assert.strictEqual(canManageRole("support_agent", "customer"), false);
    });

    it("should grant super_admin full section permissions", () => {
      assert.strictEqual(hasPermission("super_admin", "settings"), true);
      assert.strictEqual(hasPermission("super_admin", "security"), true);
      assert.strictEqual(hasPermission("super_admin", "audit-logs"), true);
      assert.strictEqual(hasPermission("super_admin", "staff"), true);
    });

    it("should restrict support_agent from financial and security modules", () => {
      assert.strictEqual(hasPermission("support_agent", "support"), true);
      assert.strictEqual(hasPermission("support_agent", "orders"), true);
      assert.strictEqual(hasPermission("support_agent", "settings"), false);
      assert.strictEqual(hasPermission("support_agent", "security"), false);
      assert.strictEqual(hasPermission("support_agent", "staff"), false);
    });
  });

  // ─── 5. Granular Action Permissions ───────────────────────────────────────
  describe("Granular Action Permission Matrix", () => {
    it("should allow finance_manager to refund and export payments, but not delete products", () => {
      assert.strictEqual(hasActionPermission("finance_manager", "payments", "refund"), true);
      assert.strictEqual(hasActionPermission("finance_manager", "payments", "export"), true);
      assert.strictEqual(hasActionPermission("finance_manager", "products", "delete"), false);
    });

    it("should allow product_manager to create/update products, but not issue refunds", () => {
      assert.strictEqual(hasActionPermission("product_manager", "products", "create"), true);
      assert.strictEqual(hasActionPermission("product_manager", "products", "update"), true);
      assert.strictEqual(canIssueRefund("product_manager"), false);
    });

    it("should restrict root security modifications to super_admin only", () => {
      assert.strictEqual(canModifySecurity("super_admin"), true);
      assert.strictEqual(canModifySecurity("admin"), false);
      assert.strictEqual(canModifySecurity("finance_manager"), false);
      assert.strictEqual(canModifySecurity("customer"), false);
    });

    it("should allow authorized refund roles (super_admin, admin, finance_manager)", () => {
      assert.strictEqual(canIssueRefund("super_admin"), true);
      assert.strictEqual(canIssueRefund("admin"), true);
      assert.strictEqual(canIssueRefund("finance_manager"), true);
      assert.strictEqual(canIssueRefund("order_manager"), false);
      assert.strictEqual(canIssueRefund("support_agent"), false);
      assert.strictEqual(canIssueRefund("customer"), false);
    });
  });

  // ─── 6. User Agent & Device Fingerprinting ────────────────────────────────
  describe("User-Agent Device Fingerprinting", () => {
    it("should parse macOS Chrome desktop user agent", () => {
      const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      const info = parseUserAgent(ua);
      assert.strictEqual(info.deviceType, "desktop");
      assert.strictEqual(info.os, "macOS");
      assert.strictEqual(info.browser, "Google Chrome");
    });

    it("should parse iPhone Safari mobile user agent", () => {
      const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1";
      const info = parseUserAgent(ua);
      assert.strictEqual(info.deviceType, "mobile");
      assert.strictEqual(info.os, "iOS");
      assert.strictEqual(info.browser, "Apple Safari");
    });

    it("should handle empty or malformed user agent safely", () => {
      const info = parseUserAgent(null);
      assert.strictEqual(info.deviceType, "desktop");
      assert.strictEqual(info.os, "Unknown OS");
      assert.strictEqual(info.browser, "Unknown Browser");
    });
  });
});
