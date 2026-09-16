# DATABASE.md

## Purpose

Define the PostgreSQL/Supabase persistence model and database engineering rules.

## Technology

Primary database:

- PostgreSQL through Supabase.

Application:

- TypeScript;
- Next.js App Router.

## Database Design Principles

1. Prefer normalized relational data for operational records.
2. Use foreign keys for important relationships.
3. Use constraints for business invariants.
4. Use indexes based on actual query patterns.
5. Use Row Level Security for protected data.
6. Prefer append-only history for financial/audit events.
7. Do not store derived values when they can safely be queried from authoritative records, unless denormalization is justified.

## Initial Logical Tables

```text
profiles
roles
permissions
role_permissions

donations
donation_items
pickup_requests
collection_points

waste_intakes
waste_batches
inventory_transactions

production_batches
production_batch_inputs
production_batch_outputs

products
product_media

orders
order_items
sales
revenue_entries

social_funds
social_allocations
social_programs
beneficiaries
distributions

impact_records
transparency_reports
transparency_report_metrics

audit_logs
notifications
```

Final schema may evolve after implementation discovery.

## Primary Key Strategy

Use UUIDs as internal primary keys unless a documented reason requires another strategy.

Human-readable identifiers such as:

```text
DNT-2026-000123
```

should be separate unique fields.

Never expose sequential database IDs as the only public identifier where enumeration would create privacy/security concerns.

## Timestamps

Use UTC timestamps in the database.

Convert to the user's locale at presentation time.

Store:

- created_at;
- updated_at;
- relevant event timestamps.

Do not use client-generated timestamps for authoritative events.

## Money

Do not store money in floating-point types.

Use integer minor units when appropriate, e.g.:

```text
125000 = Rp125,000
```

or an exact PostgreSQL numeric/decimal representation with explicit currency.

Each financial record must identify its currency when there is any possibility of future multi-currency use.

## Quantities

Physical quantities require:

- value;
- unit;
- optionally normalized base unit.

Examples:

```text
5 L
12.5 KG
80 PCS
```

Do not mix units silently.

## Status Fields

Statuses should be explicit and constrained.

Prefer enums/check constraints or controlled lookup values over arbitrary strings.

## Inventory

Inventory should be reconstructable from inventory transactions.

Example:

```text
+100 KG intake
-40 KG production consumption
-2 KG loss
+1 KG correction
```

Current stock is a derived operational view.

Do not silently overwrite stock without recording the reason.

## Financial Ledger

Financial records should be auditable.

Recommended conceptual chain:

```text
Sale
→ Revenue Entry
→ Social Fund availability
→ Social Allocation
→ Social Program
```

A correction should create an auditable adjustment instead of destroying historical evidence.

## Row Level Security

RLS is mandatory for:

- private profiles;
- pickup locations;
- beneficiary data;
- internal operational records;
- financial records;
- audit logs;
- admin functions.

Public read policies should expose only explicitly public records.

## Authorization Layers

Critical access should be enforced at multiple layers:

```text
UI visibility
+
server authorization
+
database RLS
```

Never rely on hidden routes or hidden buttons as security.

## Indexing

Index:

- foreign keys used in filters/joins;
- status + timestamp combinations used in operational queues;
- public slug fields;
- unique business identifiers;
- frequently searched fields.

Do not create indexes blindly on every column.

## Soft Delete / Archival

For historical operational and financial entities:

- avoid hard deletion;
- use status;
- archival;
- void/correction records.

Hard deletion may be appropriate for temporary/non-auditable content only when policy allows.

## Migrations

Schema changes must be migration-based.

Never manually mutate production schema without a reproducible migration.

Migration files should be version-controlled.

## Seed Data

Seed data must be clearly non-production.

Never seed fake real-world beneficiary stories or fake financial impact into a production environment.

Development fixtures should use obvious demo identities and values.

## Supabase Client Rules

Use separate server/browser access patterns where required by Supabase/Next.js architecture.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to client-side code.

Environment variables must be validated at startup/build-time where practical.

## Storage

If Supabase Storage is used:

- define bucket purpose;
- define public/private status;
- validate file type;
- validate file size;
- use signed URLs for private objects;
- never rely on filename extension alone.

Potential storage groups:

```text
public-site
product-media
program-media
beneficiary-private
documents-private
```

## Database Safety Checklist

```text
[ ] PK/FK constraints
[ ] quantity constraints
[ ] money constraints
[ ] status constraints
[ ] RLS enabled
[ ] public/private boundaries verified
[ ] indexes justified
[ ] migration exists
[ ] audit trail defined for critical mutations
[ ] no service-role key in client
```
