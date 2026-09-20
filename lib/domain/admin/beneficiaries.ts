"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/domain/admin/audit-logs";
import {
  CreateBeneficiarySchema,
  UpdateBeneficiarySchema,
  type CreateBeneficiaryInput,
  type UpdateBeneficiaryInput,
  type BeneficiaryCategory,
  type VerificationStatus,
  type ConsentStatus,
  type PrivacyLevel,
} from "@/lib/validation/social-schema";
import type { Beneficiary, SocialActionResult } from "@/types/social";

export interface GetAdminBeneficiariesParams {
  category?: string;
  verificationStatus?: string;
  page?: number;
  pageSize?: number;
}

export interface GetAdminBeneficiariesResult {
  beneficiaries: Beneficiary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type RawBeneficiary = {
  id: string;
  name_or_alias: string;
  category: BeneficiaryCategory;
  need_type: string;
  verification_status: VerificationStatus;
  consent_status: ConsentStatus;
  privacy_level: PrivacyLevel;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function mapBeneficiary(row: RawBeneficiary): Beneficiary {
  return { ...row };
}

/**
 * Fetch paginated beneficiary records. Admin-only — this data must never be
 * queried from a public-facing code path (DATABASE.md, ARSITEKTUR.md §17.5).
 */
export async function getAdminBeneficiaries(
  params: GetAdminBeneficiariesParams = {}
): Promise<GetAdminBeneficiariesResult> {
  await requirePermission("beneficiaries", "read");
  const supabase = await createClient();

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(50, params.pageSize || 15));
  const offset = (page - 1) * pageSize;

  let query = supabase.from("beneficiaries").select("*", { count: "exact" });

  if (params.category && params.category !== "ALL") {
    query = query.eq("category", params.category);
  }
  if (params.verificationStatus && params.verificationStatus !== "ALL") {
    query = query.eq("verification_status", params.verificationStatus);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error || !data) {
    console.error("[getAdminBeneficiaries] Error fetching beneficiaries:", error);
    return { beneficiaries: [], totalCount: 0, page, pageSize, totalPages: 0 };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const beneficiaries = (data as unknown as RawBeneficiary[]).map(mapBeneficiary);

  return { beneficiaries, totalCount, page, pageSize, totalPages };
}

/**
 * Lightweight lookup list for select inputs (e.g. distribution form) —
 * remains staff-only and goes through the beneficiary read permission.
 */
export async function getAdminBeneficiaryOptions(): Promise<
  Array<{ id: string; name_or_alias: string; category: BeneficiaryCategory }>
> {
  await requirePermission("beneficiaries", "read");
  const supabase = await createClient();

  const { data } = await supabase
    .from("beneficiaries")
    .select("id, name_or_alias, category")
    .eq("verification_status", "VERIFIED")
    .order("name_or_alias", { ascending: true });

  return data || [];
}

export async function createBeneficiaryAction(
  rawInput: CreateBeneficiaryInput
): Promise<SocialActionResult<{ id: string }>> {
  const admin = await requirePermission("beneficiaries", "write");

  const parsed = CreateBeneficiarySchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = fieldErrors[field] ?? [];
      fieldErrors[field].push(issue.message);
    });
    return { success: false, error: "Data penerima manfaat tidak valid.", code: "VALIDATION_ERROR", fieldErrors };
  }

  const supabase = await createClient();
  const input = parsed.data;

  const { data: inserted, error } = await supabase
    .from("beneficiaries")
    .insert({
      name_or_alias: input.name_or_alias,
      category: input.category,
      need_type: input.need_type,
      verification_status: input.verification_status,
      consent_status: input.consent_status,
      privacy_level: input.privacy_level,
      notes: input.notes || null,
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[createBeneficiaryAction] Insert failed:", error);
    return { success: false, error: "Gagal menyimpan data penerima manfaat." };
  }

  revalidatePath("/admin/social/beneficiaries");
  return { success: true, data: inserted };
}

export async function updateBeneficiaryAction(
  rawInput: UpdateBeneficiaryInput
): Promise<SocialActionResult<{ id: string }>> {
  const actor = await requirePermission("beneficiaries", "write");

  const parsed = UpdateBeneficiarySchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = fieldErrors[field] ?? [];
      fieldErrors[field].push(issue.message);
    });
    return { success: false, error: "Data penerima manfaat tidak valid.", code: "VALIDATION_ERROR", fieldErrors };
  }

  const supabase = await createClient();
  const { id, ...input } = parsed.data;

  const { error } = await supabase
    .from("beneficiaries")
    .update({
      name_or_alias: input.name_or_alias,
      category: input.category,
      need_type: input.need_type,
      verification_status: input.verification_status,
      consent_status: input.consent_status,
      privacy_level: input.privacy_level,
      notes: input.notes || null,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateBeneficiaryAction] Update failed:", error);
    return { success: false, error: "Gagal memperbarui data penerima manfaat." };
  }

  await recordAuditLog({
    actorId: actor.id,
    action: "BENEFICIARY_UPDATED",
    entityType: "beneficiary",
    entityId: id,
    newValue: {
      changed_fields: ["category", "need_type", "verification_status", "consent_status", "privacy_level"],
      verification_status: input.verification_status,
      consent_status: input.consent_status,
      privacy_level: input.privacy_level,
    },
  });

  revalidatePath("/admin/social/beneficiaries");
  return { success: true, data: { id } };
}
