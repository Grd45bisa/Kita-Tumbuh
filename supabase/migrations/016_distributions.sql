-- =============================================================================
-- 016_distributions.sql
-- Phase 7: Social Program & Beneficiary — Distributions (P0-703)
-- =============================================================================
-- Closes the loop opened in Phase 6: social_allocations records that money
-- was ALLOCATED to a program; distributions records that it (or an
-- in-kind item) was actually DISTRIBUTED to a specific beneficiary, with an
-- evidence reference and an approval trail (ARSITEKTUR.md §5.15, §18).

CREATE TABLE IF NOT EXISTS public.distributions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  program_id          UUID NOT NULL REFERENCES public.social_programs(id) ON DELETE RESTRICT,
  beneficiary_id       UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE RESTRICT,

  -- Funding source: which allocation this distribution draws down (nullable
  -- because some distributions may be in-kind items sourced outside a cash
  -- allocation, e.g. a donated waste-derived product handed out directly).
  allocation_id       UUID REFERENCES public.social_allocations(id) ON DELETE SET NULL,

  -- A distribution is either a monetary amount, an item description, or
  -- both (e.g. "Rp 200.000 dan 1 unit kursi roda bekas layak pakai").
  amount              BIGINT CHECK (amount IS NULL OR amount > 0),
  currency            TEXT NOT NULL DEFAULT 'IDR',
  item_description    TEXT DEFAULT NULL,

  distributed_at      DATE NOT NULL DEFAULT (timezone('utc'::text, now()))::date,

  evidence_url        TEXT DEFAULT NULL,
  evidence_notes      TEXT DEFAULT NULL,

  approval_status     TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    approval_status IN ('PENDING', 'APPROVED', 'REJECTED')
  ),
  approved_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recorded_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- A distribution must record either a monetary amount or an item — never
  -- neither (DATABASE.md "do not silently overwrite/omit the reason").
  CONSTRAINT distributions_amount_or_item CHECK (
    amount IS NOT NULL OR (item_description IS NOT NULL AND item_description <> '')
  )
);

COMMENT ON TABLE public.distributions IS 'Realisasi penyaluran dana/barang dari program sosial ke penerima manfaat, dengan bukti dan jejak persetujuan';

CREATE INDEX IF NOT EXISTS idx_distributions_program_id ON public.distributions(program_id);
CREATE INDEX IF NOT EXISTS idx_distributions_beneficiary_id ON public.distributions(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_distributions_allocation_id ON public.distributions(allocation_id);
CREATE INDEX IF NOT EXISTS idx_distributions_distributed_at ON public.distributions(distributed_at DESC);
CREATE INDEX IF NOT EXISTS idx_distributions_approval_status ON public.distributions(approval_status);

ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

-- Admin-only, mirroring beneficiaries — a distribution row references a
-- specific beneficiary_id and is therefore itself sensitive.
CREATE POLICY "distributions_admin_all"
  ON public.distributions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS trg_distributions_updated_at ON public.distributions;
CREATE TRIGGER trg_distributions_updated_at
  BEFORE UPDATE ON public.distributions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- -----------------------------------------------------------------------------
-- Server-side invariant: a distribution's amount must not exceed what is
-- still undistributed from its allocation (when allocation_id is set).
-- Enforced the same way as execute_social_allocation / the order payment RPC:
-- a SECURITY DEFINER function that locks the relevant rows and validates
-- within a single transaction, rather than a naive application-level
-- check-then-insert that would be vulnerable to a TOCTOU race between two
-- concurrent distributions against the same allocation.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.execute_distribution(
  p_program_id UUID,
  p_beneficiary_id UUID,
  p_allocation_id UUID,
  p_amount BIGINT,
  p_item_description TEXT,
  p_distributed_at DATE,
  p_evidence_url TEXT,
  p_evidence_notes TEXT,
  p_recorded_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_allocation_amount BIGINT;
  v_already_distributed BIGINT;
  v_remaining BIGINT;
  v_new_distribution public.distributions%ROWTYPE;
BEGIN
  IF p_allocation_id IS NOT NULL THEN
    -- Lock the allocation row so concurrent distributions against it can't
    -- both read the same "already distributed" total before either commits.
    SELECT amount INTO v_allocation_amount
      FROM public.social_allocations
     WHERE id = p_allocation_id
       AND approval_status = 'APPROVED'
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Alokasi dana tidak ditemukan atau belum disetujui.'
        USING ERRCODE = 'no_data_found';
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_already_distributed
      FROM public.distributions
     WHERE allocation_id = p_allocation_id
       AND approval_status = 'APPROVED';

    v_remaining := v_allocation_amount - v_already_distributed;

    IF p_amount IS NOT NULL AND p_amount > v_remaining THEN
      RAISE EXCEPTION 'Nominal distribusi melebihi sisa alokasi (Sisa: Rp %, Diminta: Rp %)',
        v_remaining, p_amount
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  INSERT INTO public.distributions (
    program_id,
    beneficiary_id,
    allocation_id,
    amount,
    currency,
    item_description,
    distributed_at,
    evidence_url,
    evidence_notes,
    approval_status,
    approved_by,
    recorded_by
  ) VALUES (
    p_program_id,
    p_beneficiary_id,
    p_allocation_id,
    p_amount,
    'IDR',
    p_item_description,
    COALESCE(p_distributed_at, (timezone('utc'::text, now()))::date),
    p_evidence_url,
    p_evidence_notes,
    'APPROVED',
    p_recorded_by,
    p_recorded_by
  ) RETURNING * INTO v_new_distribution;

  RETURN to_jsonb(v_new_distribution);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
