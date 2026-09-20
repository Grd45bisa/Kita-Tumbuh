-- =============================================================================
-- 021_waste_lot_mutation_hardening.sql
-- Phase 13 audit fix: atomic waste_lots.current_quantity mutation (P0-1304)
-- =============================================================================
-- Bug found during Phase 13 audit: both adjustWasteLotAction
-- (lib/domain/admin/inventory.ts) and addBatchInputAction
-- (lib/domain/admin/production.ts) mutate waste_lots.current_quantity with
-- the same application-level read-then-write pattern already found and
-- fixed three times elsewhere in this codebase (order stock decrement,
-- ADR-020; social allocation balance, Phase 6/7; distribution balance,
-- ADR-024): SELECT current_quantity, compute the new value in JavaScript,
-- then UPDATE — with no row lock in between. Two admins adjusting stock or
-- allocating batch input from the same waste_lot concurrently can both read
-- the same stale current_quantity, both pass their own sufficiency check,
-- and the second UPDATE silently overwrites the first — losing one mutation
-- and leaving the ledger (inventory_transactions) inconsistent with the lot's
-- actual current_quantity.
--
-- Fix: a single SECURITY DEFINER RPC that locks the waste_lots row
-- (FOR UPDATE), validates sufficiency for SUBTRACT-direction changes, applies
-- the change, and appends the ledger entry — all within one transaction, so
-- two concurrent calls against the same lot serialize instead of racing.
-- Mirrors the pattern from execute_distribution (016) / ADR-024.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.execute_waste_lot_mutation(
  p_waste_lot_id UUID,
  p_transaction_type TEXT,
  p_quantity_change NUMERIC,
  p_reason TEXT,
  p_reference_id TEXT,
  p_operator_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_lot public.waste_lots%ROWTYPE;
  v_prev_quantity NUMERIC;
  v_new_quantity NUMERIC;
  v_new_status TEXT;
BEGIN
  IF NOT public.has_permission('waste_inventory', 'write') THEN
    RAISE EXCEPTION 'Tidak memiliki izin untuk memutasi inventaris limbah.' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_transaction_type NOT IN ('INTAKE', 'PRODUCTION_CONSUMPTION', 'ADJUSTMENT', 'DISPOSAL') THEN
    RAISE EXCEPTION 'Jenis transaksi inventaris tidak valid: %', p_transaction_type
      USING ERRCODE = 'check_violation';
  END IF;

  -- Lock the lot row so a concurrent mutation against the same lot must
  -- wait for this transaction to commit before it can read/write it.
  SELECT * INTO v_lot
    FROM public.waste_lots
   WHERE id = p_waste_lot_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lot limbah tidak ditemukan.' USING ERRCODE = 'no_data_found';
  END IF;

  v_prev_quantity := v_lot.current_quantity;
  v_new_quantity := v_prev_quantity + p_quantity_change;

  IF v_new_quantity < 0 THEN
    RAISE EXCEPTION 'Stok lot % tidak mencukupi (tersedia: %, diminta: %).',
      v_lot.lot_code, v_prev_quantity, -p_quantity_change
      USING ERRCODE = 'check_violation';
  END IF;

  v_new_status := CASE WHEN v_new_quantity = 0 THEN 'DEPLETED' ELSE 'AVAILABLE' END;

  UPDATE public.waste_lots
     SET current_quantity = v_new_quantity,
         status = v_new_status,
         updated_at = timezone('utc'::text, now())
   WHERE id = p_waste_lot_id
   RETURNING * INTO v_lot;

  INSERT INTO public.inventory_transactions (
    waste_lot_id, waste_type_id, transaction_type, quantity_change,
    previous_quantity, new_quantity, unit, reason, reference_id, operator_id
  ) VALUES (
    p_waste_lot_id, v_lot.waste_type_id, p_transaction_type, p_quantity_change,
    v_prev_quantity, v_new_quantity, v_lot.unit, p_reason, p_reference_id, p_operator_id
  );

  RETURN to_jsonb(v_lot);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.execute_waste_lot_mutation(UUID, TEXT, NUMERIC, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_waste_lot_mutation(UUID, TEXT, NUMERIC, TEXT, TEXT, UUID) TO authenticated;
