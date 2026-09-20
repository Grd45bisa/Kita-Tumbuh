import { z } from "zod";

/**
 * Donation lifecycle order per ARSITEKTUR.md §7.1:
 *   SUBMITTED → SCHEDULED → COLLECTED → VERIFIED → SORTED → PROCESSED →
 *   CONVERTED → IMPACTED
 * (DROP-OFF donations may skip SCHEDULED straight to COLLECTED — handled by
 * allowing a forward jump of exactly one extra step at that specific point,
 * see isValidDonationStatusTransition below.)
 * REJECTED is a terminal state reachable from any status before CONVERTED
 * (a donation already converted into product inventory no longer makes
 * sense to reject).
 */
export const DONATION_STATUS_ORDER = [
  "SUBMITTED",
  "SCHEDULED",
  "COLLECTED",
  "VERIFIED",
  "SORTED",
  "PROCESSED",
  "CONVERTED",
  "IMPACTED",
] as const;

/**
 * Validates a donation status transition against the lifecycle order.
 * Found missing during the Phase 14 test-coverage audit (P0-1402 "status
 * transition rules"): UpdateDonationStatusSchema only checked that
 * next_status was *a* valid enum value, never that it was a *reachable*
 * next step from the donation's current status — an admin could jump a
 * freshly SUBMITTED donation straight to IMPACTED, or move an already
 * IMPACTED donation back to SUBMITTED, in one click with no validation
 * anywhere in the stack.
 */
export function isValidDonationStatusTransition(
  currentStatus: string,
  nextStatus: string
): boolean {
  if (nextStatus === "REJECTED") {
    // Terminal from any point before the donation has been converted into
    // product inventory.
    return currentStatus !== "CONVERTED" && currentStatus !== "IMPACTED" && currentStatus !== "REJECTED";
  }

  const currentIndex = DONATION_STATUS_ORDER.indexOf(currentStatus as (typeof DONATION_STATUS_ORDER)[number]);
  const nextIndex = DONATION_STATUS_ORDER.indexOf(nextStatus as (typeof DONATION_STATUS_ORDER)[number]);

  if (currentIndex === -1 || nextIndex === -1) return false;

  // Exactly one step forward — except the documented DROP-OFF shortcut,
  // which allows skipping SCHEDULED (index 1) to go straight from
  // SUBMITTED (index 0) to COLLECTED (index 2).
  if (nextIndex === currentIndex + 1) return true;
  if (currentStatus === "SUBMITTED" && nextStatus === "COLLECTED") return true;

  return false;
}

export const VerifyDonationSchema = z.object({
  verified_quantity: z.coerce
    .number({ message: "Kuantitas terverifikasi harus berupa angka." })
    .min(0, "Kuantitas terverifikasi tidak boleh negatif.")
    .max(99999, "Kuantitas terlalu besar."),
  verification_notes: z
    .string()
    .trim()
    .min(2, "Catatan verifikasi penimbangan wajib diisi (minimal 2 karakter).")
    .max(1000, "Catatan verifikasi maksimal 1000 karakter."),
  decision: z.enum(["VERIFIED", "REJECTED"], {
    message: "Keputusan harus VERIFIED atau REJECTED.",
  }),
});

export type VerifyDonationInput = z.infer<typeof VerifyDonationSchema>;

export const UpdateDonationStatusSchema = z.object({
  next_status: z.enum(
    [
      "SUBMITTED",
      "SCHEDULED",
      "COLLECTED",
      "VERIFIED",
      "SORTED",
      "PROCESSED",
      "CONVERTED",
      "IMPACTED",
      "REJECTED",
    ],
    { message: "Status tidak valid." }
  ),
  notes: z.string().trim().max(1000, "Catatan maksimal 1000 karakter.").optional().default(""),
});

export type UpdateDonationStatusInput = z.infer<typeof UpdateDonationStatusSchema>;
