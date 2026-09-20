-- =============================================================================
-- 004_admin_role_foundation.sql
-- Phase 5: Core Operational System — Admin role foundation & operational RLS
-- =============================================================================

-- 1. Add role column to profiles
-- Using TEXT with CHECK constraint so it is easily extensible in Phase 9 RBAC
-- (SUPER_ADMIN, OPERATOR, FINANCE, SOCIAL_OFFICER) without table rewrite.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
  CHECK (role IN ('member', 'admin'));

COMMENT ON COLUMN public.profiles.role IS 'Peran otorisasi pengguna: member (default) atau admin';

-- Index on role for fast permission lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =============================================================================
-- 2. Helper function: is_admin()
-- Returns true if the currently authenticated user has the 'admin' role.
-- SECURITY DEFINER with empty search_path prevents search_path injection.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Memeriksa apakah user yang sedang terautentikasi memiliki peran admin';

-- =============================================================================
-- 3. Row Level Security Policies for Admin Access
-- Allows administrators full read and write access to operational domain tables.
-- =============================================================================

-- A. Profiles: Admins can read all profiles
CREATE POLICY "profiles_admin_read_all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- B. Donations: Admins have full access (select, insert, update)
CREATE POLICY "donations_admin_all"
  ON public.donations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- C. Pickup Requests: Admins have full access
CREATE POLICY "pickup_requests_admin_all"
  ON public.pickup_requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- D. Donation Status History: Admins have full access
CREATE POLICY "donation_status_history_admin_all"
  ON public.donation_status_history FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- E. Waste Types: Admins have write access (insert, update, delete)
CREATE POLICY "waste_types_admin_write"
  ON public.waste_types FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- F. Collection Points: Admins have write access (insert, update, delete)
CREATE POLICY "collection_points_admin_write"
  ON public.collection_points FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
