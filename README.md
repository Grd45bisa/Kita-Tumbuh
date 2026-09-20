# KAMPUNG SMART FARMING

> **Master Brand:** KITA TUMBUH
> **Tagline:** Dari Limbah, Tumbuh Manfaat.
> **Brand Statement:** *SAMPAH KALIAN SANGAT BERARTI BAGI KAMI*

Platform circular economy dan dampak sosial yang mengubah limbah rumah tangga — terutama minyak jelantah dan sampah organik dapur — menjadi produk bernilai, dikerjakan bersama anak-anak difabel, dengan sebagian hasil penjualannya dialokasikan untuk program pemberdayaan sosial.

Untuk penjelasan konsep produk secara naratif, lihat [`docs/PAPER.md`](docs/PAPER.md). Untuk alur data donasi end-to-end sampai ke angka dampak publik, lihat [`docs/ALUR_DONASI.md`](docs/ALUR_DONASI.md).

---

## Apa yang Dikerjakan Platform Ini

1. **Donasi limbah** — warga mendonasikan limbah lewat drop-off ke titik penyerahan atau penjemputan terjadwal, tanpa wajib membuat akun.
2. **Verifikasi & pengolahan** — operator memverifikasi jumlah fisik yang diterima (terpisah dari estimasi donatur), lalu limbah diolah bersama anak-anak difabel menjadi produk bernilai jual (lilin aromaterapi, sabun, kompos, dan sejenisnya).
3. **Penjualan produk** — produk dijual lewat katalog publik dengan konfirmasi pembayaran manual, dan pendapatan tercatat otomatis di buku besar keuangan.
4. **Alokasi dampak sosial** — sebagian pendapatan dialokasikan ke program sosial dan disalurkan ke penerima manfaat, dengan validasi saldo yang tidak bisa dilewati.
5. **Transparansi publik** — halaman `/dampak` dan `/transparansi` menampilkan angka agregat yang dihitung langsung dari data terverifikasi, bukan estimasi atau angka ilustratif.

Sistem sengaja **tidak** mengklaim pelacakan satu-lawan-satu ("donasi ini menjadi produk itu") — akuntansi bahan dan dana bersifat pooled (digabung), dan hal ini dinyatakan eksplisit ke pengguna. Detail lengkap ada di [`docs/ALUR_DONASI.md`](docs/ALUR_DONASI.md).

---

## Status Proyek

Fondasi teknis, alur donasi, sistem operasional (inventaris limbah, produksi, katalog produk, penjualan, keuangan, program sosial), kontrol akses berjenjang (RBAC), SEO, aksesibilitas, dan pengamanan data telah dibangun dan diverifikasi. Item yang secara sadar belum dikerjakan (publikasi cerita dampak dengan alur consent, laporan transparansi berbentuk snapshot periodik, pengujian end-to-end otomatis) dicatat eksplisit di `.agents/TASK.md` — tidak diklaim selesai jika belum.

Ringkasan fondasi teknis awal:

- [x] Struktur Next.js App Router (Server Components by default)
- [x] Strict TypeScript (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`)
- [x] Design Token System (`styles/tokens.css` dan `lib/tokens/index.ts`)
- [x] Palet Warna Murni (Ink, Warm Earth, Botanical Green, Paper, dan State tokens)
- [x] Sistem Tipografi, Spacing 4px, Border Radius, dan Elevasi Terukur
- [x] UI Primitives dasar (`Button`, `Badge`, `Card`, `Input`, `Container`, `SkipLink`)
- [x] Aksesibilitas WCAG 2.2 AA (Focus states, semantic HTML, screen reader helpers)
- [x] Error boundaries & loading states (`loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`)
- [x] Metadata & SEO Foundation (`robots.ts`, `sitemap.ts`, Open Graph, structured data)
- [x] Fondasi Utilitas Supabase (`lib/supabase/` SSR client/server/middleware dengan perlindungan service-role key)
- [x] Row Level Security (RLS) granular per peran di seluruh tabel operasional
- [x] Kontrol akses berjenjang (SUPER_ADMIN, ADMIN, OPERATOR, FINANCE, SOCIAL_OFFICER)

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

Variabel publik (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dan `SUPABASE_SERVICE_ROLE_KEY` divalidasi secara *lazy* melalui `lib/env.ts` — aplikasi akan melempar error yang jelas saat variabel tersebut pertama kali diakses dan kosong/tidak terisi, alih-alih diam-diam berjalan dengan nilai kosong.

---

## Node.js Version

Project ini menargetkan **Node.js 20 LTS** (lihat `.nvmrc` dan field `engines` di `package.json`). Jika menggunakan `nvm`:

```bash
nvm use
```

---

## Supabase & Migration Workflow

### Environment Supabase

Project ini menggunakan Supabase project terpisah per environment:

- **Local/Development**: gunakan Supabase project pribadi (free tier cukup) untuk development sehari-hari. Isi `.env.local` dengan URL/key project tersebut.
- **Staging**: Supabase project terpisah untuk pengujian sebelum production, dengan data non-sensitif/demo.
- **Production**: Supabase project produksi. Kredensial hanya disimpan di environment variable platform hosting (misalnya Vercel), **tidak pernah** dikomit ke repository.

Repo ini belum menyertakan `supabase/config.toml` (konfigurasi Supabase CLI untuk local stack berbasis Docker) karena belum ada kebutuhan menjalankan Supabase secara lokal via CLI. Jika suatu saat dibutuhkan, jalankan `supabase init` secara interaktif lalu commit hasilnya.

### Menjalankan Migration

Migration SQL disimpan di `supabase/migrations/` (contoh: `001_donation_foundation.sql`). Setiap file migration bersifat idempotent (menggunakan `IF NOT EXISTS` / `ON CONFLICT DO NOTHING`) sehingga aman dijalankan ulang.

Dua cara menerapkan migration ke sebuah Supabase project:

1. **Manual via Supabase Dashboard** — buka **SQL Editor** pada project Supabase yang dituju, tempel isi file migration secara berurutan sesuai penomoran (`001_...`, `002_...`, dst.), lalu jalankan.
2. **Via Supabase CLI** (jika project sudah di-link dengan `supabase link`):
   ```bash
   supabase db push
   ```

Migration baru harus selalu berupa file bernomor urut baru (`002_...`, `003_...`) — jangan mengubah isi file migration yang sudah pernah diterapkan ke environment manapun.
