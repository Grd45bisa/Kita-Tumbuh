"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  InventoryAdjustmentSchema,
  CreateWasteLotSchema,
  type InventoryAdjustmentInput,
  type CreateWasteLotInput,
} from "@/lib/validation/inventory-schema";
import type { ActionResult } from "@/types/donation";

function toRecord(input: unknown): Record<string, unknown> {
  if (input instanceof FormData) {
    const res: Record<string, unknown> = {};
    input.forEach((val, key) => {
      res[key] = val;
    });
    return res;
  }
  return (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
}

export async function adjustWasteLotAction(
  input: InventoryAdjustmentInput | FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parse = InventoryAdjustmentSchema.safeParse(toRecord(input));
  if (!parse.success) {
    const fieldErrors: Record<string, string[]> = {};
    parse.error.issues.forEach((iss) => {
      const f = iss.path.join(".");
      fieldErrors[f] = fieldErrors[f] ?? [];
      fieldErrors[f].push(iss.message);
    });
    return {
      success: false,
      error: "Isian penyesuaian stok belum valid.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();

    // 1. Fetch current lot
    const { data: lot, error: fetchErr } = await supabase
      .from("waste_lots")
      .select("id, waste_type_id, current_quantity, unit, lot_code")
      .eq("id", parse.data.waste_lot_id)
      .single();

    if (fetchErr || !lot) {
      return { success: false, error: "Data lot limbah tidak ditemukan." };
    }

    const prevQty = Number(lot.current_quantity);
    const adjQty = Number(parse.data.quantity);

    let newQty = prevQty;
    let changeQty = adjQty;

    if (parse.data.adjustment_type === "SUBTRACT") {
      if (prevQty < adjQty) {
        return {
          success: false,
          error: `Sisa stok tidak mencukupi untuk pengurangan (stok saat ini: ${prevQty} ${lot.unit}).`,
        };
      }
      newQty = prevQty - adjQty;
      changeQty = -adjQty;
    } else {
      newQty = prevQty + adjQty;
      changeQty = adjQty;
    }

    const nextStatus = newQty === 0 ? "DEPLETED" : "AVAILABLE";
    const now = new Date().toISOString();

    // 2. Update waste_lots
    const { error: updateErr } = await supabase
      .from("waste_lots")
      .update({
        current_quantity: newQty,
        status: nextStatus,
        updated_at: now,
      })
      .eq("id", lot.id);

    if (updateErr) {
      console.error("[admin/inventory] update lot error:", updateErr.message);
      return { success: false, error: "Gagal memperbarui saldo lot limbah." };
    }

    // 3. Append to inventory_transactions ledger
    const { error: txErr } = await supabase
      .from("inventory_transactions")
      .insert({
        waste_lot_id: lot.id,
        waste_type_id: lot.waste_type_id,
        transaction_type: "ADJUSTMENT",
        quantity_change: changeQty,
        previous_quantity: prevQty,
        new_quantity: newQty,
        unit: lot.unit,
        reason: parse.data.reason,
        reference_id: `ADJ-${Date.now()}`,
        operator_id: admin.id,
      });

    if (txErr) {
      console.error("[admin/inventory] ledger error:", txErr.message);
      return { success: false, error: "Gagal mencatat mutasi ke buku besar inventaris." };
    }

    revalidatePath("/admin/inventory");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[admin/inventory] adjust unexpected error:", err);
    return { success: false, error: "Terjadi kesalahan saat menyesuaikan inventaris." };
  }
}

export async function createWasteLotAction(
  input: CreateWasteLotInput | FormData
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();

  const parse = CreateWasteLotSchema.safeParse(toRecord(input));
  if (!parse.success) {
    const fieldErrors: Record<string, string[]> = {};
    parse.error.issues.forEach((iss) => {
      const f = iss.path.join(".");
      fieldErrors[f] = fieldErrors[f] ?? [];
      fieldErrors[f].push(iss.message);
    });
    return {
      success: false,
      error: "Data lot baru belum valid. Periksa isian form.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const qty = Number(parse.data.initial_quantity);

    // 1. Insert waste_lot
    const { data: lot, error: insertErr } = await supabase
      .from("waste_lots")
      .insert({
        lot_code: parse.data.lot_code,
        waste_type_id: parse.data.waste_type_id,
        source_donation_id: parse.data.source_donation_id || null,
        initial_quantity: qty,
        current_quantity: qty,
        unit: parse.data.unit,
        quality_grade: parse.data.quality_grade,
        storage_location: parse.data.storage_location,
        notes: parse.data.notes || null,
      })
      .select("id")
      .single();

    if (insertErr) {
      if (insertErr.code === "23505") {
        return { success: false, error: "Kode lot ini sudah digunakan. Gunakan kode lot unik." };
      }
      return { success: false, error: insertErr.message };
    }

    // 2. Append INTAKE transaction to ledger
    await supabase.from("inventory_transactions").insert({
      waste_lot_id: lot.id,
      waste_type_id: parse.data.waste_type_id,
      transaction_type: "INTAKE",
      quantity_change: qty,
      previous_quantity: 0,
      new_quantity: qty,
      unit: parse.data.unit,
      reason: parse.data.source_donation_id
        ? "Penerimaan fisik dari donasi terverifikasi"
        : "Penerimaan fisik limbah masuk gudang (intake)",
      reference_id: parse.data.lot_code,
      operator_id: admin.id,
    });

    revalidatePath("/admin/inventory");
    return { success: true, data: { id: lot.id } };
  } catch (err) {
    console.error("[admin/inventory] createLot error:", err);
    return { success: false, error: "Gagal membuat lot inventaris baru." };
  }
}
