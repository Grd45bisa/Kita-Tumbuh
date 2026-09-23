-- =============================================================================
-- 022_donation_notifications_and_claim.sql
-- Feature: donor-email status notifications + auto-claim on registration
-- =============================================================================
-- Two related additions requested directly by the product owner:
--
-- 1. An anonymous donor may optionally leave an email address to be notified
--    whenever their donation's status genuinely advances (SUBMITTED →
--    SCHEDULED → COLLECTED → VERIFIED → SORTED → PROCESSED → CONVERTED →
--    IMPACTED, or REJECTED). This is NOT a claim about which product their
--    donation became — the system deliberately cannot make that claim (see
--    docs/ALUR_DONASI.md, "Mengapa Tidak Ada Pelacakan 1:1"). It only informs
--    the donor about the progress of THEIR OWN donation record.
--
--    No email provider is wired up yet (none was installed in this project —
--    see README.md). This migration builds the durable, provider-agnostic
--    half of the feature: every status change that should notify a donor is
--    recorded as a row in `notifications`, with `channel = 'EMAIL'` and
--    `status = 'PENDING'`. A future worker/cron (once a provider is chosen)
--    reads PENDING rows, sends the email, and marks them SENT/FAILED. This
--    keeps the notification durable and auditable even before a provider
--    exists, and avoids fabricating an email that was never actually sent.
--
-- 2. When someone who previously donated anonymously (donor_email set,
--    user_id NULL) later registers with that SAME email address, their past
--    donations are automatically linked to their new account
--    (donations.user_id set) — extending the existing handle_new_user()
--    trigger (003_auth_profiles.sql). Supabase Auth's own email
--    verification is the trust boundary here: only someone who can receive
--    mail at that address can complete signup with it, so linking on exact
--    email match at that point is safe.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Notifications table (append-only outbox, provider-agnostic)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  recipient_email     TEXT NOT NULL,
  channel             TEXT NOT NULL DEFAULT 'EMAIL' CHECK (channel IN ('EMAIL')),

  -- What this notification is about — kept generic so future notification
  -- types (order status, etc.) can reuse this table without a new one.
  event_type          TEXT NOT NULL CHECK (event_type IN ('DONATION_STATUS_CHANGED')),
  entity_type         TEXT NOT NULL,
  entity_id           UUID NOT NULL,

  -- Rendering data for whichever provider eventually sends this — kept as
  -- structured JSON rather than a pre-rendered subject/body so the actual
  -- email template can be designed/changed later without a migration.
  payload             JSONB NOT NULL,

  status              TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  sent_at             TIMESTAMPTZ DEFAULT NULL,
  failure_reason      TEXT DEFAULT NULL,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.notifications IS 'Antrian notifikasi provider-agnostic (append-only outbox). Baris PENDING menunggu dikirim oleh worker/cron begitu provider email dipasang — lihat README.md.';
COMMENT ON COLUMN public.notifications.payload IS 'Data untuk merender pesan (mis. reference, status_from, status_to, waste_type_name) — bukan subjek/isi email yang sudah jadi, supaya template bisa diubah tanpa migration baru.';

CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON public.notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admin-level read only (this is an internal operational queue, not
-- something a donor/member should be able to browse — it can contain other
-- people's email addresses).
CREATE POLICY "notifications_admin_read"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (public.has_permission('donations', 'read'));

-- No client INSERT/UPDATE/DELETE policy: rows are written exclusively by
-- the SECURITY DEFINER trigger below, and marked SENT/FAILED exclusively by
-- the future sending worker via service-role (which bypasses RLS by
-- design), matching the append-only-outbox pattern used for audit_logs.

-- -----------------------------------------------------------------------------
-- 2. Queue a notification whenever a donation's status changes, if the
--    donation has a donor_email on file. Extends (does not replace) the
--    existing record_donation_status_change() trigger from
--    001_donation_foundation.sql, which already writes donation_status_history.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.queue_donation_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.donor_email IS NOT NULL AND NEW.donor_email <> '' THEN
    INSERT INTO public.notifications (recipient_email, event_type, entity_type, entity_id, payload)
    VALUES (
      NEW.donor_email,
      'DONATION_STATUS_CHANGED',
      'donation',
      NEW.id,
      jsonb_build_object(
        'reference', NEW.reference,
        'waste_type_name', NEW.waste_type_name,
        'status_from', OLD.status,
        'status_to', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS donations_queue_status_notification ON public.donations;
CREATE TRIGGER donations_queue_status_notification
  AFTER UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.queue_donation_status_notification();

-- -----------------------------------------------------------------------------
-- 3. Auto-claim: link prior anonymous donations to a new account, but ONLY
--    once that account's email address is genuinely verified.
-- -----------------------------------------------------------------------------
-- IMPORTANT trust-boundary correction versus an earlier draft of this
-- migration: `handle_new_user()` fires AFTER INSERT ON auth.users, which
-- happens the moment supabase.auth.signUp() is called — BEFORE the user has
-- clicked any confirmation link. Whether that insert already carries a
-- confirmed email is a per-project Supabase Auth *dashboard* setting
-- ("Confirm email"), not something this codebase controls or should assume.
-- If that setting is ever off, claiming donations at INSERT time would let
-- anyone sign up with a stranger's email address (unverified) and
-- immediately see that stranger's private donation history — a real
-- account-takeover-adjacent bug, not just an edge case.
--
-- So `handle_new_user()` itself does NOT claim anything. Claiming instead
-- happens in a separate trigger that fires on auth.users UPDATE, and only
-- when `email_confirmed_at` transitions from NULL to a real value — the
-- one moment that is unambiguously true regardless of the "Confirm email"
-- setting, since even a magic-link/PKCE flow (already used elsewhere in
-- this codebase, see app/auth/confirm/route.ts) sets this column exactly
-- when Supabase itself has verified the address.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- If this project has "Confirm email" turned off, the row can already
  -- arrive with email_confirmed_at set — claim immediately in that case
  -- too, since the verification already genuinely happened (Supabase set
  -- that column itself, this code never does).
  IF NEW.email IS NOT NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.donations
       SET user_id = NEW.id
     WHERE user_id IS NULL
       AND donor_email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$;
-- (Trigger on_auth_user_created already exists from 003_auth_profiles.sql
-- and points at this function by name — no re-creation needed.)

CREATE OR REPLACE FUNCTION public.claim_donations_on_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.email IS NOT NULL
     AND NEW.email_confirmed_at IS NOT NULL
     AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.donations
       SET user_id = NEW.id
     WHERE user_id IS NULL
       AND donor_email = NEW.email;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.claim_donations_on_email_verified();
