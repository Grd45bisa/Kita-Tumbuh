import { z } from "zod";

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
