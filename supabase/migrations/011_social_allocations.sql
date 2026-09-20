-- =============================================================================
-- 011_social_allocations.sql
-- Phase 6: Sales & Financial Flow — Social Allocations (P0-604)
-- Allocating realized circular product revenues to social empowerment programs.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.social_allocations (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Program link (temporary TEXT name until Phase 7 establishes social_programs table FK)
  program_name                TEXT NOT NULL,
  funding_source_reference    TEXT NOT NULL DEFAULT 'REVENUE_SALES',
  
  -- Integer Rupiah minor units per DATABASE.md Money
  amount                      BIGINT NOT NULL CHECK (amount > 0),
  currency                    TEXT NOT NULL DEFAULT 'IDR',
  
  allocated_at                TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  approved_by                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  approval_status             TEXT NOT NULL DEFAULT 'APPROVED' CHECK (
    approval_status IN ('PENDING', 'APPROVED', 'REJECTED')
  ),
  notes                       TEXT DEFAULT NULL,
  
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.social_allocations IS 'Pencatatan alokasi dana sosial dari realisasi pendapatan produk sirkular';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_allocations_status ON public.social_allocations(approval_status);
CREATE INDEX IF NOT EXISTS idx_social_allocations_allocated_at ON public.social_allocations(allocated_at DESC);

-- RLS: Admin only (financial operations are protected)
ALTER TABLE public.social_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_allocations_admin_all"
  ON public.social_allocations FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Atomic balance-validated allocation procedure:
-- Enforces server-side transaction logic preventing allocation above available balance (P0-604).
CREATE OR REPLACE FUNCTION public.execute_social_allocation(
  p_program_name TEXT,
  p_funding_source TEXT,
  p_amount BIGINT,
  p_notes TEXT,
  p_approved_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_total_revenue BIGINT;
  v_total_allocated BIGINT;
  v_available_balance BIGINT;
  v_new_allocation public.social_allocations%ROWTYPE;
BEGIN
  -- 1. Calculate current realized revenue
  SELECT COALESCE(SUM(amount), 0)
    INTO v_total_revenue
    FROM public.revenue_entries;

  -- 2. Calculate approved allocations
  SELECT COALESCE(SUM(amount), 0)
    INTO v_total_allocated
    FROM public.social_allocations
   WHERE approval_status = 'APPROVED';

  -- 3. Compute available balance
  v_available_balance := v_total_revenue - v_total_allocated;

  -- 4. Invariant check: prevent allocation above available balance
  IF p_amount > v_available_balance THEN
    RAISE EXCEPTION 'Saldo pendapatan tidak mencukupi (Tersedia: Rp %, Diminta: Rp %)',
      v_available_balance, p_amount
      USING ERRCODE = 'check_violation';
  END IF;

  -- 5. Insert allocation
  INSERT INTO public.social_allocations (
    program_name,
    funding_source_reference,
    amount,
    currency,
    allocated_at,
    approved_by,
    approval_status,
    notes
  ) VALUES (
    p_program_name,
    COALESCE(p_funding_source, 'REVENUE_SALES'),
    p_amount,
    'IDR',
    timezone('utc'::text, now()),
    p_approved_by,
    'APPROVED',
    p_notes
  ) RETURNING * INTO v_new_allocation;

  RETURN to_jsonb(v_new_allocation);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
