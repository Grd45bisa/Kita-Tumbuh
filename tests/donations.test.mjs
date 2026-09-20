import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

// Exercise the real server action + Zod schema with an in-memory Supabase
// boundary. This suite does not claim to execute PostgreSQL or enforce RLS.
const require = createRequire(import.meta.url);
function loadTypeScript(relativePath, imports, log = console) {
  const filename = new URL(relativePath, import.meta.url);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loaded = { exports: {} };
  const resolveImport = (name) => name in imports ? imports[name] : require(name);
  new Function("require", "module", "exports", "console", outputText)(
    resolveImport, loaded, loaded.exports, log
  );
  return loaded.exports;
}

const schema = loadTypeScript("../lib/validation/donation-schema.ts", {});
const wasteType = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "minyak-jelantah",
  name: "Minyak Jelantah",
  unit: "L",
  min_quantity: 0.5,
  max_quantity: 50,
};
const collectionPoint = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Collection point fixture",
  accepted_waste_slugs: [wasteType.slug],
};
const input = {
  waste_type_id: wasteType.id,
  waste_type_slug: wasteType.slug,
  waste_type_name: wasteType.name,
  unit: wasteType.unit,
  estimated_quantity: 2,
  method: "DROP_OFF",
  collection_point_id: collectionPoint.id,
  idempotency_key: "33333333-3333-4333-8333-333333333333",
};
const safeReceipt = {
  reference: "DON-2026-100000",
  waste_type_name: wasteType.name,
  estimated_quantity: 2,
  verified_quantity: null,
  unit: "L",
  status: "SUBMITTED",
};

function boundary(options = {}) {
  const rows = new Map();
  const references = new Set(options.existingReferences ?? []);
  const calls = { clients: 0, allocations: 0, inserts: 0, lookups: [], auth: 0 };
  let sequence = options.sequence ?? 0;
  const client = {
    auth: {
      async getUser() {
        calls.auth += 1;
        return { data: { user: null } };
      },
    },
    rpc(name, args) {
      if (name === "generate_donation_reference") {
        calls.allocations += 1;
        if (options.generatorError) return Promise.resolve({ data: null, error: { code: "42883" } });
        sequence += 1;
        return Promise.resolve({ data: `DON-2026-${String(sequence).padStart(5, "0")}`, error: null });
      }
      calls.lookups.push({ name, args });
      return {
        async maybeSingle() {
          return { data: options.publicRow ?? null, error: options.lookupError ?? null };
        },
      };
    },
    from(table) {
      assert.equal(table, "donations");
      let key;
      let payload;
      const query = {
        select(columns) {
          assert.equal(columns, "id, reference, status, waste_type_name, estimated_quantity, verified_quantity, unit");
          return query;
        },
        eq(column, value) {
          assert.equal(column, "idempotency_key");
          key = value;
          return query;
        },
        async maybeSingle() {
          return { data: rows.get(key) ?? null, error: null };
        },
        insert(value) {
          payload = value;
          return query;
        },
        async single() {
          calls.inserts += 1;
          if (options.insertError) return { data: null, error: options.insertError };
          if (rows.has(payload.idempotency_key)) {
            return { data: null, error: { code: "23505", message: 'duplicate key "donations_idempotency_key_key"' } };
          }
          if (references.has(payload.reference)) {
            return { data: null, error: { code: "23505", message: 'duplicate key "donations_reference_key"' } };
          }
          const row = { ...payload, verified_quantity: null, id: `fixture-${rows.size + 1}` };
          rows.set(payload.idempotency_key, row);
          references.add(payload.reference);
          return { data: row, error: null };
        },
      };
      return query;
    },
  };
  const actions = loadTypeScript("../lib/domain/donations.ts", {
    "@/lib/supabase/server": {
      async createClient() {
        calls.clients += 1;
        if (options.clientError) throw new Error("Fixture connection unavailable");
        return client;
      },
    },
    "@/lib/domain/waste-types": {
      getWasteTypeBySlug: async () => options.inactiveWaste ? null : wasteType,
    },
    "@/lib/domain/collection-points": {
      getCollectionPointById: async () => options.rejectedMaterial
        ? { ...collectionPoint, accepted_waste_slugs: ["other-material"] }
        : collectionPoint,
    },
    "@/lib/validation/donation-schema": schema,
  }, { error() {} });
  return { actions, calls, rows };
}

test("rejects invalid submission before contacting Supabase", async () => {
  const fixture = boundary();
  const result = await fixture.actions.createDonation({ ...input, estimated_quantity: 0 });
  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.estimated_quantity.length);
  assert.equal(fixture.calls.clients, 0);
});

test("validates active material, server quantity bounds, and collection point acceptance", async () => {
  for (const [options, quantity] of [[{ inactiveWaste: true }, 2], [{}, 0.1], [{}, 51], [{ rejectedMaterial: true }, 2]]) {
    const fixture = boundary(options);
    const result = await fixture.actions.createDonation({ ...input, estimated_quantity: quantity });
    assert.equal(result.success, false);
    assert.equal(fixture.calls.allocations, 0);
  }
});

test("uses server material metadata and returns the existing donation on repeated submit", async () => {
  const fixture = boundary();
  const first = await fixture.actions.createDonation({ ...input, unit: "fabricated", waste_type_name: "fabricated" });
  const second = await fixture.actions.createDonation(input);
  assert.equal(first.success, true);
  assert.equal(second.success, true);
  assert.equal(second.data.reference, first.data.reference);
  assert.equal(second.data.wasAlreadySubmitted, true);
  assert.equal(fixture.calls.allocations, 1);
  assert.equal(fixture.rows.get(input.idempotency_key).unit, wasteType.unit);
  assert.equal(fixture.rows.get(input.idempotency_key).waste_type_name, wasteType.name);
});

test("overlapping requests with the same key recover through the unique-key race fallback", async () => {
  const fixture = boundary();
  const results = await Promise.all([
    fixture.actions.createDonation(input),
    fixture.actions.createDonation(input),
  ]);
  assert.ok(results.every((result) => result.success));
  assert.equal(results[0].data.reference, results[1].data.reference);
  assert.deepEqual(results.map((result) => result.data.wasAlreadySubmitted).sort(), [false, true]);
  assert.equal(fixture.calls.allocations, 2);
  assert.equal(fixture.calls.inserts, 2);
  assert.equal(fixture.rows.size, 1);
});

test("idempotent replays return the stored public receipt including verified quantity", async () => {
  const fixture = boundary();
  const first = await fixture.actions.createDonation(input);
  const stored = fixture.rows.get(input.idempotency_key);
  stored.status = "VERIFIED";
  stored.verified_quantity = 1.75;
  stored.verification_notes = "Internal fixture note";
  const replay = await fixture.actions.createDonation({ ...input, estimated_quantity: 10 });
  assert.equal(replay.success, true);
  assert.equal(replay.data.wasAlreadySubmitted, true);
  assert.deepEqual(replay.data.receipt, {
    reference: first.data.reference,
    waste_type_name: wasteType.name,
    estimated_quantity: 2,
    verified_quantity: 1.75,
    unit: "L",
    status: "VERIFIED",
  });
});

test("overlapping independent submissions keep distinct allocated references", async () => {
  const fixture = boundary();
  const results = await Promise.all(Array.from({ length: 12 }, (_, index) => fixture.actions.createDonation({
    ...input,
    idempotency_key: `33333333-3333-4333-8333-${String(index).padStart(12, "0")}`,
  })));
  assert.ok(results.every((result) => result.success));
  assert.equal(new Set(results.map((result) => result.data.reference)).size, 12);
  assert.equal(fixture.rows.size, 12);
});

test("retries a reference collision and preserves suffixes beyond 99999", async () => {
  const fixture = boundary({ sequence: 99998, existingReferences: ["DON-2026-99999"] });
  const result = await fixture.actions.createDonation(input);
  assert.equal(result.success, true);
  assert.equal(result.data.reference, "DON-2026-100000");
  assert.equal(result.data.wasAlreadySubmitted, false);
  assert.equal(fixture.calls.allocations, 2);
});

test("stops after three reference collisions without claiming success", async () => {
  const fixture = boundary({ insertError: { code: "23505", message: 'duplicate key "donations_reference_key"' } });
  const result = await fixture.actions.createDonation(input);
  assert.equal(result.success, false);
  assert.equal(fixture.calls.allocations, 3);
  assert.equal(fixture.rows.size, 0);
});

test("does not retry unrelated unique or permission failures", async () => {
  for (const error of [
    { code: "23505", message: 'duplicate key "donations_idempotency_key_key"' },
    { code: "42501", message: "permission denied" },
  ]) {
    const fixture = boundary({ insertError: error });
    const result = await fixture.actions.createDonation(input);
    assert.equal(result.success, false);
    assert.equal(fixture.calls.allocations, 1);
    assert.equal(fixture.calls.inserts, 1);
  }
});

test("generator failure never inserts a donation", async () => {
  const fixture = boundary({ generatorError: true });
  const result = await fixture.actions.createDonation(input);
  assert.equal(result.success, false);
  assert.equal(fixture.calls.inserts, 0);
});

test("receipt uses an exact-reference public RPC without auth and strips sensitive extras", async () => {
  const fixture = boundary({ publicRow: {
    ...safeReceipt,
    user_id: "private-owner", donor_name: "private-name", donor_email: "private-email",
    donor_phone: "private-phone", donor_notes: "private-note", verification_notes: "private-note",
    pickup_requests: { address_line1: "private-address" },
  } });
  const result = await fixture.actions.getPublicDonationReceipt(safeReceipt.reference);
  assert.deepEqual(result, { success: true, data: safeReceipt });
  assert.equal(fixture.calls.auth, 0);
  assert.deepEqual(fixture.calls.lookups, [{
    name: "get_public_donation_receipt", args: { p_reference: safeReceipt.reference },
  }]);
});

test("tracking strips donor fields and all history identities/internal notes", async () => {
  const publicPoint = { name: "Public fixture", address: "Public address", district: null, city: null, operating_hours: null };
  const event = { to_status: "IMPACTED", created_at: "2026-09-20T01:00:00Z" };
  const fixture = boundary({ publicRow: {
    ...safeReceipt, status: "IMPACTED", method: "DROP_OFF", created_at: "2026-09-19T01:00:00Z",
    donor_notes: "private", donor_name: "private",
    collection_point: { ...publicPoint, notes: "private", id: "internal-id" },
    status_history: [{ ...event, notes: "private", actor_id: "private", donation_id: "private", id: "private" }],
  } });
  const result = await fixture.actions.getDonationByReference(safeReceipt.reference);
  assert.equal(result.success, true);
  assert.equal(result.data.status, "IMPACTED");
  assert.deepEqual(result.data.collection_point, publicPoint);
  assert.deepEqual(result.data.status_history, [event]);
  assert.equal("donor_notes" in result.data, false);
  assert.equal("donor_name" in result.data, false);
});

test("invalid references do not reach Supabase; missing and unavailable are distinct", async () => {
  for (const reference of ["", "DON-2026-1234", "DON-2026-00001' OR true--", "not-a-reference"]) {
    const fixture = boundary();
    const result = await fixture.actions.getPublicDonationReceipt(reference);
    assert.equal(result.code, "INVALID_REFERENCE");
    assert.equal(fixture.calls.clients, 0);
  }
  assert.equal((await boundary().actions.getDonationByReference(safeReceipt.reference)).code, "NOT_FOUND");
  assert.equal((await boundary({ lookupError: { code: "42883" } }).actions.getDonationByReference(safeReceipt.reference)).code, "UNAVAILABLE");
  assert.equal((await boundary({ clientError: true }).actions.getPublicDonationReceipt(safeReceipt.reference)).code, "UNAVAILABLE");
});
