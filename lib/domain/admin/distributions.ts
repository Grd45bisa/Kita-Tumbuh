"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  CreateDistributionSchema,
  type CreateDistributionInput,
  type DistributionApprovalStatus,
} from "@/lib/validation/social-schema";
import type { Distribution, SocialActionResult } from "@/types/social";

export interface GetAdminDistributionsParams {
  programId?: string;
  page?: number;
  pageSize?: number;
}

export interface GetAdminDistributionsResult {
  distributions: Distribution[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type RawDistribution = {
  id: string;
  program_id: string;
  beneficiary_id: string;
  allocation_id: string | null;
  amount: number | string | null;
  currency: string;
  item_description: string | null;
  distributed_at: string;
  evidence_url: string | null;
  evidence_notes: string | null;
  approval_status: DistributionApprovalStatus;
  approved_by: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
  social_programs?: { name: string } | null;
  beneficiaries?: { name_or_alias: string } | null;
};

function mapDistribution(row: RawDistribution): Distribution {
  return {
    id: row.id,
    program_id: row.program_id,
    program_name: row.social_programs?.name,
    beneficiary_id: row.beneficiary_id,
    beneficiary_name: row.beneficiaries?.name_or_alias,
    allocation_id: row.allocation_id,
    amount: row.amount === null ? null : Number(row.amount),
    currency: row.currency,
    item_description: row.item_description,
    distributed_at: row.distributed_at,
    evidence_url: row.evidence_url,
    evidence_notes: row.evidence_notes,
    approval_status: row.approval_status,
    approved_by: row.approved_by,
    recorded_by: row.recorded_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetch paginated distribution records for admin back-office, joined with
 * program name and beneficiary alias for display.
 */
export async function getAdminDistributions(
  params: GetAdminDistributionsParams = {}
): Promise<GetAdminDistributionsResult> {
  await requireAdmin();
  const supabase = await createClient();

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(50, params.pageSize || 15));
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("distributions")
    .select(
      `
      id,
      program_id,
      beneficiary_id,
      allocation_id,
      amount,
      currency,
      item_description,
      distributed_at,
      evidence_url,
      evidence_notes,
      approval_status,
      approved_by,
      recorded_by,
      created_at,
      updated_at,
      social_programs ( name ),
      beneficiaries ( name_or_alias )
    `,
      { count: "exact" }
    );

  if (params.programId) {
    query = query.eq("program_id", params.programId);
  }

  const { data, count, error } = await query
    .order("distributed_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error || !data) {
    console.error("[getAdminDistributions] Error fetching distributions:", error);
    return { distributions: [], totalCount: 0, page, pageSize, totalPages: 0 };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const distributions = (data as unknown as RawDistribution[]).map(mapDistribution);

  return { distributions, totalCount, page, pageSize, totalPages };
}

/**
 * Record a new distribution (money and/or item) to a beneficiary under a
 * social program, optionally drawn from a specific approved allocation.
 *
 * Balance-against-allocation validation is enforced atomically server-side
 * via the `execute_distribution` RPC (016_distributions.sql), which locks
 * the allocation row and re-checks the remaining balance within a single
 * transaction — avoiding a TOCTOU race between concurrent distributions
 * drawing from the same allocation.
 */
export async function createDistributionAction(
  rawInput: CreateDistributionInput
): Promise<SocialActionResult<{ id: string }>> {
  const admin = await requireAdmin();

  const parsed = CreateDistributionSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = fieldErrors[field] ?? [];
      fieldErrors[field].push(issue.message);
    });
    return { success: false, error: "Data distribusi tidak valid.", code: "VALIDATION_ERROR", fieldErrors };
  }

  const supabase = await createClient();
  const input = parsed.data;

  const { data, error } = await supabase.rpc("execute_distribution", {
    p_program_id: input.program_id,
    p_beneficiary_id: input.beneficiary_id,
    p_allocation_id: input.allocation_id,
    p_amount: input.amount,
    p_item_description: input.item_description || null,
    p_distributed_at: input.distributed_at,
    p_evidence_url: input.evidence_url || null,
    p_evidence_notes: input.evidence_notes || null,
    p_recorded_by: admin.id,
  });

  if (error) {
    console.error("[createDistributionAction] RPC error:", error);
    if (error.code === "PGRST202" || error.message?.includes("does not exist")) {
      return { success: false, error: "Fungsi pencatatan distribusi belum tersedia di database. Jalankan migration 016 terlebih dahulu." };
    }
    return {
      success: false,
      error: error.message || "Gagal mencatat distribusi.",
      code: error.message?.includes("Sisa") ? "INSUFFICIENT_ALLOCATION" : undefined,
    };
  }

  const created = data as { id: string } | null;
  if (!created) {
    return { success: false, error: "Gagal mencatat distribusi." };
  }

  revalidatePath("/admin/social/distributions");
  revalidatePath("/admin/social/programs");
  revalidatePath(`/admin/social/programs/${input.program_id}`);

  return { success: true, data: { id: created.id } };
}
