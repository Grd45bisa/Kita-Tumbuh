import { z } from "zod";

export const RECONCILIATION_STATUSES = [
  "PENDING",
  "RECONCILED",
  "DISCREPANCY",
] as const;

export type ReconciliationStatus = (typeof RECONCILIATION_STATUSES)[number];

export const RECONCILIATION_STATUS_LABELS: Record<ReconciliationStatus, string> = {
  PENDING: "Menunggu Rekonsiliasi",
  RECONCILED: "Terekonsiliasi Cocok",
  DISCREPANCY: "Terdapat Selisih",
};

export const UpdateReconciliationSchema = z.object({
  entry_id: z.string().uuid("ID entry tidak valid."),
  status: z.enum(RECONCILIATION_STATUSES, {
    message: "Status rekonsiliasi tidak valid.",
  }),
  notes: z.string().trim().max(500).optional(),
});

export type UpdateReconciliationInput = z.infer<typeof UpdateReconciliationSchema>;

export const ALLOCATION_APPROVAL_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export type AllocationApprovalStatus = (typeof ALLOCATION_APPROVAL_STATUSES)[number];

export const ALLOCATION_APPROVAL_LABELS: Record<AllocationApprovalStatus, string> = {
  PENDING: "Menunggu Persetujuan",
  APPROVED: "Disetujui & Dialokasikan",
  REJECTED: "Ditolak",
};

export const CreateSocialAllocationSchema = z.object({
  program_name: z
    .string()
    .trim()
    .min(3, "Nama program minimal 3 karakter.")
    .max(100, "Nama program maksimal 100 karakter."),
  funding_source_reference: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("REVENUE_SALES"),
  amount: z.coerce
    .number({ message: "Nominal alokasi harus berupa angka." })
    .int("Nominal alokasi harus bilangan bulat.")
    .positive("Nominal alokasi harus lebih dari 0.")
    .min(1000, "Nominal alokasi minimal Rp 1.000."),
  notes: z.string().trim().max(500).optional().default(""),
});

export type CreateSocialAllocationInput = z.input<typeof CreateSocialAllocationSchema>;
export type CreateSocialAllocationOutput = z.output<typeof CreateSocialAllocationSchema>;

export const EXPENSE_CATEGORIES = [
  "LOGISTICS",
  "PACKAGING",
  "EQUIPMENT",
  "UTILITIES",
  "OTHER",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  LOGISTICS: "Logistik & Armada Pickup",
  PACKAGING: "Wadah & Kemasan Produk",
  EQUIPMENT: "Peralatan & Cetakan Pengolahan",
  UTILITIES: "Utilitas (Listrik / Air / Gas)",
  OTHER: "Operasional Lain-Lain",
};

export const CreateExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, {
    message: "Kategori pengeluaran tidak valid.",
  }),
  amount: z.coerce
    .number({ message: "Nominal pengeluaran harus berupa angka." })
    .int("Nominal harus bilangan bulat.")
    .positive("Nominal harus lebih dari 0.")
    .min(1000, "Nominal pengeluaran minimal Rp 1.000."),
  occurred_at: z
    .string()
    .optional()
    .default(() => new Date().toISOString()),
  notes: z
    .string()
    .trim()
    .min(3, "Catatan pengeluaran minimal 3 karakter.")
    .max(500, "Catatan pengeluaran maksimal 500 karakter."),
  attachment_url: z.string().trim().max(500).optional().default(""),
});

export type CreateExpenseInput = z.input<typeof CreateExpenseSchema>;
export type CreateExpenseOutput = z.output<typeof CreateExpenseSchema>;
