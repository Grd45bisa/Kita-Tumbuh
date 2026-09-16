"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getWasteTypeBySlug } from "@/lib/domain/waste-types";
import { getCollectionPointById } from "@/lib/domain/collection-points";
import { DonationSubmitSchema } from "@/lib/validation/donation-schema";
import type { ActionResult, Donation, DonationDetail } from "@/types/donation";

// =============================================================================
// DONATION SERVER ACTIONS
// All mutations are validated server-side. Pickup addresses are never returned
// to the client after submission.
// =============================================================================

export interface CreateDonationInput {
  waste_type_id: string;
  waste_type_slug: string;
  waste_type_name: string;
  unit: string;
  estimated_quantity: number;
  method: "DROP_OFF" | "PICKUP";
  // DROP_OFF fields
  collection_point_id?: string;
  // PICKUP fields (private — stored server-side only)
  pickup_address_line1?: string;
  pickup_address_line2?: string;
  pickup_district?: string;
  pickup_city?: string;
  pickup_requested_date?: string;
  pickup_requested_slot?: string;
  pickup_notes?: string;
  // Donor identity (optional for anonymous)
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  donor_notes?: string;
  // Idempotency
  idempotency_key: string;
}

export interface CreateDonationResult {
  reference: string;
  donationId: string;
  status: string;
  wasAlreadySubmitted: boolean;
}

export async function createDonation(
  input: CreateDonationInput
): Promise<ActionResult<CreateDonationResult>> {
  // 1. Server-side Zod validation
  const parseResult = DonationSubmitSchema.safeParse(input);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string[]> = {};
    parseResult.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = fieldErrors[field] ?? [];
      fieldErrors[field].push(issue.message);
    });
    return {
      success: false,
      error: "Validasi gagal. Periksa kembali isian kamu.",
      fieldErrors,
    };
  }

  const data = parseResult.data;
  const supabase = await createClient();

  // 2. Idempotency check — prevent duplicate submissions
  const { data: existing } = await supabase
    .from("donations")
    .select("id, reference, status")
    .eq("idempotency_key", data.idempotency_key)
    .maybeSingle();

  if (existing) {
    return {
      success: true,
      data: {
        reference: existing.reference as string,
        donationId: existing.id as string,
        status: existing.status as string,
        wasAlreadySubmitted: true,
      },
    };
  }

  // 3. Server-side authorization: verify waste_type is still active
  const wasteType = await getWasteTypeBySlug(data.waste_type_slug);
  if (!wasteType) {
    return {
      success: false,
      error: "Jenis limbah tidak tersedia. Halaman perlu dimuat ulang.",
    };
  }

  // 4. Validate quantity against waste type constraints
  if (data.estimated_quantity < wasteType.min_quantity) {
    return {
      success: false,
      error: `Jumlah minimum untuk ${wasteType.name} adalah ${wasteType.min_quantity} ${wasteType.unit}.`,
      fieldErrors: { estimated_quantity: [`Minimum ${wasteType.min_quantity} ${wasteType.unit}`] },
    };
  }
  if (wasteType.max_quantity && data.estimated_quantity > wasteType.max_quantity) {
    return {
      success: false,
      error: `Jumlah maksimum untuk ${wasteType.name} adalah ${wasteType.max_quantity} ${wasteType.unit}. Hubungi kami untuk donasi massal.`,
      fieldErrors: { estimated_quantity: [`Maksimum ${wasteType.max_quantity} ${wasteType.unit}`] },
    };
  }

  // 5. Validate collection point for DROP_OFF
  if (data.method === "DROP_OFF") {
    const cp = await getCollectionPointById(data.collection_point_id);
    if (!cp) {
      return {
        success: false,
        error: "Lokasi collection point tidak ditemukan atau tidak aktif.",
        fieldErrors: { collection_point_id: ["Pilih lokasi yang valid."] },
      };
    }
    // Check waste type is accepted at this collection point
    if (
      cp.accepted_waste_slugs &&
      !cp.accepted_waste_slugs.includes(wasteType.slug)
    ) {
      return {
        success: false,
        error: `${wasteType.name} tidak diterima di ${cp.name}. Pilih lokasi lain.`,
      };
    }
  }

  // 6. Get authenticated user if available (anonymous is ok)
  const { data: { user } } = await supabase.auth.getUser();

  // 7. Generate reference number
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("donations")
    .select("*", { count: "exact", head: true });
  const seq = ((count ?? 0) + 1).toString().padStart(5, "0");
  const reference = `DON-${year}-${seq}`;

  // 8. Insert donation record
  const donationInsert = {
    reference,
    user_id: user?.id ?? null,
    donor_name: data.donor_name || null,
    donor_email: data.donor_email || null,
    waste_type_id: wasteType.id,
    waste_type_slug: wasteType.slug,
    waste_type_name: wasteType.name,
    unit: wasteType.unit,
    estimated_quantity: data.estimated_quantity,
    method: data.method,
    collection_point_id:
      data.method === "DROP_OFF" ? data.collection_point_id : null,
    donor_notes: data.donor_notes || null,
    idempotency_key: data.idempotency_key,
    status: "SUBMITTED" as const,
  };

  const { data: donation, error: donationError } = await supabase
    .from("donations")
    .insert(donationInsert)
    .select("id, reference, status")
    .single();

  if (donationError || !donation) {
    console.error("[create-donation] insert error:", donationError?.message);
    // Handle duplicate idempotency_key race condition
    if (donationError?.code === "23505") {
      const { data: raceDonation } = await supabase
        .from("donations")
        .select("id, reference, status")
        .eq("idempotency_key", data.idempotency_key)
        .maybeSingle();
      if (raceDonation) {
        return {
          success: true,
          data: {
            reference: raceDonation.reference as string,
            donationId: raceDonation.id as string,
            status: raceDonation.status as string,
            wasAlreadySubmitted: true,
          },
        };
      }
    }
    return {
      success: false,
      error: "Gagal menyimpan donasi. Coba lagi dalam beberapa saat.",
    };
  }

  // 9. Insert pickup request if method is PICKUP
  // IMPORTANT: pickup address is stored server-side only, never returned to client
  if (data.method === "PICKUP") {
    const pickupData = data as Extract<typeof data, { method: "PICKUP" }>;
    const { error: pickupError } = await supabase
      .from("pickup_requests")
      .insert({
        donation_id: donation.id,
        address_line1: pickupData.pickup_address_line1,
        address_line2: pickupData.pickup_address_line2 || null,
        district: pickupData.pickup_district || null,
        city: pickupData.pickup_city || null,
        requested_date: pickupData.pickup_requested_date,
        requested_slot: pickupData.pickup_requested_slot || null,
        pickup_notes: pickupData.pickup_notes || null,
      });

    if (pickupError) {
      console.error("[create-donation] pickup insert error:", pickupError.message);
      // Non-fatal: donation was created, pickup detail failed
      // In production, this should be handled with a transaction or cleanup
    }
  }

  return {
    success: true,
    data: {
      reference: donation.reference as string,
      donationId: donation.id as string,
      status: donation.status as string,
      wasAlreadySubmitted: false,
    },
  };
}

// =============================================================================
// GET DONATION BY REFERENCE (for tracking page)
// Returns donation details WITHOUT private pickup address.
// =============================================================================

export async function getDonationByReference(
  reference: string
): Promise<ActionResult<DonationDetail>> {
  if (!reference || !/^DON-\d{4}-\d{5}$/.test(reference)) {
    return { success: false, error: "Format referensi donasi tidak valid." };
  }

  const supabase = await createClient();

  const { data: donation, error } = await supabase
    .from("donations")
    .select(`
      id, reference, user_id, donor_name, waste_type_slug,
      waste_type_name, unit, estimated_quantity, verified_quantity,
      verification_notes, verified_at, method, collection_point_id,
      status, status_updated_at, donor_notes, created_at, updated_at,
      collection_points (
        id, code, name, address, district, city, phone, operating_hours,
        accepted_waste_slugs, notes
      ),
      donation_status_history (
        id, donation_id, from_status, to_status, notes, created_at
      )
    `)
    .eq("reference", reference)
    .single();

  if (error || !donation) {
    return {
      success: false,
      error: "Donasi dengan referensi tersebut tidak ditemukan.",
    };
  }

  // SECURITY: Never return pickup address — it's private
  // Only return the safe donation fields + status history

  const rawDonation = donation as Record<string, unknown>;

  const result: DonationDetail = {
    id: rawDonation.id as string,
    reference: rawDonation.reference as string,
    user_id: rawDonation.user_id as string | null,
    donor_name: rawDonation.donor_name as string | null,
    donor_email: null, // Never return email to public tracking
    waste_type_slug: rawDonation.waste_type_slug as string,
    waste_type_name: rawDonation.waste_type_name as string,
    unit: rawDonation.unit as string,
    estimated_quantity: rawDonation.estimated_quantity as number,
    verified_quantity: rawDonation.verified_quantity as number | null,
    verification_notes: rawDonation.verification_notes as string | null,
    verified_at: rawDonation.verified_at as string | null,
    method: rawDonation.method as "DROP_OFF" | "PICKUP",
    collection_point_id: rawDonation.collection_point_id as string | null,
    status: rawDonation.status as Donation["status"],
    status_updated_at: rawDonation.status_updated_at as string,
    donor_notes: rawDonation.donor_notes as string | null,
    created_at: rawDonation.created_at as string,
    updated_at: rawDonation.updated_at as string,
    collection_point: rawDonation.collection_points as DonationDetail["collection_point"],
    status_history: (
      (rawDonation.donation_status_history as unknown[]) ?? []
    ) as DonationDetail["status_history"],
  };

  return { success: true, data: result };
}

// Re-export for client convenience
export { randomUUID };
