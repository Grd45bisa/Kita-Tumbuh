// =============================================================================
// KAMPUNG SMART FARMING — USER & AUTH DOMAIN TYPES
// =============================================================================

import type { User } from "@supabase/supabase-js";
import type { ActionResult } from "./donation";

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  role: "member" | "admin";
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
  rawUser?: User;
}

export type AuthActionResult<T = void> = ActionResult<T>;
