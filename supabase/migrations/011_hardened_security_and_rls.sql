-- ============================================================================
-- Lennox ChinaMall — Hardened Authentication, RBAC & Row Level Security (RLS)
-- Migration: 011_hardened_security_and_rls.sql
-- ============================================================================

-- 1. Ensure user_role enum includes all 7 operational roles
DO $$ BEGIN
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'product_manager';
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'finance_manager';
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. User account status enum
DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM (
    'active',
    'suspended',
    'blocked',
    'pending_verification',
    'deleted'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Enhance profiles table with account status, security tracking & 2FA fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status public.account_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
  ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS security_version INT NOT NULL DEFAULT 1;

-- 4. Active user sessions & device management table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Unknown Device',
  device_type TEXT NOT NULL DEFAULT 'desktop', -- 'desktop', 'mobile', 'tablet'
  browser TEXT NOT NULL DEFAULT 'Unknown Browser',
  os TEXT NOT NULL DEFAULT 'Unknown OS',
  ip_address TEXT NOT NULL,
  location TEXT,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id) WHERE revoked_at IS NULL;

-- 5. Comprehensive login history table
CREATE TABLE IF NOT EXISTS public.auth_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  location TEXT,
  status TEXT NOT NULL, -- 'success', 'failed_credentials', 'failed_locked', 'failed_2fa', 'blocked'
  failure_reason TEXT,
  is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.auth_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON public.auth_login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_ip ON public.auth_login_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON public.auth_login_history(email);

-- 6. Rate limits & brute-force tracking table
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL UNIQUE, -- IP or email or composite (ip:email)
  attempts INT NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.auth_rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_locked_until ON public.auth_rate_limits(locked_until) WHERE locked_until IS NOT NULL;

-- 7. Security audit logs table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role public.user_role,
  action TEXT NOT NULL, -- 'LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'ROLE_CHANGE', 'SESSION_REVOKE', '2FA_TOGGLE', 'ACCOUNT_LOCK', 'ACCOUNT_SUSPEND'
  target_type TEXT NOT NULL, -- 'user', 'session', 'role', 'settings', 'order'
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sec_audit_created_at ON public.security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sec_audit_action ON public.security_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_sec_audit_actor_id ON public.security_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_sec_audit_severity ON public.security_audit_logs(severity);

-- ============================================================================
-- 8. Enable Row Level Security (RLS) on all security tables
-- ============================================================================
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. Strict RLS Policies for Profiles
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins can update any user profile" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Staff can view customer profiles for order and support operations
CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'admin', 'order_manager', 'product_manager', 'catalogue_manager', 'support_agent', 'finance_manager')
      AND p.account_status = 'active'
    )
  );

-- Users can update their own display info BUT CANNOT change their role or account_status
CREATE POLICY "Users can update own profile safe"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
    AND account_status = (SELECT p.account_status FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );

-- Only Admins and Super Admins can update other user roles or statuses
CREATE POLICY "Admins can update user profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'admin')
      AND p.account_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'admin')
      AND p.account_status = 'active'
    )
  );

-- ============================================================================
-- 10. Strict RLS Policies for User Sessions
-- ============================================================================

-- Users can view their own active sessions
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can revoke (update) their own sessions
CREATE POLICY "Users can update own sessions"
  ON public.user_sessions FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admins can view all sessions for security auditing
CREATE POLICY "Admins can view all user sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'admin')
      AND p.account_status = 'active'
    )
  );

-- ============================================================================
-- 11. Strict RLS Policies for Login History
-- ============================================================================

-- Users can view their own login history
CREATE POLICY "Users can view own login history"
  ON public.auth_login_history FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Admins can view all login history
CREATE POLICY "Admins can view all login history"
  ON public.auth_login_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'admin', 'support_agent')
      AND p.account_status = 'active'
    )
  );

-- ============================================================================
-- 12. Strict RLS Policies for Security Audit Logs
-- ============================================================================

-- Only Admins and Super Admins can view security audit logs
CREATE POLICY "Admins can view security audit logs"
  ON public.security_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'admin')
      AND p.account_status = 'active'
    )
  );

-- Authenticated staff can insert security audit logs for their actions
CREATE POLICY "Staff can insert security audit logs"
  ON public.security_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'admin', 'product_manager', 'catalogue_manager', 'order_manager', 'finance_manager', 'support_agent')
      AND p.account_status = 'active'
    )
  );
