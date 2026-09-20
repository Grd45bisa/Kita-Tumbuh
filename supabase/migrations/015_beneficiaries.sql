-- =============================================================================
-- 015_beneficiaries.sql
-- Phase 7: Social Program & Beneficiary — Beneficiaries (P0-702)
-- =============================================================================
-- Sensitive personal data: strictly admin-only at the RLS level (DATABASE.md
-- "RLS is mandatory for ... beneficiary data" / ARSITEKTUR.md §17.5 "Data
-- beneficiary dipisahkan dari public projection"). There is no public SELECT
-- policy on this table at all — any public-facing display must go through a
-- narrow, explicitly-consented projection built in Phase 8, never a direct
-- query against this table.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Uses name_or_alias per ARSITEKTUR.md §5.13 — a real name is not required
  -- and an alias may be used when consent for a real name is not given.
  name_or_alias       TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (
    category IN ('CHILD_WITH_DISABILITY', 'ELDERLY', 'FAMILY', 'OTHER')
  ),
  need_type           TEXT NOT NULL,

  verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')
  ),

  -- Consent/privacy: what this beneficiary (or their guardian) has agreed to
  -- have shown publicly. NONE means nothing about them may ever be surfaced
  -- publicly, including in aggregate stories that could identify them.
  consent_status      TEXT NOT NULL DEFAULT 'NOT_REQUESTED' CHECK (
    consent_status IN ('NOT_REQUESTED', 'PENDING', 'GRANTED', 'DECLINED', 'REVOKED')
  ),
  privacy_level       TEXT NOT NULL DEFAULT 'PRIVATE' CHECK (
    privacy_level IN ('PRIVATE', 'ALIAS_ONLY', 'PUBLIC')
  ),

  notes               TEXT DEFAULT NULL,

  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.beneficiaries IS 'Data internal penerima manfaat program sosial — tidak pernah diekspos langsung ke public API (ARSITEKTUR.md §17.5)';
COMMENT ON COLUMN public.beneficiaries.privacy_level IS 'PRIVATE: tidak pernah publik. ALIAS_ONLY: hanya alias/kategori boleh muncul di agregat publik. PUBLIC: identitas boleh ditampilkan sesuai consent_status = GRANTED.';

CREATE INDEX IF NOT EXISTS idx_beneficiaries_category ON public.beneficiaries(category);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_verification ON public.beneficiaries(verification_status);

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- Admin-only. No public SELECT policy exists on this table by design.
CREATE POLICY "beneficiaries_admin_all"
  ON public.beneficiaries FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS trg_beneficiaries_updated_at ON public.beneficiaries;
CREATE TRIGGER trg_beneficiaries_updated_at
  BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();
