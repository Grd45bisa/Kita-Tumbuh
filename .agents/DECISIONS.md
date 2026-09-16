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

## Agent Rule

Before introducing a major architectural change, search this document first.

If an existing decision no longer fits reality, add a new ADR that supersedes the old one. Do not silently rewrite history.
