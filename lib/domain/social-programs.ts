import { createClient } from "@/lib/supabase/server";
import type { PublicSocialProgram } from "@/types/social";
import type { SocialProgramStatus } from "@/lib/validation/social-schema";

type RawPublicProgram = {
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
};

/**
 * Public read of social programs. RLS ("social_programs_public_read")
 * already restricts this to public_status = true rows, so no server
 * authorization is required here — but we still never select internal-only
 * columns like created_by or public_status itself (ARSITEKTUR.md §3.3
 * "public data ≠ internal data").
 */
export async function getPublicPrograms(): Promise<PublicSocialProgram[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("social_programs")
    .select("id, name, slug, description, goal, status, target_amount, currency, start_date, end_date")
    .order("created_at", { ascending: false });

  const rows = (data as unknown as RawPublicProgram[]) || [];
  if (rows.length === 0) return [];

  // Fetch allocations for every program in a single query (IN-clause) instead
  // of one query per program — the previous Promise.all(rows.map(...)) shape
  // sent N sequential-per-row round trips to the DB (an N+1 query), which
  // scales linearly with the number of programs and was the main source of
  // slow loads on this page as more programs got added.
  const { data: allocRows } = await supabase
    .from("social_allocations")
    .select("program_id, amount")
    .in("program_id", rows.map((row) => row.id))
    .eq("approval_status", "APPROVED");

  const allocatedByProgram = new Map<string, number>();
  for (const alloc of allocRows || []) {
    const current = allocatedByProgram.get(alloc.program_id) || 0;
    allocatedByProgram.set(alloc.program_id, current + Number(alloc.amount));
  }

  return rows.map((row) => ({
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
    allocated_amount: allocatedByProgram.get(row.id) || 0,
  }));
}

export async function getPublicProgramBySlug(slug: string): Promise<PublicSocialProgram | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("social_programs")
    .select("id, name, slug, description, goal, status, target_amount, currency, start_date, end_date")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const row = data as unknown as RawPublicProgram;

  const { data: allocRows } = await supabase
    .from("social_allocations")
    .select("amount")
    .eq("program_id", row.id)
    .eq("approval_status", "APPROVED");

  const allocated_amount = (allocRows || []).reduce((acc, curr) => acc + Number(curr.amount), 0);

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
    allocated_amount,
  };
}
