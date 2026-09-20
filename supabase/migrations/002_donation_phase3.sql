-- Phase 3: final lifecycle status, atomic references, public-safe receipts.
-- Apply after 001_donation_foundation.sql. Existing donation rows are retained.

ALTER TYPE public.donation_status ADD VALUE IF NOT EXISTS 'IMPACTED' AFTER 'CONVERTED';

-- One locked counter row per UTC calendar year. Seed from reference suffixes,
-- not row counts: deleting a donation must never recycle its reference.
CREATE TABLE IF NOT EXISTS public.donation_reference_counters (
  year INTEGER PRIMARY KEY,
  last_value BIGINT NOT NULL CHECK (last_value >= 0)
);

ALTER TABLE public.donation_reference_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.donation_reference_counters FROM PUBLIC, anon, authenticated;

INSERT INTO public.donation_reference_counters (year, last_value)
SELECT split_part(reference, '-', 2)::INTEGER,
       max(split_part(reference, '-', 3)::BIGINT)
FROM public.donations
WHERE reference ~ '^DON-[0-9]{4}-[0-9]{5,}$'
GROUP BY split_part(reference, '-', 2)::INTEGER
ON CONFLICT (year) DO UPDATE
SET last_value = greatest(donation_reference_counters.last_value, EXCLUDED.last_value);

CREATE OR REPLACE FUNCTION public.generate_donation_reference()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  reference_year INTEGER := extract(year FROM now() AT TIME ZONE 'UTC')::INTEGER;
  sequence_number BIGINT;
BEGIN
  -- ON CONFLICT locks the current year's row, so concurrent calls reserve
  -- distinct values even when their subsequent donation inserts overlap.
  INSERT INTO public.donation_reference_counters AS counters (year, last_value)
  VALUES (reference_year, 1)
  ON CONFLICT (year) DO UPDATE SET last_value = counters.last_value + 1
  RETURNING last_value INTO sequence_number;

  -- LPAD(..., 5, ...) alone truncates 100000 to 10000 in PostgreSQL.
  RETURN 'DON-' || reference_year::TEXT || '-' ||
    lpad(sequence_number::TEXT, greatest(5, length(sequence_number::TEXT)), '0');
END;
$$;

REVOKE ALL ON FUNCTION public.generate_donation_reference() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_donation_reference() TO anon, authenticated;

-- The reference is a public lookup key, never authorization to read a donation
-- row. These functions expose a fixed allowlist and no donor or pickup fields.
-- SECURITY DEFINER is needed to show the same safe receipt anonymously even
-- when the original donation belongs to an authenticated member.
CREATE OR REPLACE FUNCTION public.get_public_donation_receipt(p_reference TEXT)
RETURNS TABLE (
  reference TEXT,
  waste_type_name TEXT,
  estimated_quantity NUMERIC,
  verified_quantity NUMERIC,
  unit TEXT,
  status public.donation_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT d.reference, d.waste_type_name, d.estimated_quantity,
         d.verified_quantity, d.unit, d.status
  FROM public.donations AS d
  WHERE p_reference ~ '^DON-[0-9]{4}-[0-9]{5,}$'
    AND d.reference = p_reference;
$$;

REVOKE ALL ON FUNCTION public.get_public_donation_receipt(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_donation_receipt(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_donation_tracking(p_reference TEXT)
RETURNS TABLE (
  reference TEXT,
  waste_type_name TEXT,
  estimated_quantity NUMERIC,
  verified_quantity NUMERIC,
  unit TEXT,
  status public.donation_status,
  method public.donation_method,
  created_at TIMESTAMPTZ,
  collection_point JSONB,
  status_history JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT d.reference, d.waste_type_name, d.estimated_quantity,
         d.verified_quantity, d.unit, d.status, d.method, d.created_at,
         CASE WHEN cp.id IS NOT NULL THEN jsonb_build_object(
           'name', cp.name,
           'address', cp.address,
           'district', cp.district,
           'city', cp.city,
           'operating_hours', cp.operating_hours
         ) ELSE NULL END,
         coalesce((
           SELECT jsonb_agg(jsonb_build_object(
             'to_status', history.to_status,
             'created_at', history.created_at
           ) ORDER BY history.created_at, history.id)
           FROM public.donation_status_history AS history
           WHERE history.donation_id = d.id
         ), '[]'::JSONB)
  FROM public.donations AS d
  LEFT JOIN public.collection_points AS cp
    ON cp.id = d.collection_point_id AND cp.is_active = true
  WHERE p_reference ~ '^DON-[0-9]{4}-[0-9]{5,}$'
    AND d.reference = p_reference;
$$;

REVOKE ALL ON FUNCTION public.get_public_donation_tracking(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_donation_tracking(TEXT) TO anon, authenticated;
