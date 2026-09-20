/**
 * Environment variables configuration and validation
 * Strictly distinguishes public from server-only secrets.
 *
 * Validation is lazy (checked on first access of a given field, not at
 * module import time). This keeps `next build` / static generation from
 * crashing when a route only needs a subset of variables, while still
 * failing fast with a clear error the moment a required-but-missing
 * variable is actually used at runtime.
 */

import { z } from "zod";

const RequiredString = z
  .string()
  .trim()
  .min(1, "wajib diisi dan tidak boleh kosong");

function readRequired(name: string, value: string | undefined): string {
  const result = RequiredString.safeParse(value ?? "");
  if (!result.success) {
    throw new Error(
      `[env] Environment variable "${name}" ${result.error.issues[0]?.message ?? "tidak valid"}. ` +
        `Salin .env.example ke .env.local dan isi nilainya.`
    );
  }
  return result.data;
}

function readOptional(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export const env = {
  // Public variables accessible in browser and server
  siteUrl: readOptional(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),

  get supabaseUrl(): string {
    return readRequired("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },

  get supabaseAnonKey(): string {
    return readRequired(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  },

  // Server-only secrets
  get supabaseServiceRoleKey(): string {
    if (typeof window !== "undefined") {
      throw new Error(
        "CRITICAL SECURITY VIOLATION: SUPABASE_SERVICE_ROLE_KEY cannot be accessed from the browser."
      );
    }
    return readRequired("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  },

  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};
