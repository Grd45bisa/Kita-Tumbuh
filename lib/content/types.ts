/**
 * Shared TypeScript types for static site content (`lib/content/*.ts`).
 *
 * This is distinct from `lib/domain/*.ts`, which queries live operational
 * data from Supabase (e.g. real waste types tied to donation records,
 * collection points). Content here is editorial copy for the public
 * marketing site — extracted out of page components so copy can change
 * without touching component code (TASK.md P0-104).
 */

export interface WasteTypePreview {
  icon: "drop" | "leaf" | "bottle";
  title: string;
  description: string;
  preparation: string;
  tag: string;
}

export interface JourneyStep {
  number: string;
  title: string;
  description: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  label: string;
  className: string;
}

export interface HeroContent {
  brandLine: string;
  eyebrow: string;
  headline: string;
  headlineEmphasis: string;
  coreStatement: string;
  lead: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  noteHighlight: string;
  noteText: string;
  imageSrc: string;
  imageAlt: string;
  quote: string;
  visualLabel: string;
}

export interface FaqItem {
  category:
    | "donasi"
    | "limbah"
    | "pickup-dropoff"
    | "pengolahan"
    | "dampak"
    | "produk"
    | "privasi";
  question: string;
  answer: string;
}

export interface OrganizationContent {
  mission: string;
  vision: string;
  values: Array<{ title: string; description: string }>;
  operationalApproach: string;
}
