"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import type { AuditLog } from "@/types/audit";

export interface AuditLogFilters {
  actor?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
}

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
  await requirePermission("audit_log", "read");
  const supabase = await createClient();
  let query = supabase.from("audit_logs").select(
    "id,actor_id,action,entity_type,entity_id,old_value,new_value,reason,created_at"
  );
  if (filters.actor) query = query.eq("actor_id", filters.actor);
  if (filters.action) query = query.eq("action", filters.action);
  if (filters.entity) query = query.eq("entity_type", filters.entity);
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(200);
  if (error) {
    console.error("[audit-log] read failed:", error.code);
    return [];
  }
  return (data ?? []) as AuditLog[];
}

/**
 * Records an audit trail entry for an action the caller has ALREADY
 * authorized and committed.
 *
 * `actorId` must come from a `requirePermission()`/`requireUser()` call the
 * caller already performed for the mutation itself — this function
 * deliberately does NOT re-derive or re-check authorization on its own.
 *
 * Why not re-check here (this was a real bug found during the Phase 9
 * audit): this is always called AFTER the underlying mutation has already
 * been committed (e.g. after `execute_order_payment_confirmation` RPC
 * succeeds). Re-running `requirePermission()` at that point is redundant —
 * the caller was already gated — and worse, `requirePermission()` can call
 * Next.js `redirect()`, which throws a special error that a generic
 * `try/catch` here would silently swallow (logged, never actually
 * redirecting, and never surfaced to the caller), turning a real
 * authorization failure into a silently dropped audit entry for an action
 * that already happened. The actual security boundary against forged audit
 * entries is the `record_audit_log` RPC itself: it is `SECURITY DEFINER`
 * and `GRANT EXECUTE`'d only to `service_role` (019_audit_logs.sql) — no
 * client-side or anon/authenticated-role code path can call it at all,
 * regardless of what this function does or doesn't check.
 */
export async function recordAuditLog(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  reason?: string | null;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("record_audit_log", {
      p_actor_id: input.actorId,
      p_action: input.action,
      p_entity_type: input.entityType,
      p_entity_id: input.entityId,
      p_old_value: input.oldValue ?? null,
      p_new_value: input.newValue ?? null,
      p_reason: input.reason ?? null,
    });
    if (error) console.error("[audit-log] write failed:", error.code, error.message);
  } catch (error) {
    // The underlying mutation already succeeded — a failure here must never
    // propagate as a user-facing error (and must never redirect: see note
    // above). Best-effort logging only.
    console.error("[audit-log] unavailable after committed mutation:", error);
  }
}
