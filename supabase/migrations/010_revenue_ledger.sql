-- =============================================================================
-- 010_revenue_ledger.sql
-- Phase 6: Sales & Financial Flow — Revenue Ledger (P0-603)
-- Append-only ledger for realized sales revenue from circular products.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.revenue_entries (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  
  -- Integer Rupiah minor units per DATABASE.md Financial Ledger
  amount                  BIGINT NOT NULL CHECK (amount > 0),
  currency                TEXT NOT NULL DEFAULT 'IDR',
  
  occurred_at             TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  recorded_by             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  reconciliation_status   TEXT NOT NULL DEFAULT 'RECONCILED' CHECK (
    reconciliation_status IN ('PENDING', 'RECONCILED', 'DISCREPANCY')
  ),
  notes                   TEXT DEFAULT NULL,
  
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.revenue_entries IS 'Buku besar append-only untuk pencatatan realisasi pendapatan penjualan produk';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_revenue_entries_order_id ON public.revenue_entries(order_id);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_occurred_at ON public.revenue_entries(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_reconciliation ON public.revenue_entries(reconciliation_status);

-- Row Level Security: strictly restricted to back-office admins (no public exposure)
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revenue_entries_admin_all"
  ON public.revenue_entries FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Automated ledger recording trigger:
-- Fires whenever an order transitions to PAID, ensuring financial integrity across all entry points.
CREATE OR REPLACE FUNCTION public.record_revenue_on_paid_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if order became PAID and hasn't been recorded in the ledger yet
  IF NEW.status = 'PAID' AND (OLD.status IS DISTINCT FROM 'PAID') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.revenue_entries WHERE order_id = NEW.id
    ) THEN
      INSERT INTO public.revenue_entries (
        order_id,
        amount,
        currency,
        occurred_at,
        recorded_by,
        reconciliation_status,
        notes
      ) VALUES (
        NEW.id,
        NEW.total,
        NEW.currency,
        timezone('utc'::text, now()),
        auth.uid(),
        'RECONCILED',
        'Pencatatan otomatis realisasi pendapatan saat pesanan diverifikasi lunas (PAID)'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_record_revenue_on_paid ON public.orders;

CREATE TRIGGER trg_record_revenue_on_paid
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.record_revenue_on_paid_order();
