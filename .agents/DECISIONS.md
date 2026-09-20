# DECISIONS.md

## Purpose

Record durable architecture/product decisions so future agents do not repeatedly reconsider already-settled choices.

## Decision Format

```text
ADR-XXX
Title:
Status:
Date:
Context:
Decision:
Why:
Consequences:
```

---

## ADR-001 — Full-Stack Next.js

**Status:** Accepted

**Date:** 2026-09-16

**Context:** The application needs a public website, authenticated member experience, and operational/admin workflows.

**Decision:** Use Next.js with TypeScript as the primary application framework, with backend/server logic kept inside Next.js where practical.

**Why:** Keeps the product architecture cohesive and avoids unnecessary service separation for the current scope.

**Consequences:** Server Components, Server Actions, and Route Handlers become the default application primitives.

---

## ADR-002 — Supabase PostgreSQL

**Status:** Accepted

**Date:** 2026-09-16

**Context:** The product needs persistent relational data, authentication, and secure access control.

**Decision:** Use Supabase PostgreSQL as the primary database platform when persistence is required.

**Why:** PostgreSQL fits the relational domain model and Supabase provides useful managed infrastructure.

**Consequences:** RLS and Supabase security patterns are first-class architectural concerns.

---

## ADR-003 — Waste-to-Impact Traceability

**Status:** Accepted

**Date:** 2026-09-16

**Decision:** Preserve the chain:

```text
Donation
→ Waste Intake
→ Inventory
→ Production
→ Product
→ Sale
→ Revenue
→ Social Allocation
→ Program
→ Beneficiary/Distribution
→ Impact
```

**Why:** Transparency is a core product value, not a marketing add-on.

**Consequences:** The data model must preserve historical relationships and operational records.

---

## ADR-004 — Estimated vs Verified Quantity

**Status:** Accepted

**Decision:** Donor-provided estimates and operator-verified quantities are separate fields/records.

**Why:** The donor estimate should not become authoritative physical inventory.

---

## ADR-005 — Brand Architecture: KITA TUMBUH & KAMPUNG SMART FARMING

**Status:** Accepted

**Date:** 2026-09-16

**Decision:** `KITA TUMBUH` is the master brand of the social circular movement. `KAMPUNG SMART FARMING` is the platform/ecosystem connecting waste collection, smart farming, and community empowerment.

**Hierarchy:**
```text
KITA TUMBUH
└── KAMPUNG SMART FARMING
    └── Dari Limbah, Tumbuh Manfaat.
```

**Why:** Establishes a clear master brand while keeping the operational platform identity grounded in community agriculture and waste transformation.

---

## ADR-006 — Brand Phrase

**Status:** Accepted

**Decision:** Preserve the core phrase:

> **SAMPAH KALIAN SANGAT BERARTI BAGI KAMI**

**Why:** It communicates the central emotional proposition that waste can still create meaningful social value.

---

## ADR-007 — No Fabricated Impact

**Status:** Accepted

**Decision:** Public impact, financial, beneficiary, and operational claims must come from real or explicitly labeled demo records.

**Why:** Trust is foundational to a donation/social-impact product.

**Consequences:** Marketing copy cannot invent statistics for visual purposes.

---

## ADR-008 — Server-First Next.js

**Status:** Accepted

**Decision:** Prefer Server Components for reads and use Client Components only when client-side behavior requires them.

**Why:** Reduces unnecessary client JavaScript and keeps data access closer to trusted server boundaries.

---

## ADR-009 — RLS and Server Authorization

**Status:** Accepted

**Decision:** Critical data access requires appropriate server authorization and database RLS.

**Why:** UI-only access control is insufficient.

---

## ADR-010 — Mobile-First Donation

**Status:** Accepted

**Decision:** The public donation journey is mobile-first.

**Why:** Donation is the primary contribution action and must work well on common mobile devices.

---

## ADR-011 — Controlled Natural Color Palette

**Status:** Accepted

**Date:** 2026-09-16

**Decision:** The product uses warm off-white (tulang), green (hijau), and brown (coklat) as its core visual color families.

**Why:** The palette reinforces nature, farming, local materials, community, circular economy, and warmth while reducing visual inconsistency, AI-generated color drift, and generic SaaS cliches.

**Consequences:** New UI components must use approved semantic color tokens. Unrelated colors (blue, purple, pink, cyan, neon, bright decorative red) must not be introduced as decoration.

---

## ADR-012 — Palette Token Naming Reconciled to Implementation

**Status:** Accepted

**Date:** 2026-09-20

**Context:** `.agents/DESIGN_SYSTEM.md` and `.agents/PROMPT.md` documented a color palette using the names `cream-*` (warm off-white) and `brown-*` (earth), with specific hex values (e.g. `cream-50 #FDFCF8`, `green-900 #173B2A`, `brown-900 #3E2A21`). The actual implementation in `styles/tokens.css` and `lib/tokens/index.ts` — already in production use across `components/ui/*`, `components/layout/*`, `components/donation/*`, and the live homepage (`app/page.tsx`) — uses different token names and hex values: `--color-paper-*` instead of `cream-*`, `--color-earth-*` instead of `brown-*`, plus a dedicated `--color-ink-*` neutral scale that the docs did not separately name. The green family also differs in hex value at nearly every step (e.g. implemented `green-700` is `#32614B`, documented `green-700` was `#2F6247`).

**Decision:** Reconcile `.agents/DESIGN_SYSTEM.md` and `.agents/PROMPT.md` to match the palette as implemented in `styles/tokens.css` (token names: `paper`, `ink`, `green`, `earth`; hex values as shipped). Documentation was updated to match code, not the reverse.

**Why:** The implemented token set was already used in dozens of files before this drift was discovered. Rewriting `styles/tokens.css` to match the old documented hex values would have been a large, purely cosmetic breaking change to an already-coherent, already-shipped design system, with no evidence the documented values were ever validated against a real design review — whereas updating the documentation is a same-day, zero-risk correction that makes the docs an accurate source of truth again per `AGENTS.md` §33 (Documentation Synchronization).

**Consequences:**
- `styles/tokens.css` / `lib/tokens/index.ts` remain unchanged and continue to be the actual source of truth for color tokens.
- Any future reference to "cream" or "brown" tokens in older docs/notes should be read as `paper` and `earth` respectively.
- Semantic state colors (`success`/`warning`/`danger`/`info`) are documented as their own dedicated token family (`--color-success-*` etc.), not as raw green/earth values, matching how they're actually implemented.
- The `info` semantic state intentionally uses a muted blue-gray (`--color-info-fg: #315A73`) — the one documented, scoped exception to the "no blue" rule, used only for that state and never decoratively.

---

## ADR-013 — One Donation Entry Route

**Status:** Accepted

**Date:** 2026-09-20

**Context:** The original wireframe described a separate `/donasi` landing, while the existing implementation already combines category selection, accepted/rejected conditions, and the four-step wizard at `/donasikan`.

**Decision:** Keep `/donasikan` as the official combined landing and wizard (Phase 3 option b). Use `/donasi/[reference]` for tracking and `/donasi/[reference]/receipt` for the shareable receipt. Do not add a duplicate landing or a second wizard.

**Why:** The first material step already serves the landing purpose; preserving the working flow avoids an extra navigation step and aligns documentation with the implementation.

**Consequences:** `WIREFRAME.md` §5.1, `ARSITEKTUR.md` §8, and `TASK.md` P0-301 use the same entry route. Method, schedule/location, and review remain within the four-step wizard.

---

## ADR-014 — Pickup Time Preferences in MVP

**Status:** Accepted

**Date:** 2026-09-20

**Context:** The pickup form has static morning/afternoon choices and stores the requested date/time. There is no capacity calendar or reservation engine.

**Decision:** Keep these choices as donor preferences requiring operational confirmation. Explain this in the method and review UI. Leave P0-304 available-slot logic unchecked until date-specific capacity is queried and enforced by the backend.

**Why:** Real availability requires operational capacity data and concurrent reservation rules; a static select cannot truthfully represent available slots.

**Consequences:** Submitting a requested date/time does not reserve capacity or guarantee collection on that date. Operator assignment and capacity scheduling remain follow-up work in the operational workflow. Do not claim automatic availability or an unverified service deadline.

---

## ADR-015 — Public-Safe Donation Receipt Without Unsupported Impact

**Status:** Accepted

**Date:** 2026-09-20

**Context:** Donation facts exist, but individual donations do not yet have verified lineage through production, sales, and social allocation. A receipt can consolidate those facts without inventing an impact result.

**Decision:** Share a compact server-rendered HTML receipt at `/donasi/[reference]/receipt`, reusing `ImpactReceipt` for reference, material, estimated quantity, verified quantity when present, and current status. `Bagikan Dampak` links to this page. Use public-safe text Open Graph metadata; defer dynamic image generation. Omit the impact-summary section entirely until verified linked data exists in Phase 5/8.

**Why:** A small readable page is sufficient for MVP sharing, while a fabricated summary or a promise based solely on estimated quantity would undermine traceability.

**Consequences:** Public data uses an explicit safe projection and excludes donor identity, contact information, pickup address/schedule, notes, and internal audit fields. Anyone with the reference link can open this limited receipt, including for member-owned donations. Public tracking also excludes private notes. These pages are not indexed. `CONVERTED` describes a product outcome; `IMPACTED` is a supported terminal status, not automatic evidence for a numerical impact summary. Applying migration `002` is required before the updated server queries and enum are deployed.

---

## ADR-016 — Email and Password Authentication Only (No OAuth in Phase 4)

**Status:** Accepted

**Date:** 2026-09-20

**Context:** The member area needs authentication for donation tracking, member dashboards, and personal impact. WIREFRAME.md §13 mentioned OAuth options as conditional ("jika disetujui").

**Decision:** Use email and password exclusively via Supabase Auth. Do not implement or expose OAuth providers (Google, Facebook, GitHub, etc.) during Phase 4. Donation submission at `/donasikan` remains 100% accessible to anonymous users without requiring login.

**Why:** Keeps dependencies minimal (`@supabase/ssr` only), eliminates third-party provider credential friction and privacy liabilities for donors, and avoids premature OAuth configuration before legal/consent policies are settled.

**Consequences:** Users authenticate using email and password. Sessions are tracked via secure HTTP-only cookies in Next.js middleware and SSR helpers. Unauthenticated visitors can donate without logging in.

---

## ADR-017 — Postponement of Multi-Address Management to Phase 5

**Status:** Accepted

**Date:** 2026-09-20

**Context:** P1-405 mentions "pickup addresses if supported" for member profiles. The existing donation flow captures pickup address fields directly inside the `pickup_requests` table during each donation wizard submission.

**Decision:** Postpone dedicated saved multi-address management (`profiles_addresses` or user address book CRUD) to Phase 5 (Core Operational System). In Phase 4 MVP, members update their primary contact information (full name and phone) on `/profil`. When scheduling pickups, they provide the pickup address in the donation wizard.

**Why:** Prevents premature schema bloat and complex address-selection UI before the operational dispatch and collection routing domain (Phase 5) is established.

**Consequences:** No separate saved-addresses table is introduced in migration `003`. Profile page includes an honest explanation that saved multi-address support will arrive in Phase 5.

---

## ADR-018 — Admin Role and Operational Security Architecture (Phase 5)

**Status:** Accepted

**Date:** 2026-09-20

**Context:** The platform requires an operational back-office under `/admin` for waste intake, verification, inventory, and production management. Full 5-role RBAC (`SUPER_ADMIN`, `OPERATOR`, `FINANCE`, `SOCIAL_OFFICER`, `MEMBER`) is planned for Phase 9.

**Decision:** Add a single `role` column to `public.profiles` (`TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin'))`). Operational routes live strictly under `/admin/*`. Use a three-tier defense-in-depth model:
1. `middleware.ts`: checks session presence on `/admin/*` routes;
2. `lib/auth/session.ts` `requireAdmin()`: checks `user.profile.role === 'admin'` on Server Components and mutations, redirecting non-admins to `/dashboard`;
3. Database RLS: `public.is_admin()` security-definer helper grants full write/read access to domain tables (`donations`, `waste_types`, `pickup_requests`, `inventory_transactions`, etc.).

**Why:** Using `TEXT` with a `CHECK` constraint avoids rigid PostgreSQL `ENUM` alteration locks, enabling straightforward expansion into multi-role RBAC in Phase 9 without data migrations or downtime.

**Consequences:** Role assignments are set directly in database by project owners. Member area (`/dashboard`, `/riwayat`, `/profil`) remains strictly separated from `/admin`. Non-admin members attempting to access `/admin` are redirected to `/dashboard` rather than receiving a deceptive login prompt.

---

## ADR-019 — Anonymous vs. Authenticated Order Placement

**Status:** Accepted

**Date:** 2026-09-20

**Context:** TASK.md P0-601 requires customer information for orders. We needed to decide whether customer account creation/login should be mandatory before ordering circular products.

**Decision:** Allow guest (anonymous) checkout by collecting customer name, email, phone, and delivery address directly in the order form, while capturing `user_id` if the user is currently authenticated (matching the established pattern in `donations`).

**Why:** Enforcing mandatory registration increases drop-off friction for customers who wish to support circular social products. Linking `user_id` when authenticated allows seamless member order history tracking without blocking anonymous buyers.

**Consequences:** `orders.user_id` is a nullable foreign key to `auth.users(id)`. Public order tracking (`/pesanan/[reference]`) is accessible using the human-readable order reference without exposing sensitive account credentials or other customers' orders.

---

## ADR-020 — Inventory Decrement Exclusively at Payment Verification

**Status:** Accepted

**Date:** 2026-09-20

**Context:** P0-601 specifies that product inventory should only decrement at the agreed transactional point. We must choose whether to decrement stock at initial checkout submission (`PENDING_PAYMENT`) or upon payment verification (`PAID`).

**Decision:** Decrement product `stock_quantity` strictly when the order transitions to `PAID`. Initial order creation in `PENDING_PAYMENT` validates that sufficient stock is available, but does not deduct physical stock from `products`.

**Why:** In a manual bank transfer or asynchronous payment workflow, holding or decrementing inventory for unpaid orders risks locking limited community craft inventory against unpaid/abandoned drafts. Decrementing upon verified payment ensures inventory reflects actual finalized commitments.

**Consequences:** Admin payment confirmation (or future payment webhook callbacks) must decrement product stock and verify available quantity in a single transaction.

**Implementation note (2026-09-20, Phase 6 audit):** The first implementation of `confirmOrderPaymentAction` decremented stock via an application-level read-then-write loop per item, which did not actually satisfy "single transaction" and was vulnerable to a TOCTOU race between two concurrent payment confirmations touching the same product. Fixed by moving the entire operation into a single `SECURITY DEFINER` Postgres function, `execute_order_payment_confirmation` (`supabase/migrations/013_order_payment_fixes.sql`), which row-locks the order and every affected product (`FOR UPDATE`) and performs validation + decrement + status transition atomically — mirroring the pattern already used correctly by `execute_social_allocation` (ADR "P0-604"). The function also rejects confirmation of an already-`CANCELLED` order, and the generic `updateOrderStatusAction` now refuses `status = "PAID"` entirely (it can only be reached through this RPC), closing a second path that could otherwise leave `payment_status` and `stock_quantity` inconsistent with `status`.

---

## ADR-021 — Payment Integration Boundary and Manual Confirmation Provider

**Status:** Accepted

**Date:** 2026-09-20

**Context:** TASK.md P0-602 states that payment provider selection (Midtrans, Xendit, etc.) is a separate decision. The platform needs an order and payment lifecycle that can be verified and tested immediately without hard-coding or locking into an external provider.

**Decision:** Define an abstract TypeScript interface `PaymentProvider` (`createPaymentIntent`, `verifyCallback`). Provide `ManualConfirmationProvider` as the initial concrete implementation, where customers transfer to official community bank accounts and administrators verify the transfer via the protected back-office dashboard (`/admin/orders/[id]`).

**Why:** Decouples payment gateway APIs and vendor SDKs from core orders, inventory, and revenue domain logic. Switching to or adding an automated payment gateway later requires only writing a new class that implements `PaymentProvider`, with zero rewrites to order states, inventory decrement routines, or revenue recording.

**Consequences:** Client and server code interact solely with domain actions. Payment status mutations cannot be forged from the client and require `requireAdmin()` server authorization.

---

## ADR-022 — Social Program Identity: FK + Retained Snapshot, Not a Breaking Migration

**Status:** Accepted

**Date:** 2026-09-20

**Context:** Phase 6 (`011_social_allocations.sql`) added `social_allocations.program_name TEXT` as an explicit, documented temporary limitation, because `social_programs` did not exist yet. Phase 7 now creates that table (`014_social_programs.sql`, P0-701). The question is how to link the two without breaking existing allocation rows or losing historical accuracy.

**Decision:** Add a nullable `social_allocations.program_id UUID REFERENCES social_programs(id) ON DELETE SET NULL` alongside the existing `program_name TEXT` column. Keep `program_name` permanently — it is not deprecated or backfilled-then-dropped. New allocations created through the admin UI/RPC populate both fields; the RPC `execute_social_allocation` gained an optional `p_program_id` parameter with a default of `NULL` so existing callers keep working unmodified.

**Why:** `program_name` at allocation time is a financial-record snapshot, the same pattern already used for `order_items.product_name_snapshot`/`product_price_snapshot` (P0-601) and consistent with DATABASE.md's "prefer append-only history for financial/audit events." If a program is later renamed, historical allocation records must keep reading the name as it was when the money was actually allocated — a live join through `program_id` would silently rewrite history. `ON DELETE SET NULL` (not `RESTRICT`) on `program_id` means a program record can be archived/removed later without blocking deletion or corrupting the allocation ledger, since `program_name` alone remains sufficient to read old records.

**Consequences:** Every read of `social_allocations` for display purposes should prefer `program_name` (the snapshot) over a live join to `social_programs.name` through `program_id`, which exists only for filtering/relational queries (e.g. "sum allocated to program X") and UI convenience linking (e.g. deep-linking to the program's admin page).

---

## ADR-023 — Beneficiary Privacy Model: No Public Projection Yet, Admin-Only by Default

**Status:** Accepted

**Date:** 2026-09-20

**Context:** ARSITEKTUR.md §5.13 and §17.5 require that beneficiary data be strictly separated from any public projection, and DATABASE.md mandates RLS for beneficiary data. `beneficiaries` (P0-702) carries a `consent_status` and `privacy_level` schema (`PRIVATE`/`ALIAS_ONLY`/`PUBLIC`) intended to eventually gate what a future public-facing impact story or program page may show about a real person.

**Decision:** For this Phase 7 iteration, `beneficiaries` has **no public SELECT RLS policy at all** — not even a narrowed one filtered by `privacy_level`/`consent_status`. Every read of this table goes through `requireAdmin()`-gated Server Actions only. The `privacy_level`/`consent_status` columns are captured now (so the data model doesn't need another breaking migration later) but are not yet wired to any public-facing query or page.

**Why:** Building a "safe" public projection correctly (one that reliably never leaks `PRIVATE` or `NOT_REQUESTED`/`PENDING`/`DECLINED`/`REVOKED` consent records even under future refactors) deserves its own deliberate design pass — most naturally as part of Phase 8's "Transparency & Impact Engine," which already owns the public data pipeline (`Operational DB → Validation → Verified Metrics → Aggregation → Public Projection`, ARSITEKTUR.md §13). Wiring a narrow public view now, ahead of that pipeline, risks a privacy bug being introduced under schedule pressure without the review such sensitive data deserves. An admin-only table with zero public exposure is strictly safer than a partially-correct public view.

**Consequences:** P1-704 (Impact story publishing) and any future public beneficiary-facing content must be built against a dedicated public projection (view or RPC) created in Phase 8, never a direct query against `beneficiaries`. This ADR should be revisited/superseded when that projection is built.

---

## ADR-024 — Distribution-Against-Allocation Balance Validation: Atomic RPC, Following the Established Pattern

**Status:** Accepted

**Date:** 2026-09-20

**Context:** P0-703 requires that a distribution's funding source be trackable back to a social allocation, and ARSITEKTUR.md §24 states allocation/distribution amounts must never exceed what is available. The Phase 6 audit (see the ADR-020 implementation note above) found that a naive application-level "read balance, then insert" pattern is vulnerable to a TOCTOU race between concurrent writes — first caught in `confirmOrderPaymentAction`'s stock decrement, after `execute_social_allocation` had already established the correct atomic pattern for allocation-vs-revenue balance checks.

**Decision:** `distributions` validates its amount against the remaining balance of its linked `social_allocations` row (when one is set) via a single `SECURITY DEFINER` Postgres function, `execute_distribution` (`016_distributions.sql`), which locks the allocation row (`FOR UPDATE`) and recomputes `SUM(distributions.amount) WHERE allocation_id = ... AND approval_status = 'APPROVED'` within the same transaction before inserting.

**Why:** Applies the lesson from the Phase 6 audit proactively instead of shipping the naive version and fixing it later. Two admins concurrently recording distributions against the same allocation must not both pass a stale balance check.

**Consequences:** Any future domain logic that checks a derived balance before writing a dependent record (this codebase now has three instances: `execute_social_allocation` for revenue→allocation, `execute_order_payment_confirmation` for stock, `execute_distribution` for allocation→distribution) should default to this same locked-RPC shape rather than an application-level check-then-insert, unless a specific reason is documented for why the race is acceptable.

---

## ADR-025 — Public Impact Aggregation: Narrow SECURITY DEFINER RPCs, Not Direct Table Queries

**Status:** Accepted

**Date:** 2026-09-20

**Context:** P0-802 requires `/dampak` and `/transparansi` to show real, verified aggregate numbers to public visitors — no session, anon Supabase client (`lib/supabase/server.ts` `createClient()` always uses the visitor's own session, never service role). The Phase 8 audit found the first implementation of `getPublicImpactSummary()` queried `donations`, `production_batches`, `batch_inputs`, and `social_allocations` directly with that anon client. Under those tables' actual RLS:
- `donations_owner_read` (`001_donation_foundation.sql`) is `USING (user_id = auth.uid() OR user_id IS NULL)`. For an anonymous visitor `auth.uid()` is `NULL`, so only donations with `user_id IS NULL` (anonymous donations) are visible — every donation made by a logged-in member silently disappears from the public aggregate. No error, no warning, just a wrong (undercounted) number.
- `production_batches`, `batch_inputs`, `social_allocations` all carry admin-only policies (`FOR ALL TO authenticated USING (is_admin())`) with **no public SELECT policy whatsoever**. A direct query from the anon client on these tables always returns zero rows — which the aggregation code cannot distinguish from "no data exists yet," so it always rendered `"no_data"` in production regardless of how much real data existed.

This directly undermined the page's own stated purpose ("every number here is real, verified, not an estimate") — the numbers weren't fabricated, but they were systematically wrong or permanently empty due to an RLS boundary the aggregation code crossed without noticing.

**Decision:** Six of the seven public metrics (`waste_collected_liters`, `waste_collected_kg`, `donations_verified`, `waste_processed`, `production_batches_completed`, `social_allocation_total`) are computed by narrow, read-only `SECURITY DEFINER` Postgres functions (`get_public_impact_*`, `017_public_impact_aggregation.sql`) that return **only an already-aggregated SUM/COUNT value**, never raw rows, and are explicitly `GRANT EXECUTE`'d to the `anon` role. `social_programs_count` is the one exception and keeps querying `social_programs` directly, because that table already has a correct public SELECT policy (`social_programs_public_read`, scoped to `public_status = true`) — no RPC is needed there.

**Why:** A `SECURITY DEFINER` function that returns one aggregated number cannot leak anything RLS would otherwise protect (no individual donor, beneficiary, order, or allocation row is ever exposed through it) while still correctly seeing *all* the underlying data, not just the subset visible to an anonymous session. This is the same trust boundary already established for `execute_social_allocation`, `execute_order_payment_confirmation`, and `execute_distribution` (ADR-020/024): cross an RLS boundary deliberately and narrowly, through a function whose entire contract is auditable in one place, rather than by weakening a table's RLS policy itself (which would also expose it to authenticated non-admin users) or by querying with an admin/service-role client from a public page (which would defeat RLS entirely for that request).

**Consequences:** Any future public metric that aggregates over a table with owner-scoped or admin-only RLS must follow this same pattern — a dedicated `get_public_impact_*` (or similarly named) RPC that returns only the aggregate, granted to `anon` — rather than a direct `.from(...)` query from `lib/domain/impact/public-impact.ts` or any other public-facing code path. `tests/public-impact-rls-boundary.test.mjs` guards against regressing to a direct query against the four tables named above.

---

## ADR-026 — Phase 9 RBAC Uses a Checked Role Column and Granular Boundaries

**Status:** Accepted

**Date:** 2026-09-20

**Decision:** Keep `profiles.role` as `TEXT` with a database `CHECK`, and centralize the fixed MVP matrix in `lib/auth/permissions.ts` plus the equivalent database `has_permission()` function. Existing lowercase `admin` rows are promoted to `SUPER_ADMIN`, while `member` becomes `MEMBER`. The compatibility helper `is_admin()` means exactly `SUPER_ADMIN` or `ADMIN`. Server actions use module-specific read/write checks, navigation and dashboard use the same matrix for visibility, and RLS policies enforce module access independently. No role/permission join tables or per-user overrides are introduced.

**Why:** Promoting legacy admins preserves all capabilities they already had. A checked text column fits the existing schema and the fixed five-role MVP without adding a second permission source in relational tables. Finance and beneficiary access stay separate. Distribution additionally requires beneficiary permission because its rows reveal a beneficiary relationship.

**Consequences:** Changes to the official matrix must update TypeScript, migration logic, ARSITEKTUR §11, and its sync test together. UI visibility never grants access. Migration `018_rbac_roles.sql` must be applied before deploying the new application code.

---

## ADR-027 — Explicit, Append-Only Audit Events

**Status:** Accepted

**Date:** 2026-09-20

**Decision:** Use explicit `recordAuditLog()` calls after critical server mutations. `audit_logs` has SELECT-only RLS for all five staff roles and no direct client write policy. Its allowlisted `SECURITY DEFINER` append RPC (`record_audit_log`) is executable only by `service_role`. The first iteration wires `ORDER_PAID`, `REVENUE_RECORDED`, `ALLOCATION_CREATED`, and `BENEFICIARY_UPDATED`. Beneficiary audit payloads record status/field names only, never names, needs, or notes.

**Why:** Explicit events are reviewable and avoid a generic trigger copying entire sensitive rows. They also allow a reason and a minimal old/new projection suited to each business action.

**Consequences:** Audit writing currently follows the successful domain mutation as a separate best-effort RPC; an audit RPC failure is logged but does not roll back the completed business transaction. Events listed in ARSITEKTUR §18 but not wired above remain documented follow-up work in TASK.md. Migration `019_audit_logs.sql` must be applied after `018`.

**Correction (2026-09-20, Phase 9 audit):** The first implementation had `recordAuditLog()` call `requirePermission()` again internally, re-deriving and re-checking the caller's authorization *after* the underlying mutation had already been committed. This was a real bug, not defense-in-depth: `requirePermission()` can call Next.js `redirect()`, which throws a special error that the function's own generic `try/catch` would silently swallow (logged only, never actually redirecting) — so a genuine authorization failure at that point would just quietly drop the audit entry for an action that had already happened, with no signal to anyone. It was also redundant: the caller had already been gated by its own `requirePermission()` call before the mutation. Fixed by having `recordAuditLog()` accept the caller's already-verified `actorId` as a parameter instead of re-deriving it — the real security boundary against forged audit entries was never that internal check anyway; it is that `record_audit_log` is `SECURITY DEFINER` and `GRANT EXECUTE`'d only to `service_role`, so no client-side or `anon`/`authenticated`-role code path can call it regardless of what `recordAuditLog()` itself checks.

---

## ADR-028 — Write-RPC Authorization: Explicit REVOKE/GRANT Plus an In-Function Permission Guard

**Status:** Accepted

**Date:** 2026-09-20

**Context:** The Phase 9 audit found that four `SECURITY DEFINER` RPCs introduced in earlier phases — `execute_social_allocation` (allocating social funds, Phase 6/7), `execute_order_payment_confirmation` (confirming payment + decrementing stock, Phase 6), `execute_distribution` (distributing funds/items to a beneficiary, Phase 7), and `update_revenue_reconciliation` (mutating the revenue ledger's reconciliation status, Phase 6) — never received an explicit `REVOKE`/`GRANT`. Postgres grants `EXECUTE` on a newly created function to `PUBLIC` by default. For a `SECURITY DEFINER` function this means any authenticated session — not just staff, a plain `MEMBER` too — could call it directly via `supabase.rpc(...)` from a browser console and have it genuinely execute, completely bypassing every `requirePermission()` check in `lib/domain/admin/*.ts` (those checks only guard the Server Action call path, never the RPC itself). This directly violated AGENTS.md §14's requirement to use "all applicable layers" (UI + server authorization + database RLS) — the database layer was entirely absent for these four functions specifically.

**Decision:** `supabase/migrations/020_rpc_grant_hardening.sql` re-declares all four functions (`CREATE OR REPLACE`, identical signature and logic) with two additions: (1) `REVOKE ALL ... FROM PUBLIC` followed by `GRANT EXECUTE ... TO authenticated`, closing the anon/public gap; (2) an in-function guard, `IF NOT public.has_permission('<module>', 'write') THEN RAISE EXCEPTION ... END IF;` at the top of the function body, using the exact same RBAC matrix (`has_permission`, `018_rbac_roles.sql`) as every other authorization check in the system.

**Why:** `GRANT ... TO authenticated` alone is not sufficient — `authenticated` includes every staff role and every `MEMBER`, not just the roles the ARSITEKTUR.md §11 matrix actually permits for that module (e.g. a `SOCIAL_OFFICER` has `orders_sales: read` only, so they must not be able to call `execute_order_payment_confirmation` even though they are staff). The in-function `has_permission()` check makes the database layer independently correct rather than merely "not wide open," consistent with the "UI + server + RLS" layering principle this phase exists to establish everywhere else.

**Consequences:** Any future `SECURITY DEFINER` RPC that mutates sensitive data must follow this same two-part pattern (explicit `REVOKE`/`GRANT` to `authenticated`, plus an internal `has_permission()` guard matching the module the mutation belongs to) from the moment it is first written — not added later as an audit fix. `tests/rpc-grant-hardening.test.mjs` guards the four functions named above against regressing to an ungranted or unguarded state; any new critical write RPC should be added to that test's `CRITICAL_WRITE_RPCS` list when it is introduced.

---

## Agent Rule

Before introducing a major architectural change, search this document first.

If an existing decision no longer fits reality, add a new ADR that supersedes the old one. Do not silently rewrite history.
