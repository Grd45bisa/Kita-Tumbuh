import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

/**
 * PKCE code-exchange callback for Supabase Auth email links.
 *
 * @supabase/ssr defaults to `flowType: "pkce"` (see createBrowserClient /
 * createServerClient), which means every auth email link (password
 * recovery, email confirmation, magic link) carries a `?code=...` param
 * that MUST be exchanged server-side via `exchangeCodeForSession()` before
 * a session actually exists. Without this route, links like
 * `resetPasswordForEmail`'s `redirectTo` landed directly on a page that
 * assumed a session was already active — it never was, so
 * `supabase.auth.updateUser()` failed with "Auth session missing".
 *
 * This route exchanges the code for a real session (setting the auth
 * cookies via the server client), then redirects onward based on the
 * `next` param the caller supplied when building the original redirectTo
 * URL (see lib/auth/actions.ts requestPasswordResetAction).
 */

/**
 * `next` reaches this route as a raw, attacker-controllable URL query
 * parameter — every caller in this codebase currently only ever sends a
 * hardcoded server-side string (see requestPasswordResetAction), but the
 * route itself has no way to know that a given request genuinely came from
 * that path rather than a crafted link. Found during the Phase 13 audit:
 * without this check, `next` was interpolated directly into the redirect
 * URL, so a link like
 * `/auth/confirm?code=<real-code>&next=https://evil.example/phish` would
 * exchange a real PKCE code (making the request look legitimate) and then
 * send the user on to an attacker-controlled destination — an open
 * redirect. Only allow same-origin, relative paths.
 */
function sanitizeNextPath(rawNext: string | null): string {
  const fallback = "/";
  if (!rawNext) return fallback;
  // Must start with exactly one "/" — rejects absolute URLs
  // (https://evil.example), protocol-relative URLs (//evil.example), and
  // anything with an embedded scheme.
  if (!rawNext.startsWith("/") || rawNext.startsWith("//")) return fallback;
  if (rawNext.includes("\\") || rawNext.toLowerCase().includes(":")) return fallback;
  return rawNext;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectBase = env.siteUrl || origin;
      return NextResponse.redirect(`${redirectBase}${next}`);
    }

    console.error("[auth/confirm] exchangeCodeForSession error:", error.message);
  }

  // Missing/invalid code, or exchange failed — send the user back to a
  // safe, contextual starting point rather than a broken form.
  const redirectBase = env.siteUrl || origin;
  return NextResponse.redirect(
    `${redirectBase}/login?error=auth_link_invalid`
  );
}
