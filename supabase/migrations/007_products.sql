-- =====================================================================
-- Migration 007: Products & Circular Product Catalog
-- Description: Supports Phase 5 (P0-506) circular products derived from
--              production batches, with SKU, integer Rupiah pricing,
--              stock quantity, and public visibility toggle.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_batch_id UUID REFERENCES public.production_batches(id) ON DELETE SET NULL,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    story TEXT DEFAULT NULL,
    category TEXT NOT NULL DEFAULT 'MINYAK_JELANTAH' CHECK (
        category IN ('MINYAK_JELANTAH', 'ORGANIK', 'ANORGANIK')
    ),
    price BIGINT NOT NULL CHECK (price >= 0),
    currency TEXT NOT NULL DEFAULT 'IDR',
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    unit TEXT NOT NULL DEFAULT 'Pcs',
    image_url TEXT DEFAULT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for efficient lookup and public catalog
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_public ON public.products(is_public);
CREATE INDEX IF NOT EXISTS idx_products_batch ON public.products(production_batch_id);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1. Public can read products that have is_public = true
CREATE POLICY "Public read active products"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

-- 2. Admin full access for operational CRUD
CREATE POLICY "Admin full access on products"
    ON public.products
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
