import assert from "node:assert/strict";
import test from "node:test";
import {
  clearPendingDonationSubmission,
  prepareDonationSubmission,
} from "../lib/donation-submission.ts";

function memoryStorage() {
  const values = new Map();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

const payload = {
  waste_type_slug: "minyak-jelantah",
  estimated_quantity: 5,
  method: "PICKUP",
  pickup_address_line1: "Private pickup address",
  donor_email: "private@example.test",
};

test("a failed submission can retry with the same idempotency key", async () => {
  const storage = memoryStorage();
  const first = await prepareDonationSubmission(payload, null, storage);
  const retry = await prepareDonationSubmission(payload, first, storage);
  assert.equal(retry.key, first.key);
});

test("re-entering the same submission after refresh recovers the pending key", async () => {
  const storage = memoryStorage();
  const first = await prepareDonationSubmission(payload, null, storage);
  const afterRefresh = await prepareDonationSubmission({ ...payload }, null, storage);
  assert.equal(afterRefresh.key, first.key);
});

test("editing the submission creates a different idempotency key", async () => {
  const storage = memoryStorage();
  const first = await prepareDonationSubmission(payload, null, storage);
  const edited = await prepareDonationSubmission(
    { ...payload, estimated_quantity: 7 }, first, storage,
  );
  assert.notEqual(edited.key, first.key);
});

test("confirmed success clears the key so a new donation remains possible", async () => {
  const storage = memoryStorage();
  const first = await prepareDonationSubmission(payload, null, storage);
  clearPendingDonationSubmission(storage);
  assert.equal(storage.values.size, 0);
  const nextDonation = await prepareDonationSubmission(payload, null, storage);
  assert.notEqual(nextDonation.key, first.key);
});

test("browser storage contains only a UUID and hash, never private form fields", async () => {
  const storage = memoryStorage();
  await prepareDonationSubmission(payload, null, storage);
  const serialized = Array.from(storage.values.values())[0];
  const saved = JSON.parse(serialized);
  assert.deepEqual(Object.keys(saved).sort(), ["fingerprint", "key"]);
  assert.match(saved.fingerprint, /^[\da-f]{64}$/);
  assert.ok(!serialized.includes(payload.pickup_address_line1));
  assert.ok(!serialized.includes(payload.donor_email));
});

test("malformed stored tokens do not prevent submission", async () => {
  const storage = memoryStorage();
  storage.values.set("donation.pending-submission", "not JSON");
  const pending = await prepareDonationSubmission(payload, null, storage);
  assert.match(pending.key, /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
});

test("disabled browser storage still permits retries using the in-memory key", async () => {
  const unavailable = () => { throw new Error("Storage disabled"); };
  const storage = { getItem: unavailable, setItem: unavailable, removeItem: unavailable };
  const first = await prepareDonationSubmission(payload, null, storage);
  const retry = await prepareDonationSubmission(payload, first, storage);
  assert.equal(retry.key, first.key);
  assert.doesNotThrow(() => clearPendingDonationSubmission(storage));
});
