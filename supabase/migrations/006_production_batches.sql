-- =====================================================================
-- Migration 006: Production Batches & Batch Inputs
-- Description: Supports Phase 5 (P0-505) production lifecycle traceability:
--              PLANNED -> IN_PROGRESS -> QC_REVIEW -> COMPLETED -> RELEASED
--              with M:N batch_inputs linking back to waste_lots.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.production_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (
        status IN ('PLANNED', 'IN_PROGRESS', 'QC_REVIEW', 'COMPLETED', 'RELEASED')
    ),
    target_output_type TEXT NOT NULL,
    target_quantity NUMERIC(10, 2) NOT NULL CHECK (target_quantity > 0),
    output_unit TEXT NOT NULL,
    actual_output_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (actual_output_quantity >= 0),
    loss_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (loss_quantity >= 0),
    loss_reason TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    started_at TIMESTAMPTZ DEFAULT NULL,
    completed_at TIMESTAMPTZ DEFAULT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.batch_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.production_batches(id) ON DELETE CASCADE,
    waste_lot_id UUID NOT NULL REFERENCES public.waste_lots(id) ON DELETE RESTRICT,
    quantity_used NUMERIC(10, 2) NOT NULL CHECK (quantity_used > 0),
    unit TEXT NOT NULL,
    notes TEXT DEFAULT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON public.production_batches(status);
CREATE INDEX IF NOT EXISTS idx_batch_inputs_batch ON public.batch_inputs(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_inputs_lot ON public.batch_inputs(waste_lot_id);

-- Enable RLS
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_inputs ENABLE ROW LEVEL SECURITY;

-- Admin access policy for production batches
CREATE POLICY "Admin full access on production_batches"
    ON public.production_batches
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Admin access policy for batch inputs
CREATE POLICY "Admin full access on batch_inputs"
    ON public.batch_inputs
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
