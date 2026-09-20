import assert from "node:assert/strict";
import test from "node:test";
import {
  VerifyDonationSchema,
  UpdateDonationStatusSchema,
} from "../lib/validation/admin-donation-schema.ts";

test("VerifyDonationSchema accepts valid verified quantity and notes", () => {
  const valid = VerifyDonationSchema.safeParse({
    verified_quantity: 4.85,
    verification_notes: "Penimbangan digital di pos utama. Minyak jernih disaring.",
    decision: "VERIFIED",
  });

  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.verified_quantity, 4.85);
    assert.equal(valid.data.decision, "VERIFIED");
  }
});

test("VerifyDonationSchema accepts REJECTED decision with 0 or positive quantity", () => {
  const rejected = VerifyDonationSchema.safeParse({
    verified_quantity: 0,
    verification_notes: "Kandungan air melebihi 50%, tidak dapat diolah.",
    decision: "REJECTED",
  });

  assert.equal(rejected.success, true);
});

test("VerifyDonationSchema rejects negative quantity or empty notes", () => {
  const negative = VerifyDonationSchema.safeParse({
    verified_quantity: -2,
    verification_notes: "Catatan valid",
    decision: "VERIFIED",
  });
  assert.equal(negative.success, false);

  const emptyNotes = VerifyDonationSchema.safeParse({
    verified_quantity: 5,
    verification_notes: " ",
    decision: "VERIFIED",
  });
  assert.equal(emptyNotes.success, false);
});

test("UpdateDonationStatusSchema validates all 8 lifecycle statuses", () => {
  const statuses = [
    "SUBMITTED",
    "SCHEDULED",
    "COLLECTED",
    "VERIFIED",
    "SORTED",
    "PROCESSED",
    "CONVERTED",
    "IMPACTED",
    "REJECTED",
  ];

  for (const s of statuses) {
    const res = UpdateDonationStatusSchema.safeParse({ next_status: s });
    assert.equal(res.success, true, `Expected status ${s} to be valid`);
  }

  const invalid = UpdateDonationStatusSchema.safeParse({ next_status: "UNKNOWN_STATUS" });
  assert.equal(invalid.success, false);
});
