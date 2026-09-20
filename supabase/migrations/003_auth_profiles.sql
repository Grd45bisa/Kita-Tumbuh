-- =============================================================================
-- 003_auth_profiles.sql
-- Phase 4: Authentication & Member Area — Profiles table & triggers
-- =============================================================================

-- Table: public.profiles
-- Stores application user metadata that is not managed directly by Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Data profil tambahan member KITA TUMBUH';
COMMENT ON COLUMN public.profiles.id IS 'Sama dengan auth.users(id)';
COMMENT ON COLUMN public.profiles.full_name IS 'Nama lengkap pengguna untuk sapaan dan laporan';
COMMENT ON COLUMN public.profiles.phone IS 'Nomor telepon / WhatsApp untuk koordinasi penjemputan';

-- Updated at trigger
CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Owner can read their own profile
CREATE POLICY "profiles_owner_read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Owner can update their own profile
CREATE POLICY "profiles_owner_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Owner can insert their own profile (defense-in-depth in addition to trigger)
CREATE POLICY "profiles_owner_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- Auto-create profile trigger on auth.users insert
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger runs when a new row is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
