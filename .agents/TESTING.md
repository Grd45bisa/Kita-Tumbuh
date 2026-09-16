# TESTING.md

## Purpose

Define the quality strategy for the application.

## Testing Pyramid

```text
              E2E
             /   \
       Integration
         /       \
       Unit + Domain Tests
```

Prefer fast tests for business rules and use E2E for high-value user journeys.

## Critical Business Journeys

### Donation

```text
user opens donation flow
→ chooses accepted waste
→ enters estimate
→ selects pickup/drop-off
→ confirms
→ receives donation ID
→ views tracking
```

### Operational Traceability

```text
donation
→ waste intake
→ verified quantity
→ inventory transaction
→ production batch
→ product output
```

### Social Flow

```text
sale
→ revenue entry
→ social fund
→ allocation
→ program
→ distribution
→ impact record
→ transparency
```

## Unit Tests

Test:

- validation;
- quantity normalization;
- money calculations;
- status transitions;
- permission checks;
- allocation constraints;
- impact calculations.

Avoid testing framework implementation details.

## Integration Tests

Test real boundaries such as:

- server action + database;
- route handler + authorization;
- RLS;
- inventory updates;
- financial allocations;
- publication logic.

## E2E Tests

Minimum core scenarios:

1. public visitor understands how donation works;
2. member completes donation;
3. member sees donation tracking;
4. operator verifies donation;
5. operator processes inventory;
6. admin creates product/production record;
7. sale records correctly;
8. finance creates valid social allocation;
9. public transparency shows published data only.

## RLS Tests

Explicitly test cross-user access.

Example:

```text
User A creates donation A
User B requests donation A
→ must not receive private donation details
```

## Accessibility Testing

Check:

- keyboard flow;
- focus;
- labels;
- heading structure;
- dialog semantics;
- form errors;
- color contrast;
- reduced motion where applicable.

## SEO Testing

For public pages verify:

- title;
- description;
- canonical;
- heading structure;
- sitemap;
- robots;
- structured data;
- crawlable content.

## Visual Testing

Use visual regression selectively for:

- homepage;
- donation wizard;
- member dashboard;
- admin overview;
- key program/product pages.

Do not snapshot every tiny component.

## Performance Testing

Check:

- production build;
- page load;
- Core Web Vitals where measurable;
- image weight;
- client JavaScript;
- slow database queries.

## Test Data

Use deterministic fixtures.

Clearly separate:

```text
test data
demo data
production data
```

Never use real beneficiary private data in tests.

## Failure Cases

Test:

- invalid quantity;
- unsupported waste;
- expired pickup slot;
- unauthorized action;
- insufficient inventory;
- invalid status transition;
- insufficient social funds;
- duplicate submission;
- network/database failure.

## Definition of Done

A critical feature should not be marked complete when only the happy path works.

Every high-risk mutation needs at least:

- validation test;
- authorization/RLS test;
- successful mutation test;
- failure-path test.

## CI Expectations

CI should run at minimum:

```text
typecheck
lint
unit/integration tests
build
```

E2E should run on appropriate branches/environments.

## Test Naming

Test names should describe behavior.

Prefer:

```text
allows a member to create a donation
rejects verification from unauthorized role
prevents allocation above available social funds
```

Avoid:

```text
works correctly
test donation
```
