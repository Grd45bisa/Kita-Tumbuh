const STORAGE_KEY = "donation.pending-submission";

type SubmissionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface PendingDonationSubmission {
  key: string;
  fingerprint: string;
}

function sessionStorage(): SubmissionStorage | undefined {
  try {
    return globalThis.sessionStorage;
  } catch {
    // Browser privacy settings can disable storage; in-memory retries still work.
    return undefined;
  }
}

function readPending(storage?: SubmissionStorage): PendingDonationSubmission | null {
  try {
    const saved: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "null");
    if (
      typeof saved === "object" && saved !== null &&
      "key" in saved && typeof saved.key === "string" &&
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(saved.key) &&
      "fingerprint" in saved && typeof saved.fingerprint === "string" &&
      /^[\da-f]{64}$/i.test(saved.fingerprint)
    ) {
      return { key: saved.key, fingerprint: saved.fingerprint };
    }
  } catch {
    // Ignore malformed or inaccessible browser storage.
  }
  return null;
}

export async function prepareDonationSubmission(
  payload: Record<string, unknown>,
  previous: PendingDonationSubmission | null,
  storage: SubmissionStorage | undefined = sessionStorage(),
): Promise<PendingDonationSubmission> {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const fingerprint = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const saved = previous ?? readPending(storage);
  const pending = saved?.fingerprint === fingerprint
    ? saved
    : { key: globalThis.crypto.randomUUID(), fingerprint };

  try {
    // Persist only the retry token and hash, never the address/contact/form data.
    storage?.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // The component retains this token in memory if persistence is unavailable.
  }
  return pending;
}

export function clearPendingDonationSubmission(
  storage: SubmissionStorage | undefined = sessionStorage(),
): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Storage failure must not turn a confirmed donation into a failed submission.
  }
}
