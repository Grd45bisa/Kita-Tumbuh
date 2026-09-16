import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.siteUrl;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
