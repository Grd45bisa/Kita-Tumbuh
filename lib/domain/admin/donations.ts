"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  VerifyDonationSchema,
  UpdateDonationStatusSchema,
  type VerifyDonationInput,
  type UpdateDonationStatusInput,
} from "@/lib/validation/admin-donation-schema";
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

export async function verifyDonationAction(
  donationId: string,
  reference: string,
  input: VerifyDonationInput | FormData
): Promise<ActionResult> {
  const admin = await requirePermission("donations", "write");

  const parse = VerifyDonationSchema.safeParse(toRecord(input));
  if (!parse.success) {
    const fieldErrors: Record<string, string[]> = {};
    parse.error.issues.forEach((iss) => {
      const f = iss.path.join(".");
      fieldErrors[f] = fieldErrors[f] ?? [];
      fieldErrors[f].push(iss.message);
    });
    return {
      success: false,
      error: "Isian verifikasi fisik belum valid. Periksa angka penimbangan dan catatan.",
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("donations")
      .update({
        verified_quantity: parse.data.decision === "REJECTED" ? 0 : parse.data.verified_quantity,
        verification_notes: parse.data.verification_notes,
        verified_at: now,
        verified_by: admin.id,
        status: parse.data.decision,
        status_updated_at: now,
        updated_at: now,
      })
      .eq("id", donationId);

    if (error) {
      console.error("[admin/donations] verify error:", error.message);
      return { success: false, error: "Gagal menyimpan hasil verifikasi: " + error.message };
    }

    revalidatePath("/admin/donations");
    revalidatePath(`/admin/donations/${reference}`);
    revalidatePath(`/donasi/${reference}`);
    revalidatePath("/dashboard");
    revalidatePath("/riwayat");
    revalidatePath("/impact");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[admin/donations] verify unexpected error:", err);
    return { success: false, error: "Terjadi kesalahan saat memverifikasi donasi." };
  }
}

export async function updateDonationStatusAction(
  donationId: string,
  reference: string,
  input: UpdateDonationStatusInput | FormData
): Promise<ActionResult> {
  await requirePermission("donations", "write");

  const parse = UpdateDonationStatusSchema.safeParse(toRecord(input));
  if (!parse.success) {
    return {
      success: false,
      error: "Pilihan status baru tidak valid.",
    };
  }

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("donations")
      .update({
        status: parse.data.next_status,
        status_updated_at: now,
        updated_at: now,
      })
      .eq("id", donationId);

    if (error) {
      console.error("[admin/donations] updateStatus error:", error.message);
      return { success: false, error: "Gagal mengubah status: " + error.message };
    }

    revalidatePath("/admin/donations");
    revalidatePath(`/admin/donations/${reference}`);
    revalidatePath(`/donasi/${reference}`);
    revalidatePath("/dashboard");
    revalidatePath("/riwayat");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[admin/donations] updateStatus unexpected error:", err);
    return { success: false, error: "Terjadi kesalahan saat memperbarui status donasi." };
  }
}
