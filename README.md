# KAMPUNG SMART FARMING

> **Tagline:** Dari Limbah, Tumbuh Manfaat.  
> **Brand Statement:** *SAMPAH KALIAN SANGAT BERARTI BAGI KAMI*

Platform circular economy dan dampak sosial yang mengubah limbah rumah tangga menjadi produk bernilai dan mengalokasikan hasil ekonominya untuk program sosial serta pemberdayaan masyarakat.

---

## Status Proyek: Fase 0 — Project Foundation

Fondasi sistem telah selesai diinisialisasi dan siap untuk pengembangan fitur pada fase berikutnya:

- [x] Struktur Next.js App Router (Server Components by default)
- [x] Strict TypeScript (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`)
- [x] Design Token System (`styles/tokens.css` dan `lib/tokens/index.ts`)
- [x] Palet Warna Murni (Ink, Warm Earth, Botanical Green, Paper, dan State tokens)
- [x] Sistem Tipografi, Spacing 4px, Border Radius, dan Elevasi Terukur
- [x] UI Primitives dasar (`Button`, `Badge`, `Card`, `Input`, `Container`, `SkipLink`)
- [x] Aksesibilitas WCAG 2.2 AA (Focus states, semantic HTML, screen reader helpers)
- [x] Error boundaries & loading states (`loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`)
- [x] Metadata & SEO Foundation (`robots.ts`, `sitemap.ts`, Open Graph, Twitter cards)
- [x] Fondasi Utilitas Supabase (`lib/supabase/` SSR client/server/middleware dengan perlindungan service-role key)

---

## Perintah Pengembangan (Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server lokal pengembangan di `http://localhost:3000` |
| `npm run typecheck` | Menjalankan verifikasi tipe TypeScript (`tsc --noEmit`) |
| `npm run lint` | Menjalankan linter ESLint |
| `npm run build` | Menjalankan production build Next.js |
| `npm run start` | Menjalankan production server hasil build |

---

## Konfigurasi Lingkungan (Environment Variables)

Salin `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Variabel yang tersedia:
- `NEXT_PUBLIC_SITE_URL`: URL utama website (default: `http://localhost:3000`)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key publik
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase secret service-role key (**hanya untuk server-side**)
