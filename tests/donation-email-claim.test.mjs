import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// =============================================================================
// Feature: donor-email status notifications + auto-claim on verified
// registration (022_donation_notifications_and_claim.sql).
//
// Critical security property under test: a donation must NEVER be linked to
// a new account (donations.user_id set) before that account's email is
// GENUINELY verified by Supabase Auth (email_confirmed_at set by Supabase
// itself, never assumed at row-insert time). An earlier draft of this
// migration claimed donations directly inside handle_new_user() (which
// fires at auth.users INSERT, before any confirmation), which would have
// let anyone sign up with a stranger's unverified email address and
// immediately see that stranger's private donation history if the
// Supabase project's "Confirm email" dashboard setting were ever off.
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function readSource(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

const migration = readSource("supabase/migrations/022_donation_notifications_and_claim.sql");

test("handle_new_user() does not unconditionally claim donations at auth.users INSERT time", () => {
  // Find the handle_new_user() function body specifically (not the whole
  // file, so this doesn't accidentally match the separate, correctly-gated
  // claim_donations_on_email_verified() function below it).
  const fnMatch = migration.match(/CREATE OR REPLACE FUNCTION public\.handle_new_user\(\)[\s\S]*?\$\$;/);
  assert.ok(fnMatch, "Expected to find handle_new_user() function body");
  const fnBody = fnMatch[0];

  if (/UPDATE public\.donations/.test(fnBody)) {
    // If handle_new_user() touches donations at all, it MUST be gated on
    // email_confirmed_at IS NOT NULL — never an unconditional claim at
    // INSERT time.
    assert.match(
      fnBody,
      /email_confirmed_at IS NOT NULL/,
      "handle_new_user() updates donations.user_id but does not check NEW.email_confirmed_at IS NOT NULL — this would claim donations for an unverified email address."
    );
  }
});

test("a dedicated trigger claims donations only when email_confirmed_at transitions from NULL to set", () => {
  assert.match(
    migration,
    /AFTER UPDATE OF email_confirmed_at ON auth\.users/,
    "Expected a trigger firing specifically on auth.users UPDATE OF email_confirmed_at"
  );

  const fnMatch = migration.match(/CREATE OR REPLACE FUNCTION public\.claim_donations_on_email_verified\(\)[\s\S]*?\$\$;/);
  assert.ok(fnMatch, "Expected to find claim_donations_on_email_verified() function body");
  const fnBody = fnMatch[0];

  assert.match(fnBody, /NEW\.email_confirmed_at IS NOT NULL/, "Must require the new value to be set");
  assert.match(fnBody, /OLD\.email_confirmed_at IS NULL/, "Must require the old value to have been unset (a genuine NULL->set transition, not a re-fire)");
  assert.match(fnBody, /UPDATE public\.donations/);
  assert.match(fnBody, /WHERE user_id IS NULL/, "Must only claim donations that are still anonymous — never reassign an already-owned donation");
  assert.match(fnBody, /donor_email = NEW\.email/, "Must match on the exact verified email address");
});

test("donation status-change notifications are only queued when donor_email is present", () => {
  const fnMatch = migration.match(/CREATE OR REPLACE FUNCTION public\.queue_donation_status_notification\(\)[\s\S]*?\$\$ LANGUAGE plpgsql/);
  assert.ok(fnMatch, "Expected to find queue_donation_status_notification() function body");
  const fnBody = fnMatch[0];

  assert.match(fnBody, /NEW\.donor_email IS NOT NULL/, "Must not queue a notification when there's no email to send it to");
  assert.match(fnBody, /OLD\.status IS DISTINCT FROM NEW\.status/, "Must only fire on a genuine status change, not every update");
});

test("notifications table has no client-facing INSERT/UPDATE/DELETE policy (write-restricted like audit_logs)", () => {
  // A public/authenticated INSERT or UPDATE policy on notifications would
  // let a client forge notification rows (e.g. spoofing an event about
  // another donation, or marking their own pending notification as SENT to
  // hide it from an admin's outbox review).
  assert.doesNotMatch(
    migration,
    /CREATE POLICY[^;]*ON public\.notifications[^;]*FOR (INSERT|UPDATE|DELETE|ALL)[^;]*TO authenticated/is,
    "notifications must not have a client-writable RLS policy — rows are written only by the SECURITY DEFINER trigger and marked SENT/FAILED only by a future service-role worker"
  );
  assert.match(migration, /CREATE POLICY "notifications_admin_read"/);
});

test("notifications.event_type and channel are constrained by CHECK, not free text", () => {
  assert.match(migration, /event_type\s+TEXT NOT NULL CHECK \(event_type IN \('DONATION_STATUS_CHANGED'\)\)/);
  assert.match(migration, /channel\s+TEXT NOT NULL DEFAULT 'EMAIL' CHECK \(channel IN \('EMAIL'\)\)/);
});
