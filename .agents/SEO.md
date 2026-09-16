# SEO.md

## Purpose

Define search-engine and AI-discoverability requirements for all public pages.

## SEO North Star

The site should be easy to understand before it tries to rank.

Primary goals:

1. crawlability;
2. semantic clarity;
3. trustworthy information;
4. useful internal linking;
5. structured data;
6. strong page experience.

## URL Principles

Use clean, stable, descriptive URLs.

Examples:

```text
/
/tentang-kami
/cara-kerja
/donasikan
/dampak
/program
/program/[slug]
/produk
/produk/[slug]
/collection-point
/collection-point/[slug]
/transparansi
/transparansi/[year]/[month]
```

Avoid:

```text
/page?id=123&x=abc
```

unless required for non-indexable application states.

## Indexability

Index:

- useful public pages;
- published programs;
- published products;
- public collection points;
- approved impact/transparency pages.

Do not index:

- private dashboards;
- account pages;
- admin pages;
- internal search states;
- unfinished/draft content;
- duplicate filtered views unless explicitly useful.

## Metadata

Each indexable page should have:

- unique title;
- useful meta description;
- canonical URL;
- Open Graph metadata;
- social image where appropriate.

Do not generate identical metadata for every page.

## Title Formula

Prefer:

```text
Primary Topic | Brand
```

Examples:

```text
Homepage:
KITA TUMBUH | Kampung Smart Farming

Platform & Subpages:
Kampung Smart Farming | KITA TUMBUH
Donasikan Limbah | KITA TUMBUH
Cara Kerja Sirkular | Kampung Smart Farming
Lilin & Sabun Jelantah | KITA TUMBUH
Transparansi 2026 | KITA TUMBUH
```

Avoid excessive keyword repetition.

## Headings

Every public page should have one clear primary heading.

Maintain:

```text
H1
 ├── H2
 │    └── H3
 └── H2
```

Do not use headings merely to obtain a visual font size.

## Semantic Content

Important facts must be rendered as HTML text.

Do not put:

- donation rules;
- program details;
- financial explanations;
- product facts;

only inside images or canvas.

## Structured Data

Use schema types only where applicable and truthful.

Potential types:

- Organization;
- WebSite;
- WebPage;
- Product;
- BreadcrumbList;
- Article;
- FAQPage where appropriate and valid;
- LocalBusiness for legitimate collection-point entities where applicable.

Do not manufacture structured data.

## Sitemap

Generate a sitemap containing eligible public URLs.

Exclude:

- authentication routes;
- admin;
- user-specific pages;
- temporary states.

## Robots

`robots.txt` should protect private areas while allowing public content to be crawled.

Do not block assets required for rendering/search understanding unnecessarily.

## Internal Linking

Public pages should connect logically.

Example:

```text
Home
 ↓
Cara Kerja
 ↓
Donasikan
 ↓
Dampak
 ↓
Transparansi
```

Program pages can connect to:

- related impact;
- supporting products;
- relevant transparency;
- contribution CTA.

Product pages can connect to:

- origin/material;
- impact;
- related story.

## AI Discoverability

Structure content so an AI system can answer:

```text
Who are you?
What do you do?
What can people donate?
Where can people donate?
What happens to donated material?
What products result?
How are proceeds used?
What is KITA TUMBUH?
What is Kampung Smart Farming?
How is impact measured?
```

Use descriptive headings and explicit factual statements.

## Local SEO

Collection point pages should contain:

- name;
- service scope;
- address as appropriate;
- operating hours;
- accepted waste categories;
- contact method;
- map information;
- accessibility information when known.

Do not publish private pickup addresses unless intended to be public.

## Performance

SEO and performance are related.

Monitor:

- Core Web Vitals;
- image sizes;
- JavaScript payload;
- layout shift;
- font loading;
- unnecessary client rendering.

Do not add large libraries solely for visual effects.

## Duplicate Content

Avoid indexable duplicate pages caused by:

- query parameters;
- redundant category paths;
- mirrored content;
- arbitrary pagination states.

Use canonical/robots rules deliberately.

## Content Quality

Never create pages solely for keyword targeting.

Each indexable page should provide useful original information.

## SEO Checklist

```text
[ ] Unique title
[ ] Unique description
[ ] Canonical
[ ] One primary heading
[ ] Semantic HTML
[ ] Crawlable content
[ ] Internal links
[ ] Relevant structured data
[ ] Sitemap inclusion/exclusion correct
[ ] Robots behavior verified
[ ] Mobile usable
[ ] Performance acceptable
[ ] No fabricated claims
```
