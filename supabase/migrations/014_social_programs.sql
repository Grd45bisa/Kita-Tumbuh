-- =============================================================================
-- 014_social_programs.sql
-- Phase 7: Social Program & Beneficiary — Social Programs (P0-701)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.social_programs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT NOT NULL,
  goal                TEXT NOT NULL,

  -- Lifecycle per ARSITEKTUR.md §7.4
  status              TEXT NOT NULL DEFAULT 'DRAFT' CHECK (
    status IN ('DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'FUNDED', 'PARTIALLY_FUNDED', 'DISTRIBUTED', 'COMPLETED')
  ),

  -- Target amount is optional: some programs are ongoing/needs-based rather
  -- than a fixed fundraising target.
  target_amount       BIGINT CHECK (target_amount IS NULL OR target_amount > 0),
  currency            TEXT NOT NULL DEFAULT 'IDR',

  start_date          DATE DEFAULT NULL,
  end_date            DATE DEFAULT NULL,

  -- Public/private visibility: only public_status = true programs may be
  -- surfaced on /program (ARSITEKTUR.md §3.3 "public data ≠ internal data").
  public_status       BOOLEAN NOT NULL DEFAULT FALSE,

  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.social_programs IS 'Program pemberdayaan sosial yang dibiayai dari alokasi pendapatan penjualan produk sirkular';
COMMENT ON COLUMN public.social_programs.public_status IS 'Hanya program dengan public_status = true yang boleh ditampilkan di halaman publik /program';

CREATE INDEX IF NOT EXISTS idx_social_programs_status ON public.social_programs(status);
CREATE INDEX IF NOT EXISTS idx_social_programs_public ON public.social_programs(public_status) WHERE public_status = TRUE;
CREATE INDEX IF NOT EXISTS idx_social_programs_slug ON public.social_programs(slug);

ALTER TABLE public.social_programs ENABLE ROW LEVEL SECURITY;

-- Public can read only explicitly published programs.
CREATE POLICY "social_programs_public_read"
  ON public.social_programs FOR SELECT
  USING (public_status = TRUE);

-- Admins have full access (draft, review, unpublished programs included).
CREATE POLICY "social_programs_admin_all"
  ON public.social_programs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Generic shared trigger to auto-maintain updated_at, reused by other
-- Phase 7 tables (beneficiaries, distributions) — see 015/016 migrations.
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_social_programs_updated_at ON public.social_programs;
CREATE TRIGGER trg_social_programs_updated_at
  BEFORE UPDATE ON public.social_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- -----------------------------------------------------------------------------
-- Link social_allocations to social_programs.
-- Phase 6 (011_social_allocations.sql) intentionally used a plain TEXT
-- program_name column because this table did not exist yet (documented as
-- an explicit, temporary limitation — see TASK.md P0-604). Now that
-- social_programs exists, add a nullable FK alongside the existing TEXT
-- column. The TEXT column is KEPT (not dropped) as an immutable snapshot of
-- the program name at allocation time, consistent with the append-only
-- ledger / snapshot pattern used for order_items.product_name_snapshot —
-- it must keep reading correctly even if a program is later renamed.
-- -----------------------------------------------------------------------------
ALTER TABLE public.social_allocations
  ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.social_programs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_social_allocations_program_id ON public.social_allocations(program_id);

COMMENT ON COLUMN public.social_allocations.program_id IS 'FK opsional ke social_programs (Phase 7). program_name tetap dipertahankan sebagai snapshot nama program saat alokasi dibuat.';

-- Update the atomic allocation RPC to accept an optional program_id while
-- keeping program_name as the authoritative snapshot value.
CREATE OR REPLACE FUNCTION public.execute_social_allocation(
  p_program_name TEXT,
  p_funding_source TEXT,
  p_amount BIGINT,
  p_notes TEXT,
  p_approved_by UUID,
  p_program_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_total_revenue BIGINT;
  v_total_allocated BIGINT;
  v_available_balance BIGINT;
  v_new_allocation public.social_allocations%ROWTYPE;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
    INTO v_total_revenue
    FROM public.revenue_entries;

  SELECT COALESCE(SUM(amount), 0)
    INTO v_total_allocated
    FROM public.social_allocations
   WHERE approval_status = 'APPROVED';

  v_available_balance := v_total_revenue - v_total_allocated;

  IF p_amount > v_available_balance THEN
    RAISE EXCEPTION 'Saldo pendapatan tidak mencukupi (Tersedia: Rp %, Diminta: Rp %)',
      v_available_balance, p_amount
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.social_allocations (
    program_name,
    program_id,
    funding_source_reference,
    amount,
    currency,
    allocated_at,
    approved_by,
    approval_status,
    notes
  ) VALUES (
    p_program_name,
    p_program_id,
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
