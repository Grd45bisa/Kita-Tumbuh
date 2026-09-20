import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Do not attempt to create a Supabase client (or run auth calls) if
  // URL/key are not configured yet — this keeps local dev usable before
  // `.env.local` is filled in, without crashing every request.
  let supabaseUrl: string;
  let supabaseAnonKey: string;
  try {
    supabaseUrl = env.supabaseUrl;
    supabaseAnonKey = env.supabaseAnonKey;
  } catch {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Parameters<typeof supabaseResponse.cookies.set>[2];
        }>
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Protected Member Area Routes
  const isMemberRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/riwayat") ||
    pathname.startsWith("/profil") ||
    pathname.startsWith("/impact") ||
    pathname.startsWith("/pickup");

  if (isMemberRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    const returnPath = pathname + request.nextUrl.search;
    redirectUrl.searchParams.set("redirect", returnPath);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Auth Routes when already logged in
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (isAuthRoute && user) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
