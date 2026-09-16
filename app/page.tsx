import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { ProofStrip } from "@/components/home/ProofStrip";
import { WhyItMatters } from "@/components/home/WhyItMatters";
import { TransformationStory } from "@/components/home/TransformationStory";
import { EcosystemSection } from "@/components/home/EcosystemSection";
import { WasteCategorySection } from "@/components/home/WasteCategorySection";
import { SocialImpactSection } from "@/components/home/SocialImpactSection";
import { ProductPreviewSection } from "@/components/home/ProductPreviewSection";
import { TransparencyPreview } from "@/components/home/TransparencyPreview";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { env } from "@/lib/env";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${env.siteUrl}/#organization`,
        name: "KITA TUMBUH — Kampung Smart Farming",
        alternateName: "Kampung Smart Farming",
        url: env.siteUrl,
        slogan: "Dari Limbah, Tumbuh Manfaat.",
        description:
          "KITA TUMBUH — Inisiatif circular economy sosial Kampung Smart Farming yang mengubah limbah minyak jelantah dan sampah organik menjadi pupuk, pakan, dan sayuran segar bernilai sosial.",
        knowsAbout: [
          "KITA TUMBUH",
          "Circular Economy",
          "Smart Farming",
          "Used Cooking Oil Recycling",
          "Organic Composting",
          "Community Social Impact",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${env.siteUrl}/#website`,
        url: env.siteUrl,
        name: "KITA TUMBUH — Kampung Smart Farming",
        publisher: {
          "@id": `${env.siteUrl}/#organization`,
        },
        inLanguage: "id-ID",
      },
    ],
  };

  return (
    <>
      {/* Structured Data for SEO & AI Discoverability */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Impact / Proof Strip */}
      <ProofStrip />

      {/* 3. Why It Matters */}
      <WhyItMatters />

      {/* 4. Transformation Story (Limbah → Nilai → Dampak) */}
      <TransformationStory />

      {/* 5. Kampung Smart Farming Ecosystem */}
      <EcosystemSection />

      {/* 6. Waste Category Guide */}
      <WasteCategorySection />

      {/* 7. Social Impact & Community Dignity */}
      <SocialImpactSection />

      {/* 8. Transformed Product & Harvest Preview */}
      <ProductPreviewSection />

      {/* 9. Transparency & Traceability Preview */}
      <TransparencyPreview />

      {/* 10. Final Call to Action */}
      <FinalCtaSection />
    </>
  );
}
