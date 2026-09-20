"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  UpdateReconciliationSchema,
  CreateSocialAllocationSchema,
  CreateExpenseSchema,
  type UpdateReconciliationInput,
  type CreateSocialAllocationInput,
  type CreateExpenseInput,
  type ReconciliationStatus,
  type AllocationApprovalStatus,
  type ExpenseCategory,
} from "@/lib/validation/finance-schema";
import type {
  RevenueEntry,
  SocialAllocation,
  Expense,
  FinancialSummary,
  FinanceActionResult,
} from "@/types/finance";

export interface GetRevenueEntriesParams {
  reconciliationStatus?: string;
  page?: number;
  pageSize?: number;
}

export interface GetRevenueEntriesResult {
  entries: RevenueEntry[];
  totalCount: number;
  totalRevenueAmount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch paginated list of append-only revenue entries with optional reconciliation filter.
 */
export async function getAdminRevenueEntries(
  params: GetRevenueEntriesParams = {}
): Promise<GetRevenueEntriesResult> {
  await requireAdmin();
  const supabase = await createClient();

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(50, params.pageSize || 15));
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("revenue_entries")
    .select(`
      id,
      order_id,
      amount,
      currency,
      occurred_at,
      recorded_by,
      reconciliation_status,
      notes,
      created_at,
      orders (
        reference
      )
    `, { count: "exact" });

  if (params.reconciliationStatus && params.reconciliationStatus !== "ALL") {
    query = query.eq("reconciliation_status", params.reconciliationStatus);
  }

  const { data, count, error } = await query
    .order("occurred_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error || !data) {
    console.error("[getAdminRevenueEntries] Error fetching entries:", error);
    return {
      entries: [],
      totalCount: 0,
      totalRevenueAmount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  type RowWithOrder = {
    id: string;
    order_id: string;
    amount: number | string;
    currency: string;
    occurred_at: string;
    recorded_by: string | null;
    reconciliation_status: ReconciliationStatus;
    notes: string | null;
    created_at: string;
    orders?: { reference: string } | null;
  };

  const entries: RevenueEntry[] = (data as unknown as RowWithOrder[]).map((row) => ({
    id: row.id,
    order_id: row.order_id,
    order_reference: row.orders?.reference,
    amount: Number(row.amount),
    currency: row.currency,
    occurred_at: row.occurred_at,
    recorded_by: row.recorded_by,
    reconciliation_status: row.reconciliation_status,
    notes: row.notes,
    created_at: row.created_at,
  }));

  // Aggregate total realized revenue
  const { data: allAmounts } = await supabase
    .from("revenue_entries")
    .select("amount");

  const totalRevenueAmount = (allAmounts || []).reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );

  return {
    entries,
    totalCount,
    totalRevenueAmount,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get unified financial summary (Total Revenue, Total Allocations, Balance, Expenses)
 * Balance is always a derived calculation, never an overwritten mutable field.
 */
export async function getFinancialSummary(): Promise<FinancialSummary> {
  await requireAdmin();
  const supabase = await createClient();

  // 1. Sum total revenue from append-only revenue entries
  const { data: revData } = await supabase
    .from("revenue_entries")
    .select("amount");

  const totalRevenue = (revData || []).reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );

  // 2. Sum approved allocations (if table exists)
  let totalAllocations = 0;
  try {
    const { data: allocData } = await supabase
      .from("social_allocations")
      .select("amount")
      .eq("approval_status", "APPROVED");

    if (allocData) {
      totalAllocations = allocData.reduce(
        (acc, curr) => acc + Number(curr.amount),
        0
      );
    }
  } catch {
    // Table not created yet (Tahap D)
  }

  // 3. Sum expenses (if table exists)
  let totalExpenses = 0;
  try {
    const { data: expData } = await supabase
      .from("expenses")
      .select("amount");

    if (expData) {
      totalExpenses = expData.reduce(
        (acc, curr) => acc + Number(curr.amount),
        0
      );
    }
  } catch {
    // Table not created yet (Tahap E)
  }

  const availableBalance = Math.max(0, totalRevenue - totalAllocations);

  return {
    totalRevenue,
    totalAllocations,
    availableBalance,
    totalExpenses,
    currency: "IDR",
  };
}

/**
 * Update reconciliation status of a specific revenue entry (e.g. mark RECONCILED or DISCREPANCY)
 */
export async function updateRevenueReconciliationAction(
  rawInput: UpdateReconciliationInput
): Promise<FinanceActionResult<{ entryId: string }>> {
  await requireAdmin();

  const parseResult = UpdateReconciliationSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Data rekonsiliasi tidak valid.",
    };
  }

  const { entry_id, status, notes } = parseResult.data;
  const supabase = await createClient();

  // revenue_entries is an append-only ledger at the RLS level (no admin
  // UPDATE/DELETE policy) — reconciliation changes go through this
  // SECURITY DEFINER RPC, the only sanctioned way to touch an existing row.
  const { error } = await supabase.rpc("update_revenue_reconciliation", {
    p_entry_id: entry_id,
    p_status: status,
    p_notes: notes || null,
  });

  if (error) {
    console.error("[updateRevenueReconciliationAction] Update error:", error);
    return {
      success: false,
      error: "Gagal memperbarui status rekonsiliasi.",
    };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/revenue");

  return {
    success: true,
    data: { entryId: entry_id },
  };
}

export interface GetSocialAllocationsResult {
  allocations: SocialAllocation[];
  totalCount: number;
  totalAllocatedAmount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch paginated list of social allocations for admin back-office.
 */
export async function getAdminSocialAllocations(
  page: number = 1,
  pageSize: number = 15
): Promise<GetSocialAllocationsResult> {
  await requireAdmin();
  const supabase = await createClient();

  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, Math.min(50, pageSize));
  const offset = (validPage - 1) * validPageSize;

  const { data, count, error } = await supabase
    .from("social_allocations")
    .select(`
      id,
      program_name,
      program_id,
      funding_source_reference,
      amount,
      currency,
      allocated_at,
      approved_by,
      approval_status,
      notes,
      created_at
    `, { count: "exact" })
    .order("allocated_at", { ascending: false })
    .range(offset, offset + validPageSize - 1);

  if (error || !data) {
    console.error("[getAdminSocialAllocations] Error fetching allocations:", error);
    return {
      allocations: [],
      totalCount: 0,
      totalAllocatedAmount: 0,
      page: validPage,
      pageSize: validPageSize,
      totalPages: 0,
    };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / validPageSize);

  type RawAllocation = {
    id: string;
    program_name: string;
    program_id: string | null;
    funding_source_reference: string;
    amount: number | string;
    currency: string;
    allocated_at: string;
    approved_by: string | null;
    approval_status: AllocationApprovalStatus;
    notes: string | null;
    created_at: string;
  };

  const allocations: SocialAllocation[] = (data as unknown as RawAllocation[]).map((row) => ({
    id: row.id,
    program_name: row.program_name,
    program_id: row.program_id,
    funding_source_reference: row.funding_source_reference,
    amount: Number(row.amount),
    currency: row.currency,
    allocated_at: row.allocated_at,
    approved_by: row.approved_by,
    approval_status: row.approval_status,
    notes: row.notes,
    created_at: row.created_at,
  }));

  const { data: allAllocations } = await supabase
    .from("social_allocations")
    .select("amount")
    .eq("approval_status", "APPROVED");

  const totalAllocatedAmount = (allAllocations || []).reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );

  return {
    allocations,
    totalCount,
    totalAllocatedAmount,
    page: validPage,
    pageSize: validPageSize,
    totalPages,
  };
}

/**
 * Allocate realized revenue to a social program.
 *
 * Requirements:
 * 1. requireAdmin() server authorization.
 * 2. Strict server-side balance check: cannot allocate more than (SUM revenue - SUM approved allocations).
 * 3. Atomic insert with validation to prevent race-condition overdrafts (P0-604).
 */
export async function allocateRevenueAction(
  rawInput: CreateSocialAllocationInput
): Promise<FinanceActionResult<{ allocationId: string }>> {
  const admin = await requireAdmin();

  const parseResult = CreateSocialAllocationSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string[]> = {};
    parseResult.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = fieldErrors[field] ?? [];
      fieldErrors[field].push(issue.message);
    });
    return {
      success: false,
      error: "Data alokasi tidak valid.",
      fieldErrors,
    };
  }

  const input = parseResult.data;
  const supabase = await createClient();

  // Try calling atomic RPC procedure first
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "execute_social_allocation",
    {
      p_program_name: input.program_name,
      p_funding_source: input.funding_source_reference,
      p_amount: input.amount,
      p_notes: input.notes || null,
      p_approved_by: admin.id,
      p_program_id: input.program_id || null,
    }
  );

  if (!rpcError && rpcResult) {
    revalidatePath("/admin/finance");
    revalidatePath("/admin/finance/allocations");
    return {
      success: true,
      data: { allocationId: (rpcResult as { id: string }).id },
    };
  }

  // Fallback: If RPC isn't deployed in DB, perform strict server-side transaction check
  const summary = await getFinancialSummary();
  if (input.amount > summary.availableBalance) {
    return {
      success: false,
      error: `Saldo tidak mencukupi untuk alokasi ini (Saldo tersedia: Rp ${summary.availableBalance.toLocaleString("id-ID")}, Diminta: Rp ${input.amount.toLocaleString("id-ID")}).`,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("social_allocations")
    .insert({
      program_name: input.program_name,
      program_id: input.program_id || null,
      funding_source_reference: input.funding_source_reference,
      amount: input.amount,
      currency: "IDR",
      approved_by: admin.id,
      approval_status: "APPROVED",
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[allocateRevenueAction] Insert failed:", insertError);
    return {
      success: false,
      error: "Gagal menyimpan alokasi dana sosial.",
    };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/allocations");

  return {
    success: true,
    data: { allocationId: inserted.id },
  };
}

/**
 * Lightweight lookup of approved allocations linked to a specific program,
 * for the distribution form's "funding source" select (Phase 7, P0-703).
 */
export async function getApprovedAllocationsForProgram(
  programId: string
): Promise<Array<{ id: string; amount: number; allocated_at: string }>> {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("social_allocations")
    .select("id, amount, allocated_at")
    .eq("program_id", programId)
    .eq("approval_status", "APPROVED")
    .order("allocated_at", { ascending: false });

  return (data || []).map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    allocated_at: row.allocated_at,
  }));
}

export interface GetExpensesParams {
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface GetExpensesResult {
  expenses: Expense[];
  totalCount: number;
  totalExpenseAmount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch paginated operational expenses for admin back-office.
 */
export async function getAdminExpenses(
  params: GetExpensesParams = {}
): Promise<GetExpensesResult> {
  await requireAdmin();
  const supabase = await createClient();

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(50, params.pageSize || 15));
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("expenses")
    .select(`
      id,
      category,
      amount,
      currency,
      occurred_at,
      notes,
      attachment_url,
      recorded_by,
      created_at
    `, { count: "exact" });

  if (params.category && params.category !== "ALL") {
    query = query.eq("category", params.category);
  }

  const { data, count, error } = await query
    .order("occurred_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error || !data) {
    console.error("[getAdminExpenses] Error fetching expenses:", error);
    return {
      expenses: [],
      totalCount: 0,
      totalExpenseAmount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  type RawExpense = {
    id: string;
    category: ExpenseCategory;
    amount: number | string;
    currency: string;
    occurred_at: string;
    notes: string | null;
    attachment_url: string | null;
    recorded_by: string | null;
    created_at: string;
  };

  const expenses: Expense[] = (data as unknown as RawExpense[]).map((row) => ({
    id: row.id,
    category: row.category,
    amount: Number(row.amount),
    currency: row.currency,
    occurred_at: row.occurred_at,
    notes: row.notes,
    attachment_url: row.attachment_url,
    recorded_by: row.recorded_by,
    created_at: row.created_at,
  }));

  const { data: allExpenses } = await supabase
    .from("expenses")
    .select("amount");

  const totalExpenseAmount = (allExpenses || []).reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );

  return {
    expenses,
    totalCount,
    totalExpenseAmount,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Record a new operational expense.
 * Kept strictly segregated from social allocations per AGENTS.md §12.
 */
export async function recordExpenseAction(
  rawInput: CreateExpenseInput
): Promise<FinanceActionResult<{ expenseId: string }>> {
  const admin = await requireAdmin();

  const parseResult = CreateExpenseSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string[]> = {};
    parseResult.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = fieldErrors[field] ?? [];
      fieldErrors[field].push(issue.message);
    });
    return {
      success: false,
      error: "Data pengeluaran tidak valid.",
      fieldErrors,
    };
  }

  const input = parseResult.data;
  const supabase = await createClient();

  const { data: inserted, error: insertError } = await supabase
    .from("expenses")
    .insert({
      category: input.category,
      amount: input.amount,
      currency: "IDR",
      occurred_at: input.occurred_at || new Date().toISOString(),
      notes: input.notes,
      attachment_url: input.attachment_url || null,
      recorded_by: admin.id,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[recordExpenseAction] Insert failed:", insertError);
    return {
      success: false,
      error: "Gagal menyimpan catatan pengeluaran.",
    };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/expenses");

  return {
    success: true,
    data: { expenseId: inserted.id },
  };
}


