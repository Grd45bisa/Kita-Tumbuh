-- =============================================================================
-- 020_rpc_grant_hardening.sql
-- Phase 9 audit fix: close a critical authorization gap in write-side RPCs
-- =============================================================================
-- Bug found during Phase 9 audit: `execute_social_allocation` (011),
-- `execute_order_payment_confirmation` (013), `execute_distribution` (016),
-- and `update_revenue_reconciliation` (013) are all `SECURITY DEFINER`
-- functions that mutate the most sensitive data in the system (social
-- fund allocation, order payment + stock, beneficiary distributions,
-- revenue ledger reconciliation) — but none of them ever received an
-- explicit REVOKE/GRANT. Postgres's default behavior grants EXECUTE on a
-- newly created function to PUBLIC, so ANY authenticated session — including
-- a plain MEMBER, not just staff — could call
-- `supabase.rpc("execute_social_allocation", {...})` directly from a
-- browser console and have it genuinely execute, completely bypassing the
-- `requirePermission()` checks in lib/domain/admin/*.ts (those checks only
-- protect the Server Action call path, not the RPC itself).
--
-- This directly violates AGENTS.md §14 ("For critical actions, use all
-- applicable layers: UI + server authorization + database RLS") — the
-- database layer was entirely absent for these four functions.
--
-- Fix, two layers:
--   1. REVOKE EXECUTE FROM PUBLIC, then GRANT EXECUTE only to `authenticated`
--      (closes the anon/public gap — matches the pattern already used
--      correctly for `get_public_impact_*`, `has_permission`, etc.).
--   2. Add an in-function `has_permission(...)` guard so being merely
--      "authenticated" is not enough — the caller must hold the specific
--      module permission the action requires, evaluated with the exact
--      same RBAC matrix as everywhere else in the system. This closes the
--      remaining gap that `authenticated` alone still includes MEMBER and
--      any staff role without the relevant module permission (e.g. a
--      SOCIAL_OFFICER calling execute_order_payment_confirmation, which
--      per ARSITEKTUR.md §11 they have no access to — orders_sales: read
--      only for SOCIAL_OFFICER).
-- =============================================================================

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
  IF NOT public.has_permission('finance', 'write') THEN
    RAISE EXCEPTION 'Tidak memiliki izin untuk mengalokasikan dana sosial.' USING ERRCODE = 'insufficient_privilege';
  END IF;

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
    program_name, program_id, funding_source_reference, amount, currency,
    allocated_at, approved_by, approval_status, notes
  ) VALUES (
    p_program_name, p_program_id, COALESCE(p_funding_source, 'REVENUE_SALES'),
    p_amount, 'IDR', timezone('utc'::text, now()), p_approved_by, 'APPROVED', p_notes
  ) RETURNING * INTO v_new_allocation;

  RETURN to_jsonb(v_new_allocation);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  IF NOT public.has_permission('orders_sales', 'write') THEN
    RAISE EXCEPTION 'Tidak memiliki izin untuk mengonfirmasi pembayaran pesanan.' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

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

  FOR v_item IN
    SELECT oi.product_id, oi.quantity, oi.product_name_snapshot
      FROM public.order_items oi
     WHERE oi.order_id = p_order_id
     ORDER BY oi.product_id
  LOOP
    SELECT stock_quantity, name INTO v_product_stock, v_product_name
      FROM public.products WHERE id = v_item.product_id FOR UPDATE;

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
  IF NOT (public.has_permission('social_programs', 'write') AND public.has_permission('beneficiaries', 'write')) THEN
    RAISE EXCEPTION 'Tidak memiliki izin untuk mencatat distribusi.' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_allocation_id IS NOT NULL THEN
    SELECT amount INTO v_allocation_amount
      FROM public.social_allocations
     WHERE id = p_allocation_id AND approval_status = 'APPROVED'
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Alokasi dana tidak ditemukan atau belum disetujui.'
        USING ERRCODE = 'no_data_found';
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_already_distributed
      FROM public.distributions
     WHERE allocation_id = p_allocation_id AND approval_status = 'APPROVED';

    v_remaining := v_allocation_amount - v_already_distributed;

    IF p_amount IS NOT NULL AND p_amount > v_remaining THEN
      RAISE EXCEPTION 'Nominal distribusi melebihi sisa alokasi (Sisa: Rp %, Diminta: Rp %)',
        v_remaining, p_amount
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  INSERT INTO public.distributions (
    program_id, beneficiary_id, allocation_id, amount, currency, item_description,
    distributed_at, evidence_url, evidence_notes, approval_status, approved_by, recorded_by
  ) VALUES (
    p_program_id, p_beneficiary_id, p_allocation_id, p_amount, 'IDR', p_item_description,
    COALESCE(p_distributed_at, (timezone('utc'::text, now()))::date),
    p_evidence_url, p_evidence_notes, 'APPROVED', p_recorded_by, p_recorded_by
  ) RETURNING * INTO v_new_distribution;

  RETURN to_jsonb(v_new_distribution);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_revenue_reconciliation(
  p_entry_id UUID,
  p_status TEXT,
  p_notes TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_entry public.revenue_entries%ROWTYPE;
BEGIN
  IF NOT public.has_permission('finance', 'write') THEN
    RAISE EXCEPTION 'Tidak memiliki izin untuk memperbarui status rekonsiliasi.' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_status NOT IN ('PENDING', 'RECONCILED', 'DISCREPANCY') THEN
    RAISE EXCEPTION 'Status rekonsiliasi tidak valid: %', p_status
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.revenue_entries
     SET reconciliation_status = p_status, notes = p_notes
   WHERE id = p_entry_id
   RETURNING * INTO v_entry;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entri pendapatan tidak ditemukan.' USING ERRCODE = 'no_data_found';
  END IF;

  RETURN to_jsonb(v_entry);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Explicit REVOKE-then-GRANT: PUBLIC (which includes anon) never gets
-- EXECUTE; only `authenticated` does, and the in-function has_permission()
-- guard above further restricts it to the specific module+level required.
REVOKE ALL ON FUNCTION public.execute_social_allocation(TEXT, TEXT, BIGINT, TEXT, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_social_allocation(TEXT, TEXT, BIGINT, TEXT, UUID, UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.execute_order_payment_confirmation(UUID, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_order_payment_confirmation(UUID, TEXT, UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.execute_distribution(UUID, UUID, UUID, BIGINT, TEXT, DATE, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_distribution(UUID, UUID, UUID, BIGINT, TEXT, DATE, TEXT, TEXT, UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.update_revenue_reconciliation(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_revenue_reconciliation(UUID, TEXT, TEXT) TO authenticated;
