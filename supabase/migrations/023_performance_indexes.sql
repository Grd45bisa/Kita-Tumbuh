-- =============================================================================
-- 023_performance_indexes.sql
-- Performance audit: missing indexes on frequently-filtered columns.
-- =============================================================================
-- donations grows unbounded (one row per donation ever submitted). Several
-- hot-path queries filter on columns that had no supporting index, so
-- Postgres falls back to a sequential scan that gets slower as the table
-- grows — the "gets slower over time" pattern reported in production:
--
--   1. app/admin/donations/page.tsx — the admin donation queue filters by
--      waste_type_slug and method (dropdown filters used on every visit).
--      Only `status` and `created_at` had indexes; `waste_type_slug` and
--      `method` did a full scan.
--   2. get_public_impact_waste_collected() (017_public_impact_aggregation.sql)
--      — called twice per /dampak and /transparansi page load, filters on
--      `waste_type_slug = ? AND status IN (...)`. The existing single-column
--      idx_donations_status index only prunes by status; Postgres still has
--      to check waste_type_slug against every matching row. A composite
--      index lets it seek directly to the (waste_type_slug, status) pair.
--
-- These are pure additions (CREATE INDEX ... IF NOT EXISTS) — no existing
-- index, table, or RLS policy is touched, so this is safe to run against a
-- database that already has data.
-- =============================================================================

-- Supports admin donation queue filters (method dropdown) and any future
-- query that segments donations by delivery method.
CREATE INDEX IF NOT EXISTS idx_donations_method ON public.donations(method);

-- Composite index for the (waste_type_slug, status) pair used by both the
-- admin waste-type filter and get_public_impact_waste_collected(). A
-- composite index also serves queries that filter on waste_type_slug alone,
-- so this replaces the need for a separate single-column index on it.
CREATE INDEX IF NOT EXISTS idx_donations_waste_type_status
  ON public.donations(waste_type_slug, status);

-- Speeds up the admin queue's free-text search (reference / donor_name /
-- donor_email via .ilike(), i.e. ILIKE '%term%'). A plain btree index can't
-- serve a leading-wildcard ILIKE, so this uses trigram matching (pg_trgm),
-- which Postgres can use for both prefix and substring ILIKE lookups.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_donations_reference_trgm
  ON public.donations USING gin (reference gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_donations_donor_name_trgm
  ON public.donations USING gin (donor_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_donations_donor_email_trgm
  ON public.donations USING gin (donor_email gin_trgm_ops);

-- Same pattern in two more admin list pages: a filter dropdown targets a
-- column with no supporting index, so it currently falls back to a full
-- table scan.
--   - app/admin/orders/page.tsx / lib/domain/admin/orders.ts filters by
--     payment_status (orders.status already had an index, payment_status
--     did not).
--   - app/admin/products/page.tsx filters by category (products.is_public
--     already had an index, category did not).
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_reference_trgm
  ON public.orders USING gin (reference gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name_trgm
  ON public.orders USING gin (customer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email_trgm
  ON public.orders USING gin (customer_email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
