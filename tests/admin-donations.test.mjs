import assert from "node:assert/strict";
import test from "node:test";
import {
  VerifyDonationSchema,
  UpdateDonationStatusSchema,
  isValidDonationStatusTransition,
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

// P0-1402 (Phase 14 audit): isValidDonationStatusTransition previously did
// not exist — UpdateDonationStatusSchema only validated next_status was *a*
// valid enum member, never that it was reachable from the donation's actual
// current status. An admin could jump a freshly SUBMITTED donation straight
// to IMPACTED, or move an already-IMPACTED donation back to SUBMITTED, with
// nothing anywhere in the stack rejecting it.

test("isValidDonationStatusTransition allows exactly one forward step along the lifecycle", () => {
  assert.equal(isValidDonationStatusTransition("SUBMITTED", "SCHEDULED"), true);
  assert.equal(isValidDonationStatusTransition("SCHEDULED", "COLLECTED"), true);
  assert.equal(isValidDonationStatusTransition("COLLECTED", "VERIFIED"), true);
  assert.equal(isValidDonationStatusTransition("VERIFIED", "SORTED"), true);
  assert.equal(isValidDonationStatusTransition("SORTED", "PROCESSED"), true);
  assert.equal(isValidDonationStatusTransition("PROCESSED", "CONVERTED"), true);
  assert.equal(isValidDonationStatusTransition("CONVERTED", "IMPACTED"), true);
});

test("isValidDonationStatusTransition allows the documented DROP-OFF shortcut (SUBMITTED -> COLLECTED)", () => {
  assert.equal(isValidDonationStatusTransition("SUBMITTED", "COLLECTED"), true);
});

test("isValidDonationStatusTransition rejects multi-step forward jumps", () => {
  assert.equal(isValidDonationStatusTransition("SUBMITTED", "VERIFIED"), false);
  assert.equal(isValidDonationStatusTransition("SUBMITTED", "IMPACTED"), false);
  assert.equal(isValidDonationStatusTransition("SCHEDULED", "SORTED"), false);
  assert.equal(isValidDonationStatusTransition("VERIFIED", "CONVERTED"), false);
});

test("isValidDonationStatusTransition rejects any backward transition", () => {
  assert.equal(isValidDonationStatusTransition("IMPACTED", "SUBMITTED"), false);
  assert.equal(isValidDonationStatusTransition("VERIFIED", "SCHEDULED"), false);
  assert.equal(isValidDonationStatusTransition("CONVERTED", "PROCESSED"), false);
  assert.equal(isValidDonationStatusTransition("SORTED", "VERIFIED"), false);
});

test("isValidDonationStatusTransition rejects a no-op (same status to itself)", () => {
  for (const s of ["SUBMITTED", "SCHEDULED", "COLLECTED", "VERIFIED", "SORTED", "PROCESSED", "CONVERTED", "IMPACTED"]) {
    assert.equal(isValidDonationStatusTransition(s, s), false, `${s} -> ${s} should not be a valid transition`);
  }
});

test("isValidDonationStatusTransition allows REJECTED from any status before CONVERTED", () => {
  assert.equal(isValidDonationStatusTransition("SUBMITTED", "REJECTED"), true);
  assert.equal(isValidDonationStatusTransition("SCHEDULED", "REJECTED"), true);
  assert.equal(isValidDonationStatusTransition("COLLECTED", "REJECTED"), true);
  assert.equal(isValidDonationStatusTransition("VERIFIED", "REJECTED"), true);
  assert.equal(isValidDonationStatusTransition("SORTED", "REJECTED"), true);
  assert.equal(isValidDonationStatusTransition("PROCESSED", "REJECTED"), true);
});

test("isValidDonationStatusTransition forbids REJECTED once a donation has been CONVERTED or IMPACTED", () => {
  assert.equal(isValidDonationStatusTransition("CONVERTED", "REJECTED"), false);
  assert.equal(isValidDonationStatusTransition("IMPACTED", "REJECTED"), false);
  assert.equal(isValidDonationStatusTransition("REJECTED", "REJECTED"), false);
});

test("isValidDonationStatusTransition rejects unknown status strings on either side", () => {
  assert.equal(isValidDonationStatusTransition("BOGUS", "SCHEDULED"), false);
  assert.equal(isValidDonationStatusTransition("SUBMITTED", "BOGUS"), false);
});
