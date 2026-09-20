-- =============================================================================
-- KITA TUMBUH / KAMPUNG SMART FARMING
-- PROMOTE USER(S) TO SUPER_ADMIN
-- File: supabase/promote-super-admin.sql
-- =============================================================================
-- Jalankan query ini di SQL Editor dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql

-- OPSI 1: Ubah SEMUA akun yang sudah ada di database saat ini menjadi SUPER_ADMIN:
UPDATE public.profiles
SET role = 'SUPER_ADMIN',
    updated_at = now();

-- OPSI 2 (Alternatif): Jika hanya ingin akun tertentu berdasarkan EMAIL:
-- UPDATE public.profiles
-- SET role = 'SUPER_ADMIN',
--     updated_at = now()
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'email_anda@example.com'
-- );

-- Verifikasi hasil perubahan role:
SELECT 
  p.id,
  u.email,
  p.full_name,
  p.role,
  u.email_confirmed_at,
  p.updated_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.updated_at DESC;
