-- ============================================================================
-- Lennox ChinaMall — Fix RLS Policy Recursion on Profiles and Categories
-- ============================================================================

-- 1. Helper function with SECURITY DEFINER to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role IN ('super_admin', 'admin', 'catalogue_manager', 'order_manager', 'support_agent', 'finance_manager', 'product_manager')
    AND (account_status IS NULL OR account_status = 'active')
    AND (is_active IS NULL OR is_active = TRUE)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'super_admin'
    AND (account_status IS NULL OR account_status = 'active')
    AND (is_active IS NULL OR is_active = TRUE)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role IN ('super_admin', 'admin', 'order_manager', 'product_manager', 'catalogue_manager', 'support_agent', 'finance_manager')
    AND (account_status IS NULL OR account_status = 'active')
  );
END;
$$;

-- 2. Drop recursive policies on public.profiles
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins can update any user profile" ON public.profiles;

-- 3. Re-create non-recursive policies on public.profiles
CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR public.is_staff()
  );

CREATE POLICY "Admins can update user profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Ensure categories RLS policies are clean
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
DROP POLICY IF EXISTS "Staff manage categories" ON public.categories;

CREATE POLICY "Staff manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
