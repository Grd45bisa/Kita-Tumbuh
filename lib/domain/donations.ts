"use server";

import { createClient } from "@/lib/supabase/server";
import { getWasteTypeBySlug } from "@/lib/domain/waste-types";
import { getCollectionPointById } from "@/lib/domain/collection-points";
import { DonationSubmitSchema } from "@/lib/validation/donation-schema";
import type {
  ActionResult,
  DonationStatus,
  PublicDonationReceipt,
  PublicDonationTracking,
} from "@/types/donation";

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
  status: DonationStatus;
  receipt: PublicDonationReceipt;
  wasAlreadySubmitted: boolean;
}

const submissionProjection = "id, reference, status, waste_type_name, estimated_quantity, verified_quantity, unit";

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
    .select(submissionProjection)
    .eq("idempotency_key", data.idempotency_key)
    .maybeSingle();

  if (existing) {
    return {
      success: true,
      data: {
        reference: existing.reference as string,
        donationId: existing.id as string,
        status: existing.status as DonationStatus,
        receipt: toPublicReceipt(existing as PublicDonationReceipt),
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

  // Reference allocation is atomic and year-scoped in PostgreSQL (migration 002).
  // Idempotency remains independent: retries can consume a sequence number.
  const donationInsert = {
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

  let donation: (PublicDonationReceipt & { id: string }) | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: reference, error: referenceError } = await supabase.rpc(
      "generate_donation_reference"
    );
    if (referenceError || typeof reference !== "string") {
      console.error("[create-donation] reference allocation failed:", referenceError?.code);
      return { success: false, error: "Gagal membuat referensi donasi. Coba lagi dalam beberapa saat." };
    }

    const { data: inserted, error: donationError } = await supabase
      .from("donations")
      .insert({ ...donationInsert, reference })
      .select(submissionProjection)
      .single();

    if (!donationError && inserted) {
      donation = inserted as PublicDonationReceipt & { id: string };
      break;
    }

    // Preserve the unique-key fallback when two requests pass the pre-check.
    if (donationError?.code === "23505") {
      const { data: raceDonation } = await supabase
        .from("donations")
        .select(submissionProjection)
        .eq("idempotency_key", data.idempotency_key)
        .maybeSingle();
      if (raceDonation) {
        return {
          success: true,
          data: {
            reference: raceDonation.reference as string,
            donationId: raceDonation.id as string,
            status: raceDonation.status as DonationStatus,
            receipt: toPublicReceipt(raceDonation as PublicDonationReceipt),
            wasAlreadySubmitted: true,
          },
        };
      }

      // An imported/manual reference may collide with the counter. Retry only
      // that constraint; other uniqueness failures must not look successful.
      if (
        donationError.message.includes("donations_reference_key") ||
        donationError.details?.includes("Key (reference)=")
      ) {
        continue;
      }
    }
    console.error("[create-donation] insert failed:", donationError?.code);
    break;
  }

  if (!donation) {
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
      status: donation.status,
      receipt: toPublicReceipt(donation),
      wasAlreadySubmitted: false,
    },
  };
}

// =============================================================================
// PUBLIC DONATION LOOKUPS
// Exact-reference SQL functions return only public fields, including for
// member-owned donations. No service-role client or unrestricted row reads.
// =============================================================================

function toPublicReceipt(row: PublicDonationReceipt): PublicDonationReceipt {
  return {
    reference: row.reference,
    waste_type_name: row.waste_type_name,
    estimated_quantity: row.estimated_quantity,
    verified_quantity: row.verified_quantity,
    unit: row.unit,
    status: row.status,
  };
}

async function lookupPublicDonation<T>(
  reference: string,
  rpc: "get_public_donation_receipt" | "get_public_donation_tracking"
): Promise<ActionResult<T>> {
  // The numeric suffix can grow beyond five digits; never truncate it.
  if (!/^DON-\d{4}-\d{5,}$/.test(reference)) {
    return { success: false, code: "INVALID_REFERENCE", error: "Format referensi donasi tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(rpc, { p_reference: reference }).maybeSingle();
    if (error) {
      console.error("[public-donation] lookup failed:", error.code);
      return { success: false, code: "UNAVAILABLE", error: "Data donasi belum dapat dimuat. Coba lagi dalam beberapa saat." };
    }
    if (!data) {
      return { success: false, code: "NOT_FOUND", error: "Donasi dengan referensi ini tidak ditemukan. Periksa kembali kodenya." };
    }
    return { success: true, data: data as T };
  } catch {
    return { success: false, code: "UNAVAILABLE", error: "Data donasi belum dapat dimuat. Coba lagi dalam beberapa saat." };
  }
}

export async function getPublicDonationReceipt(
  reference: string
): Promise<ActionResult<PublicDonationReceipt>> {
  const result = await lookupPublicDonation<PublicDonationReceipt>(reference, "get_public_donation_receipt");
  if (!result.success) return result;
  return { success: true, data: toPublicReceipt(result.data) };
}

export async function getDonationByReference(
  reference: string
): Promise<ActionResult<PublicDonationTracking>> {
  const result = await lookupPublicDonation<PublicDonationTracking>(reference, "get_public_donation_tracking");
  if (!result.success) return result;
  const row = result.data;
  return {
    success: true,
    data: {
      ...toPublicReceipt(row),
      method: row.method,
      created_at: row.created_at,
      collection_point: row.collection_point ? {
        name: row.collection_point.name,
        address: row.collection_point.address,
        district: row.collection_point.district,
        city: row.collection_point.city,
        operating_hours: row.collection_point.operating_hours,
      } : null,
      status_history: (row.status_history ?? []).map((event) => ({
        to_status: event.to_status,
        created_at: event.created_at,
      })),
    },
  };
}
