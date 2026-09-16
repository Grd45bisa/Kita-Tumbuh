import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Parameters<typeof cookieStore.set>[2];
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Server-only client using service-role key for administrative tasks.
 * NEVER export or use this in client components.
 */
export function createAdminClient() {
  const serviceRoleKey = env.supabaseServiceRoleKey;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin client.");
  }

  return createServerClient(
    env.supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
