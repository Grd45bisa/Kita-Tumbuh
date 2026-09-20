import type {
  SocialProgramStatus,
  BeneficiaryCategory,
  VerificationStatus,
  ConsentStatus,
  PrivacyLevel,
  DistributionApprovalStatus,
} from "@/lib/validation/social-schema";

export type {
  SocialProgramStatus,
  BeneficiaryCategory,
  VerificationStatus,
  ConsentStatus,
  PrivacyLevel,
  DistributionApprovalStatus,
};

export interface SocialProgram {
  id: string;
  name: string;
  slug: string;
  description: string;
  goal: string;
  status: SocialProgramStatus;
  target_amount: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  public_status: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Derived, computed server-side from social_allocations — never stored.
  allocated_amount?: number;
}

export interface Beneficiary {
  id: string;
  name_or_alias: string;
  category: BeneficiaryCategory;
  need_type: string;
  verification_status: VerificationStatus;
  consent_status: ConsentStatus;
  privacy_level: PrivacyLevel;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Distribution {
  id: string;
  program_id: string;
  program_name?: string;
  beneficiary_id: string;
  beneficiary_name?: string;
  allocation_id: string | null;
  amount: number | null;
  currency: string;
  item_description: string | null;
  distributed_at: string;
  evidence_url: string | null;
  evidence_notes: string | null;
  approval_status: DistributionApprovalStatus;
  approved_by: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicSocialProgram {
  id: string;
  name: string;
  slug: string;
  description: string;
  goal: string;
  status: SocialProgramStatus;
  target_amount: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  allocated_amount: number;
}

export type SocialActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: "NOT_FOUND" | "VALIDATION_ERROR" | "INSUFFICIENT_ALLOCATION";
      fieldErrors?: Record<string, string[]>;
    };
