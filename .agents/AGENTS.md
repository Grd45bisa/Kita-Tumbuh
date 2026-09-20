# AGENTS.md

## 1. Purpose

This file defines the operating rules for AI coding agents working on the waste-donation and social-impact platform.

The agent must treat the project documentation as the source of truth:

1. `RPD.md` — product requirements and experience principles
2. `ARSITEKTUR.md` — system architecture and domain boundaries
3. `WIREFRAME.md` — screen structure and UX behavior
4. `TASK.md` — implementation backlog and execution order
5. `AGENTS.md` — engineering rules in this file

When documents conflict, resolve them in this order:

`RPD.md` → `ARSITEKTUR.md` → `WIREFRAME.md` → `TASK.md` → implementation detail.

Do not silently change product behavior to make implementation easier. Record required changes explicitly.

---

## 2. Product North Star & Brand Hierarchy

### Brand Architecture

```text
KITA TUMBUH (Master Brand)
└── KAMPUNG SMART FARMING (Platform / Ekosistem)
    └── Dari Limbah, Tumbuh Manfaat. (Tagline)
```

- **KITA TUMBUH**: Master brand gerakan gotong royong dan kemandirian sirkular.
- **KAMPUNG SMART FARMING**: Platform ekosistem operasional penjemputan limbah, pengolahan terpadu, pertanian pintar, dan dampak sosial.
- **Tagline**: *Dari Limbah, Tumbuh Manfaat.*
- **Core Emotional Statement**: *SAMPAH KALIAN SANGAT BERARTI BAGI KAMI*

The platform turns household waste into social value.

Core loop:

`Waste Donation → Collection → Verification → Sorting → Processing → Product → Sale → Social Fund → Social Program → Impact`

The product is not merely a waste collection website and not merely a donation landing page.

Every major feature should reinforce at least one of these outcomes:

- make contribution easy;
- make the journey understandable;
- make operations traceable;
- make impact measurable;
- make public information trustworthy.

Do not alter the core brand phrase casually. If copy changes are needed, preserve its meaning and emotional role.

---

## 3. Technology Baseline

### Required

- TypeScript
- Next.js
- Next.js App Router
- React
- Supabase PostgreSQL when persistent data is required

### Backend approach

Prefer backend capabilities inside Next.js:

- Server Components
- Server Actions
- Route Handlers
- server-side data access
- background/async mechanisms supported by the deployment environment

Do not introduce Express, NestJS, FastAPI, or another separate backend service unless there is a documented technical requirement that Next.js cannot reasonably satisfy.

### Supabase

Use Supabase for persistent application data and appropriate Supabase services.

Typical responsibilities may include:

- PostgreSQL database
- authentication
- row-level security
- storage where appropriate
- database-side constraints/functions where justified

Never expose the Supabase service-role key to the browser.

---

## 4. General Agent Behavior

### 4.1 Read before editing

Before changing an existing feature, inspect:

- the relevant documentation;
- existing route structure;
- existing components;
- current data model;
- current environment/config;
- nearby tests.

Do not replace working architecture merely because another pattern is more familiar.

### 4.2 Make the smallest coherent change

Prefer:

- focused changes;
- reusable primitives;
- existing conventions;
- incremental migrations.

Avoid unrelated refactors while implementing a task.

### 4.3 Never invent facts

Do not invent:

- beneficiaries;
- donation totals;
- product impact numbers;
- financial figures;
- operational metrics;
- testimonials;
- addresses;
- partner organizations;
- certifications;
- legal claims.

For unfinished features, use explicit non-production placeholders or realistic UI fixtures clearly marked as demo data.

Never present demo data as real impact.

### 4.4 Never fake functionality

A button labeled:

- `Konfirmasi Donasi`
- `Jadwalkan Pickup`
- `Checkout`
- `Publish Report`
- `Alokasikan Dana`

must either perform its documented action or be clearly marked as unavailable/coming soon.

Do not make fake buttons that appear successful without performing a meaningful state change.

---

## 5. UI / UX Direction
 
The website must feel:

- professional;
- warm;
- human;
- trustworthy;
- modern;
- accessible;
- fast;
- distinctive without being visually noisy.

### Hard Implementation Rules for Colors & UI

1. **Do not introduce random colors.** The product uses only three normal color families: Warm Off-White / Tulang, Green / Hijau, and Brown / Coklat.
2. **Use semantic design tokens.** Never scatter ad-hoc hex values or hardcode raw colors in components.
3. **Warm off-white is the dominant public canvas** (60–75% of surface area). The page must feel like warm natural paper, not harsh pure white or dark tech mode.
4. **Green is the primary brand/action family** (20–30% of visual weight) for primary buttons, active states, and growth indicators.
5. **Brown is secondary** (5–10% of visual weight) representing earth, soil, wood, and material craft.
6. **No gradient-heavy UI.** Avoid linear gradients as default background patterns. Flat surfaces, borders, and subtle contrast must carry structure.
7. **No bright decorative red.** A restrained earthy tone is allowed strictly for semantic error/destructive states, never as branding or decoration.
8. **No default blue/purple palette drift.** Do not accept framework or component library default styles (e.g. Tailwind/shadcn blue/purple focus rings or tags). Override them with approved green/brown tokens.
9. **Charts follow green/brown/cream.** Data visualizations must use variations of green, brown, and warm neutral tones. No rainbow charts.
10. **All UI must remain visually consistent across public/member/admin.** Admin dashboards may be denser, but must share the identical palette DNA and not degrade into a colorful SaaS template.

The agent must inspect library defaults rather than accepting them blindly.

### Anti-slop rules

Avoid generic AI-generated web patterns such as:

- excessive gradient backgrounds;
- random glassmorphism;
- excessive rounded cards;
- arbitrary floating blobs;
- decorative elements with no meaning;
- oversized dashboard widgets;
- repetitive icon-card grids;
- fake statistics;
- excessive animations;
- generic "AI startup" visual language;
- excessive uppercase copy;
- dense text walls.

Visual design must have hierarchy, purpose, and brand consistency.

### Brand expression

The interface should communicate:

`Waste → Transformation → Product → Human Impact`

Use actual project photography, illustrations, diagrams, or meaningful visual metaphors where available.

Do not use emotionally manipulative imagery of beneficiaries.

The tone should communicate dignity and agency, not pity.

---

## 6. Typography and Copy

Copy should be:

- clear;
- concrete;
- emotionally resonant;
- easy to scan;
- written for ordinary users;
- free of unnecessary jargon.

Prefer Bahasa Indonesia for primary user-facing copy.

Technical/code naming can remain in English.

### Copy quality

Avoid vague phrases such as:

- "solusi terbaik";
- "platform revolusioner";
- "memberikan dampak luar biasa";
- "teknologi masa depan";

unless the statement is supported by specific evidence.

Prefer concrete language:

- what users can donate;
- what happens next;
- what is produced;
- how proceeds are allocated;
- what impact has actually occurred.

---

## 7. Next.js Rules

### Server Components by default

Use Server Components unless client-side interactivity is actually required.

Use `"use client"` only when needed for:

- browser APIs;
- interactive state;
- event handlers;
- client-only libraries;
- realtime UI requirements.

Do not turn entire pages into Client Components just because one small area is interactive.

### Server Actions / Route Handlers

Use Server Actions for appropriate authenticated mutations initiated by application UI.

Use Route Handlers for:

- public APIs;
- webhook endpoints;
- integration endpoints;
- machine-to-machine requests;
- cases where an HTTP endpoint is explicitly required.

Validate all inputs on the server.

---

## 8. Data Access

Prefer a clear data-access layer over scattering database calls everywhere.

Recommended conceptual structure:

```text
app/
components/
features/
lib/
  supabase/
  auth/
  validation/
  permissions/
  domain/
```

Keep domain logic separate from presentation when practical.

A component should not contain complex financial allocation, donation lifecycle, or permission logic.

---

## 9. Supabase Rules

### Security first

Use Row Level Security for user-owned and sensitive data.

Never rely solely on UI restrictions for authorization.

Every protected mutation must enforce authorization server-side.

### Public vs private data

Publicly visible information may include:

- published impact aggregates;
- published transparency reports;
- public programs;
- approved public stories;
- published products;
- collection point information.

Private information may include:

- user contact information;
- precise pickup address;
- beneficiary sensitive details;
- internal financial records;
- moderation/internal notes;
- audit metadata not intended for public display.

Do not expose private fields through public queries.

### Database integrity

Use database constraints for critical invariants where appropriate.

Examples:

- quantities cannot be negative;
- transaction amounts cannot be negative;
- required foreign keys must exist;
- status transitions must remain valid;
- published records must satisfy required fields.

---

## 10. Domain Rules

The system must preserve traceability.

A valid domain chain is:

```text
Donation
  ↓
Waste Intake
  ↓
Inventory
  ↓
Production Batch
  ↓
Product
  ↓
Sale
  ↓
Revenue
  ↓
Social Allocation
  ↓
Social Program
  ↓
Beneficiary / Distribution
```

Do not shortcut this chain merely to simplify the UI.

If a feature needs a simplified presentation, keep the underlying domain records intact.

---

## 11. Donation Lifecycle

The recommended lifecycle is:

```text
SUBMITTED
→ SCHEDULED
→ COLLECTED
→ VERIFIED
→ SORTED
→ PROCESSED
→ CONVERTED
→ IMPACTED
```

Not every donation must expose every internal state publicly.

`CONVERTED` records conversion into a product; `IMPACTED` requires verified downstream impact records. Adding a lifecycle state does not automatically create those records or an impact summary.

Internal states can be simplified for members, but the backend should retain enough information for traceability.

### Important rule

Estimated quantity submitted by the donor is not automatically the verified quantity.

Example:

```text
Estimated: 10 L
Verified: 8.7 L
```

The system must distinguish them.

---

## 12. Financial Integrity

Financial data is high-risk.

Never calculate or display:

- revenue;
- expenses;
- social allocation;
- profit;
- impact value;

from arbitrary frontend constants in production.

Financial calculations must happen through trusted server/database logic.

Round and format monetary values consistently.

Always store currency explicitly when future multi-currency support is possible.

---

## 13. Impact Data Rules

Impact numbers must have definitions.

For every public metric, know:

- source;
- period;
- calculation;
- unit;
- publication status.

Do not use phrases such as:

> "Rp X created from your donation"

unless the underlying accounting/traceability supports the statement.

For donor-facing impact, distinguish carefully between:

- physical quantity donated;
- physical quantity processed;
- product output;
- sales revenue;
- social allocation.

They are not interchangeable.

---

## 14. Role-Based Access Control

Roles may include:

- `SUPER_ADMIN`
- `ADMIN`
- `OPERATOR`
- `FINANCE`
- `SOCIAL_OFFICER`
- `MEMBER`
- `PUBLIC`

Never assume that visibility in a navigation menu equals authorization.

Permissions must be checked independently.

Example:

```text
UI visibility
+
server authorization
+
database RLS
```

For critical actions, use all applicable layers.

---

## 15. Sensitive Beneficiary Information

Beneficiary data must be handled with care.

Do not expose:

- precise home address;
- phone number;
- government identification numbers;
- medical/sensitive information;
- private documents;

to the public.

Public stories should use only approved information.

If a beneficiary's name is not required, prefer anonymized or abbreviated presentation.

---

## 16. SEO Requirements

Every public indexable page should have:

- meaningful `<title>`;
- meta description;
- canonical URL when appropriate;
- semantic heading hierarchy;
- descriptive internal links;
- Open Graph metadata where relevant;
- structured data where appropriate.

Implement:

- `robots.txt`;
- XML sitemap;
- clean URLs;
- useful 404 behavior;
- stable metadata.

Do not create SEO pages solely to generate keyword volume.

Content should answer real user questions.

---

## 17. AI Discoverability

The website should be understandable to search engines and AI systems.

Use:

- descriptive headings;
- explicit definitions;
- concise explanatory sections;
- structured data;
- factual organization/entity information;
- clear page purpose;
- consistent terminology;
- crawlable HTML content.

Do not hide critical facts only inside canvas/SVG images or client-only interactions.

Important information should remain available in semantic page content.

---

## 18. Accessibility

Target WCAG 2.2 AA principles where practical.

Minimum expectations:

- keyboard navigability;
- visible focus states;
- proper labels;
- semantic HTML;
- sufficient contrast;
- reduced-motion consideration;
- meaningful alt text;
- accessible errors;
- accessible modal/dialog behavior;
- form validation that is understandable.

Do not rely on color alone for status.

---

## 19. Performance

Prefer performance-safe patterns:

- server-rendered content where possible;
- optimized images;
- responsive images;
- lazy loading for below-the-fold media;
- limited client JavaScript;
- no unnecessary animation libraries;
- avoid large dependencies for tiny features.

Measure before optimizing.

Do not add caching or realtime behavior without understanding consistency requirements.

---

## 20. Responsive Design

Design mobile-first for public donation flows.

Test at minimum:

- small mobile;
- standard mobile;
- tablet;
- desktop;
- wide desktop.

Critical user flows must work without horizontal scrolling.

Admin dashboards may be desktop-prioritized but should remain usable on tablet/smaller screens for essential actions.

---

## 21. Forms

Every important form should support:

- clear labels;
- required/optional indication;
- inline validation;
- server-side validation;
- loading state;
- success state;
- failure state;
- retry path.

Never clear user-entered data unnecessarily after an error.

Use shared schemas where possible so client and server validation cannot drift.

---

## 22. Loading / Empty / Error States

Every data-driven screen should have explicit states:

```text
Loading
Empty
Success
Partial
Error
Permission denied
Unavailable
```

Avoid showing an empty white page while data loads.

Avoid fake skeletons that imply content which does not exist.

Error messages should explain what the user can do next.

---

## 23. Component Strategy

Prefer reusable primitives for repeated patterns.

Examples:

- Button
- Input
- Select
- Dialog
- Sheet
- Toast
- Badge
- StatusTimeline
- MetricCard
- DataTable
- EmptyState
- ErrorState
- DonationCard
- ImpactCard
- ProgramCard
- ProductCard

Do not create dozens of nearly identical components with tiny differences.

Use composition before duplication.

---

## 24. Naming

Use predictable names.

Examples:

```text
DonationStatus
DonationTimeline
DonationForm
ImpactSummary
ImpactBreakdown
ProgramCard
BeneficiarySummary
ProductionBatchForm
RevenueAllocation
TransparencyReport
```

Use English for code identifiers unless the repository convention explicitly uses another language.

User-facing labels should remain Indonesian.

---

## 25. State Management

Use local state when local state is enough.

Do not introduce a global state library just because the application has many pages.

Before adding global state, determine whether the state should instead live in:

- URL search params;
- server state;
- database;
- form state;
- local component state.

Avoid duplicated sources of truth.

---

## 26. Testing Requirements

Every critical mutation should have tests.

Minimum targets:

### Unit

- validation;
- calculations;
- status transition rules;
- permission checks.

### Integration

- donation creation;
- donation verification;
- inventory updates;
- production batch processing;
- product/sale recording;
- social allocation.

### End-to-end

At least test:

```text
Public visitor
→ donation flow
→ authenticated member
→ admin verification
→ tracking result
```

And where implemented:

```text
Product
→ sale
→ social allocation
→ public transparency
```

---

## 27. Git / Change Discipline

Commits should be focused.

Prefer messages such as:

```text
feat(donation): add waste donation wizard
feat(admin): add donation verification
fix(auth): enforce member access on dashboard
feat(seo): add public sitemap metadata
```

Avoid commits such as:

```text
update website
fix stuff
changes
final final
```

Do not mix unrelated refactors with feature work unless necessary.

---

## 28. Task Execution Protocol

For each task:

### Step 1 — Understand

Read the task and relevant architecture/product documents.

### Step 2 — Inspect

Find affected routes, components, data, and tests.

### Step 3 — Implement

Make the smallest complete implementation.

### Step 4 — Verify

Run:

- type checking;
- linting;
- relevant unit/integration tests;
- build when practical.

### Step 5 — Review

Check:

- responsive behavior;
- loading/empty/error states;
- permissions;
- accessibility;
- SEO when public;
- no fake data;
- no accidental secrets.

### Step 6 — Report

Summarize:

- what changed;
- what was tested;
- known limitations;
- follow-up task if genuinely required.

---

## 29. Definition of Done

A task is not done merely because the page renders.

A task is done when the implementation:

- follows the documented architecture;
- matches the wireframe intent;
- behaves correctly;
- handles errors;
- respects permissions;
- has appropriate validation;
- is responsive;
- is accessible to a reasonable degree;
- passes relevant checks;
- does not expose sensitive data;
- does not introduce fake production claims.

For public pages, also verify:

- metadata;
- semantic structure;
- crawlability;
- share preview where applicable.

---

## 30. Anti-Regression Rules

Before changing an existing workflow, identify its dependencies.

Do not break:

- authentication;
- RLS;
- donation traceability;
- financial integrity;
- public transparency calculations;
- role permissions;
- SEO routes.

A visually minor change must not silently change business logic.

---

## 31. Feature Flags / Coming Soon

Features that are documented but not implemented should be presented honestly.

Preferred UI:

```text
Feature Name
Coming Soon

Descriptive explanation.

[ Notify Me ]
```

Do not expose unfinished backend actions as if they were production-ready.

---

## 32. Prohibited Shortcuts

Never:

- hardcode production credentials;
- put service-role secrets in client bundles;
- bypass RLS;
- trust client-submitted authorization;
- fabricate financial data;
- fabricate beneficiaries;
- fabricate testimonials;
- hide failed mutations;
- mark failed operations as successful;
- create SEO spam pages;
- duplicate large code blocks instead of reusing components;
- add dependencies without a reason;
- rewrite the entire project to implement a small feature.

---

## 33. Documentation Synchronization

When implementation changes the intended product behavior, update the relevant markdown file.

Examples:

- product behavior changed → update `RPD.md`;
- architecture changed → update `ARSITEKTUR.md`;
- screen behavior changed → update `WIREFRAME.md`;
- implementation sequence changed → update `TASK.md`;
- agent rule changed → update `AGENTS.md`.

Documentation should describe the real system, not an aspirational system that no longer exists.

---

## 34. Final Quality Bar

Before calling the project ready for a release, ask:

### Product

- Is the value understandable within seconds?
- Is donation friction low?
- Is the social impact understandable?

### Trust

- Can users trace what happened to their contribution?
- Are financial/impact claims backed by real records?
- Are limitations communicated honestly?

### UX

- Can a first-time user complete the main flow without assistance?
- Does the interface feel calm and intentional?
- Are all important states handled?

### Engineering

- Is authorization enforced server-side?
- Is Supabase access secure?
- Are critical business rules centralized?
- Are important flows tested?

### Discovery

- Can search engines understand the site?
- Can AI systems understand what the organization does, what can be donated, and how the impact model works?
- Is key information represented as semantic content rather than images alone?

### Anti-Slop

- Does every visual element have a purpose?
- Is the design recognizable as this brand rather than a generic AI website?
- Are real operational facts used instead of decorative statistics?

The project should optimize for:

> **Clarity over decoration.**
>
> **Trust over hype.**
>
> **Real impact over vanity metrics.**
>
> **Human dignity over emotional manipulation.**
>
> **A coherent system over isolated screens.**
