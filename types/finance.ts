import type {
  ReconciliationStatus,
  AllocationApprovalStatus,
  ExpenseCategory,
} from "@/lib/validation/finance-schema";

export type { ReconciliationStatus, AllocationApprovalStatus, ExpenseCategory };

export interface RevenueEntry {
  id: string;
  order_id: string;
  order_reference?: string;
  amount: number;
  currency: string;
  occurred_at: string;
  recorded_by: string | null;
  reconciliation_status: ReconciliationStatus;
  notes: string | null;
  created_at: string;
}

export interface SocialAllocation {
  id: string;
  program_name: string;
  program_id: string | null;
  funding_source_reference: string;
  amount: number;
  currency: string;
  allocated_at: string;
  approved_by: string | null;
  approval_status: AllocationApprovalStatus;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  occurred_at: string;
  notes: string | null;
  attachment_url: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalAllocations: number;
  availableBalance: number;
  totalExpenses: number;
  currency: string;
}

export interface FinanceActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
