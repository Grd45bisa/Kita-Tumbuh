import { z } from "zod";

export const PRODUCTION_STATUS_STEPS = [
  "PLANNED",
  "IN_PROGRESS",
  "QC_REVIEW",
  "COMPLETED",
  "RELEASED",
] as const;

export type ProductionBatchStatus = (typeof PRODUCTION_STATUS_STEPS)[number];

export const PRODUCTION_STATUS_LABELS: Record<ProductionBatchStatus, { label: string; description: string }> = {
  PLANNED: {
    label: "Direncanakan",
    description: "Batch telah dijadwalkan, menunggu alokasi bahan baku limbah.",
  },
  IN_PROGRESS: {
    label: "Sedang Diproses",
    description: "Proses pengolahan/formulasi aktif sedang berjalan di workshop.",
  },
  QC_REVIEW: {
    label: "Uji Kualitas (QC)",
    description: "Tahap evaluasi parameter mutu dan keamanan hasil pengolahan.",
  },
  COMPLETED: {
    label: "Selesai Diproduksi",
    description: "Pengolahan selesai, kuantitas output dan susut/loss tercatat.",
  },
  RELEASED: {
    label: "Siap Distribusi",
    description: "Batch dirilis dan siap dikemas atau dimasukkan ke katalog produk.",
  },
};

export const CreateProductionBatchSchema = z.object({
  batch_number: z
    .string()
    .trim()
    .min(3, "Nomor batch minimal 3 karakter.")
    .max(50, "Nomor batch maksimal 50 karakter.")
    .regex(/^[A-Z0-9-]+$/i, "Nomor batch hanya boleh huruf, angka, dan tanda hubung (-)."),
  title: z
    .string()
    .trim()
    .min(5, "Nama/judul batch minimal 5 karakter.")
    .max(150, "Nama/judul batch maksimal 150 karakter."),
  target_output_type: z
    .string()
    .trim()
    .min(2, "Jenis output target wajib diisi.")
    .max(100, "Maksimal 100 karakter."),
  target_quantity: z.coerce
    .number({ message: "Target kuantitas harus berupa angka." })
    .positive("Target kuantitas harus lebih dari 0."),
  output_unit: z
    .string()
    .trim()
    .min(1, "Satuan output target wajib diisi.")
    .max(20, "Maksimal 20 karakter."),
  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter.").optional().default(""),
});

export type CreateProductionBatchInput = z.infer<typeof CreateProductionBatchSchema>;

export const AddBatchInputSchema = z.object({
  batch_id: z.string().uuid("ID batch produksi tidak valid."),
  waste_lot_id: z.string().uuid("Pilih lot limbah yang valid."),
  quantity_used: z.coerce
    .number({ message: "Kuantitas penggunaan harus berupa angka." })
    .positive("Kuantitas penggunaan harus lebih dari 0."),
  unit: z.string().trim().min(1, "Satuan wajib diisi."),
  notes: z.string().trim().max(500).optional().default(""),
});

export type AddBatchInput = z.infer<typeof AddBatchInputSchema>;

export const UpdateBatchStatusSchema = z.object({
  batch_id: z.string().uuid("ID batch tidak valid."),
  status: z.enum(PRODUCTION_STATUS_STEPS, {
    message: "Status batch tidak valid.",
  }),
  actual_output_quantity: z.coerce
    .number({ message: "Output riil harus berupa angka." })
    .min(0, "Output riil tidak boleh negatif.")
    .optional(),
  loss_quantity: z.coerce
    .number({ message: "Kuantitas loss harus berupa angka." })
    .min(0, "Loss tidak boleh negatif.")
    .optional(),
  loss_reason: z.string().trim().max(500).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
});

export type UpdateBatchStatusInput = z.infer<typeof UpdateBatchStatusSchema>;
