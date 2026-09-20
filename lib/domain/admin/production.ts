"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
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
  const admin = await requireAdmin();

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
  const admin = await requireAdmin();

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

  // 2. Fetch lot info
  const { data: lot, error: lotError } = await supabase
    .from("waste_lots")
    .select("id, lot_code, waste_type_id, current_quantity, unit, status")
    .eq("id", parsed.data.waste_lot_id)
    .single();

  if (lotError || !lot) {
    return { success: false, error: "Lot limbah tidak ditemukan." };
  }

  const currentQty = Number(lot.current_quantity);
  const qtyUsed = parsed.data.quantity_used;

  if (currentQty < qtyUsed) {
    return {
      success: false,
      error: `Stok lot ${lot.lot_code} tidak mencukupi. Tersedia: ${currentQty} ${lot.unit}, diminta: ${qtyUsed} ${parsed.data.unit}.`,
    };
  }

  const newQty = Math.max(0, currentQty - qtyUsed);
  const newLotStatus = newQty === 0 ? "DEPLETED" : "AVAILABLE";

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

  // 4. Update waste lot stock
  const { error: updateLotError } = await supabase
    .from("waste_lots")
    .update({
      current_quantity: newQty,
      status: newLotStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lot.id);

  if (updateLotError) {
    return {
      success: false,
      error: `Gagal memperbarui kuantitas lot: ${updateLotError.message}`,
    };
  }

  // 5. Append inventory ledger transaction (Audit trail per DATABASE.md & AGENTS.md §12)
  const { error: ledgerError } = await supabase.from("inventory_transactions").insert({
    waste_lot_id: lot.id,
    waste_type_id: lot.waste_type_id,
    transaction_type: "PRODUCTION_CONSUMPTION",
    quantity_change: -qtyUsed,
    previous_quantity: currentQty,
    new_quantity: newQty,
    unit: lot.unit,
    reason: `Alokasi bahan baku ke batch produksi ${batch.batch_number} (${parsed.data.notes || "tanpa catatan tambahan"})`,
    operator_id: admin.id,
  });

  if (ledgerError) {
    // The lot quantity was already decremented (step 4) — this failure
    // means the append-only audit trail is now inconsistent with the lot's
    // current_quantity. Surface it loudly rather than silently returning
    // success, per AGENTS.md §12 (financial/inventory integrity).
    console.error(
      `[admin/production] ledger insert failed after lot ${lot.id} was decremented:`,
      ledgerError.message
    );
    return {
      success: false,
      error:
        "Bahan baku sudah dialokasikan dan stok lot sudah berkurang, tetapi gagal mencatat jejak audit ledger. Hubungi administrator teknis untuk memeriksa konsistensi data sebelum melanjutkan.",
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
  await requireAdmin();

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
