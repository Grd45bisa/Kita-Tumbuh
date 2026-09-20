-- =============================================================================
-- 013_order_payment_fixes.sql
-- Phase 6 audit fixes: Sales & Financial Flow integrity
-- =============================================================================
-- Fixes applied (see Phase 6 audit findings):
-- 1. Order payment confirmation must be a single atomic transaction that
--    row-locks the affected products, validates stock, decrements it, and
--    flips the order to PAID — replacing the previous application-level
--    read-then-write loop in confirmOrderPaymentAction (lib/domain/admin/orders.ts),
--    which was vulnerable to a TOCTOU race between two concurrent payment
--    confirmations touching the same product (ADR-020 promised "single
--    transaction" but the implementation did not deliver it).
-- 2. The function also refuses to confirm payment for an order that is
--    already CANCELLED, and refuses to re-confirm one already PAID.
-- 3. revenue_entries RLS is tightened from FOR ALL (which silently allowed
--    admin UPDATE/DELETE on realized revenue rows) to SELECT + INSERT only,
--    matching the "append-only ledger" design intent stated in
--    010_revenue_ledger.sql's own header comment. Reconciliation status
--    changes are handled via a dedicated SECURITY DEFINER RPC that only
--    permits touching reconciliation_status/notes, never amount/order_id.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Atomic order payment confirmation RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.execute_order_payment_confirmation(
  p_order_id UUID,
  p_notes TEXT,
  p_confirmed_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item RECORD;
  v_product_stock BIGINT;
  v_product_name TEXT;
BEGIN
  -- Lock the order row for the duration of this transaction.
  SELECT * INTO v_order
    FROM public.orders
   WHERE id = p_order_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pesanan tidak ditemukan.' USING ERRCODE = 'no_data_found';
  END IF;

  IF v_order.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Pesanan telah dibatalkan, tidak dapat dikonfirmasi pembayarannya.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_order.payment_status = 'PAID' THEN
    RAISE EXCEPTION 'Pesanan ini sudah ditandai Lunas sebelumnya.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Lock every affected product row (deterministic order by product_id avoids
  -- deadlocks between concurrent multi-item confirmations) and validate +
  -- decrement stock within this same transaction.
  FOR v_item IN
    SELECT oi.product_id, oi.quantity, oi.product_name_snapshot
      FROM public.order_items oi
     WHERE oi.order_id = p_order_id
     ORDER BY oi.product_id
  LOOP
    SELECT stock_quantity, name INTO v_product_stock, v_product_name
      FROM public.products
     WHERE id = v_item.product_id
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk % tidak ditemukan di database.', v_item.product_name_snapshot
        USING ERRCODE = 'no_data_found';
    END IF;

    IF v_product_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Stok produk "%" tidak mencukupi (tersedia: %, dibutuhkan: %).',
        v_product_name, v_product_stock, v_item.quantity
        USING ERRCODE = 'check_violation';
    END IF;

    UPDATE public.products
       SET stock_quantity = stock_quantity - v_item.quantity,
           updated_at = timezone('utc'::text, now())
     WHERE id = v_item.product_id;
  END LOOP;

  -- Flip order to PAID. The existing trg_record_revenue_on_paid trigger
  -- (010_revenue_ledger.sql) fires from this same UPDATE and records the
  -- revenue_entries row within this same transaction.
  UPDATE public.orders
     SET status = 'PAID',
         payment_status = 'PAID',
         updated_at = timezone('utc'::text, now()),
         customer_notes = CASE
           WHEN p_notes IS NOT NULL AND p_notes <> ''
             THEN COALESCE(customer_notes || E'\n', '') || '[Diverifikasi]: ' || p_notes
           ELSE customer_notes
         END
   WHERE id = p_order_id
   RETURNING * INTO v_order;

  RETURN to_jsonb(v_order);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 2. Tighten revenue_entries RLS to genuinely append-only (SELECT + INSERT)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "revenue_entries_admin_all" ON public.revenue_entries;

CREATE POLICY "revenue_entries_admin_select"
  ON public.revenue_entries FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "revenue_entries_admin_insert"
  ON public.revenue_entries FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- No UPDATE or DELETE policy is defined for authenticated admins: with RLS
-- enabled and no matching policy, those operations are denied by default.
-- Reconciliation status changes go through the RPC below instead, which is
-- the only sanctioned way to mutate a revenue_entries row after insert.

CREATE OR REPLACE FUNCTION public.update_revenue_reconciliation(
  p_entry_id UUID,
  p_status TEXT,
  p_notes TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_entry public.revenue_entries%ROWTYPE;
BEGIN
  IF p_status NOT IN ('PENDING', 'RECONCILED', 'DISCREPANCY') THEN
    RAISE EXCEPTION 'Status rekonsiliasi tidak valid: %', p_status
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.revenue_entries
     SET reconciliation_status = p_status,
         notes = p_notes
   WHERE id = p_entry_id
   RETURNING * INTO v_entry;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entri pendapatan tidak ditemukan.' USING ERRCODE = 'no_data_found';
  END IF;

  RETURN to_jsonb(v_entry);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
