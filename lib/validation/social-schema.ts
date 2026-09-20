import { z } from "zod";

// =============================================================================
// Social Programs (P0-701)
// =============================================================================

export const SOCIAL_PROGRAM_STATUSES = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "ACTIVE",
  "FUNDED",
  "PARTIALLY_FUNDED",
  "DISTRIBUTED",
  "COMPLETED",
] as const;

export type SocialProgramStatus = (typeof SOCIAL_PROGRAM_STATUSES)[number];

export const SOCIAL_PROGRAM_STATUS_LABELS: Record<SocialProgramStatus, string> = {
  DRAFT: "Draf",
  REVIEW: "Sedang Ditinjau",
  APPROVED: "Disetujui",
  ACTIVE: "Aktif Berjalan",
  FUNDED: "Terdanai Penuh",
  PARTIALLY_FUNDED: "Terdanai Sebagian",
  DISTRIBUTED: "Sudah Disalurkan",
  COMPLETED: "Selesai",
};

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CreateSocialProgramSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama program minimal 3 karakter.")
    .max(150, "Nama program maksimal 150 karakter."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug minimal 3 karakter.")
    .max(150, "Slug maksimal 150 karakter.")
    .regex(slugRegex, "Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)."),
  description: z
    .string()
    .trim()
    .min(10, "Deskripsi program minimal 10 karakter.")
    .max(2000, "Deskripsi program maksimal 2000 karakter."),
  goal: z
    .string()
    .trim()
    .min(5, "Tujuan program minimal 5 karakter.")
    .max(500, "Tujuan program maksimal 500 karakter."),
  status: z.enum(SOCIAL_PROGRAM_STATUSES, { message: "Status program tidak valid." }).default("DRAFT"),
  target_amount: z
    .union([
      z.coerce
        .number()
        .int("Target dana harus bilangan bulat.")
        .positive("Target dana harus lebih dari 0."),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
  start_date: z.string().trim().optional().nullable().default(null),
  end_date: z.string().trim().optional().nullable().default(null),
  public_status: z.coerce.boolean().default(false),
});

export type CreateSocialProgramInput = z.input<typeof CreateSocialProgramSchema>;
export type CreateSocialProgramOutput = z.output<typeof CreateSocialProgramSchema>;

export const UpdateSocialProgramSchema = CreateSocialProgramSchema.extend({
  id: z.string().uuid("ID program tidak valid."),
});

export type UpdateSocialProgramInput = z.input<typeof UpdateSocialProgramSchema>;

// =============================================================================
// Beneficiaries (P0-702)
// =============================================================================

export const BENEFICIARY_CATEGORIES = [
  "CHILD_WITH_DISABILITY",
  "ELDERLY",
  "FAMILY",
  "OTHER",
] as const;

export type BeneficiaryCategory = (typeof BENEFICIARY_CATEGORIES)[number];

export const BENEFICIARY_CATEGORY_LABELS: Record<BeneficiaryCategory, string> = {
  CHILD_WITH_DISABILITY: "Anak Difabel",
  ELDERLY: "Lansia",
  FAMILY: "Keluarga Prasejahtera",
  OTHER: "Lainnya",
};

export const VERIFICATION_STATUSES = ["PENDING", "VERIFIED", "REJECTED"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  PENDING: "Menunggu Verifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
};

export const CONSENT_STATUSES = ["NOT_REQUESTED", "PENDING", "GRANTED", "DECLINED", "REVOKED"] as const;
export type ConsentStatus = (typeof CONSENT_STATUSES)[number];

export const CONSENT_STATUS_LABELS: Record<ConsentStatus, string> = {
  NOT_REQUESTED: "Belum Diminta",
  PENDING: "Menunggu Persetujuan",
  GRANTED: "Diberikan",
  DECLINED: "Ditolak",
  REVOKED: "Dicabut",
};

export const PRIVACY_LEVELS = ["PRIVATE", "ALIAS_ONLY", "PUBLIC"] as const;
export type PrivacyLevel = (typeof PRIVACY_LEVELS)[number];

export const PRIVACY_LEVEL_LABELS: Record<PrivacyLevel, string> = {
  PRIVATE: "Privat (Tidak Pernah Publik)",
  ALIAS_ONLY: "Hanya Alias/Kategori Boleh Publik",
  PUBLIC: "Boleh Publik (Sesuai Persetujuan)",
};

export const CreateBeneficiarySchema = z.object({
  name_or_alias: z
    .string()
    .trim()
    .min(2, "Nama atau alias minimal 2 karakter.")
    .max(150, "Nama atau alias maksimal 150 karakter."),
  category: z.enum(BENEFICIARY_CATEGORIES, { message: "Kategori penerima manfaat tidak valid." }),
  need_type: z
    .string()
    .trim()
    .min(3, "Jenis kebutuhan minimal 3 karakter.")
    .max(300, "Jenis kebutuhan maksimal 300 karakter."),
  verification_status: z.enum(VERIFICATION_STATUSES).default("PENDING"),
  consent_status: z.enum(CONSENT_STATUSES).default("NOT_REQUESTED"),
  privacy_level: z.enum(PRIVACY_LEVELS).default("PRIVATE"),
  notes: z.string().trim().max(1000).optional().default(""),
}).refine(
  (data) => !(data.privacy_level === "PUBLIC" && data.consent_status !== "GRANTED"),
  {
    message: "Privacy level PUBLIC hanya boleh dipilih jika consent_status adalah GRANTED.",
    path: ["privacy_level"],
  }
);

export type CreateBeneficiaryInput = z.input<typeof CreateBeneficiarySchema>;
export type CreateBeneficiaryOutput = z.output<typeof CreateBeneficiarySchema>;

export const UpdateBeneficiarySchema = z.object({
  id: z.string().uuid("ID penerima manfaat tidak valid."),
  name_or_alias: z.string().trim().min(2).max(150),
  category: z.enum(BENEFICIARY_CATEGORIES),
  need_type: z.string().trim().min(3).max(300),
  verification_status: z.enum(VERIFICATION_STATUSES),
  consent_status: z.enum(CONSENT_STATUSES),
  privacy_level: z.enum(PRIVACY_LEVELS),
  notes: z.string().trim().max(1000).optional().default(""),
}).refine(
  (data) => !(data.privacy_level === "PUBLIC" && data.consent_status !== "GRANTED"),
  {
    message: "Privacy level PUBLIC hanya boleh dipilih jika consent_status adalah GRANTED.",
    path: ["privacy_level"],
  }
);

export type UpdateBeneficiaryInput = z.input<typeof UpdateBeneficiarySchema>;

// =============================================================================
// Distributions (P0-703)
// =============================================================================

export const DISTRIBUTION_APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type DistributionApprovalStatus = (typeof DISTRIBUTION_APPROVAL_STATUSES)[number];

export const DISTRIBUTION_APPROVAL_LABELS: Record<DistributionApprovalStatus, string> = {
  PENDING: "Menunggu Persetujuan",
  APPROVED: "Disetujui & Disalurkan",
  REJECTED: "Ditolak",
};

export const CreateDistributionSchema = z
  .object({
    program_id: z.string().uuid("Program tidak valid."),
    beneficiary_id: z.string().uuid("Penerima manfaat tidak valid."),
    allocation_id: z
      .union([z.string().uuid(), z.literal(""), z.null()])
      .optional()
      .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
    amount: z
      .union([
        z.coerce.number().int("Nominal harus bilangan bulat.").positive("Nominal harus lebih dari 0."),
        z.literal(""),
        z.null(),
      ])
      .optional()
      .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
    item_description: z.string().trim().max(500).optional().default(""),
    distributed_at: z
      .string()
      .trim()
      .optional()
      .default(() => new Date().toISOString().slice(0, 10)),
    evidence_url: z.string().trim().max(500).optional().default(""),
    evidence_notes: z.string().trim().max(1000).optional().default(""),
  })
  .refine((data) => data.amount !== null || (data.item_description && data.item_description.length > 0), {
    message: "Distribusi harus mencatat nominal dana dan/atau deskripsi barang.",
    path: ["amount"],
  });

export type CreateDistributionInput = z.input<typeof CreateDistributionSchema>;
export type CreateDistributionOutput = z.output<typeof CreateDistributionSchema>;
