import { z } from "zod";

export const InventoryAdjustmentSchema = z.object({
  waste_lot_id: z.string().uuid("ID lot limbah tidak valid."),
  adjustment_type: z.enum(["ADD", "SUBTRACT"], {
    message: "Tipe penyesuaian harus ADD atau SUBTRACT.",
  }),
  quantity: z.coerce
    .number({ message: "Kuantitas harus berupa angka." })
    .positive("Kuantitas penyesuaian harus lebih dari 0."),
  reason: z
    .string()
    .trim()
    .min(5, "Alasan penyesuaian stok wajib diisi (minimal 5 karakter).")
    .max(500, "Alasan maksimal 500 karakter."),
});

export type InventoryAdjustmentInput = z.infer<typeof InventoryAdjustmentSchema>;

export const CreateWasteLotSchema = z.object({
  waste_type_id: z.string().uuid("Pilih jenis limbah yang valid."),
  source_donation_id: z.string().uuid().optional().nullable().or(z.literal("").transform(() => null)),
  lot_code: z
    .string()
    .trim()
    .min(3, "Kode lot minimal 3 karakter.")
    .max(50, "Kode lot maksimal 50 karakter.")
    .regex(/^[A-Z0-9-]+$/i, "Kode lot hanya boleh huruf, angka, dan strip."),
  initial_quantity: z.coerce
    .number({ message: "Kuantitas harus berupa angka." })
    .positive("Kuantitas awal harus lebih dari 0."),
  unit: z.string().trim().min(1, "Satuan takaran wajib diisi."),
  quality_grade: z.enum(["GRADE_A", "STANDARD", "GRADE_C"]).default("STANDARD"),
  storage_location: z.string().trim().max(100).default("Gudang Utama SEMAI"),
  notes: z.string().trim().max(500).optional().default(""),
});

export type CreateWasteLotInput = z.infer<typeof CreateWasteLotSchema>;
