import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthUser, UserProfile } from "@/types/user";
import { hasPermission, type AdminModule } from "@/lib/auth/permissions";

/**
 * Read the current authenticated user and profile from session cookies.
 * Safe to call in Server Components, Route Handlers, and Server Actions.
 * Returns null if unauthenticated or on error.
 *
 * Wrapped in React's `cache()` so repeated calls within the same request
 * (e.g. once in app/admin/layout.tsx, then again inside every
 * requirePermission() call a domain function under lib/domain/admin/*
 * makes) are deduplicated to a single Supabase round trip instead of one
 * per call. Found during a dashboard-navigation performance audit: an
 * admin page load could previously trigger 3-5 separate
 * auth.getUser()+profiles calls (up to 10 network round trips) for what is
 * always the same answer within one request — this was the single biggest
 * contributor to admin navigation feeling slow. `cache()` scopes strictly
 * per-request in Next.js Server Components, so this never leaks one user's
 * session into another's request.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
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
      .select("id, full_name, phone, role, created_at, updated_at")
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
});

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
 * Enforce that an authenticated user has the 'admin' role.
 * - If unauthenticated -> redirects to /login with return URL preserved.
 * - If authenticated but not admin -> redirects to /dashboard (forbidden).
 */
export async function requireAdmin(returnUrl?: string): Promise<AuthUser> {
  return requirePermission("dashboard", "read", returnUrl);
}

export async function requirePermission(
  module: AdminModule,
  level: "read" | "write",
  returnUrl?: string
): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    const query = returnUrl ? `?redirect=${encodeURIComponent(returnUrl)}` : "";
    redirect(`/login${query}`);
  }

  if (!hasPermission(user.profile?.role, module, level)) {
    redirect("/dashboard");
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
      .select("id, full_name, phone, role, created_at, updated_at")
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
