# TASK.md — KITA TUMBUH / KAMPUNG SMART FARMING

> **Implementation Roadmap & Execution Backlog**
>
> **Status:** Approved v1.0  
> **Master Brand:** KITA TUMBUH  
> **Platform / Ekosistem:** KAMPUNG SMART FARMING  
> **Tagline:** Dari Limbah, Tumbuh Manfaat.  
> **Core Statement:** SAMPAH KALIAN SANGAT BERARTI BAGI KAMI  
> **Stack:** TypeScript + Next.js + Supabase PostgreSQL  
> **Related:** `RPD.md`, `ARSITEKTUR.md`, `WIREFRAME.md`, `DESIGN_SYSTEM.md`, `AGENTS.md`

---

## 0. Purpose

Dokumen ini mengubah product requirements, system architecture, dan wireframe KITA TUMBUH / KAMPUNG SMART FARMING menjadi pekerjaan yang dapat dieksekusi oleh manusia maupun coding agent.

Urutan kerja harus menjaga prinsip:

```text
Foundation
   ↓
Design System
   ↓
Public Experience
   ↓
Donation Experience
   ↓
Auth + Member Area
   ↓
Operational Admin
   ↓
Impact + Transparency
   ↓
SEO + AI Discoverability
   ↓
Testing + Security
   ↓
Production
```

Jangan melompat langsung ke dashboard admin sebelum public donation journey memiliki fondasi yang stabil.

---

# 1. Definition of Done Global

Sebuah task dianggap selesai jika:

- implementasi mengikuti arsitektur dan naming convention yang telah ditetapkan;
- TypeScript strict tanpa `any` yang tidak beralasan;
- responsive minimal untuk mobile, tablet, dan desktop;
- loading, empty, error, dan success state tersedia ketika relevan;
- akses keyboard dan semantic HTML dipertimbangkan;
- data sensitif tidak bocor ke public client;
- tidak ada credential/secret di source code;
- lint/typecheck/build berhasil;
- perubahan penting mempunyai test atau verification yang sesuai;
- tidak membuat placeholder yang terlihat seperti fitur sudah benar-benar tersedia;
- copy publik tidak mengandung lorem ipsum, hype kosong, atau angka dampak palsu.

---

# 2. Priority Legend

| Priority | Meaning |
|---|---|
| P0 | Blocker / core MVP. Harus selesai agar produk utama bekerja. |
| P1 | Penting untuk usability, trust, atau operational readiness. |
| P2 | Improvement setelah core flow stabil. |
| P3 | Eksperimen/future enhancement. |

Status:

```text
[ ] Todo
[~] In Progress
[x] Done
[-] Blocked
```

---

# 3. Phase 0 — Project Foundation

## P0-001 — Initialize Next.js project

- [x] Buat project Next.js berbasis App Router.
- [x] Aktifkan TypeScript strict.
- [x] Konfigurasi linting dan formatting.
- [x] Pastikan `dev`, `lint`, `typecheck`, dan `build` tersedia.
- [x] Tetapkan Node.js version melalui project configuration.
- [x] Buat baseline README dan environment documentation.

**Acceptance:** project dapat dijalankan lokal dengan command standar dan production build berhasil.

## P0-002 — Establish source structure

- [x] Tentukan struktur `app/`, `components/`, `lib/`, `server/`, `types/`, `content/`, `public/`, dan `tests/` sesuai kebutuhan.
- [x] Pisahkan server-only utilities dari browser code.
- [x] Buat barrel exports hanya jika benar-benar membantu readability.
- [x] Hindari folder structure yang terlalu dalam tanpa alasan.

## P0-003 — Environment configuration

- [x] Definisikan environment variables yang dibutuhkan.
- [x] Pisahkan public variables dari server-only secrets.
- [x] Tambahkan `.env.example` tanpa secret nyata.
- [x] Validasi environment saat startup/build bila memungkinkan.

## P0-004 — Supabase foundation

- [x] Hubungkan Supabase project.
- [x] Konfigurasi PostgreSQL access sesuai environment.
- [x] Siapkan migration workflow.
- [x] Pastikan service-role key hanya digunakan server-side jika memang diperlukan.
- [x] Dokumentasikan local/staging/production environment.

---

# 4. Phase 1 — Design System & Content Foundation

## P0-101 — Visual design tokens

- [x] Tetapkan color tokens brand.
- [x] Tetapkan typography scale.
- [x] Tetapkan spacing scale.
- [x] Tetapkan border radius.
- [x] Tetapkan shadow/elevation secara terbatas.
- [x] Tetapkan container width.
- [x] Tetapkan responsive breakpoints.

**Anti-slop requirement:** jangan membuat semua card menjadi rounded floating boxes. Gunakan hierarchy, spacing, border, dan surface variation secara intentional.

## P0-102 — Core components

Buat komponen reusable minimal:

- [x] Button
- [x] LinkButton
- [x] Input
- [ ] Select
- [ ] Textarea
- [ ] Checkbox / Radio
- [x] Card
- [x] Badge
- [ ] Modal / Dialog
- [x] Drawer
- [ ] Toast / Alert
- [ ] Tabs
- [ ] Progress
- [ ] DataTable
- [ ] EmptyState
- [ ] ErrorState
- [ ] Skeleton
- [ ] Pagination
- [ ] Breadcrumb

## P0-103 — Public navigation

- [x] Desktop header.
- [x] Mobile navigation/drawer.
- [x] Primary CTA `Donasikan Limbah`.
- [x] Active navigation state.
- [x] Footer dengan link penting.

## P0-104 — Content model baseline

Siapkan struktur konten untuk:

- [x] hero messaging;
- [x] cara kerja;
- [x] accepted waste;
- [x] FAQ;
- [x] impact metrics;
- [x] social programs;
- [x] stories;
- [x] products;
- [x] transparency pages.

Copy awal harus dapat diganti tanpa mengubah komponen utama.

---

# 5. Phase 2 — Public Website MVP

## P0-201 — Home

- [x] Hero dengan signature line **“SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.”**
- [x] Primary CTA ke donation flow.
- [x] Secondary CTA ke cara kerja/dampak.
- [x] Impact proof strip.
- [x] How-it-works preview.
- [x] Accepted waste preview.
- [x] Product preview.
- [x] Social program preview.
- [x] Story preview.
- [x] Transparency preview.
- [x] Final CTA.

**Acceptance:** visitor memahami proposisi produk tanpa harus membuka halaman lain.

## P0-202 — `/cara-kerja`

- [ ] Jelaskan enam tahap utama.
- [ ] Tampilkan hubungan limbah → produk → sosial.
- [ ] Jelaskan apa yang terjadi setelah donor menyerahkan limbah.
- [ ] Tambahkan FAQ operasional.

## P0-203 — `/tentang-kami`

- [ ] Mission.
- [ ] Vision.
- [ ] Values.
- [ ] Operational approach.
- [ ] Team/organization information bila tersedia.
- [ ] Avoid unverifiable claims.

## P0-204 — `/dampak`

- [ ] Public impact overview.
- [ ] Filter periode.
- [ ] Waste collected.
- [ ] Waste processed.
- [ ] Products generated/sold.
- [ ] Social allocation.
- [ ] Beneficiaries.
- [ ] Data methodology link.

## P0-205 — `/transparansi`

- [ ] Explain source and update cadence of metrics.
- [ ] Monthly/periodic summary.
- [ ] Revenue and allocation summary when publishable.
- [ ] Operational notes.
- [ ] Link to supporting reports/documents when appropriate.

## P1-206 — `/program`

- [ ] Program list.
- [ ] Program detail.
- [ ] Goal and current progress.
- [ ] Source of social funds.
- [ ] Status.
- [ ] Evidence/documentation where appropriate.

## P1-207 — `/cerita`

- [ ] Story listing.
- [ ] Story detail.
- [ ] Consent/privacy review for identifiable people.
- [ ] Keep storytelling human, not exploitative.

## P1-208 — `/produk`

- [ ] Product catalog.
- [ ] Category/filter.
- [ ] Product detail.
- [ ] Product impact explanation.
- [ ] Availability state.

## P1-209 — `/collection-point`

- [ ] Search/filter locations.
- [ ] Accepted waste per location.
- [ ] Opening hours.
- [ ] Instructions.
- [ ] Directions link/CTA.

## P1-210 — `/faq`

- [ ] Donation questions.
- [ ] Accepted/rejected waste.
- [ ] Pickup/drop-off.
- [ ] Processing.
- [ ] Impact calculation.
- [ ] Product sales.
- [ ] Privacy.

---

# 6. Phase 3 — Donation Flow

## P0-301 — Donation start

- [ ] `/donasi` landing.
- [ ] Waste category selection.
- [ ] Show accepted condition.
- [ ] Show disallowed items.
- [ ] Avoid misleading “donate anything” messaging.

## P0-302 — Donation wizard

Implement a guided flow:

```text
Material
   ↓
Quantity
   ↓
Method
   ↓
Schedule / Location
   ↓
Confirmation
```

Tasks:

- [ ] Step state management.
- [ ] Client validation.
- [ ] Server validation.
- [ ] Back/next behavior.
- [ ] Preserve entered data between steps.
- [ ] Accessible labels and error messages.
- [ ] Mobile-friendly form controls.

## P0-303 — Donation submission

- [ ] Create donation record.
- [ ] Generate human-readable donation reference.
- [ ] Prevent duplicate submission on accidental refresh/click.
- [ ] Validate accepted waste type server-side.
- [ ] Validate quantity/unit server-side.
- [ ] Return clear confirmation state.

## P0-304 — Pickup scheduling

- [ ] Address capture.
- [ ] Date selection.
- [ ] Available slot logic.
- [ ] Pickup notes.
- [ ] Status lifecycle.
- [ ] Operator assignment if required.

## P0-305 — Drop-off scheduling/selection

- [ ] Collection point selector.
- [ ] Display accepted materials.
- [ ] Operating hours.
- [ ] Selected location summary.

## P0-306 — Donation tracking

Track:

```text
Submitted
→ Scheduled
→ Collected
→ Verified
→ Sorted
→ Processed
→ Converted
→ Impacted
```

- [ ] Timeline UI.
- [ ] Status timestamp.
- [ ] Status-specific copy.
- [ ] Empty/error fallback.
- [ ] User can open donation detail.

## P0-307 — Impact receipt

- [ ] Donation reference.
- [ ] Material.
- [ ] Estimated quantity.
- [ ] Actual verified quantity when available.
- [ ] Current processing status.
- [ ] Impact summary only when supported by verified data.
- [ ] Shareable public-safe version.

---

# 7. Phase 4 — Authentication & Member Area

## P0-401 — Authentication

- [ ] Sign up.
- [ ] Sign in.
- [ ] Sign out.
- [ ] Session handling.
- [ ] Password reset if password auth is enabled.
- [ ] Email verification if required.

Prefer Supabase Auth rather than custom password handling.

## P0-402 — Member dashboard

- [ ] Personal greeting.
- [ ] Total contribution.
- [ ] Donation count.
- [ ] Verified impact.
- [ ] Recent donations.
- [ ] Active pickup.
- [ ] Clear CTA to donate again.

## P0-403 — Donation history

- [ ] List donations.
- [ ] Filter by status/type/date.
- [ ] Open donation detail.
- [ ] Pagination or cursor pagination.

## P0-404 — Personal impact

- [ ] Waste contribution totals.
- [ ] Material breakdown.
- [ ] Derived product impact where data is available.
- [ ] Social impact attribution where methodology supports it.
- [ ] Explain metric definitions.

## P1-405 — Profile

- [ ] Personal information.
- [ ] Contact details.
- [ ] Pickup addresses if supported.
- [ ] Privacy settings.

---

# 8. Phase 5 — Core Operational System

## P0-501 — Waste master data

- [ ] Waste type CRUD.
- [ ] Unit definition.
- [ ] Acceptance rules.
- [ ] Safety notes.
- [ ] Active/inactive status.

## P0-502 — Donation management

- [ ] Donation queue.
- [ ] Search/filter.
- [ ] Verify donation.
- [ ] Record actual quantity.
- [ ] Assign pickup/collection point.
- [ ] Update status with audit trail.

## P0-503 — Collection / handover

- [ ] Record receipt.
- [ ] Actual quantity.
- [ ] Receiver/operator.
- [ ] Timestamp.
- [ ] Verification notes.

## P0-504 — Waste inventory

- [ ] Waste lot creation.
- [ ] Inventory ledger.
- [ ] Incoming quantity.
- [ ] Consumption/processing quantity.
- [ ] Adjustment flow with reason.
- [ ] Low-stock/aging indicators if operationally useful.

## P0-505 — Production batch

- [ ] Create batch.
- [ ] Select input waste lots.
- [ ] Record input quantity.
- [ ] Record output quantity.
- [ ] Record loss/waste where necessary.
- [ ] Link output to product.
- [ ] Close batch.

## P0-506 — Product management

- [ ] Product CRUD.
- [ ] SKU.
- [ ] Price.
- [ ] Inventory.
- [ ] Production batch relationship.
- [ ] Public visibility.
- [ ] Product images.

---

# 9. Phase 6 — Sales & Financial Flow

## P0-601 — Orders

- [ ] Create order.
- [ ] Order item snapshot (name/price at purchase time).
- [ ] Order status.
- [ ] Customer information.
- [ ] Product inventory decrement only at the agreed transactional point.

## P0-602 — Payment integration boundary

- [ ] Abstract payment provider interface.
- [ ] Keep provider-specific logic isolated.
- [ ] Verify server-side payment callbacks/webhooks.
- [ ] Do not trust client-submitted payment status.

Payment provider selection is a separate decision and should not be hard-coded into domain logic.

## P0-603 — Revenue ledger

- [ ] Record realized sales revenue.
- [ ] Keep order and financial ledger concepts separate.
- [ ] Reconciliation state.
- [ ] Audit changes.

## P0-604 — Allocation

- [ ] Define allocation record.
- [ ] Link allocation to a funding source.
- [ ] Link allocation to social program.
- [ ] Record amount.
- [ ] Record date.
- [ ] Approval status.
- [ ] Prevent allocation above available balance through server-side transaction logic.

## P1-605 — Operational expenses

- [ ] Expense records.
- [ ] Category.
- [ ] Amount.
- [ ] Date.
- [ ] Notes.
- [ ] Attachment/reference where appropriate.

---

# 10. Phase 7 — Social Program & Beneficiary

## P0-701 — Social program management

- [ ] Program CRUD.
- [ ] Goal.
- [ ] Status.
- [ ] Target amount if applicable.
- [ ] Funding status.
- [ ] Public/private visibility.

## P0-702 — Beneficiary management

- [ ] Beneficiary record.
- [ ] Category.
- [ ] Need/assistance type.
- [ ] Verification status.
- [ ] Consent/privacy status.
- [ ] Public display policy.

## P0-703 — Distribution

- [ ] Create distribution.
- [ ] Link to program.
- [ ] Link to beneficiary.
- [ ] Funding source.
- [ ] Amount/item.
- [ ] Date.
- [ ] Evidence/document reference.
- [ ] Approval/audit trail.

## P1-704 — Impact story publishing

- [ ] Story draft.
- [ ] Review/approval.
- [ ] Consent verification.
- [ ] Publish/unpublish.
- [ ] Link story to program/impact records where appropriate.

---

# 11. Phase 8 — Transparency & Impact Engine

## P0-801 — Impact calculation definitions

Document every public metric.

Example:

```text
Waste Collected
= sum verified received quantities
for selected period
```

```text
Social Allocation
= sum approved social allocation records
published for selected period
```

No metric may be published without a defined source.

## P0-802 — Public impact aggregation

- [ ] Aggregate verified records.
- [ ] Filter by period.
- [ ] Filter by material where useful.
- [ ] Handle privacy boundaries.
- [ ] Cache/ISR only when safe and necessary.

## P0-803 — Transparency report

- [ ] Period summary.
- [ ] Methodology.
- [ ] Data freshness.
- [ ] Operational caveats.
- [ ] Source/report references.

## P1-804 — Donation-to-impact trace

Where data quality supports it, visualize:

```text
Donation
→ Collection
→ Waste Lot
→ Production Batch
→ Product
→ Sale
→ Social Allocation
→ Program
```

Do not imply direct one-to-one financial causality when the accounting model is pooled.

---

# 12. Phase 9 — Admin & RBAC

## P0-901 — Role model

Minimum roles:

```text
SUPER_ADMIN
ADMIN
OPERATOR
FINANCE
SOCIAL_OFFICER
```

## P0-902 — Permission matrix

- [ ] Create permission list.
- [ ] Map roles to permissions.
- [ ] Enforce on server.
- [ ] UI visibility is only a convenience, not authorization.

## P0-903 — Admin dashboard

- [ ] Operations overview.
- [ ] Donation queue.
- [ ] Waste stock.
- [ ] Production.
- [ ] Product inventory.
- [ ] Orders.
- [ ] Finance summary.
- [ ] Social programs.
- [ ] Alerts/actions requiring attention.

## P0-904 — Audit log

Log important mutations:

- [ ] actor;
- [ ] action;
- [ ] entity;
- [ ] entity id;
- [ ] old/new value where appropriate;
- [ ] reason when required;
- [ ] timestamp.

Avoid storing sensitive values unnecessarily.

---

# 13. Phase 10 — SEO & AI Discoverability

## P0-1001 — Metadata foundation

- [ ] Unique title per indexable page.
- [ ] Useful description.
- [ ] Canonical URL.
- [ ] Open Graph image/title/description.
- [ ] Correct robots policy.

## P0-1002 — Sitemap

- [ ] Generate dynamic sitemap for public indexable routes.
- [ ] Exclude authenticated/admin pages.
- [ ] Exclude duplicate/temporary URLs.

## P0-1003 — Robots

- [ ] Public pages crawlable.
- [ ] Private routes blocked appropriately.
- [ ] Do not accidentally block CSS/critical assets.

## P0-1004 — Structured data

Implement only schema types actually supported by page content, such as:

- [ ] Organization.
- [ ] WebSite.
- [ ] BreadcrumbList.
- [ ] FAQPage where eligible and genuinely represented.
- [ ] Product for product detail pages where data is complete.
- [ ] Article where story/article content meets the structure.

## P0-1005 — Semantic content

- [ ] One meaningful H1 per primary page.
- [ ] Logical H2/H3 hierarchy.
- [ ] Important information in crawlable HTML.
- [ ] Image alt text based on actual image purpose.
- [ ] Descriptive anchor text.
- [ ] Internal links between conceptually related pages.

## P1-1006 — AI-friendly information architecture

- [ ] Clear organization identity page.
- [ ] Explicit explanation of accepted waste.
- [ ] Explicit explanation of operational flow.
- [ ] Public definitions for impact metrics.
- [ ] FAQ with direct factual answers.
- [ ] Stable URLs.
- [ ] Consistent entity naming across pages.
- [ ] Avoid keyword stuffing and synthetic filler.

---

# 14. Phase 11 — Performance

## P0-1101 — Core page performance

- [ ] Optimize hero imagery.
- [ ] Avoid unnecessary client-side JavaScript.
- [ ] Prefer Server Components for static/public content.
- [ ] Use Client Components only when interaction requires them.
- [ ] Lazy-load below-the-fold heavy media when appropriate.
- [ ] Avoid oversized dependencies.

## P0-1102 — Data fetching strategy

- [ ] Public content: server-side fetch where appropriate.
- [ ] User data: authenticated server-side access where possible.
- [ ] Mutations: Server Actions or Route Handlers based on use case.
- [ ] Avoid fetching sensitive data into client components unnecessarily.

## P1-1103 — Image strategy

- [ ] Use optimized image delivery.
- [ ] Explicit dimensions/aspect ratios.
- [ ] Avoid layout shift.
- [ ] Define focal crop for editorial imagery.

## P1-1104 — Loading performance verification

- [ ] Measure key pages with Lighthouse/PageSpeed in staging.
- [ ] Identify LCP/CLS/INP issues.
- [ ] Fix actual bottlenecks instead of blindly optimizing.

---

# 15. Phase 12 — Accessibility

## P0-1201 — Keyboard accessibility

- [ ] All interactive controls keyboard reachable.
- [ ] Visible focus state.
- [ ] Logical tab order.
- [ ] Dialog focus management.
- [ ] Escape behavior where relevant.

## P0-1202 — Forms

- [ ] Labels linked to controls.
- [ ] Error messages associated with fields.
- [ ] Required state announced correctly.
- [ ] Do not rely on color alone.

## P0-1203 — Visual accessibility

- [ ] Sufficient contrast.
- [ ] Text remains readable on mobile.
- [ ] Focus state visible.
- [ ] Motion is restrained and can respect reduced-motion preferences.

---

# 16. Phase 13 — Security & Data Integrity

## P0-1301 — Authorization

- [ ] Every privileged mutation checks authorization server-side.
- [ ] Admin routes protected.
- [ ] Member routes protected.
- [ ] Role escalation prevented.

## P0-1302 — Supabase Row Level Security

- [ ] Define RLS policies for user-owned records.
- [ ] Define staff/admin access policies.
- [ ] Test unauthorized reads/writes.
- [ ] Keep service-role credentials server-only.

## P0-1303 — Input validation

- [ ] Validate all externally supplied data.
- [ ] Validate enums/status transitions.
- [ ] Validate quantity/unit combinations.
- [ ] Sanitize rich text/content where applicable.

Use a runtime schema validation library such as Zod when appropriate.

## P0-1304 — Mutation integrity

For important operations use transactional logic where necessary:

```text
Order paid
   ↓
Verify payment
   ↓
Reserve/decrement inventory
   ↓
Record financial event
```

Similarly:

```text
Production completed
   ↓
Consume waste inventory
   ↓
Create output inventory
   ↓
Record batch completion
```

Avoid partially successful state transitions.

---

# 17. Phase 14 — Testing

## P0-1401 — Unit tests

Cover:

- [ ] impact calculations;
- [ ] status transition rules;
- [ ] allocation validation;
- [ ] quantity/unit validation;
- [ ] permission checks;
- [ ] formatting helpers;
- [ ] pure business rules.

## P0-1402 — Integration tests

Cover:

- [ ] donation creation;
- [ ] donation verification;
- [ ] inventory mutation;
- [ ] production batch completion;
- [ ] order/payment state;
- [ ] social allocation;
- [ ] RBAC boundaries.

## P0-1403 — E2E tests

Minimum critical journeys:

```text
Visitor → Donation → Confirmation
Member → Login → Donation History → Tracking
Operator → Verify Donation → Inventory
Operator → Production Batch → Product Stock
Customer → Product → Order
Finance → Revenue → Allocation
Social Officer → Program → Distribution
Public → Impact → Transparency
```

## P0-1404 — Accessibility verification

- [ ] Automated accessibility scan.
- [ ] Keyboard walkthrough.
- [ ] Mobile touch interaction review.
- [ ] Form error review.

---

# 18. Phase 15 — Content & Trust QA

## P0-1501 — No fake impact data

- [ ] Replace all invented demo metrics before production.
- [ ] Clearly label seeded/staging data.
- [ ] Production counters must come from verified records.

## P0-1502 — Social proof verification

- [ ] Obtain consent for published stories/photos.
- [ ] Verify program status.
- [ ] Verify financial figures.
- [ ] Verify beneficiary descriptions.

## P0-1503 — Copy QA

Review every public page for:

- [ ] clarity;
- [ ] warmth;
- [ ] factual accuracy;
- [ ] consistent terminology;
- [ ] no excessive hype;
- [ ] no manipulative guilt framing;
- [ ] signature sentence appears intentionally, not repetitively.

---

# 19. Phase 16 — Anti-Slop Design QA

Before a page is marked complete, ask:

### Visual hierarchy

- [ ] Is there a clear primary message?
- [ ] Does the eye know what to read/click first?
- [ ] Is whitespace intentional?

### Distinctiveness

- [ ] Does the page have a KITA TUMBUH / KAMPUNG SMART FARMING visual/content identity?
- [ ] Could this page be mistaken for a generic SaaS/charity template?
- [ ] Are decorative elements doing real communication work?

### Content

- [ ] No generic AI filler.
- [ ] No repeated sentences in different sections.
- [ ] No fake quotes.
- [ ] No unsupported statistics.

### UX

- [ ] CTA is specific.
- [ ] Forms are understandable.
- [ ] Error states help users recover.
- [ ] Mobile layout is intentional rather than merely stacked desktop.

### Technical

- [ ] No unnecessary client components.
- [ ] No repeated API calls without reason.
- [ ] No hidden hard-coded business values that belong in configuration/data.

---

# 20. Phase 17 — Seed & Demo Data

## P1-1701 — Development seed data

Create clearly marked non-production data for:

- [ ] waste types;
- [ ] collection points;
- [ ] donations;
- [ ] waste lots;
- [ ] production batches;
- [ ] products;
- [ ] orders;
- [ ] programs;
- [ ] beneficiaries;
- [ ] allocations.

Seed data must visibly indicate staging/demo context.

## P1-1702 — Demo journeys

Prepare deterministic flows for UI review:

1. Donor submits 5 L cooking oil for pickup.
2. Operator verifies 4.5 L received.
3. Waste becomes production input.
4. Production generates products.
5. Product is sold.
6. Verified social allocation appears in transparency.

The numbers are illustrative only and must not be displayed publicly as real impact.

---

# 21. Phase 18 — Production Readiness

## P0-1801 — Production environment

- [ ] Production Supabase configured.
- [ ] Production environment variables configured securely.
- [ ] Database migrations applied.
- [ ] RLS policies verified.
- [ ] Auth redirect URLs verified.
- [ ] Domain configured.

## P0-1802 — Observability

- [ ] Error tracking.
- [ ] Server logs.
- [ ] Critical mutation logging.
- [ ] Basic uptime monitoring.
- [ ] Alerting for critical failures.

## P0-1803 — Backup / recovery

- [ ] Database backup policy confirmed.
- [ ] Recovery procedure documented.
- [ ] Storage backup strategy confirmed if files are business-critical.

## P0-1804 — SEO production check

- [ ] robots.txt verified.
- [ ] sitemap verified.
- [ ] canonical URLs verified.
- [ ] Open Graph verified.
- [ ] structured data validated.
- [ ] no staging URLs indexed.

## P0-1805 — Final release checklist

- [ ] `lint` passes.
- [ ] typecheck passes.
- [ ] tests pass.
- [ ] production build passes.
- [ ] critical E2E journeys pass.
- [ ] accessibility review completed.
- [ ] no secret in repository.
- [ ] no fake production statistics.
- [ ] legal/privacy/contact information reviewed.

---

# 22. Suggested Delivery Order

Jangan mengerjakan berdasarkan folder atau jumlah halaman. Prioritaskan berdasarkan pengalaman inti.

```text
SPRINT 1
Project foundation
Design tokens
Core components
Home skeleton

SPRINT 2
Public pages
Donation wizard UI
Collection point
FAQ

SPRINT 3
Supabase
Auth
Donation backend
Donation tracking

SPRINT 4
Member dashboard
Impact personal
Admin donation management

SPRINT 5
Waste inventory
Production batches
Products

SPRINT 6
Orders
Payment boundary
Revenue
Social programs
Allocations

SPRINT 7
Transparency
Public impact
Stories

SPRINT 8
RBAC
Audit logs
Security hardening

SPRINT 9
SEO
Structured data
Performance
Accessibility

SPRINT 10
E2E
Content QA
Anti-slop review
Production readiness
```

---

# 23. MVP Cut Line

Jika waktu/kapasitas terbatas, MVP berhenti setelah fitur berikut benar-benar stabil:

```text
Public Home
+ Cara Kerja
+ Accepted Waste
+ Donation Flow
+ Pickup/Drop-off
+ Donation Tracking
+ Auth
+ Member Donation History
+ Admin Donation Verification
+ Waste Inventory
+ Production Batch
+ Product Catalog
+ Basic Orders
+ Social Program
+ Basic Transparency
+ SEO Foundation
+ Security/RLS
+ Critical Tests
```

Fitur seperti loyalty, gamification lanjutan, AI assistant, marketplace kompleks, dan analytics tingkat lanjut masuk setelah core loop terbukti bekerja.

---

# 24. Core Product Loop — Release Gate

Produk belum dianggap berhasil hanya karena halaman sudah terlihat bagus.

Release MVP harus mampu menjalankan loop berikut secara nyata:

```text
USER
 ↓
DONATES WASTE
 ↓
SYSTEM RECORDS DONATION
 ↓
OPERATOR RECEIVES & VERIFIES
 ↓
WASTE ENTERS INVENTORY
 ↓
PRODUCTION CONSUMES INPUT
 ↓
PRODUCT IS CREATED
 ↓
PRODUCT IS SOLD
 ↓
REVENUE IS RECORDED
 ↓
SOCIAL ALLOCATION IS APPROVED
 ↓
PROGRAM RECEIVES SUPPORT
 ↓
PUBLIC IMPACT DATA IS UPDATED
 ↓
DONOR CAN SEE VERIFIED PROGRESS
```

### Final principle

> **Build the proof of impact before building the spectacle of impact.**

Website yang indah harus membantu data dan cerita yang benar menjadi mudah dipahami — bukan menutupi proses yang belum ada.
