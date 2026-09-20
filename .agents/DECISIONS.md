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

## Agent Rule

Before introducing a major architectural change, search this document first.

If an existing decision no longer fits reality, add a new ADR that supersedes the old one. Do not silently rewrite history.
