"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { WasteTypeSchema, type WasteTypeInput } from "@/lib/validation/waste-type-schema";
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

export async function createWasteTypeAction(
  input: WasteTypeInput | FormData
): Promise<ActionResult<{ id: string }>> {
  await requirePermission("waste_inventory", "write");

  const parse = WasteTypeSchema.safeParse(toRecord(input));
  if (!parse.success) {
    const fieldErrors: Record<string, string[]> = {};
    parse.error.issues.forEach((iss) => {
      const f = iss.path.join(".");
      fieldErrors[f] = fieldErrors[f] ?? [];
      fieldErrors[f].push(iss.message);
    });
    return {
      success: false,
      error: "Data jenis limbah belum valid. Periksa isian form.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("waste_types")
      .insert({
        name: parse.data.name,
        slug: parse.data.slug,
        description: parse.data.description || null,
        unit: parse.data.unit,
        min_quantity: parse.data.min_quantity,
        max_quantity: parse.data.max_quantity || null,
        accepted_notes: parse.data.accepted_notes || null,
        rejected_notes: parse.data.rejected_notes || null,
        sort_order: parse.data.sort_order,
        is_active: parse.data.is_active,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          error: "Slug jenis limbah sudah digunakan. Gunakan slug yang berbeda.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/waste-types");
    revalidatePath("/donasikan");
    revalidatePath("/cara-kerja");
    return { success: true, data: { id: data.id } };
  } catch (err) {
    console.error("[admin/waste-types] create error:", err);
    return { success: false, error: "Gagal menyimpan jenis limbah baru." };
  }
}

export async function updateWasteTypeAction(
  id: string,
  input: WasteTypeInput | FormData
): Promise<ActionResult> {
  await requirePermission("waste_inventory", "write");

  const parse = WasteTypeSchema.safeParse(toRecord(input));
  if (!parse.success) {
    const fieldErrors: Record<string, string[]> = {};
    parse.error.issues.forEach((iss) => {
      const f = iss.path.join(".");
      fieldErrors[f] = fieldErrors[f] ?? [];
      fieldErrors[f].push(iss.message);
    });
    return {
      success: false,
      error: "Data jenis limbah belum valid. Periksa isian form.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("waste_types")
      .update({
        name: parse.data.name,
        slug: parse.data.slug,
        description: parse.data.description || null,
        unit: parse.data.unit,
        min_quantity: parse.data.min_quantity,
        max_quantity: parse.data.max_quantity || null,
        accepted_notes: parse.data.accepted_notes || null,
        rejected_notes: parse.data.rejected_notes || null,
        sort_order: parse.data.sort_order,
        is_active: parse.data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          error: "Slug jenis limbah sudah digunakan oleh data lain.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/waste-types");
    revalidatePath("/donasikan");
    revalidatePath("/cara-kerja");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[admin/waste-types] update error:", err);
    return { success: false, error: "Gagal memperbarui jenis limbah." };
  }
}

export async function toggleWasteTypeStatusAction(
  id: string,
  nextStatus: boolean
): Promise<ActionResult> {
  await requirePermission("waste_inventory", "write");

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("waste_types")
      .update({
        is_active: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/waste-types");
    revalidatePath("/donasikan");
    revalidatePath("/cara-kerja");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[admin/waste-types] toggle status error:", err);
    return { success: false, error: "Gagal mengubah status aktif limbah." };
  }
}
