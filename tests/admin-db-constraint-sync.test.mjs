import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// =============================================================================
// Regression guard: application code must only ever send enum/status/type
// string literals that actually exist in the corresponding Postgres CHECK
// constraint or ENUM type. Zod schema tests alone (see admin-*.test.mjs)
// cannot catch this class of bug — a value can be a syntactically valid
// string that Zod happily accepts while still being rejected by Postgres
// at INSERT/UPDATE time ("invalid input value for enum ..." / "violates
// check constraint ..."). This file was added after exactly that kind of
// bug shipped in Phase 5 (waste_lots.status sent as "ACTIVE" when the only
// valid values are AVAILABLE/RESERVED/DEPLETED/DISCARDED, and
// inventory_transactions.transaction_type sent as "PRODUCTION_INPUT" when
// the constraint only allows PRODUCTION_CONSUMPTION) — see
// lib/domain/admin/production.ts.
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function readSource(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

/**
 * Extracts the allowed values from a Postgres CHECK constraint of the shape:
 *   CHECK (column_name IN ('A', 'B', 'C'))
 */
function extractCheckConstraintValues(sql, columnName) {
  const pattern = new RegExp(
    `CHECK\\s*\\(\\s*${columnName}\\s+IN\\s*\\(([^)]+)\\)\\s*\\)`,
    "i"
  );
  const match = sql.match(pattern);
  assert.ok(match, `Expected to find a CHECK (${columnName} IN (...)) constraint`);
  return match[1]
    .split(",")
    .map((v) => v.trim().replace(/^'|'$/g, ""));
}

/**
 * Extracts values added to a Postgres native ENUM type across all
 * migrations, combining the initial CREATE TYPE ... AS ENUM (...) list
 * with any later ALTER TYPE ... ADD VALUE ... statements.
 */
function extractEnumValues(migrationSources, typeName) {
  const values = [];

  for (const sql of migrationSources) {
    const createMatch = sql.match(
      new RegExp(`CREATE\\s+TYPE\\s+${typeName}\\s+AS\\s+ENUM\\s*\\(([^)]+)\\)`, "i")
    );
    if (createMatch) {
      values.push(
        ...createMatch[1].split(",").map((v) => v.trim().replace(/^'|'$/g, ""))
      );
    }

    const alterMatches = sql.matchAll(
      new RegExp(
        `ALTER\\s+TYPE\\s+(?:public\\.)?${typeName}\\s+ADD\\s+VALUE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?'([^']+)'`,
        "gi"
      )
    );
    for (const m of alterMatches) {
      values.push(m[1]);
    }
  }

  assert.ok(values.length > 0, `Expected to find enum values for type ${typeName}`);
  return values;
}

test("waste_lots.status values sent by admin code exist in the migration 005 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/005_waste_inventory.sql");
  const validStatuses = extractCheckConstraintValues(migration, "status");

  const productionSource = readSource("lib/domain/admin/production.ts");
  // Every string literal assigned as a waste_lots.status value in application
  // code, e.g. the two branches of `const newLotStatus = cond ? "DEPLETED" : "AVAILABLE"`.
  const newLotStatusLine = productionSource.match(/const newLotStatus\s*=[^\n]*/);
  assert.ok(newLotStatusLine, "Expected to find the newLotStatus assignment in production.ts");
  const usedStatuses = [...newLotStatusLine[0].matchAll(/"([A-Z_]+)"/g)].map((m) => m[1]);

  assert.ok(usedStatuses.length > 0, "Expected to find waste_lots.status literals in production.ts");
  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `production.ts uses waste_lots.status "${status}" which is not in the migration 005 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});

test("inventory_transactions.transaction_type values sent by admin code exist in the migration 005 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/005_waste_inventory.sql");
  const validTypes = extractCheckConstraintValues(migration, "transaction_type");

  const productionSource = readSource("lib/domain/admin/production.ts");
  const usedTypes = [...productionSource.matchAll(/transaction_type:\s*"([A-Z_]+)"/g)]
    .map((m) => m[1]);

  assert.ok(usedTypes.length > 0, "Expected to find transaction_type literals in production.ts");
  for (const type of usedTypes) {
    assert.ok(
      validTypes.includes(type),
      `production.ts uses inventory_transactions.transaction_type "${type}" which is not in the migration 005 CHECK constraint: [${validTypes.join(", ")}]`
    );
  }
});

test("donation_status values in UpdateDonationStatusSchema exist in the donation_status enum across all migrations", () => {
  const migrationFiles = [
    "supabase/migrations/001_donation_foundation.sql",
    "supabase/migrations/002_donation_phase3.sql",
    "supabase/migrations/008_donation_status_rejected.sql",
  ];
  const sources = migrationFiles.map(readSource);
  const validStatuses = extractEnumValues(sources, "donation_status");

  const schemaSource = readSource("lib/validation/admin-donation-schema.ts");
  // Scan every quoted SCREAMING_CASE string literal in the schema file —
  // covers both the VerifyDonationSchema `decision` enum and the
  // UpdateDonationStatusSchema `next_status` enum without depending on
  // their exact variable/array structure.
  const usedStatuses = [
    ...new Set([...schemaSource.matchAll(/"([A-Z_]{4,})"/g)].map((m) => m[1])),
  ];

  assert.ok(usedStatuses.length > 0, "Expected to find donation status literals in admin-donation-schema.ts");
  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `admin-donation-schema.ts references donation_status "${status}" which is not defined in any migration's donation_status enum: [${validStatuses.join(", ")}]`
    );
  }
});

test("production_batches.status values in UpdateBatchStatusSchema exist in the migration 006 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/006_production_batches.sql");
  const validStatuses = extractCheckConstraintValues(migration, "status");

  const schemaSource = readSource("lib/validation/production-batch-schema.ts");
  const stepsMatch = schemaSource.match(/PRODUCTION_STATUS_STEPS\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find PRODUCTION_STATUS_STEPS array");
  const usedStatuses = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `production-batch-schema.ts uses production_batches.status "${status}" which is not in the migration 006 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});

test("orders.status values in order-schema.ts exist in the migration 009 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/009_orders.sql");
  const validStatuses = extractCheckConstraintValues(migration, "status");

  const schemaSource = readSource("lib/validation/order-schema.ts");
  const stepsMatch = schemaSource.match(/ORDER_STATUS_STEPS\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find ORDER_STATUS_STEPS array");
  const usedStatuses = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `order-schema.ts uses orders.status "${status}" which is not in the migration 009 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});

test("orders.payment_status values in order-schema.ts exist in the migration 009 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/009_orders.sql");
  const validStatuses = extractCheckConstraintValues(migration, "payment_status");

  const schemaSource = readSource("lib/validation/order-schema.ts");
  const stepsMatch = schemaSource.match(/ORDER_PAYMENT_STATUS_STEPS\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find ORDER_PAYMENT_STATUS_STEPS array");
  const usedStatuses = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `order-schema.ts uses orders.payment_status "${status}" which is not in the migration 009 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});

test("revenue_entries.reconciliation_status values in finance-schema.ts exist in the migration 010 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/010_revenue_ledger.sql");
  const validStatuses = extractCheckConstraintValues(migration, "reconciliation_status");

  const schemaSource = readSource("lib/validation/finance-schema.ts");
  const stepsMatch = schemaSource.match(/RECONCILIATION_STATUSES\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find RECONCILIATION_STATUSES array");
  const usedStatuses = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `finance-schema.ts uses reconciliation_status "${status}" which is not in the migration 010 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});

test("social_allocations.approval_status values in finance-schema.ts exist in the migration 011 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/011_social_allocations.sql");
  const validStatuses = extractCheckConstraintValues(migration, "approval_status");

  const schemaSource = readSource("lib/validation/finance-schema.ts");
  const stepsMatch = schemaSource.match(/ALLOCATION_APPROVAL_STATUSES\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find ALLOCATION_APPROVAL_STATUSES array");
  const usedStatuses = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `finance-schema.ts uses allocation approval_status "${status}" which is not in the migration 011 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});

test("expenses.category values in finance-schema.ts exist in the migration 012 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/012_expenses.sql");
  const validCategories = extractCheckConstraintValues(migration, "category");

  const schemaSource = readSource("lib/validation/finance-schema.ts");
  const stepsMatch = schemaSource.match(/EXPENSE_CATEGORIES\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find EXPENSE_CATEGORIES array");
  const usedCategories = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const category of usedCategories) {
    assert.ok(
      validCategories.includes(category),
      `finance-schema.ts uses expense category "${category}" which is not in the migration 012 CHECK constraint: [${validCategories.join(", ")}]`
    );
  }
});

test("social_programs.status values in social-schema.ts exist in the migration 014 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/014_social_programs.sql");
  const validStatuses = extractCheckConstraintValues(migration, "status");

  const schemaSource = readSource("lib/validation/social-schema.ts");
  const stepsMatch = schemaSource.match(/SOCIAL_PROGRAM_STATUSES\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find SOCIAL_PROGRAM_STATUSES array");
  const usedStatuses = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `social-schema.ts uses social_programs.status "${status}" which is not in the migration 014 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});

test("beneficiaries.category values in social-schema.ts exist in the migration 015 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/015_beneficiaries.sql");
  const validCategories = extractCheckConstraintValues(migration, "category");

  const schemaSource = readSource("lib/validation/social-schema.ts");
  const stepsMatch = schemaSource.match(/BENEFICIARY_CATEGORIES\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find BENEFICIARY_CATEGORIES array");
  const usedCategories = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const category of usedCategories) {
    assert.ok(
      validCategories.includes(category),
      `social-schema.ts uses beneficiaries.category "${category}" which is not in the migration 015 CHECK constraint: [${validCategories.join(", ")}]`
    );
  }
});

test("beneficiaries.verification_status values in social-schema.ts exist in the migration 015 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/015_beneficiaries.sql");
  const validStatuses = extractCheckConstraintValues(migration, "verification_status");

  const schemaSource = readSource("lib/validation/social-schema.ts");
  const stepsMatch = schemaSource.match(/VERIFICATION_STATUSES\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find VERIFICATION_STATUSES array");
  const usedStatuses = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `social-schema.ts uses beneficiaries.verification_status "${status}" which is not in the migration 015 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});

test("beneficiaries.consent_status values in social-schema.ts exist in the migration 015 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/015_beneficiaries.sql");
  const validStatuses = extractCheckConstraintValues(migration, "consent_status");

  const schemaSource = readSource("lib/validation/social-schema.ts");
  const stepsMatch = schemaSource.match(/CONSENT_STATUSES\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find CONSENT_STATUSES array");
  const usedStatuses = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `social-schema.ts uses beneficiaries.consent_status "${status}" which is not in the migration 015 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});

test("beneficiaries.privacy_level values in social-schema.ts exist in the migration 015 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/015_beneficiaries.sql");
  const validLevels = extractCheckConstraintValues(migration, "privacy_level");

  const schemaSource = readSource("lib/validation/social-schema.ts");
  const stepsMatch = schemaSource.match(/PRIVACY_LEVELS\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find PRIVACY_LEVELS array");
  const usedLevels = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const level of usedLevels) {
    assert.ok(
      validLevels.includes(level),
      `social-schema.ts uses beneficiaries.privacy_level "${level}" which is not in the migration 015 CHECK constraint: [${validLevels.join(", ")}]`
    );
  }
});

test("distributions.approval_status values in social-schema.ts exist in the migration 016 CHECK constraint", () => {
  const migration = readSource("supabase/migrations/016_distributions.sql");
  const validStatuses = extractCheckConstraintValues(migration, "approval_status");

  const schemaSource = readSource("lib/validation/social-schema.ts");
  const stepsMatch = schemaSource.match(/DISTRIBUTION_APPROVAL_STATUSES\s*=\s*\[([^\]]+)\]/);
  assert.ok(stepsMatch, "Expected to find DISTRIBUTION_APPROVAL_STATUSES array");
  const usedStatuses = stepsMatch[1]
    .split(",")
    .map((v) => v.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);

  for (const status of usedStatuses) {
    assert.ok(
      validStatuses.includes(status),
      `social-schema.ts uses distributions.approval_status "${status}" which is not in the migration 016 CHECK constraint: [${validStatuses.join(", ")}]`
    );
  }
});


