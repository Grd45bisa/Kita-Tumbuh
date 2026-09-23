"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import {
  CreateSocialProgramSchema,
  UpdateSocialProgramSchema,
  type CreateSocialProgramInput,
  type UpdateSocialProgramInput,
  type SocialProgramStatus,
} from "@/lib/validation/social-schema";
import type { SocialProgram, SocialActionResult } from "@/types/social";

export interface GetAdminProgramsParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface GetAdminProgramsResult {
  programs: SocialProgram[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type RawProgram = {
  id: string;
  name: string;
  slug: string;
  description: string;
  goal: string;
  status: SocialProgramStatus;
  target_amount: number | string | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  public_status: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function mapProgram(row: RawProgram): SocialProgram {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    goal: row.goal,
    status: row.status,
    target_amount: row.target_amount === null ? null : Number(row.target_amount),
    currency: row.currency,
    start_date: row.start_date,
    end_date: row.end_date,
    public_status: row.public_status,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetch paginated social programs for admin back-office, including
 * draft/unpublished ones (public_status = false).
 */
export async function getAdminPrograms(
  params: GetAdminProgramsParams = {}
): Promise<GetAdminProgramsResult> {
  await requirePermission("social_programs", "read");
  const supabase = await createClient();

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(50, params.pageSize || 15));
  const offset = (page - 1) * pageSize;

  let query = supabase.from("social_programs").select("*", { count: "exact" });

  if (params.status && params.status !== "ALL") {
    query = query.eq("status", params.status);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error || !data) {
    console.error("[getAdminPrograms] Error fetching programs:", error);
    return { programs: [], totalCount: 0, page, pageSize, totalPages: 0 };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Enrich with allocated_amount, computed from social_allocations —
  // never stored on the program row (ARSITEKTUR.md §3.1 single source of truth).
  // Fetched as ONE query covering every program_id on this page (an "in"
  // filter), instead of one query per row — the previous version issued up
  // to `pageSize` (15) separate round trips per page load. Summed in
  // memory here since the anon/authenticated Supabase client can't run a
  // server-side GROUP BY through PostgREST directly.
  const rows = data as unknown as RawProgram[];
  const programIds = rows.map((row) => row.id);

  const allocatedByProgram = new Map<string, number>();
  if (programIds.length > 0) {
    const { data: allocRows } = await supabase
      .from("social_allocations")
      .select("program_id, amount")
      .in("program_id", programIds)
      .eq("approval_status", "APPROVED");

    for (const alloc of allocRows || []) {
      const key = alloc.program_id as string;
      allocatedByProgram.set(key, (allocatedByProgram.get(key) || 0) + Number(alloc.amount));
    }
  }

  const programs = rows.map((row) => {
    const program = mapProgram(row);
    program.allocated_amount = allocatedByProgram.get(row.id) || 0;
    return program;
  });

  return { programs, totalCount, page, pageSize, totalPages };
}

export async function getAdminProgramById(id: string): Promise<SocialProgram | null> {
  await requirePermission("social_programs", "read");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("social_programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const program = mapProgram(data as unknown as RawProgram);

  const { data: allocRows } = await supabase
    .from("social_allocations")
    .select("amount")
    .eq("program_id", id)
    .eq("approval_status", "APPROVED");
  program.allocated_amount = (allocRows || []).reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );

  return program;
}

export async function createSocialProgramAction(
  rawInput: CreateSocialProgramInput
): Promise<SocialActionResult<{ id: string; slug: string }>> {
  const admin = await requirePermission("social_programs", "write");

  const parsed = CreateSocialProgramSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = fieldErrors[field] ?? [];
      fieldErrors[field].push(issue.message);
    });
    return { success: false, error: "Data program tidak valid.", code: "VALIDATION_ERROR", fieldErrors };
  }

  const supabase = await createClient();
  const input = parsed.data;

  const { data: inserted, error } = await supabase
    .from("social_programs")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      goal: input.goal,
      status: input.status,
      target_amount: input.target_amount,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      public_status: input.public_status,
      created_by: admin.id,
    })
    .select("id, slug")
    .single();

  if (error || !inserted) {
    if (error?.code === "23505") {
      return { success: false, error: `Slug "${input.slug}" sudah digunakan program lain. Gunakan slug unik.` };
    }
    console.error("[createSocialProgramAction] Insert failed:", error);
    return { success: false, error: "Gagal menyimpan program sosial." };
  }

  revalidatePath("/admin/social/programs");
  revalidatePath("/program");
  return { success: true, data: inserted };
}

export async function updateSocialProgramAction(
  rawInput: UpdateSocialProgramInput
): Promise<SocialActionResult<{ id: string }>> {
  await requirePermission("social_programs", "write");

  const parsed = UpdateSocialProgramSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = fieldErrors[field] ?? [];
      fieldErrors[field].push(issue.message);
    });
    return { success: false, error: "Data program tidak valid.", code: "VALIDATION_ERROR", fieldErrors };
  }

  const supabase = await createClient();
  const { id, ...input } = parsed.data;

  const { error } = await supabase
    .from("social_programs")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      goal: input.goal,
      status: input.status,
      target_amount: input.target_amount,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      public_status: input.public_status,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: `Slug "${input.slug}" sudah digunakan program lain. Gunakan slug unik.` };
    }
    console.error("[updateSocialProgramAction] Update failed:", error);
    return { success: false, error: "Gagal memperbarui program sosial." };
  }

  revalidatePath("/admin/social/programs");
  revalidatePath(`/admin/social/programs/${id}`);
  revalidatePath("/program");
  revalidatePath(`/program/${input.slug}`);
  return { success: true, data: { id } };
}
