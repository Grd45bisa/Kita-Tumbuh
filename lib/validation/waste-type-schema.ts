import { z } from "zod";

export const WasteTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama jenis limbah minimal 2 karakter.")
    .max(100, "Nama jenis limbah maksimal 100 karakter."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter.")
    .max(100, "Slug maksimal 100 karakter.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"),
  description: z.string().trim().max(500, "Deskripsi maksimal 500 karakter.").optional().default(""),
  unit: z.string().trim().min(1, "Satuan takaran wajib diisi.").max(20, "Satuan maksimal 20 karakter."),
  min_quantity: z.coerce.number().min(0, "Kuantitas minimum tidak boleh negatif."),
  max_quantity: z.coerce
    .number()
    .positive("Kuantitas maksimum harus bernilai positif.")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  accepted_notes: z.string().trim().max(1000, "Catatan diterima maksimal 1000 karakter.").optional().default(""),
  rejected_notes: z.string().trim().max(1000, "Catatan ditolak maksimal 1000 karakter.").optional().default(""),
  sort_order: z.coerce.number().int().min(0, "Urutan harus berupa angka positif.").default(0),
  is_active: z.coerce.boolean().default(true),
});

export type WasteTypeInput = z.infer<typeof WasteTypeSchema>;
