# API.md

## Purpose

Define the application interface contract for server-side operations and public/authenticated endpoints.

## Architecture

Primary stack:

```text
Next.js App Router
├── Server Components
├── Server Actions
└── Route Handlers
        ↓
Supabase
        ↓
PostgreSQL
```

Do not introduce a separate backend service without documented justification.

## Interface Selection

### Server Components

Use for:

- server-rendered read operations;
- public content;
- authenticated page data;
- dashboard summaries.

### Server Actions

Use for:

- UI-triggered mutations;
- authenticated form submissions;
- simple application commands.

### Route Handlers

Use for:

- external HTTP consumers;
- webhooks;
- public API requirements;
- integration endpoints;
- cases requiring explicit HTTP semantics.

## General Rules

Every mutation must:

1. validate input;
2. authenticate when required;
3. authorize the actor;
4. execute trusted server-side logic;
5. return a predictable result;
6. handle errors safely;
7. produce audit information when required.

## Result Pattern

Prefer a consistent application result shape.

Conceptual example:

```ts
type Result<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: string;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
```

Do not expose internal stack traces.

## Validation

Use one source of truth for request schemas where practical.

Validate:

- type;
- required fields;
- ranges;
- enum values;
- ownership;
- business constraints.

Client validation improves UX.
Server validation enforces correctness.

## Authentication

Protected operations require authenticated sessions.

Never infer authorization from:

- hidden UI;
- client-side role fields;
- URL parameters;
- local storage alone.

## Authorization

Use permission checks based on trusted server-side identity.

Examples:

```text
donation:create
donation:verify
inventory:manage
production:manage
sales:manage
finance:allocate
program:manage
beneficiary:manage
transparency:publish
```

Exact permission catalog is maintained with RBAC implementation.

## Public Endpoints

Potential public reads:

```text
GET /api/impact
GET /api/programs
GET /api/programs/:slug
GET /api/products
GET /api/products/:slug
GET /api/collection-points
GET /api/transparency
```

Public APIs must return only explicitly public fields.

## Member Operations

Potential operations:

```text
POST /api/donations
GET /api/donations/:id
POST /api/donations/:id/cancel
GET /api/me/impact
GET /api/me/donations
POST /api/pickups
```

Ownership must be verified server-side.

## Operations/Admin

Potential operations:

```text
GET  /api/admin/donations
POST /api/admin/donations/:id/verify
POST /api/admin/waste-intakes
POST /api/admin/production-batches
POST /api/admin/products
POST /api/admin/sales
POST /api/admin/social-allocations
POST /api/admin/transparency/publish
```

These examples are contracts to be refined during implementation, not permission to build every endpoint immediately.

## Donation Mutation Example

Conceptual flow:

```text
POST /api/donations
        ↓
validate payload
        ↓
authenticate
        ↓
authorize
        ↓
create donation
        ↓
create donation items
        ↓
audit if required
        ↓
return donation reference
```

Do not accept verified quantity from the public donor as authoritative.

## Idempotency

Operations that can be retried or triggered by webhooks should support idempotency.

Potential candidates:

- payment/webhook handling;
- fulfillment;
- external integrations;
- critical mutation retries.

## Pagination

List endpoints should use predictable pagination.

Prefer:

- cursor pagination for large/volatile operational datasets;
- offset pagination for small/static public datasets where appropriate.

Do not load unbounded admin datasets.

## Filtering

Admin endpoints should allow relevant server-side filtering rather than fetching everything to the browser.

## Sorting

Use an explicit whitelist of sortable fields.

Never interpolate unchecked field names into SQL.

## Rate Limiting

Rate limit:

- public mutation endpoints;
- login/auth-sensitive operations;
- pickup creation;
- contact/notification endpoints;
- externally exposed APIs.

Exact limits depend on deployment and traffic.

## Webhooks

For any webhook:

1. verify provider signature;
2. validate event type;
3. ensure idempotency;
4. record processing state;
5. avoid trusting payload fields for authorization.

## Error Codes

Use stable application error codes.

Examples:

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
INVALID_STATUS_TRANSITION
INSUFFICIENT_SOCIAL_FUNDS
INVENTORY_INSUFFICIENT
RATE_LIMITED
INTERNAL_ERROR
```

## API Documentation Rules

When an API contract changes, update this file.

Do not implement undocumented public interfaces.

---

# API Checklist

```text
[ ] Request validated
[ ] Auth checked
[ ] Authorization checked
[ ] Ownership checked
[ ] Business rule checked
[ ] Sensitive fields excluded
[ ] Errors sanitized
[ ] Idempotency considered
[ ] Rate limiting considered
[ ] Audit requirement considered
[ ] Tests added
```
