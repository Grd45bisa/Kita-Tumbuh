-- =============================================================================
-- KITA TUMBUH / KAMPUNG SMART FARMING
-- DEVELOPMENT SEED DATA (DEMO ONLY)
-- File: supabase/seed-demo.sql
--
-- STRICT WARNING:
-- This script contains purely fictional, illustrative demo records intended
-- ONLY for local development, UI validation, and testing of full-lifecycle
-- operational workflows.
--
-- NEVER RUN THIS FILE IN A STAGING OR PRODUCTION ENVIRONMENT.
-- Every seeded record is prefixed with 'DEMO -' or 'demo-' to prevent
-- accidental confusion with genuine community contributions.
-- =============================================================================

DO $$
DECLARE
  v_oil_id UUID;
  v_oil_name TEXT;
  v_oil_unit TEXT;
  v_cp_id UUID;
  v_donation_1_id UUID := 'd0000000-0000-0000-0000-000000000001'::UUID;
  v_donation_2_id UUID := 'd0000000-0000-0000-0000-000000000002'::UUID;
  v_donation_3_id UUID := 'd0000000-0000-0000-0000-000000000003'::UUID;
  v_lot_id UUID := 'e0000000-0000-0000-0000-000000000001'::UUID;
  v_batch_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
  v_product_id UUID := 'f0000000-0000-0000-0000-000000000001'::UUID;
  v_order_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
  v_program_id UUID := '90000000-0000-0000-0000-000000000001'::UUID;
BEGIN
  -- 1. Fetch existing master reference IDs (from migrations 001/002)
  SELECT id, name, unit INTO v_oil_id, v_oil_name, v_oil_unit 
  FROM public.waste_types 
  WHERE slug = 'minyak-jelantah' 
  LIMIT 1;

  SELECT id INTO v_cp_id 
  FROM public.collection_points 
  LIMIT 1;

  IF v_oil_id IS NULL OR v_cp_id IS NULL THEN
    RAISE NOTICE 'Baseline waste types or collection points not found. Ensure migrations 001 and 002 are applied.';
    RETURN;
  END IF;

  -- 2. Seed Demo Donations across various lifecycle stages
  -- ---------------------------------------------------------------------------
  -- Demo Donation 1: SUBMITTED (Pickup requested)
  INSERT INTO public.donations (
    id, reference, waste_type_id, waste_type_slug, waste_type_name, unit,
    estimated_quantity, verified_quantity,
    donor_name, donor_phone, donor_email,
    method, collection_point_id, status, donor_notes
  ) VALUES (
    v_donation_1_id,
    'KT-DEMO-0001',
    v_oil_id, 'minyak-jelantah', v_oil_name, v_oil_unit,
    5.0, NULL,
    'DEMO - Budi Santoso', '081299990001', 'demo-budi@example.com',
    'PICKUP', NULL, 'SUBMITTED', 'Demo pickup request submitted for testing.'
  ) ON CONFLICT (reference) DO NOTHING;

  -- Pickup request detail for Donation 1
  INSERT INTO public.pickup_requests (
    id, donation_id, address_line1, requested_date, requested_slot, pickup_notes
  ) VALUES (
    'd1000000-0000-0000-0000-000000000001',
    v_donation_1_id,
    'Jl. Kebun Raya No. 12, RT 01/RW 02 (DEMO ADDRESS)',
    CURRENT_DATE + INTERVAL '2 days',
    '08:00–12:00',
    'Titip di pos satpam jika tidak ada orang di rumah.'
  ) ON CONFLICT (donation_id) DO NOTHING;

  -- Demo Donation 2: VERIFIED (Drop-off, verified at collection point)
  INSERT INTO public.donations (
    id, reference, waste_type_id, waste_type_slug, waste_type_name, unit,
    estimated_quantity, verified_quantity,
    donor_name, donor_phone, donor_email,
    method, collection_point_id, status, donor_notes
  ) VALUES (
    v_donation_2_id,
    'KT-DEMO-0002',
    v_oil_id, 'minyak-jelantah', v_oil_name, v_oil_unit,
    5.0, 4.5,
    'DEMO - Siti Rahma', '081299990002', 'demo-siti@example.com',
    'DROP_OFF', v_cp_id, 'VERIFIED', 'Demo drop-off donation verified at collection point.'
  ) ON CONFLICT (reference) DO NOTHING;

  -- Demo Donation 3: CONVERTED (Already processed into products)
  INSERT INTO public.donations (
    id, reference, waste_type_id, waste_type_slug, waste_type_name, unit,
    estimated_quantity, verified_quantity,
    donor_name, donor_phone, donor_email,
    method, collection_point_id, status, donor_notes
  ) VALUES (
    v_donation_3_id,
    'KT-DEMO-0003',
    v_oil_id, 'minyak-jelantah', v_oil_name, v_oil_unit,
    10.0, 9.8,
    'DEMO - Hendra Wijaya', '081299990003', 'demo-hendra@example.com',
    'DROP_OFF', v_cp_id, 'CONVERTED', 'Demo donation converted into finished circular products.'
  ) ON CONFLICT (reference) DO NOTHING;

  -- 3. Seed Waste Lot (Inventory)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.waste_lots (
    id, lot_code, waste_type_id, source_donation_id, initial_quantity,
    current_quantity, unit, quality_grade, status, storage_location, notes
  ) VALUES (
    v_lot_id,
    'LOT-DEMO-001',
    v_oil_id,
    v_donation_2_id,
    50.0,
    35.0,
    v_oil_unit,
    'STANDARD',
    'AVAILABLE',
    'Gudang Transit A-01 (DEMO)',
    'Demo waste lot allocated from verified donations.'
  ) ON CONFLICT (lot_code) DO NOTHING;

  -- 4. Seed Production Batch (Phase 5)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.production_batches (
    id, batch_number, title, status, target_output_type,
    target_quantity, output_unit, actual_output_quantity, notes
  ) VALUES (
    v_batch_id,
    'BATCH-DEMO-001',
    'DEMO - Batch Lilin Aromaterapi Batch #1',
    'COMPLETED',
    'lilin_aromaterapi',
    25,
    'pcs',
    20,
    'Demo batch completed successfully with 20 finished pcs produced.'
  ) ON CONFLICT (batch_number) DO NOTHING;

  -- Link batch input (from waste lot to batch)
  INSERT INTO public.batch_inputs (
    id, batch_id, waste_lot_id, quantity_used, unit, notes
  ) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    v_batch_id,
    v_lot_id,
    15.0,
    v_oil_unit,
    'Allocated 15 L filtered cooking oil for aroma candle workshop.'
  ) ON CONFLICT (id) DO NOTHING;

  -- 5. Seed Circular Product (Phase 5)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.products (
    id, production_batch_id, sku, name, slug, description, story, category,
    price, currency, stock_quantity, unit, is_public
  ) VALUES (
    v_product_id,
    v_batch_id,
    'PRD-DEMO-001',
    'DEMO - Lilin Aromaterapi Serai Wangi',
    'demo-lilin-serai',
    'Lilin aromaterapi ramah lingkungan berbahan dasar minyak jelantah terfiltrasi dengan minyak atsiri serai wangi alami.',
    'Dibuat dalam sesi workshop kreasi bersama adik-adik difabel di Rumah Komunitas.',
    'MINYAK_JELANTAH',
    35000,
    'IDR',
    20,
    'pcs',
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- 6. Seed Demo Order (Phase 6)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.orders (
    id, reference, customer_name, customer_email, customer_phone,
    shipping_address, status, payment_status, payment_method,
    subtotal, total, currency
  ) VALUES (
    v_order_id,
    'ORD-DEMO-001',
    'DEMO - Pembeli Lestari',
    'demo-pembeli@example.com',
    '081299990004',
    'Jl. Melati No. 4, RT 02/RW 01, Jakarta Selatan (DEMO)',
    'PAID',
    'PAID',
    'MANUAL_TRANSFER',
    70000,
    85000,
    'IDR'
  ) ON CONFLICT (reference) DO NOTHING;

  -- Order Item Snapshot
  INSERT INTO public.order_items (
    id, order_id, product_id, product_name_snapshot, product_price_snapshot,
    quantity, subtotal
  ) VALUES (
    'a1000000-0000-0000-0000-000000000001',
    v_order_id,
    v_product_id,
    'DEMO - Lilin Aromaterapi Serai Wangi',
    35000,
    2,
    70000
  ) ON CONFLICT (id) DO NOTHING;

  -- 7. Seed Social Program & Allocation (Phase 6 & 7)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.social_programs (
    id, name, slug, description, goal, target_amount, currency,
    status, public_status
  ) VALUES (
    v_program_id,
    'DEMO - Kelas Berkarya & Kemandirian Anak Difabel',
    'demo-kelas-berkarya',
    'Program pelatihan keterampilan motorik dan kreasi daur ulang limbah minyak jelantah menjadi produk lilin dan kerajinan tangan bernilai ekonomi bagi anak-anak difabel.',
    'Mendukung operasional ruang belajar dan sarana alat bantu berkarya 15 anak difabel.',
    10000000,
    'IDR',
    'ACTIVE',
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- Social Allocation linked to Program
  INSERT INTO public.social_allocations (
    id, program_name, program_id, funding_source_reference,
    amount, currency, approval_status, notes
  ) VALUES (
    '91000000-0000-0000-0000-000000000001',
    'DEMO - Kelas Berkarya & Kemandirian Anak Difabel',
    v_program_id,
    'ORD-DEMO-001',
    35000,
    'IDR',
    'APPROVED',
    'Demo 50% margin allocation from Order ORD-DEMO-001 to support inclusive workshop tools.'
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Demo seed data inserted successfully.';
END $$;
