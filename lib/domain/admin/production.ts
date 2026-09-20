"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import {
  CreateProductionBatchSchema,
  AddBatchInputSchema,
  UpdateBatchStatusSchema,
  type CreateProductionBatchInput,
  type AddBatchInput,
  type UpdateBatchStatusInput,
} from "@/lib/validation/production-batch-schema";

export interface ProductionActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Creates a new production batch in PLANNED state.
 */
export async function createProductionBatchAction(
  rawInput: CreateProductionBatchInput
): Promise<ProductionActionResult<{ id: string; batch_number: string }>> {
  const admin = await requirePermission("production", "write");

  const parsed = CreateProductionBatchSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Data batch produksi tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: batch, error: insertError } = await supabase
    .from("production_batches")
    .insert({
      batch_number: parsed.data.batch_number.toUpperCase(),
      title: parsed.data.title,
      status: "PLANNED",
      target_output_type: parsed.data.target_output_type,
      target_quantity: parsed.data.target_quantity,
      output_unit: parsed.data.output_unit,
      notes: parsed.data.notes || null,
      created_by: admin.id,
    })
    .select("id, batch_number")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        success: false,
        error: `Nomor batch ${parsed.data.batch_number} sudah terdaftar. Gunakan nomor unik.`,
      };
    }
    return {
      success: false,
      error: `Gagal membuat batch produksi: ${insertError.message}`,
    };
  }

  revalidatePath("/admin/production");
  return { success: true, data: batch };
}

/**
 * Adds an input waste lot to an active production batch.
 * Decrements the waste lot stock and creates an immutable inventory_transactions record.
 */
export async function addBatchInputAction(
  rawInput: AddBatchInput
): Promise<ProductionActionResult<{ id: string }>> {
  const admin = await requirePermission("production", "write");

  const parsed = AddBatchInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Data alokasi bahan baku limbah tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  // 1. Fetch batch info
  const { data: batch, error: batchError } = await supabase
    .from("production_batches")
    .select("id, batch_number, status")
    .eq("id", parsed.data.batch_id)
    .single();

  if (batchError || !batch) {
    return { success: false, error: "Batch produksi tidak ditemukan." };
  }

  if (batch.status === "COMPLETED" || batch.status === "RELEASED") {
    return {
      success: false,
      error: `Tidak dapat menambah bahan baku ke batch yang sudah ${batch.status}.`,
    };
  }

  // 2. Fetch lot info (only for lot_code in the batch_inputs insert below —
  // the actual quantity check + decrement happens atomically in the RPC
  // call in step 4, which re-validates sufficiency itself under a row lock)
  const { data: lot, error: lotError } = await supabase
    .from("waste_lots")
    .select("id, lot_code, waste_type_id, current_quantity, unit, status")
    .eq("id", parsed.data.waste_lot_id)
    .single();

  if (lotError || !lot) {
    return { success: false, error: "Lot limbah tidak ditemukan." };
  }

  const qtyUsed = parsed.data.quantity_used;

  // 3. Insert batch_inputs
  const { data: inputRecord, error: inputError } = await supabase
    .from("batch_inputs")
    .insert({
      batch_id: batch.id,
      waste_lot_id: lot.id,
      quantity_used: qtyUsed,
      unit: parsed.data.unit,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (inputError) {
    return {
      success: false,
      error: `Gagal mencatat bahan baku batch: ${inputError.message}`,
    };
  }

  // 4. Atomically decrement the lot and append the ledger entry. Locks the
  // waste_lots row, re-validates sufficiency under that lock, and writes
  // both the lot update and the ledger insert in a single transaction — see
  // execute_waste_lot_mutation (021_waste_lot_mutation_hardening.sql).
  // Found during the Phase 13 audit: the previous implementation read
  // current_quantity, computed the new value in JavaScript, then wrote it
  // back with no row lock — a TOCTOU race between two concurrent batch
  // input allocations (or an allocation racing a manual stock adjustment)
  // against the same lot.
  const { error: mutationError } = await supabase.rpc("execute_waste_lot_mutation", {
    p_waste_lot_id: lot.id,
    p_transaction_type: "PRODUCTION_CONSUMPTION",
    p_quantity_change: -qtyUsed,
    p_reason: `Alokasi bahan baku ke batch produksi ${batch.batch_number} (${parsed.data.notes || "tanpa catatan tambahan"})`,
    p_reference_id: batch.id,
    p_operator_id: admin.id,
  });

  if (mutationError) {
    // batch_inputs (step 3) was already inserted — this failure means that
    // record is now inconsistent with the lot's current_quantity (the
    // decrement never happened, or the sufficiency check failed under
    // lock). Surface it loudly rather than silently returning success, per
    // AGENTS.md §12 (financial/inventory integrity).
    console.error(
      `[admin/production] execute_waste_lot_mutation failed after batch_inputs row ${inputRecord?.id} was inserted:`,
      mutationError.message
    );
    if (mutationError.code === "PGRST202" || mutationError.message?.includes("does not exist")) {
      return {
        success: false,
        error: "Fungsi mutasi inventaris belum tersedia di database. Jalankan migration 021 terlebih dahulu.",
      };
    }
    return {
      success: false,
      error: mutationError.message?.includes("tidak mencukupi")
        ? `${mutationError.message} Catatan alokasi bahan baku sudah tersimpan namun stok lot BELUM berkurang — hubungi administrator teknis untuk memeriksa konsistensi data.`
        : "Bahan baku sudah tercatat namun gagal memutasi stok lot. Hubungi administrator teknis untuk memeriksa konsistensi data sebelum melanjutkan.",
    };
  }

  revalidatePath(`/admin/production/${batch.id}`);
  revalidatePath("/admin/production");
  revalidatePath("/admin/inventory");

  return { success: true, data: inputRecord };
}

/**
 * Updates production batch status along the lifecycle state machine:
 * PLANNED -> IN_PROGRESS -> QC_REVIEW -> COMPLETED -> RELEASED
 */
export async function updateBatchStatusAction(
  rawInput: UpdateBatchStatusInput
): Promise<ProductionActionResult<{ status: string }>> {
  await requirePermission("production", "write");

  const parsed = UpdateBatchStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Data status batch tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const updatePayload: Record<string, unknown> = {
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.actual_output_quantity !== undefined) {
    updatePayload.actual_output_quantity = parsed.data.actual_output_quantity;
  }
  if (parsed.data.loss_quantity !== undefined) {
    updatePayload.loss_quantity = parsed.data.loss_quantity;
  }
  if (parsed.data.loss_reason) {
    updatePayload.loss_reason = parsed.data.loss_reason;
  }
  if (parsed.data.notes) {
    updatePayload.notes = parsed.data.notes;
  }

  if (parsed.data.status === "IN_PROGRESS") {
    updatePayload.started_at = new Date().toISOString();
  } else if (parsed.data.status === "COMPLETED" || parsed.data.status === "RELEASED") {
    updatePayload.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("production_batches")
    .update(updatePayload)
    .eq("id", parsed.data.batch_id);

  if (error) {
    return {
      success: false,
      error: `Gagal memperbarui status batch: ${error.message}`,
    };
  }

  revalidatePath(`/admin/production/${parsed.data.batch_id}`);
  revalidatePath("/admin/production");

  return { success: true, data: { status: parsed.data.status } };
}
