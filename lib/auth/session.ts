import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthUser, UserProfile } from "@/types/user";

/**
 * Read the current authenticated user and profile from session cookies.
 * Safe to call in Server Components, Route Handlers, and Server Actions.
 * Returns null if unauthenticated or on error.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email || "",
      profile: (profile as UserProfile) || null,
      rawUser: user,
    };
  } catch (err) {
    console.error("[auth/session] error reading current user:", err);
    return null;
  }
}

/**
 * Enforce that an authenticated user is present.
 * If not authenticated, redirects to /login with return URL preserved.
 */
export async function requireUser(returnUrl?: string): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    const query = returnUrl ? `?redirect=${encodeURIComponent(returnUrl)}` : "";
    redirect(`/login${query}`);
  }

  return user;
}

/**
 * Get profile directly by user ID.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[auth/session] error reading profile:", error.message);
      return null;
    }

    return (profile as UserProfile) || null;
  } catch (err) {
    console.error("[auth/session] unexpected error reading profile:", err);
    return null;
  }
}
