# DEMO JOURNEY — Deterministic Verification Guide
## KITA TUMBUH / Kampung Smart Farming

> **Scope:** Manual QA & End-to-End Operational Lifecycle Verification  
> **Environment:** Development & Staging Only  
> **Rule:** All metrics herein are illustrative demo fixtures. NEVER represent demo figures as genuine public impact.

---

## 1. Overview of the 6-Step Circular Loop

The platform connects household waste donations directly to community empowerment through a strictly traceable chain:

```text
Step 1: Waste Donation Submission (Donor)
   ↓
Step 2: Intake Verification & Inventory Ingestion (Operator)
   ↓
Step 3: Production Batch Allocation (Operator)
   ↓
Step 4: Product Manufacturing & Stock Update (Operator)
   ↓
Step 5: Product Order & Payment Verification (Customer & Admin)
   ↓
Step 6: Social Allocation & Transparency Reporting (Finance & Public)
```

---

## 2. Step-by-Step Deterministic QA Walkthrough

### Step 1: Donor Submits Waste Donation
- **Actor:** Public Visitor / Donor (no login required, or logged in Member).
- **Route:** `/donasikan`
- **Action:**
  1. Select Category: **Minyak Jelantah**.
  2. Select Quantity tier: **Sedang** (~2–5 L).
  3. Choose Method: **Jemput ke Rumah (Pickup)**.
  4. Fill Contact & Address:
     - Name: `DEMO - Budi Santoso`
     - Phone: `081299990001`
     - Address: `Jl. Kebun Raya No. 12, RT 01/RW 02, Jakarta Selatan`
  5. Confirm submission.
- **Expected Outcome:**
  - System generates a unique tracking reference (e.g. `KT-DEMO-0001`).
  - Screen redirects to `/donasi/sukses?ref=KT-DEMO-0001`.
  - Record status in database: `SUBMITTED`.
  - Estimated quantity recorded: `5.0 L`. Verified quantity is initially `NULL`.

---

### Step 2: Operator Verifies Intake
- **Actor:** Operator / Admin.
- **Route:** `/admin/donations`
- **Action:**
  1. Locate `KT-DEMO-0001` in the active intake queue.
  2. Transition status: `SUBMITTED → SCHEDULED → COLLECTED → VERIFIED`.
  3. Enter actual measured quantity: **4.5 L** (demonstrating estimated vs. verified distinction per ADR-004).
  4. Select target inventory lot or create new lot: `LOT-DEMO-001`.
- **Expected Outcome:**
  - `donations.verified_quantity` set to `4.5`.
  - Public tracking page (`/lacak?ref=KT-DEMO-0001`) updates status to `Terverifikasi: 4.5 L`.
  - Waste lot `LOT-DEMO-001` inventory incremented by `4.5 L` via locked atomic RPC (`execute_waste_lot_mutation`).

---

### Step 3: Production Batch Allocation
- **Actor:** Production Operator.
- **Route:** `/admin/production`
- **Action:**
  1. Click **Buat Batch Produksi Baru**.
  2. Target Product: `DEMO - Lilin Aromaterapi Serai Wangi` (SKU: `PRD-DEMO-001`).
  3. Target Output Quantity: `20 pcs`.
  4. Input Allocation: Allocate `15.0 L` from `LOT-DEMO-001`.
- **Expected Outcome:**
  - Production batch created with status `IN_PROGRESS` (Batch: `BATCH-DEMO-001`).
  - Waste lot available balance decrements by `15.0 L` atomically.
  - Linked input registered in `batch_inputs`.

---

### Step 4: Batch Completion & Finished Goods Ingestion
- **Actor:** Production Operator.
- **Route:** `/admin/production`
- **Action:**
  1. Open `BATCH-DEMO-001`.
  2. Transition status: `IN_PROGRESS → COMPLETED`.
  3. Input actual finished product yield: **20 pcs**.
- **Expected Outcome:**
  - Batch status set to `COMPLETED`.
  - Product stock for `PRD-DEMO-001` automatically incremented from `0` to `20 pcs`.
  - Product appears as in-stock on the public catalog (`/produk`).

---

### Step 5: Customer Order & Payment Confirmation
- **Actor:** Customer (Public) & Admin.
- **Route:** `/produk` → `/order`
- **Action:**
  1. Customer orders `2 pcs` of `DEMO - Lilin Aromaterapi Serai Wangi` (Rp 35.000 / pcs = Rp 70.000).
  2. Submits order: generated order number `ORD-DEMO-001` with status `PENDING_PAYMENT`.
  3. Customer completes manual bank transfer.
  4. Admin navigates to `/admin/orders` and marks payment as `PAID`.
- **Expected Outcome:**
  - Payment status verified.
  - Inventory decremented atomically by `2 pcs` (stock remaining: `18 pcs`).
  - Revenue transaction recorded in accounting ledger.

---

### Step 6: Social Allocation & Transparency Engine
- **Actor:** Finance Officer / System Automation.
- **Route:** `/admin/allocations`
- **Action:**
  1. Select available order revenue from `ORD-DEMO-001` (Rp 70.000).
  2. Allocate social margin (e.g. 50% = Rp 35.000) to social program:
     `DEMO - Kelas Berkarya & Kemandirian Anak Difabel`.
- **Expected Outcome:**
  - Record appended to `social_allocations`.
  - Public route `/program/demo-kelas-berkarya` reflects updated allocated balance (+Rp 35.000).
  - Public route `/transparansi` and `/dampak` dynamically reflect real aggregated pooled metrics via SECURITY DEFINER RPCs without manual intervention or hardcoded numbers.

---

## 3. Data Cleanup & Reset Protocol

To reset the local demo environment to a clean state after performing the walkthrough:

```bash
# Re-apply migrations up to date
npx supabase db reset

# Re-seed baseline master records and demo state
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed-demo.sql
```
