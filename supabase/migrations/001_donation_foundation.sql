-- =============================================================================
-- KAMPUNG SMART FARMING — DONATION FOUNDATION MIGRATION
-- Migration: 001_donation_foundation.sql
-- =============================================================================
-- Tables:
--   1. waste_types        — master data jenis limbah yang diterima
--   2. collection_points  — lokasi drop-off (public)
--   3. donations          — record donasi utama
--   4. pickup_requests    — detail jadwal pickup (private, server-only read)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. WASTE TYPES
-- =============================================================================

CREATE TABLE IF NOT EXISTS waste_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  unit            TEXT NOT NULL DEFAULT 'kg',   -- e.g. 'L', 'kg', 'pcs'
  min_quantity    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_quantity    NUMERIC(10, 2),               -- NULL = no limit
  accepted_notes  TEXT,                         -- packaging/condition notes
  rejected_notes  TEXT,                         -- what is NOT accepted
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE waste_types IS 'Master data jenis limbah yang diterima oleh Kampung Smart Farming';
COMMENT ON COLUMN waste_types.unit IS 'Satuan ukuran: L (liter), kg (kilogram), pcs (unit)';
COMMENT ON COLUMN waste_types.accepted_notes IS 'Petunjuk kondisi / kemasan yang diterima';
COMMENT ON COLUMN waste_types.rejected_notes IS 'Item yang tidak diterima dalam kategori ini';

-- Seed: waste types (operational data for initial launch)
INSERT INTO waste_types (slug, name, description, unit, min_quantity, max_quantity, accepted_notes, rejected_notes, sort_order)
VALUES
  (
    'minyak-jelantah',
    'Minyak Jelantah',
    'Minyak goreng bekas pakai dari dapur rumah tangga yang dapat diolah menjadi sabun, lilin, dan bahan bakar bio.',
    'L',
    0.5,
    50,
    'Masukkan ke dalam jeriken HDPE atau botol PET bersih. Saring kotoran kasar terlebih dahulu. Boleh campuran berbagai minyak goreng bekas.',
    'Tidak menerima: oli mesin/kendaraan, minyak industri, minyak terkontaminasi bahan kimia, minyak yang bercampur air lebih dari 30%.',
    1
  ),
  (
    'limbah-organik',
    'Limbah Organik Dapur',
    'Sisa sayuran, kulit buah, ampas kopi, dan bahan organik dapur yang dapat diolah menjadi kompos dan pakan ternak.',
    'kg',
    0.5,
    20,
    'Sisa sayuran mentah, kulit buah, ampas kopi dan teh, potongan tanaman. Masukkan ke dalam kantong plastik tertutup rapat.',
    'Tidak menerima: daging, ikan, tulang keras, santan pekat, makanan berjamur parah, produk susu, sisa makanan berminyak berat.',
    2
  ),
  (
    'plastik-wadah',
    'Plastik Wadah Tertentu',
    'Jeriken HDPE dan botol PET bersih untuk digunakan sebagai wadah tampung minyak jelantah atau didaur ulang.',
    'pcs',
    1,
    20,
    'Jeriken HDPE (kode resin 2) dan botol PET (kode resin 1). Harus bersih dan kering. Lepaskan tutup dan label jika memungkinkan.',
    'Tidak menerima: plastik kresek, styrofoam, plastik berlapis (metalic/multilayer), plastik kotor/berminyak yang tidak bisa dibersihkan.',
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 2. COLLECTION POINTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS collection_points (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,         -- e.g. 'CP-001'
  name            TEXT NOT NULL,
  address         TEXT NOT NULL,
  district        TEXT,
  city            TEXT,
  province        TEXT,
  lat             NUMERIC(10, 7),
  lng             NUMERIC(10, 7),
  phone           TEXT,
  operating_hours JSONB,                        -- { mon: "08:00-17:00", ... }
  accepted_waste_slugs TEXT[],                  -- references waste_types.slug
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE collection_points IS 'Lokasi drop-off/collection point untuk donasi limbah';
COMMENT ON COLUMN collection_points.operating_hours IS 'JSON jam operasional per hari, e.g. {"senin":"08:00-17:00"}';

-- Seed: initial collection point (RW 06 Sejahtera per CONTENT.md)
INSERT INTO collection_points (code, name, address, district, city, province, phone, operating_hours, accepted_waste_slugs, notes)
VALUES (
  'CP-001',
  'Pos Daur Ulang RW 06 Sejahtera',
  'Jl. Sejahtera No. 12, RW 06',
  'Kecamatan Setempat',
  'Kota Setempat',
  'Jawa Barat',
  '+62-xxx-xxxx-xxxx',
  '{"senin":"08:00–16:00","selasa":"08:00–16:00","rabu":"08:00–16:00","kamis":"08:00–16:00","jumat":"08:00–15:00","sabtu":"08:00–13:00","minggu":"Tutup"}',
  ARRAY['minyak-jelantah','limbah-organik','plastik-wadah'],
  'Harap konfirmasi terlebih dahulu melalui telepon untuk jumlah besar (> 10 L / 10 kg).'
)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 3. DONATIONS
-- =============================================================================

CREATE TYPE donation_status AS ENUM (
  'SUBMITTED',
  'SCHEDULED',
  'COLLECTED',
  'VERIFIED',
  'SORTED',
  'PROCESSED',
  'CONVERTED'
);

CREATE TYPE donation_method AS ENUM (
  'DROP_OFF',
  'PICKUP'
);

CREATE TABLE IF NOT EXISTS donations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference           TEXT NOT NULL UNIQUE,       -- human-readable: DON-2026-00001
  
  -- Donor identity (optional — anonymous donation supported)
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name          TEXT,
  donor_email         TEXT,
  donor_phone         TEXT,
  
  -- Waste details
  waste_type_id       UUID NOT NULL REFERENCES waste_types(id),
  waste_type_slug     TEXT NOT NULL,              -- snapshot at time of donation
  waste_type_name     TEXT NOT NULL,              -- snapshot at time of donation
  unit                TEXT NOT NULL,              -- snapshot from waste_type
  
  -- Quantities — CRITICAL: estimated != verified
  estimated_quantity  NUMERIC(10, 2) NOT NULL,
  -- Verified quantity is filled by operator only, never by donor
  verified_quantity   NUMERIC(10, 2),
  verification_notes  TEXT,
  verified_at         TIMESTAMPTZ,
  verified_by         UUID REFERENCES auth.users(id),
  
  -- Method
  method              donation_method NOT NULL,
  collection_point_id UUID REFERENCES collection_points(id),
  
  -- Status lifecycle
  status              donation_status NOT NULL DEFAULT 'SUBMITTED',
  status_updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Donor notes
  donor_notes         TEXT,
  
  -- Idempotency
  idempotency_key     TEXT UNIQUE,
  
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT donations_estimated_quantity_positive CHECK (estimated_quantity > 0),
  CONSTRAINT donations_verified_quantity_positive CHECK (verified_quantity IS NULL OR verified_quantity >= 0),
  CONSTRAINT donations_dropoff_needs_point CHECK (
    method = 'PICKUP' OR (method = 'DROP_OFF' AND collection_point_id IS NOT NULL)
  )
);

COMMENT ON TABLE donations IS 'Record donasi limbah dari donor ke Kampung Smart Farming';
COMMENT ON COLUMN donations.reference IS 'Kode donasi yang mudah dibaca manusia, e.g. DON-2026-00001';
COMMENT ON COLUMN donations.estimated_quantity IS 'Perkiraan jumlah dari donor — BUKAN jumlah tervalidasi';
COMMENT ON COLUMN donations.verified_quantity IS 'Jumlah aktual setelah verifikasi fisik oleh operator';
COMMENT ON COLUMN donations.idempotency_key IS 'Untuk mencegah duplikasi submit';

-- Donation status history / audit trail
CREATE TABLE IF NOT EXISTS donation_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id   UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  from_status   donation_status,
  to_status     donation_status NOT NULL,
  actor_id      UUID REFERENCES auth.users(id),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE donation_status_history IS 'Audit trail perubahan status donasi';

-- =============================================================================
-- 4. PICKUP REQUESTS (PRIVATE — server-side only)
-- =============================================================================

CREATE TABLE IF NOT EXISTS pickup_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id     UUID NOT NULL UNIQUE REFERENCES donations(id) ON DELETE CASCADE,
  
  -- Address: PRIVATE — never expose to public or anonymous requests
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  district        TEXT,
  city            TEXT,
  province        TEXT,
  postal_code     TEXT,
  
  -- Scheduling
  requested_date  DATE NOT NULL,
  requested_slot  TEXT,                 -- e.g. '08:00–12:00', '13:00–17:00'
  pickup_notes    TEXT,
  
  -- Operator assignment
  assigned_operator_id  UUID REFERENCES auth.users(id),
  confirmed_at    TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE pickup_requests IS 'Detail jadwal pickup donasi. PRIVATE — alamat tidak boleh diekspos ke publik.';
COMMENT ON COLUMN pickup_requests.address_line1 IS 'PRIVATE: Alamat pickup donor';

-- =============================================================================
-- 5. REFERENCE NUMBER GENERATOR
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_donation_reference()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  seq_num  INTEGER;
  ref      TEXT;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM donations
  WHERE to_char(created_at, 'YYYY') = year_str;
  
  ref := 'DON-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER waste_types_updated_at
  BEFORE UPDATE ON waste_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER collection_points_updated_at
  BEFORE UPDATE ON collection_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER pickup_requests_updated_at
  BEFORE UPDATE ON pickup_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Status history trigger
CREATE OR REPLACE FUNCTION record_donation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO donation_status_history (donation_id, from_status, to_status)
    VALUES (NEW.id, OLD.status, NEW.status);
    NEW.status_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER donations_status_history
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION record_donation_status_change();

-- =============================================================================
-- 7. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_donations_reference ON donations(reference);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_donation_id ON pickup_requests(donation_id);
CREATE INDEX IF NOT EXISTS idx_donation_status_history_donation_id ON donation_status_history(donation_id);

-- =============================================================================
-- 8. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE waste_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_status_history ENABLE ROW LEVEL SECURITY;

-- waste_types: public read, admin write
CREATE POLICY "waste_types_public_read"
  ON waste_types FOR SELECT USING (is_active = true);

-- collection_points: public read, admin write
CREATE POLICY "collection_points_public_read"
  ON collection_points FOR SELECT USING (is_active = true);

-- donations: anyone can create, only owner or admin can read own
CREATE POLICY "donations_anyone_insert"
  ON donations FOR INSERT WITH CHECK (true);

CREATE POLICY "donations_owner_read"
  ON donations FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IS NULL  -- anonymous donations readable by anyone with reference
  );

-- pickup_requests: PRIVATE — only authenticated owner or admin via service role
CREATE POLICY "pickup_requests_owner_read"
  ON pickup_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM donations d
      WHERE d.id = pickup_requests.donation_id
        AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "pickup_requests_owner_insert"
  ON pickup_requests FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM donations d
      WHERE d.id = pickup_requests.donation_id
    )
  );

-- donation_status_history: owner can read
CREATE POLICY "donation_status_history_owner_read"
  ON donation_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM donations d
      WHERE d.id = donation_status_history.donation_id
        AND (d.user_id = auth.uid() OR d.user_id IS NULL)
    )
  );
