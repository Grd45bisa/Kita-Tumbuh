-- =============================================================================
-- 008_donation_status_rejected.sql
-- Phase 5: Core Operational System — adds REJECTED to donation_status enum
-- =============================================================================
--
-- The admin donation verification flow (lib/domain/admin/donations.ts,
-- lib/validation/admin-donation-schema.ts) lets an operator reject a
-- donation, setting its status to 'REJECTED'. That value was never added
-- to the `donation_status` enum created in 001_donation_foundation.sql
-- (which only has SUBMITTED/SCHEDULED/COLLECTED/VERIFIED/SORTED/PROCESSED/
-- CONVERTED, plus IMPACTED added in 002_donation_phase3.sql) — every
-- rejection attempt would fail with "invalid input value for enum
-- donation_status" until this migration runs.
--
-- Note: ALTER TYPE ... ADD VALUE cannot run inside the same transaction
-- as a statement that uses the new value, and it cannot be rolled back —
-- this is why it lives in its own migration file, matching the pattern
-- already established by 002_donation_phase3.sql for 'IMPACTED'.

ALTER TYPE public.donation_status ADD VALUE IF NOT EXISTS 'REJECTED';
