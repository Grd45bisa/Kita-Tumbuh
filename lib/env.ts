/**
 * Environment variables configuration and validation
 * Strictly distinguishes public from server-only secrets.
 */

export const env = {
  // Public variables accessible in browser and server
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",

  // Server-only secrets
  get supabaseServiceRoleKey(): string {
    if (typeof window !== "undefined") {
      throw new Error(
        "CRITICAL SECURITY VIOLATION: SUPABASE_SERVICE_ROLE_KEY cannot be accessed from the browser."
      );
    }
    return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  },

  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};
