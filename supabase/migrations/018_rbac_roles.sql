-- Phase 9: granular RBAC and sensitive-table RLS.
-- Existing legacy admins are promoted to SUPER_ADMIN to preserve every
-- capability they had before this migration.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
UPDATE public.profiles SET role = 'SUPER_ADMIN' WHERE role = 'admin';
UPDATE public.profiles SET role = 'MEMBER' WHERE role = 'member';
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'MEMBER';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (
  role IN ('MEMBER', 'SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'FINANCE', 'SOCIAL_OFFICER')
);

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.role FROM public.profiles p WHERE p.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_permission(p_module TEXT, p_level TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT CASE public.current_app_role()
    WHEN 'SUPER_ADMIN' THEN p_level IN ('read', 'write')
    WHEN 'ADMIN' THEN CASE p_module
      WHEN 'dashboard' THEN p_level = 'read'
      WHEN 'finance' THEN p_level = 'read'
      WHEN 'beneficiaries' THEN p_level = 'read'
      WHEN 'audit_log' THEN p_level = 'read'
      WHEN 'user_roles' THEN p_level = 'read'
      WHEN 'system_settings' THEN p_level = 'read'
      ELSE p_level IN ('read', 'write') END
    WHEN 'OPERATOR' THEN CASE WHEN p_module IN ('dashboard','donations','pickup_collection','waste_inventory','production')
      THEN p_level IN ('read','write') WHEN p_module IN ('product_catalog','orders_sales','transparency','stories','reports','audit_log')
      THEN p_level = 'read' ELSE false END
    WHEN 'FINANCE' THEN CASE WHEN p_module IN ('orders_sales','finance','transparency','reports')
      THEN p_level IN ('read','write') WHEN p_module IN ('dashboard','donations','pickup_collection','waste_inventory','production','product_catalog','social_programs','stories','audit_log')
      THEN p_level = 'read' ELSE false END
    WHEN 'SOCIAL_OFFICER' THEN CASE WHEN p_module IN ('social_programs','beneficiaries','transparency','stories','reports')
      THEN p_level IN ('read','write') WHEN p_module IN ('dashboard','donations','pickup_collection','waste_inventory','production','product_catalog','orders_sales','finance','audit_log')
      THEN p_level = 'read' ELSE false END
    ELSE false END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT public.current_app_role() IN ('SUPER_ADMIN', 'ADMIN');
$$;

REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_permission(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(TEXT, TEXT) TO authenticated;

DROP POLICY IF EXISTS "beneficiaries_admin_all" ON public.beneficiaries;
CREATE POLICY "beneficiaries_rbac_select" ON public.beneficiaries FOR SELECT TO authenticated
  USING (public.has_permission('beneficiaries', 'read'));
CREATE POLICY "beneficiaries_rbac_write" ON public.beneficiaries FOR ALL TO authenticated
  USING (public.has_permission('beneficiaries', 'write')) WITH CHECK (public.has_permission('beneficiaries', 'write'));

DROP POLICY IF EXISTS "revenue_entries_admin_select" ON public.revenue_entries;
DROP POLICY IF EXISTS "revenue_entries_admin_insert" ON public.revenue_entries;
CREATE POLICY "revenue_entries_rbac_select" ON public.revenue_entries FOR SELECT TO authenticated
  USING (public.has_permission('finance', 'read'));
CREATE POLICY "revenue_entries_rbac_insert" ON public.revenue_entries FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('finance', 'write'));

DROP POLICY IF EXISTS "social_allocations_admin_all" ON public.social_allocations;
CREATE POLICY "social_allocations_rbac_select" ON public.social_allocations FOR SELECT TO authenticated
  USING (public.has_permission('finance', 'read'));
CREATE POLICY "social_allocations_rbac_write" ON public.social_allocations FOR ALL TO authenticated
  USING (public.has_permission('finance', 'write')) WITH CHECK (public.has_permission('finance', 'write'));

DROP POLICY IF EXISTS "expenses_admin_all" ON public.expenses;
CREATE POLICY "expenses_rbac_select" ON public.expenses FOR SELECT TO authenticated
  USING (public.has_permission('finance', 'read'));
CREATE POLICY "expenses_rbac_write" ON public.expenses FOR ALL TO authenticated
  USING (public.has_permission('finance', 'write')) WITH CHECK (public.has_permission('finance', 'write'));

-- Replace legacy binary-admin policies with module-specific policies. Public
-- and owner policies from earlier migrations remain unchanged.
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
CREATE POLICY "profiles_rbac_read_all" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_permission('user_roles', 'read'));

DROP POLICY IF EXISTS "donations_admin_all" ON public.donations;
CREATE POLICY "donations_rbac_all" ON public.donations FOR ALL TO authenticated
  USING (public.has_permission('donations', 'read')) WITH CHECK (public.has_permission('donations', 'write'));
DROP POLICY IF EXISTS "pickup_requests_admin_all" ON public.pickup_requests;
CREATE POLICY "pickup_requests_rbac_all" ON public.pickup_requests FOR ALL TO authenticated
  USING (public.has_permission('pickup_collection', 'read')) WITH CHECK (public.has_permission('pickup_collection', 'write'));
DROP POLICY IF EXISTS "donation_status_history_admin_all" ON public.donation_status_history;
CREATE POLICY "donation_history_rbac_all" ON public.donation_status_history FOR ALL TO authenticated
  USING (public.has_permission('donations', 'read')) WITH CHECK (public.has_permission('donations', 'write'));
DROP POLICY IF EXISTS "waste_types_admin_write" ON public.waste_types;
CREATE POLICY "waste_types_rbac_all" ON public.waste_types FOR ALL TO authenticated
  USING (public.has_permission('waste_inventory', 'read')) WITH CHECK (public.has_permission('waste_inventory', 'write'));
DROP POLICY IF EXISTS "collection_points_admin_write" ON public.collection_points;
CREATE POLICY "collection_points_rbac_all" ON public.collection_points FOR ALL TO authenticated
  USING (public.has_permission('pickup_collection', 'read')) WITH CHECK (public.has_permission('pickup_collection', 'write'));

DROP POLICY IF EXISTS "waste_lots_admin_all" ON public.waste_lots;
CREATE POLICY "waste_lots_rbac_all" ON public.waste_lots FOR ALL TO authenticated
  USING (public.has_permission('waste_inventory', 'read')) WITH CHECK (public.has_permission('waste_inventory', 'write'));
DROP POLICY IF EXISTS "inventory_transactions_admin_select" ON public.inventory_transactions;
DROP POLICY IF EXISTS "inventory_transactions_admin_insert" ON public.inventory_transactions;
CREATE POLICY "inventory_transactions_rbac_select" ON public.inventory_transactions FOR SELECT TO authenticated
  USING (public.has_permission('waste_inventory', 'read'));
CREATE POLICY "inventory_transactions_rbac_insert" ON public.inventory_transactions FOR INSERT TO authenticated
  WITH CHECK (public.has_permission('waste_inventory', 'write'));

DROP POLICY IF EXISTS "Admin full access on production_batches" ON public.production_batches;
CREATE POLICY "production_batches_rbac_all" ON public.production_batches FOR ALL TO authenticated
  USING (public.has_permission('production', 'read')) WITH CHECK (public.has_permission('production', 'write'));
DROP POLICY IF EXISTS "Admin full access on batch_inputs" ON public.batch_inputs;
CREATE POLICY "batch_inputs_rbac_all" ON public.batch_inputs FOR ALL TO authenticated
  USING (public.has_permission('production', 'read')) WITH CHECK (public.has_permission('production', 'write'));
DROP POLICY IF EXISTS "Admin full access on products" ON public.products;
CREATE POLICY "products_rbac_all" ON public.products FOR ALL TO authenticated
  USING (public.has_permission('product_catalog', 'read')) WITH CHECK (public.has_permission('product_catalog', 'write'));

DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
CREATE POLICY "orders_rbac_all" ON public.orders FOR ALL TO authenticated
  USING (public.has_permission('orders_sales', 'read')) WITH CHECK (public.has_permission('orders_sales', 'write'));
DROP POLICY IF EXISTS "order_items_admin_all" ON public.order_items;
CREATE POLICY "order_items_rbac_all" ON public.order_items FOR ALL TO authenticated
  USING (public.has_permission('orders_sales', 'read')) WITH CHECK (public.has_permission('orders_sales', 'write'));

DROP POLICY IF EXISTS "social_programs_admin_all" ON public.social_programs;
CREATE POLICY "social_programs_rbac_all" ON public.social_programs FOR ALL TO authenticated
  USING (public.has_permission('social_programs', 'read')) WITH CHECK (public.has_permission('social_programs', 'write'));
DROP POLICY IF EXISTS "distributions_admin_all" ON public.distributions;
CREATE POLICY "distributions_rbac_all" ON public.distributions FOR ALL TO authenticated
  USING (public.has_permission('social_programs', 'read') AND public.has_permission('beneficiaries', 'read'))
  WITH CHECK (public.has_permission('social_programs', 'write') AND public.has_permission('beneficiaries', 'write'));
