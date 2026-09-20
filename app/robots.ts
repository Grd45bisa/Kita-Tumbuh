import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.siteUrl;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Matches the actual auth-gated routes enforced in
        // lib/supabase/middleware.ts — "/member/" never existed as a route
        // in this app (found during Phase 10 audit) and the real member
        // area routes (/riwayat, /profil, /impact, /pickup) were missing,
        // so those pages were previously crawlable even though every
        // request to them just redirects to /login for an unauthenticated
        // crawler.
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard",
          "/riwayat",
          "/profil",
          "/impact",
          "/pickup",
          "/checkout",
          "/auth/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
