import { z } from "zod";

// =============================================================================
// DONATION VALIDATION SCHEMAS
// Shared between client (for UX) and server (for security).
// =============================================================================

// Step 1 — Material selection
export const StepMaterialSchema = z.object({
  waste_type_id: z.string().uuid({ message: "Pilih jenis limbah yang valid." }),
  waste_type_slug: z.string().min(1, "Pilih jenis limbah."),
  waste_type_name: z.string().min(1),
  unit: z.string().min(1),
});

// Step 2 — Quantity
export const StepQuantitySchema = z.object({
  estimated_quantity: z
    .number()
    .positive({ message: "Jumlah harus lebih dari 0." })
    .max(9999, { message: "Jumlah terlalu besar. Hubungi kami untuk donasi massal." }),
});

// Step 3 — Method: drop-off
export const StepMethodDropOffSchema = z.object({
  method: z.literal("DROP_OFF"),
  collection_point_id: z.string().uuid({ message: "Pilih lokasi collection point." }),
  donor_notes: z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
});

// Step 3 — Method: pickup
export const StepMethodPickupSchema = z.object({
  method: z.literal("PICKUP"),
  pickup_address_line1: z
    .string()
    .min(5, "Masukkan alamat lengkap (minimal 5 karakter).")
    .max(200, "Alamat terlalu panjang."),
  pickup_address_line2: z.string().max(200).optional(),
  pickup_district: z.string().max(100).optional(),
  pickup_city: z.string().max(100).optional(),
  pickup_requested_date: z
    .string()
    .min(1, "Pilih tanggal pickup.")
    .refine((val) => {
      const date = new Date(val);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return date >= tomorrow;
    }, { message: "Tanggal pickup minimal besok." }),
  pickup_requested_slot: z.string().optional(),
  pickup_notes: z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
  donor_notes: z.string().max(500).optional(),
});

export const StepMethodSchema = z.discriminatedUnion("method", [
  StepMethodDropOffSchema,
  StepMethodPickupSchema,
]);

// Step 4 — Optional donor identity (for anonymous donations)
export const DonorIdentitySchema = z.object({
  donor_name: z.string().max(100).optional(),
  donor_email: z
    .string()
    .email({ message: "Format email tidak valid." })
    .optional()
    .or(z.literal("")),
  donor_phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, { message: "Format telepon tidak valid." })
    .optional()
    .or(z.literal("")),
});

// Full server-side submission schema
export const DonationSubmitSchema = z
  .object({
    waste_type_id: z.string().uuid({ message: "Jenis limbah tidak valid." }),
    waste_type_slug: z.string().min(1),
    waste_type_name: z.string().min(1),
    unit: z.string().min(1),
    estimated_quantity: z
      .number()
      .positive({ message: "Jumlah harus lebih dari 0." })
      .max(9999),
    donor_name: z.string().max(100).optional().or(z.literal("")),
    donor_email: z.string().email().optional().or(z.literal("")),
    donor_phone: z.string().max(20).optional().or(z.literal("")),
    donor_notes: z.string().max(500).optional(),
    idempotency_key: z.string().uuid({ message: "Kunci idempotency tidak valid." }),
  })
  .and(StepMethodSchema);

// TypeScript types inferred from schemas
export type StepMaterialData = z.infer<typeof StepMaterialSchema>;
export type StepQuantityData = z.infer<typeof StepQuantitySchema>;
export type StepMethodData = z.infer<typeof StepMethodSchema>;
export type DonorIdentityData = z.infer<typeof DonorIdentitySchema>;
export type DonationSubmitData = z.infer<typeof DonationSubmitSchema>;
