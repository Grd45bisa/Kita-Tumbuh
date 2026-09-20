"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
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
  const admin = await requirePermission("waste_inventory", "write");

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

    const adjQty = Number(parse.data.quantity);
    const quantityChange = parse.data.adjustment_type === "SUBTRACT" ? -adjQty : adjQty;

    // Atomic: locks the waste_lots row, validates sufficiency, applies the
    // change, and appends the ledger entry in a single transaction — see
    // execute_waste_lot_mutation (021_waste_lot_mutation_hardening.sql).
    // Found during the Phase 13 audit: the previous implementation read
    // current_quantity, computed the new value in JavaScript, then wrote it
    // back with no row lock — a TOCTOU race between two concurrent
    // adjustments on the same lot.
    const { error } = await supabase.rpc("execute_waste_lot_mutation", {
      p_waste_lot_id: parse.data.waste_lot_id,
      p_transaction_type: "ADJUSTMENT",
      p_quantity_change: quantityChange,
      p_reason: parse.data.reason,
      p_reference_id: `ADJ-${Date.now()}`,
      p_operator_id: admin.id,
    });

    if (error) {
      console.error("[admin/inventory] execute_waste_lot_mutation error:", error.message);
      if (error.code === "PGRST202" || error.message?.includes("does not exist")) {
        return { success: false, error: "Fungsi mutasi inventaris belum tersedia di database. Jalankan migration 021 terlebih dahulu." };
      }
      return {
        success: false,
        error: error.message?.includes("tidak mencukupi")
          ? error.message
          : error.message?.includes("tidak ditemukan")
            ? "Data lot limbah tidak ditemukan."
            : "Gagal menyesuaikan stok lot limbah.",
      };
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
  const admin = await requirePermission("waste_inventory", "write");

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
