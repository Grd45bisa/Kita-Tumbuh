-- Phase 9: append-only audit log. Writes are only possible through the
-- allowlisted SECURITY DEFINER RPC; no client INSERT/UPDATE/DELETE policy.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_logs_staff_read" ON public.audit_logs;
CREATE POLICY "audit_logs_staff_read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_permission('audit_log', 'read'));

CREATE OR REPLACE FUNCTION public.record_audit_log(
  p_actor_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id UUID;
BEGIN
  IF p_actor_id IS NULL THEN RAISE EXCEPTION 'Audit actor is required' USING ERRCODE = '22023'; END IF;
  IF p_action NOT IN (
    'DONATION_CREATED','DONATION_VERIFIED','WEIGHT_UPDATED','WASTE_LOT_CREATED',
    'BATCH_STARTED','BATCH_COMPLETED','PRODUCT_RELEASED','ORDER_PAID',
    'REVENUE_RECORDED','ALLOCATION_CREATED','PROGRAM_APPROVED',
    'BENEFICIARY_UPDATED','REPORT_PUBLISHED'
  ) THEN
    RAISE EXCEPTION 'Unsupported audit action: %', p_action USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.audit_logs(actor_id, action, entity_type, entity_id, old_value, new_value, reason)
  VALUES (p_actor_id, p_action, p_entity_type, p_entity_id, p_old_value, p_new_value, nullif(trim(p_reason), ''))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON TABLE public.audit_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;
REVOKE ALL ON FUNCTION public.record_audit_log(UUID,TEXT,TEXT,UUID,JSONB,JSONB,TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_audit_log(UUID,TEXT,TEXT,UUID,JSONB,JSONB,TEXT) TO service_role;
