-- =============================================================================
-- 017_public_impact_aggregation.sql
-- Phase 8: Transparency & Impact Engine — Public Impact Aggregation (P0-802 fix)
-- =============================================================================
-- Bug found during Phase 8 audit: getPublicImpactSummary() (lib/domain/impact/
-- public-impact.ts) queried donations/production_batches/batch_inputs/
-- social_allocations directly through the anon-key Supabase client used for
-- public visitors. Under that client's RLS:
--   - donations_owner_read (001_donation_foundation.sql) only allows a row
--     where user_id = auth.uid() OR user_id IS NULL — for an anonymous
--     visitor, auth.uid() is NULL, so ONLY anonymous donations (user_id IS
--     NULL) are visible. Every donation made by a logged-in member is
--     silently excluded from the public aggregate — an undercount with no
--     error and no indication anything is wrong.
--   - production_batches / batch_inputs / social_allocations all have
--     admin-only "FOR ALL TO authenticated USING (is_admin())" policies with
--     no public SELECT policy at all. An anonymous visitor's query against
--     these tables always returns zero rows (RLS default-deny), so
--     waste_processed, production_batches_completed, and
--     social_allocation_total ALWAYS render "no_data" in production — not
--     because the data doesn't exist, but because the query is silently
--     denied. This directly undermines the page's own claim that its
--     numbers are real, verified figures.
--
-- Fix: expose each metric as a narrow, read-only, SECURITY DEFINER RPC that
-- returns only an already-aggregated SUM/COUNT — never raw rows — so calling
-- it cannot leak anything RLS would otherwise protect (a beneficiary's name,
-- a donor's contact details, an individual order). Each function applies
-- exactly the same filter documented in lib/domain/impact/definitions.ts.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_public_impact_waste_collected(p_waste_type_slug TEXT)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(verified_quantity), NULL)
    FROM public.donations
   WHERE status IN ('VERIFIED', 'SORTED', 'PROCESSED', 'CONVERTED', 'IMPACTED')
     AND waste_type_slug = p_waste_type_slug
     AND verified_quantity IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

COMMENT ON FUNCTION public.get_public_impact_waste_collected(TEXT) IS 'Total verified_quantity donasi terverifikasi per waste_type_slug — hanya angka agregat, tidak pernah baris mentah (aman untuk pemanggil anonim).';

CREATE OR REPLACE FUNCTION public.get_public_impact_donations_verified_count()
RETURNS BIGINT AS $$
  SELECT COUNT(*)
    FROM public.donations
   WHERE status IN ('VERIFIED', 'SORTED', 'PROCESSED', 'CONVERTED', 'IMPACTED');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

COMMENT ON FUNCTION public.get_public_impact_donations_verified_count() IS 'Jumlah donasi berstatus terverifikasi ke atas — angka agregat saja.';

CREATE OR REPLACE FUNCTION public.get_public_impact_waste_processed()
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(bi.quantity_used), NULL)
    FROM public.batch_inputs bi
    JOIN public.production_batches pb ON pb.id = bi.batch_id
   WHERE pb.status IN ('COMPLETED', 'RELEASED');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

COMMENT ON FUNCTION public.get_public_impact_waste_processed() IS 'Total quantity_used batch_inputs untuk batch COMPLETED/RELEASED — angka agregat saja, tidak mengekspos batch/lot individual.';

CREATE OR REPLACE FUNCTION public.get_public_impact_batches_completed_count()
RETURNS BIGINT AS $$
  SELECT COUNT(*)
    FROM public.production_batches
   WHERE status IN ('COMPLETED', 'RELEASED');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

COMMENT ON FUNCTION public.get_public_impact_batches_completed_count() IS 'Jumlah batch produksi COMPLETED/RELEASED — angka agregat saja.';

CREATE OR REPLACE FUNCTION public.get_public_impact_social_allocation_total()
RETURNS BIGINT AS $$
  SELECT COALESCE(SUM(amount), NULL)
    FROM public.social_allocations
   WHERE approval_status = 'APPROVED';
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

COMMENT ON FUNCTION public.get_public_impact_social_allocation_total() IS 'Total alokasi dana sosial APPROVED dalam Rupiah — angka agregat saja, tidak mengekspos baris alokasi/program individual.';

-- social_programs_count is intentionally NOT duplicated here: that table
-- already has a public SELECT RLS policy (social_programs_public_read,
-- 014_social_programs.sql) scoped to public_status = true, so the existing
-- anon-key query in public-impact.ts already sees the correct, complete set
-- of rows for that metric.

-- Explicit grants: these functions must be callable by the anon role (public
-- website visitors with no session), not just authenticated users.
GRANT EXECUTE ON FUNCTION public.get_public_impact_waste_collected(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_impact_donations_verified_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_impact_waste_processed() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_impact_batches_completed_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_impact_social_allocation_total() TO anon, authenticated;
