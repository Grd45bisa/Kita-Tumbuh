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
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

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
