-- =============================================================================
-- 012_expenses.sql
-- Phase 6: Sales & Financial Flow — Operational Expenses (P1-605)
-- Explicitly separated from social allocations per AGENTS.md §12 & trust rules.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.expenses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  category            TEXT NOT NULL CHECK (
    category IN ('LOGISTICS', 'PACKAGING', 'EQUIPMENT', 'UTILITIES', 'OTHER')
  ),
  
  -- Integer Rupiah minor units per DATABASE.md Money
  amount              BIGINT NOT NULL CHECK (amount > 0),
  currency            TEXT NOT NULL DEFAULT 'IDR',
  
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  notes               TEXT DEFAULT NULL,
  attachment_url      TEXT DEFAULT NULL,
  
  recorded_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.expenses IS 'Pencatatan beban operasional (logistik, kemasan, utilitas) terpisah tegas dari alokasi dana sosial';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_occurred_at ON public.expenses(occurred_at DESC);

-- Row Level Security: restricted to back-office admins
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_admin_all"
  ON public.expenses FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
