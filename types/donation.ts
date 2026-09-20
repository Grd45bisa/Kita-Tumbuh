// =============================================================================
// KAMPUNG SMART FARMING — DONATION DOMAIN TYPES
// =============================================================================

export type DonationStatus =
  | "SUBMITTED"
  | "SCHEDULED"
  | "COLLECTED"
  | "VERIFIED"
  | "SORTED"
  | "PROCESSED"
  | "CONVERTED"
  | "IMPACTED";

export type DonationMethod = "DROP_OFF" | "PICKUP";

export interface WasteType {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  unit: string;
  min_quantity: number;
  max_quantity: number | null;
  accepted_notes: string | null;
  rejected_notes: string | null;
  sort_order: number;
}

export interface CollectionPoint {
  id: string;
  code: string;
  name: string;
  address: string;
  district: string | null;
  city: string | null;
  phone: string | null;
  operating_hours: Record<string, string> | null;
  accepted_waste_slugs: string[] | null;
  notes: string | null;
}

export interface Donation {
  id: string;
  reference: string;
  user_id: string | null;
  donor_name: string | null;
  donor_email: string | null;
  waste_type_slug: string;
  waste_type_name: string;
  unit: string;
  estimated_quantity: number;
  verified_quantity: number | null;
  verification_notes: string | null;
  verified_at: string | null;
  method: DonationMethod;
  collection_point_id: string | null;
  status: DonationStatus;
  status_updated_at: string;
  donor_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationStatusHistory {
  id: string;
  donation_id: string;
  from_status: DonationStatus | null;
  to_status: DonationStatus;
  notes: string | null;
  created_at: string;
}

export interface DonationDetail extends Donation {
  status_history: DonationStatusHistory[];
  collection_point: CollectionPoint | null;
}

// Explicit public projections: never include donor identity, pickup details,
// internal verification notes, or audit metadata in a shareable receipt.
export interface PublicDonationReceipt {
  reference: string;
  waste_type_name: string;
  estimated_quantity: number;
  verified_quantity: number | null;
  unit: string;
  status: DonationStatus;
}

export interface PublicDonationTracking extends PublicDonationReceipt {
  method: DonationMethod;
  created_at: string;
  collection_point: Pick<
    CollectionPoint,
    "name" | "address" | "district" | "city" | "operating_hours"
  > | null;
  status_history: Array<Pick<DonationStatusHistory, "to_status" | "created_at">>;
}

// ----------------------------------------------------------------------------
// Server Action result types
// ----------------------------------------------------------------------------

export type ActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: "NOT_FOUND" | "UNAVAILABLE" | "INVALID_REFERENCE";
      fieldErrors?: Record<string, string[]>;
    };
