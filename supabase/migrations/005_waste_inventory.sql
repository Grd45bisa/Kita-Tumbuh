-- =============================================================================
-- 005_waste_inventory.sql
-- Phase 5: Core Operational System — Waste inventory lots & ledger transactions
-- =============================================================================

-- 1. Table: public.waste_lots
-- Stores tangible physical lots of waste material received and verified.
CREATE TABLE IF NOT EXISTS public.waste_lots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_code            TEXT NOT NULL UNIQUE,
  waste_type_id       UUID NOT NULL REFERENCES public.waste_types(id) ON DELETE RESTRICT,
  source_donation_id  UUID REFERENCES public.donations(id) ON DELETE SET NULL,
  initial_quantity    NUMERIC(10, 2) NOT NULL CHECK (initial_quantity > 0),
  current_quantity    NUMERIC(10, 2) NOT NULL CHECK (current_quantity >= 0),
  unit                TEXT NOT NULL,
  quality_grade       TEXT NOT NULL DEFAULT 'STANDARD' CHECK (quality_grade IN ('GRADE_A', 'STANDARD', 'GRADE_C')),
  status              TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'DEPLETED', 'DISCARDED')),
  storage_location    TEXT NOT NULL DEFAULT 'Gudang Utama Kampung Smart Farming',
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.waste_lots IS 'Lot fisik inventaris limbah yang diterima dan diverifikasi';
COMMENT ON COLUMN public.waste_lots.lot_code IS 'Kode unik batch penerimaan limbah, misal LOT-202609-001';
COMMENT ON COLUMN public.waste_lots.current_quantity IS 'Sisa kuantitas fisik yang tersedia saat ini';

-- Indexing for fast search and aggregation
CREATE INDEX IF NOT EXISTS idx_waste_lots_waste_type ON public.waste_lots(waste_type_id);
CREATE INDEX IF NOT EXISTS idx_waste_lots_status ON public.waste_lots(status);
CREATE INDEX IF NOT EXISTS idx_waste_lots_donation ON public.waste_lots(source_donation_id);

-- 2. Table: public.inventory_transactions (Append-Only Ledger)
-- Principle: All stock mutations MUST be recorded with reasons and operator ID.
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waste_lot_id        UUID NOT NULL REFERENCES public.waste_lots(id) ON DELETE RESTRICT,
  waste_type_id       UUID NOT NULL REFERENCES public.waste_types(id) ON DELETE RESTRICT,
  transaction_type    TEXT NOT NULL CHECK (
    transaction_type IN ('INTAKE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT', 'DISPOSAL')
  ),
  quantity_change     NUMERIC(10, 2) NOT NULL, -- Positive for intake/add, negative for consumption/subtraction
  previous_quantity   NUMERIC(10, 2) NOT NULL CHECK (previous_quantity >= 0),
  new_quantity        NUMERIC(10, 2) NOT NULL CHECK (new_quantity >= 0),
  unit                TEXT NOT NULL,
  reason              TEXT NOT NULL,
  reference_id        TEXT,                     -- Related batch_id, donation_reference, or adjustment ticket
  operator_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.inventory_transactions IS 'Buku besar transaksi mutasi stok limbah (append-only ledger)';
COMMENT ON COLUMN public.inventory_transactions.reason IS 'Alasan perubahan stok, wajib diisi untuk integritas audit';

CREATE INDEX IF NOT EXISTS idx_inventory_tx_lot ON public.inventory_transactions(waste_lot_id);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_type ON public.inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_created ON public.inventory_transactions(created_at);

-- Updated at trigger for waste_lots
CREATE OR REPLACE TRIGGER waste_lots_updated_at
  BEFORE UPDATE ON public.waste_lots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. Row Level Security
-- =============================================================================

ALTER TABLE public.waste_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Admins have full access to waste_lots
CREATE POLICY "waste_lots_admin_all"
  ON public.waste_lots FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins have read and insert access to inventory_transactions (ledger is append-only)
CREATE POLICY "inventory_transactions_admin_select"
  ON public.inventory_transactions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "inventory_transactions_admin_insert"
  ON public.inventory_transactions FOR INSERT
  WITH CHECK (public.is_admin());
