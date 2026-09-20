-- =============================================================================
-- 009_orders.sql
-- Phase 6: Sales & Financial Flow — Orders & Order Items
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference           TEXT NOT NULL UNIQUE, -- e.g. ORD-2026-0001
  
  -- Customer identity (supports anonymous guest checkout or authenticated user)
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name       TEXT NOT NULL,
  customer_email      TEXT NOT NULL,
  customer_phone      TEXT NOT NULL,
  shipping_address    TEXT NOT NULL,
  customer_notes      TEXT DEFAULT NULL,

  -- Status lifecycle (ARSITEKTUR.md §7.3)
  status              TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (
    status IN ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED')
  ),

  -- Payment fields
  payment_status      TEXT NOT NULL DEFAULT 'UNPAID' CHECK (
    payment_status IN ('UNPAID', 'PENDING_VERIFICATION', 'PAID', 'REFUNDED', 'FAILED')
  ),
  payment_method      TEXT NOT NULL DEFAULT 'MANUAL_TRANSFER',
  
  -- Financial totals (integer Rupiah minor units per DATABASE.md Money)
  subtotal            BIGINT NOT NULL CHECK (subtotal >= 0),
  total               BIGINT NOT NULL CHECK (total >= 0),
  currency            TEXT NOT NULL DEFAULT 'IDR',

  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.orders IS 'Pencatatan pesanan produk sirkular dengan snapshot finansial dan status siklus hidup';

CREATE TABLE IF NOT EXISTS public.order_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id              UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  
  -- Immutable snapshot at purchase time (P0-601 requirement)
  product_name_snapshot   TEXT NOT NULL,
  product_price_snapshot  BIGINT NOT NULL CHECK (product_price_snapshot >= 0),
  quantity                INTEGER NOT NULL CHECK (quantity > 0),
  subtotal                BIGINT NOT NULL CHECK (subtotal >= 0),

  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.order_items IS 'Item pesanan dengan snapshot nama dan harga produk saat pembelian';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Orders RLS:
-- 1. Anyone (public or logged-in) can create an order
CREATE POLICY "orders_anyone_insert"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- 2. Owner can read their own order (or anonymous order via reference lookup)
CREATE POLICY "orders_owner_read"
  ON public.orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IS NULL
  );

-- 3. Admin has full access
CREATE POLICY "orders_admin_all"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order Items RLS:
-- 1. Anyone can insert items for an order being placed
CREATE POLICY "order_items_anyone_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- 2. Owner can read items belonging to accessible orders
CREATE POLICY "order_items_owner_read"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR o.user_id IS NULL)
    )
  );

-- 3. Admin has full access
CREATE POLICY "order_items_admin_all"
  ON public.order_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
