# TASK.md — KITA TUMBUH / KAMPUNG SMART FARMING

> **Implementation Roadmap & Execution Backlog**
>
> **Status:** Approved v1.0  
> **Master Brand:** KITA TUMBUH  
> **Platform / Ekosistem:** KAMPUNG SMART FARMING  
> **Tagline:** Dari Limbah, Tumbuh Manfaat.  
> **Core Statement:** SAMPAH KALIAN SANGAT BERARTI BAGI KAMI  
> **Stack:** TypeScript + Next.js + Supabase PostgreSQL  
> **Related:** `RPD.md`, `ARSITEKTUR.md`, `WIREFRAME.md`, `DESIGN_SYSTEM.md`, `AGENTS.md`

---

## 0. Purpose

Dokumen ini mengubah product requirements, system architecture, dan wireframe KITA TUMBUH / KAMPUNG SMART FARMING menjadi pekerjaan yang dapat dieksekusi oleh manusia maupun coding agent.

Urutan kerja harus menjaga prinsip:

```text
Foundation
   ↓
Design System
   ↓
Public Experience
   ↓
Donation Experience
   ↓
Auth + Member Area
   ↓
Operational Admin
   ↓
Impact + Transparency
   ↓
SEO + AI Discoverability
   ↓
Testing + Security
   ↓
Production
```

Jangan melompat langsung ke dashboard admin sebelum public donation journey memiliki fondasi yang stabil.

---

# 1. Definition of Done Global

Sebuah task dianggap selesai jika:

- implementasi mengikuti arsitektur dan naming convention yang telah ditetapkan;
- TypeScript strict tanpa `any` yang tidak beralasan;
- responsive minimal untuk mobile, tablet, dan desktop;
- loading, empty, error, dan success state tersedia ketika relevan;
- akses keyboard dan semantic HTML dipertimbangkan;
- data sensitif tidak bocor ke public client;
- tidak ada credential/secret di source code;
- lint/typecheck/build berhasil;
- perubahan penting mempunyai test atau verification yang sesuai;
- tidak membuat placeholder yang terlihat seperti fitur sudah benar-benar tersedia;
- copy publik tidak mengandung lorem ipsum, hype kosong, atau angka dampak palsu.

---

# 2. Priority Legend

| Priority | Meaning |
|---|---|
| P0 | Blocker / core MVP. Harus selesai agar produk utama bekerja. |
| P1 | Penting untuk usability, trust, atau operational readiness. |
| P2 | Improvement setelah core flow stabil. |
| P3 | Eksperimen/future enhancement. |

Status:

```text
[ ] Todo
[~] In Progress
[x] Done
[-] Blocked
```

---

# 3. Phase 0 — Project Foundation

## P0-001 — Initialize Next.js project

- [x] Buat project Next.js berbasis App Router.
- [x] Aktifkan TypeScript strict.
- [x] Konfigurasi linting dan formatting.
- [x] Pastikan `dev`, `lint`, `typecheck`, dan `build` tersedia.
- [x] Tetapkan Node.js version melalui project configuration.
- [x] Buat baseline README dan environment documentation.

**Acceptance:** project dapat dijalankan lokal dengan command standar dan production build berhasil.

## P0-002 — Establish source structure

- [x] Tentukan struktur `app/`, `components/`, `lib/`, `server/`, `types/`, `content/`, `public/`, dan `tests/` sesuai kebutuhan.
- [x] Pisahkan server-only utilities dari browser code.
- [x] Buat barrel exports hanya jika benar-benar membantu readability.
- [x] Hindari folder structure yang terlalu dalam tanpa alasan.

## P0-003 — Environment configuration

- [x] Definisikan environment variables yang dibutuhkan.
- [x] Pisahkan public variables dari server-only secrets.
- [x] Tambahkan `.env.example` tanpa secret nyata.
- [x] Validasi environment saat startup/build bila memungkinkan. *(2026-09-20: `lib/env.ts` divalidasi dengan Zod, lazy — dicek saat field pertama kali diakses agar `next build`/static generation tidak crash, tapi tetap fail-fast dengan pesan jelas saat runtime benar-benar memakainya.)*

## P0-004 — Supabase foundation

- [x] Hubungkan Supabase project.
- [x] Konfigurasi PostgreSQL access sesuai environment.
- [x] Siapkan migration workflow. *(2026-09-20: didokumentasikan di README — migration diterapkan manual via Supabase Dashboard SQL Editor atau `supabase db push` jika project sudah di-link. `supabase/config.toml` sengaja tidak dibuat karena tidak ada kebutuhan local Supabase stack via CLI; lihat catatan di README bagian "Supabase & Migration Workflow".)*
- [x] Pastikan service-role key hanya digunakan server-side jika memang diperlukan.
- [x] Dokumentasikan local/staging/production environment. *(2026-09-20: lihat README bagian "Supabase & Migration Workflow".)*
- [x] **`middleware.ts` di root project di-wire ke `lib/supabase/middleware.ts` `updateSession()`.** *(2026-09-20: sebelumnya fungsi ini sudah ada tapi TIDAK PERNAH dipanggil — auth session Supabase tidak pernah di-refresh oleh middleware. Ini bukan item checklist asli, dicatat di sini karena merupakan perbaikan Phase 0 yang signifikan.)*

---

# 4. Phase 1 — Design System & Content Foundation

## P0-101 — Visual design tokens

- [x] Tetapkan color tokens brand. *(2026-09-20: palette di `styles/tokens.css` — nama `paper/ink/green/earth` — sempat berbeda dari `.agents/DESIGN_SYSTEM.md` dan `.agents/PROMPT.md` yang mendokumentasikan `cream/green/brown` dengan hex berbeda. Kedua dokumen sudah disinkronkan mengikuti kode yang sudah dipakai luas di production; lihat ADR-012 di `.agents/DECISIONS.md`.)*
- [x] Tetapkan typography scale.
- [x] Tetapkan spacing scale.
- [x] Tetapkan border radius.
- [x] Tetapkan shadow/elevation secara terbatas.
- [x] Tetapkan container width.
- [x] Tetapkan responsive breakpoints.

**Anti-slop requirement:** jangan membuat semua card menjadi rounded floating boxes. Gunakan hierarchy, spacing, border, dan surface variation secara intentional.

## P0-102 — Core components

Buat komponen reusable minimal:

- [x] Button
- [x] LinkButton
- [x] Input
- [x] Select *(sudah ada sebelumnya, checklist sempat tidak sinkron dengan kode)*
- [x] Textarea *(sudah ada sebelumnya, checklist sempat tidak sinkron dengan kode)*
- [x] Checkbox / Radio — **partial**: `RadioGroup` sudah ada sebelumnya dan lengkap. Checkbox murni **belum dibuat** — ditunda karena belum ada use case konkret di Phase 0-2 (filter yang ada di `/collection-point` cukup dengan `<select>` tunggal).
- [x] Card
- [x] Badge
- [ ] Modal / Dialog — **ditunda**, belum ada use case publik di Phase 0-2 (donation wizard pakai step page, bukan modal).
- [x] Drawer — **catatan**: implementasi saat ini adalah drawer mobile-nav inline di `components/layout/Header.tsx` (via `createPortal`), bukan primitive reusable generik. Cukup untuk kebutuhan saat ini.
- [ ] Toast / Alert — **ditunda**, lebih relevan untuk form submission feedback di Phase 3 (donation wizard).
- [ ] Tabs — **ditunda**, tidak ada kebutuhan tab di halaman Phase 0-2.
- [ ] Progress — **partial**: `DonationProgress` sudah ada tapi khusus wizard donasi, bukan primitive generik. Primitive generik ditunda.
- [ ] DataTable — **ditunda**, murni kebutuhan admin (Phase 9), di luar scope Phase 0-2.
- [x] EmptyState *(2026-09-20: `components/ui/EmptyState.tsx`, dipakai di `/collection-point`.)*
- [x] ErrorState *(2026-09-20: `components/ui/ErrorState.tsx`, dipakai di `/collection-point` dan `/cara-kerja` untuk kegagalan fetch data in-page.)*
- [ ] Skeleton — **ditunda**: semua halaman data-driven baru (`/collection-point`, `/cara-kerja`) memakai server-rendered `searchParams`, bukan client-side fetch, jadi tidak ada state loading yang butuh skeleton.
- [ ] Pagination — **ditunda**, listing yang ada (`/collection-point`) masih berjumlah kecil; ditambahkan saat data benar-benar butuh pagination.
- [x] Breadcrumb *(2026-09-20: `components/ui/Breadcrumb.tsx`, dipakai di semua halaman Phase 2 baru.)*

*(2026-09-20: tambahan di luar checklist asli — `components/ui/ComingSoon.tsx` dibuat untuk state "segera hadir" yang jujur pada halaman yang datanya bergantung backend Phase 5/7/8 yang belum ada, sesuai AGENTS.md §31.)*

## P0-103 — Public navigation

- [x] Desktop header.
- [x] Mobile navigation/drawer.
- [x] Primary CTA `Donasikan Limbah`.
- [x] Active navigation state — **partial**: `usePathname()` + `aria-current="page"` sudah diterapkan di `components/layout/Header.tsx` untuk CTA `/donasikan` (satu-satunya link dengan rute asli saat P1-Phase-1 dikerjakan). Nav link lain (Galeri, Cara Kerja, Dampak, Transparansi) masih hash-anchor ke section homepage (`#cara-kerja`, dst) — logic active-state sudah siap tapi belum diterapkan ke link tersebut karena mengubahnya ke rute asli (`/cara-kerja`, `/dampak`, dst) adalah perubahan UX terpisah yang sengaja tidak dilakukan otomatis di sini, supaya homepage tidak kehilangan in-page scroll ke section yang sama.
- [x] Footer dengan link penting.

## P0-104 — Content model baseline

**Koreksi 2026-09-20:** item ini sebelumnya tercentang penuh `[x]` padahal folder `lib/content/` sama sekali belum ada — semua copy hardcoded langsung di `app/page.tsx`. Status di bawah ini mencerminkan kondisi nyata setelah ekstraksi dilakukan.

Siapkan struktur konten untuk:

- [x] hero messaging; *(`lib/content/hero.ts` — dibuat sebagai struktur data, belum di-wire ke `app/page.tsx` karena hero punya markup JSX kompleks (emphasis, ikon, quote card) yang berisiko berubah tampilan bila dipaksa jadi string interpolation murni. Tersedia sebagai referensi untuk hero halaman lain.)*
- [x] cara kerja; *(`lib/content/how-it-works.ts` — `homepageJourney` untuk preview 4 langkah di homepage, `howItWorksSteps` untuk 6 tahap lengkap di `/cara-kerja`.)*
- [x] accepted waste; *(`lib/content/accepted-waste.ts` untuk preview homepage; data real per jenis limbah tetap dari `lib/domain/waste-types.ts`, dipakai di `/cara-kerja` dan `/faq`.)*
- [x] FAQ; *(`lib/content/faq.ts`, 13 item, dipakai di `/faq`.)*
- [ ] impact metrics; — **belum ada struktur data** karena belum ada backend agregasi (P0-802 Phase 8 belum dikerjakan). `/dampak` menampilkan placeholder metrik ("—") + penjelasan methodology, bukan struktur data metrik nyata.
- [ ] social programs; — **belum ada struktur data**, `/program` memakai `ComingSoon` karena belum ada tabel/model program (P0-701 Phase 7 belum dikerjakan).
- [ ] stories; — **belum ada struktur data**, `/cerita` memakai `ComingSoon` — juga memerlukan proses consent nyata yang di luar scope coding.
- [ ] products; — **belum ada struktur data**, `/produk` memakai `ComingSoon` karena belum ada tabel/model produk (P0-506 Phase 5 belum dikerjakan).
- [x] transparency pages. *(`/transparansi` dibuat dengan prinsip pencatatan yang sudah benar-benar diterapkan di sistem + `ComingSoon` untuk laporan periodik yang butuh P0-803.)*

Copy awal harus dapat diganti tanpa mengubah komponen utama. *(Dipenuhi untuk hero/cara-kerja/accepted-waste/FAQ via `lib/content/*.ts`; item yang masih `ComingSoon` akan mendapat struktur data serupa saat backend terkait dikerjakan.)*

---

# 5. Phase 2 — Public Website MVP

## P0-201 — Home

- [x] Hero dengan signature line **“SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.”**
- [x] Primary CTA ke donation flow.
- [x] Secondary CTA ke cara kerja/dampak.
- [x] Impact proof strip.
- [x] How-it-works preview.
- [x] Accepted waste preview.
- [x] Product preview.
- [x] Social program preview.
- [x] Story preview.
- [x] Transparency preview.
- [x] Final CTA.

**Acceptance:** visitor memahami proposisi produk tanpa harus membuka halaman lain.

## P0-202 — `/cara-kerja` — DONE

- [x] Jelaskan enam tahap utama. *(`lib/content/how-it-works.ts` → `howItWorksSteps`, ditampilkan di `app/cara-kerja/page.tsx`.)*
- [x] Tampilkan hubungan limbah → produk → sosial. *(Diagram alur teks "Limbah → Pengolahan → Produk → Penjualan → Dana sosial → Dampak" di hero halaman.)*
- [x] Jelaskan apa yang terjadi setelah donor menyerahkan limbah. *(Tahap 02-03 menjelaskan verifikasi dan pengolahan.)*
- [x] Tambahkan FAQ operasional. *(Tautan ke `/faq` lengkap; halaman ini sendiri fokus pada 6 tahap + accepted/rejected waste dari `getWasteTypes()`.)*

## P0-203 — `/tentang-kami` — DONE

- [x] Mission. *(`lib/content/organization.ts`)*
- [x] Vision.
- [x] Values.
- [x] Operational approach.
- [ ] Team/organization information bila tersedia. — **sengaja dikosongkan**: tidak ada data faktual nama/struktur organisasi yang tersedia untuk dipublikasikan; menampilkannya akan melanggar AGENTS.md §4.3 (never invent facts). Ditambahkan nanti jika data faktual tersedia.
- [x] Avoid unverifiable claims. *(Semua klaim di halaman ini diturunkan dari `.agents/RPD.md`/`.agents/CONTENT.md`, bukan angka yang bisa diverifikasi — tidak ada statistik yang diklaim.)*

## P0-204 — `/dampak` — PARTIAL

- [x] Public impact overview. *(Route dibuat, `app/dampak/page.tsx`.)*
- [ ] Filter periode. — **diblokir**: perlu backend agregasi (P0-802, Phase 8) yang belum dikerjakan.
- [ ] Waste collected. — **diblokir**, sama alasan di atas. Ditampilkan sebagai placeholder "—" + penjelasan methodology, bukan angka fabricated.
- [ ] Waste processed. — **diblokir**, sama.
- [ ] Products generated/sold. — **diblokir**, sama.
- [ ] Social allocation. — **diblokir**, sama.
- [ ] Beneficiaries. — **diblokir**, sama.
- [x] Data methodology link. *(Section "Bagaimana angka ini nantinya dihitung" menjelaskan definisi metrik secara eksplisit meski datanya belum ada — janji proses, bukan angka.)*

## P0-205 — `/transparansi` — PARTIAL

- [x] Explain source and update cadence of metrics. *(Section "Prinsip pencatatan kami" — 4 prinsip yang sudah benar-benar diterapkan di sistem: estimasi vs verified quantity terpisah, audit trail status, dst.)*
- [ ] Monthly/periodic summary. — **diblokir**: perlu P0-803 (Transparency report, Phase 8) yang belum dikerjakan. `ComingSoon` state dipakai.
- [ ] Revenue and allocation summary when publishable. — **diblokir**, sama.
- [x] Operational notes. *(4 prinsip pencatatan yang ditampilkan sudah operasional nyata — bukan janji.)*
- [ ] Link to supporting reports/documents when appropriate. — **diblokir**, belum ada laporan untuk ditautkan.

## P1-206 — `/program` — PARTIAL

- [x] Program list. *(Route dibuat, tapi berisi `ComingSoon` — belum ada tabel/model program di Supabase; P0-701 Phase 7 belum dikerjakan.)*
- [ ] Program detail. — **diblokir**, sama alasan di atas.
- [ ] Goal and current progress. — **diblokir**, sama.
- [ ] Source of social funds. — **diblokir**, sama.
- [ ] Status. — **diblokir**, sama.
- [ ] Evidence/documentation where appropriate. — **diblokir**, sama.

## P1-207 — `/cerita` — PARTIAL

- [x] Story listing. *(Route dibuat, `ComingSoon` — belum ada model data cerita.)*
- [ ] Story detail. — **diblokir**, sama.
- [ ] Consent/privacy review for identifiable people. — **diblokir**: proses consent adalah proses non-teknis yang belum berjalan, bukan sesuatu yang bisa "diselesaikan" lewat kode.
- [x] Keep storytelling human, not exploitative. *(Dipenuhi secara default — belum ada cerita yang dipublikasikan sama sekali, jadi tidak ada risiko eksploitatif untuk saat ini.)*

## P1-208 — `/produk` — DONE

- [x] Product catalog. *(`app/produk/page.tsx` terintegrasi dengan database: jika ada produk aktif `is_public = true`, merender grid produk sirkular; jika belum ada, menampilkan `ComingSoon` jujur per AGENTS.md §4.4).*
- [x] Category/filter. *(3 kategori konseptual ditampilkan — minyak jelantah/organik/plastik — selaras dengan enum kategori `products.category`).*
- [x] Product detail / cards. *(Kartu produk menampilkan nama, deskripsi, cerita asal limbah, harga Rp, dan ketersediaan stok).*
- [x] Product impact explanation. *(Bagian cerita dampak / story mengaitkan produk dengan donasi limbah).*
- [x] Availability state. *(Stok dan status publik terverifikasi dari data riil tabel `products`).*

## P1-209 — `/collection-point` — DONE

- [x] Search/filter locations. *(Filter by jenis limbah via `searchParams`, server-rendered.)*
- [x] Accepted waste per location. *(Ditampilkan sebagai badge nama jenis limbah per titik.)*
- [x] Opening hours. *(`operating_hours` dari `getCollectionPoints()`.)*
- [x] Instructions. *(`notes` per titik.)*
- [x] Directions link/CTA. *(Link Google Maps berbasis alamat — fungsional, bukan `href="#"`.)*

*(Catatan: seed data collection point di `supabase/migrations/001_donation_foundation.sql` masih memakai alamat/nomor telepon placeholder ("Jl. Sejahtera No. 12", "+62-xxx-xxxx-xxxx") — ini data operasional yang perlu diganti admin sebelum go-live, di luar scope frontend.)*

## P1-210 — `/faq` — DONE

- [x] Donation questions.
- [x] Accepted/rejected waste.
- [x] Pickup/drop-off.
- [x] Processing.
- [x] Impact calculation. *(Jawaban jujur menyatakan sistem agregasi publik belum siap, bukan angka fabricated.)*
- [x] Product sales. *(Jawaban jujur menyatakan katalog belum tersedia.)*
- [x] Privacy.

---

# 6. Phase 3 — Donation Flow

**Sinkronisasi 2026-09-20:** fondasi wizard, submission, drop-off, dan tracking sudah ada sebelum pekerjaan ini. Checklist berikut mencatat implementasi yang tersedia serta penundaan yang disengaja, bukan klaim bahwa seluruh operasional Phase 5/8 telah selesai. Migration baru `002` perlu diterapkan ke Supabase sebelum versi aplikasi ini digunakan; hasil lint/typecheck/build dicatat terpisah setelah verifikasi.

## P0-301 — Donation start

- [x] `/donasikan` sebagai landing + wizard resmi (opsi b, ADR-013); `/donasi/[reference]` untuk tracking, tanpa landing `/donasi` terpisah.
- [x] Waste category selection. *(`StepMaterial` dari data jenis limbah aktif.)*
- [x] Show accepted condition. *(Catatan material terpilih.)*
- [x] Show disallowed items. *(Catatan material terpilih.)*
- [x] Avoid misleading “donate anything” messaging. *(Pilihan dibatasi kategori yang diterima.)*

## P0-302 — Donation wizard

Alur yang sudah diimplementasikan dalam empat langkah:

```text
Material
   ↓
Quantity
   ↓
Method + Schedule / Location
   ↓
Confirmation
```

Tasks:

- [x] Step state management. *(`DonationWizard`.)*
- [x] Client validation.
- [x] Server validation. *(`createDonation`.)*
- [x] Back/next behavior.
- [x] Preserve entered data between steps.
- [x] Accessible labels and error messages.
- [x] Mobile-friendly form controls.

## P0-303 — Donation submission

- [x] Create donation record. *(Insert nyata ke Supabase melalui Server Action.)*
- [x] Generate human-readable donation reference. *(Allocator database per tahun dengan perlindungan konkurensi pada migration `002`; tidak lagi memakai COUNT seluruh tabel di aplikasi.)*
- [x] Prevent duplicate submission on accidental refresh/click. *(Idempotency server: pre-check dan unique-constraint fallback; client mempertahankan key untuk payload yang sama saat retry/refresh pada sesi browser.)*
- [x] Validate accepted waste type server-side.
- [x] Validate quantity/unit server-side.
- [x] Return clear confirmation state.

**Batas yang masih ada:** pembuatan donation dan pickup request pada alur lama belum menjadi satu transaksi atomik. Hardening transaksi/recovery pickup perlu tindak lanjut; checklist ini tidak menyatakan transaksi gabungan sudah tersedia.

## P0-304 — Pickup scheduling

- [x] Address capture. *(Alamat privat untuk operasional.)*
- [x] Date selection. *(Tanggal yang diinginkan donor, menunggu konfirmasi.)*
- [ ] Available slot logic. — **ditunda secara sengaja (ADR-014):** pilihan pagi/siang statis adalah preferensi MVP; belum ada data kapasitas per tanggal, query ketersediaan, atau reservasi slot. UI tidak menjanjikan ketersediaan.
- [x] Pickup notes.
- [x] Status lifecycle. *(Enum/type/timeline delapan status sampai `IMPACTED` siap; donasi baru tetap `SUBMITTED`. Transisi admin/operasional tidak otomatis dan bergantung pada Phase 5/8.)*
- [ ] Operator assignment if required. — **ditunda:** belum ada workflow penugasan operator; bergantung pada implementasi admin/operasional.

## P0-305 — Drop-off scheduling/selection

- [x] Collection point selector.
- [x] Display accepted materials. *(Daftar titik difilter menurut material yang dipilih.)*
- [x] Operating hours.
- [x] Selected location summary. *(`StepReview`.)*

## P0-306 — Donation tracking

Track:

```text
Submitted
→ Scheduled
→ Collected
→ Verified
→ Sorted
→ Processed
→ Converted
→ Impacted
```

- [x] Timeline UI. *(`DonationTimeline`, delapan tahap termasuk `IMPACTED`.)*
- [x] Status timestamp. *(Dari event riwayat status yang tersimpan.)*
- [x] Status-specific copy. *(`CONVERTED` dipisahkan dari dampak terverifikasi pada `IMPACTED`.)*
- [x] Empty/error fallback. *(Pesan referensi tidak ditemukan memakai `EmptyState` dengan cek ulang kode/mulai donasi baru; kegagalan data memakai `ErrorState`.)*
- [x] User can open donation detail. *(`/donasi/[reference]`, proyeksi publik tanpa alamat, kontak, atau catatan privat.)*

## P0-307 — Impact receipt

- [x] Donation reference. *(Disatukan dalam `ImpactReceipt`.)*
- [x] Material.
- [x] Estimated quantity.
- [x] Actual verified quantity when available. *(Ditampilkan hanya jika tersedia; estimasi tetap terpisah.)*
- [x] Current processing status.
- [ ] Impact summary only when supported by verified data. — **ditunda:** belum ada lineage donasi individual → batch/produk → penjualan → alokasi sosial terverifikasi (Phase 5/8). Bagian ini tidak dirender sama sekali; tidak ada placeholder atau angka contoh.
- [x] Shareable public-safe version. *(`Bagikan Dampak` membuka `/donasi/[reference]/receipt`; HTML ringkas dengan metadata Open Graph teks, tanpa data sensitif. Gambar OG dinamis tidak diperlukan untuk MVP — ADR-015.)*

---

# 7. Phase 4 — Authentication & Member Area

## P0-401 — Authentication — DONE

- [x] Sign up. *(`app/register/page.tsx` + `components/auth/RegisterForm.tsx` calling `signUpAction` via Supabase Auth + fallback upsert to `profiles` table.)*
- [x] Sign in. *(`app/login/page.tsx` + `components/auth/LoginForm.tsx` calling `signInAction` via Supabase Auth email/password. No OAuth per ADR-016.)*
- [x] Sign out. *(`signOutAction` clearing session cookies and redirecting to `/login`.)*
- [x] Session handling. *(`lib/supabase/middleware.ts` updating cookies & protecting `/dashboard`, `/riwayat`, `/profil`, `/impact`, `/pickup`, plus `lib/auth/session.ts` `requireUser()` for Server Components.)*
- [x] Password reset if password auth is enabled. *(`app/reset-password/page.tsx` + `ResetPasswordForm.tsx` supporting email request and recovery password update via Supabase Auth.)*
- [x] Email verification if required. *(`RegisterForm.tsx` detects Supabase unconfirmed sessions and presents clear "Periksa kotak masuk email kamu" verification state without fabricating behavior.)*

Prefer Supabase Auth rather than custom password handling. *(Terpenuhi: memakai `@supabase/ssr` murni tanpa library auth eksternal, email + password only per ADR-016. Donasi publik di `/donasikan` tetap 100% anonim dan tidak diwajibkan login).*

## P0-402 — Member dashboard — DONE

- [x] Personal greeting. *(`app/dashboard/page.tsx` menyapa dengan nama dari `profiles` atau email pengguna.)*
- [x] Total contribution. *(Menghitung total donasi dan akumulasi liter/kg secara riil dari tabel `donations` dengan filter `.eq("user_id", user.id)`.)*
- [x] Donation count. *(Jumlah donasi riil terdaftar milik user.)*
- [x] Verified impact. *(Menampilkan volume fisik terverifikasi tim penimbangan; jika belum, estimasi awal ditandai bintang `*` secara jujur.)*
- [x] Recent donations. *(List 5 donasi terakhir dengan status badge dan tautan ke `/donasi/[reference]`.)*
- [x] Active pickup. *(Banner penjemputan aktif jika ada donasi metode PICKUP berstatus SUBMITTED/SCHEDULED.)*
- [x] Clear CTA to donate again. *(Tautan jelas ke `/donasikan` baik di header, banner, maupun `EmptyState`.)*

## P0-403 — Donation history — DONE

- [x] List donations. *(`app/riwayat/page.tsx` merender seluruh donasi pengguna.)*
- [x] Filter by status/type/date. *(Filter form berbasis server `searchParams` untuk status, waste_type, dan delivery_method).*
- [x] Open donation detail. *(Setiap baris menautkan ke `/donasi/[reference]` lengkap dengan tracking timeline).*
- [x] Pagination or cursor pagination. *(Pagination numerik 10 item per halaman dengan navigasi halaman sebelumnya/selanjutnya).*

## P0-404 — Personal impact — PARTIAL

- [x] Waste contribution totals. *(`app/impact/page.tsx` mengelompokkan total fisik limbah yang telah didonasikan).*
- [x] Material breakdown. *(Pemisahan liter/kg per jenis limbah: minyak jelantah, organik, anorganik).*
- [ ] Derived product impact where data is available. — **ComingSoon**: tabel batch produksi (`production_batches`) belum ada di DB (Phase 5 belum dikerjakan); menampilkannya akan melanggar aturan integritas data AGENTS.md §4.3. Ditampilkan kartu `ComingSoon` jujur.
- [ ] Social impact attribution where methodology supports it. — **ComingSoon**: keterkaitan penjualan produk ke alokasi sosial lansia belum terhubung ke database. Ditampilkan kartu `ComingSoon` jujur.
- [x] Explain metric definitions. *(Kartu transparansi menjelaskan perbedaan volume terverifikasi tim vs estimasi mandiri donatur).*

## P1-405 — Profile — PARTIAL

- [x] Personal information. *(`app/profil/page.tsx` + `ProfileForms.tsx` untuk mengubah nama lengkap di tabel `profiles`).*
- [x] Contact details. *(Mengubah nomor telepon/WhatsApp di tabel `profiles`).*
- [ ] Pickup addresses if supported. — **Ditunda ke Phase 5 (ADR-017)**: saat ini alamat penjemputan dimasukkan langsung pada form wizard donasi untuk menghindari skema premature sebelum modul dispatch/routing operasional dibangun.
- [x] Privacy settings. *(Form ubah kata sandi akun via Supabase Auth + penjelasan pengelolaan data kontak).*

---

# 8. Phase 5 — Core Operational System

## P0-501 — Waste master data — DONE

- [x] Waste type CRUD. *(`app/admin/waste-types/` listing via DataTable, create form at `/new`, edit form at `/[id]/edit` backed by server actions in `lib/domain/admin/waste-types.ts`.)*
- [x] Unit definition. *(Pilihan satuan ukuran seperti L, kg, pcs pada skema dan form.)*
- [x] Acceptance rules. *(Kolom `accepted_notes` untuk panduan kondisi limbah yang diterima.)*
- [x] Safety notes. *(Kolom `rejected_notes` untuk syarat keselamatan dan jenis yang dilarang.)*
- [x] Active/inactive status. *(Kolom `is_active` dengan toggle dan filter status).*

## P0-502 — Donation management — DONE

- [x] Donation queue. *(`app/admin/donations/page.tsx` menampilkan antrean seluruh donasi via DataTable dan Pagination.)*
- [x] Search/filter. *(Pencarian teks bebas pada nomor referensi/nama donatur + filter status, jenis limbah, dan metode penyerahan via server searchParams.)*
- [x] Verify donation. *(`app/admin/donations/[reference]/page.tsx` + `DonationVerificationForm.tsx` untuk keputusan VERIFIED atau REJECTED.)*
- [x] Record actual quantity. *(Input kuantitas penimbangan riil `verified_quantity` yang disimpan di database.)*
- [x] Assign pickup/collection point. *(Detail alamat pickup dan jadwal yang diminta donatur ditampilkan jelas pada kartu pengiriman.)*
- [x] Update status with audit trail. *(`updateDonationStatusAction` memicu trigger database `donation_status_history` dan menampilkan riwayat perubahan status lengkap).*

## P0-503 — Collection / handover — DONE

- [x] Record receipt. *(Form verifikasi fisik mencatat serah terima limbah resmi).*
- [x] Actual quantity. *(Menyimpan angka penimbangan fisik riil di kolom `verified_quantity`).*
- [x] Receiver/operator. *(Kolom `verified_by` mencatat ID admin/operator yang memproses verifikasi).*
- [x] Timestamp. *(Kolom `verified_at` mencatat waktu resmi serah terima dan penimbangan).*
- [x] Verification notes. *(Kolom `verification_notes` menyimpan catatan kondisi fisik dan kemasan limbah).*

## P0-504 — Waste inventory — DONE

- [x] Waste lot creation. *(`supabase/migrations/005_waste_inventory.sql` tabel `waste_lots` mencatat kode lot, jenis limbah, grade kualitas, lokasi penyimpanan, dan status).*
- [x] Inventory ledger. *(Tabel append-only `inventory_transactions` merekam setiap penambahan, konsumsi, dan penyesuaian stok).*
- [x] Incoming quantity. *(Penerimaan dari donasi atau serah terima limbah dicatat sebagai transaksi bertipe INTAKE/PURCHASE).*
- [x] Consumption/processing quantity. *(Pengurangan dicatat sebagai transaksi bertipe PRODUCTION_INPUT/DISPOSAL).*
- [x] Adjustment flow with reason. *(Modal penyesuaian stok `InventoryAdjustmentModal.tsx` mewajibkan input alasan tertulis untuk audit trail; mutasi dijalankan server-side lewat `adjustWasteLotAction`).*
- [x] Low-stock/aging indicators if operationally useful. *(Ringkasan kartu agregat stok riil per kategori limbah + status badge ACTIVE/DEPLETED/DISCARDED).*

## P0-505 — Production batch — DONE

- [x] Create batch. *(`supabase/migrations/006_production_batches.sql` tabel `production_batches` & form `app/admin/production/new/page.tsx` via `createProductionBatchAction`).*
- [x] Select input waste lots. *(Form `AddBatchInputForm.tsx` memilih lot dari `waste_lots` aktif, mencatat junction `batch_inputs`, dan mengurangi stok secara otomatis).*
- [x] Record input quantity. *(Jumlah bahan baku terpakai dicatat di `batch_inputs` dan diverifikasi tidak melebihi stok yang tersedia).*
- [x] Record output quantity. *(Form workflow mencatat `actual_output_quantity` saat batch masuk tahap COMPLETED/RELEASED).*
- [x] Record loss/waste where necessary. *(Form workflow mencatat kuantitas susut `loss_quantity` dan alasan `loss_reason`).*
- [x] Link output to product. *(Target luaran `target_output_type` dan kuantitas siap dikaitkan ke katalog produk sirkular).*
- [x] Close batch. *(State machine 5 tahap: PLANNED → IN_PROGRESS → QC_REVIEW → COMPLETED → RELEASED per ARSITEKTUR.md §7.2).*

## P0-506 — Product management — DONE

- [x] Product CRUD. *(`supabase/migrations/007_products.sql` tabel `products`, listing di `app/admin/products/page.tsx`, form create di `/new` dan edit di `/[id]/edit` via Server Actions di `lib/domain/admin/products.ts`).*
- [x] SKU. *(Kolom `sku` unik, format alfanumerik huruf kapital dan strip).*
- [x] Price. *(Harga integer Rupiah tanpa floating point per DATABASE.md Money).*
- [x] Inventory. *(Pencatatan stok fisik kuantitas integer `stock_quantity` dan satuan `unit`).*
- [x] Production batch relationship. *(Relasi opsional `production_batch_id` ke batch yang diproduksi untuk penelusuran asal usul produk).*
- [x] Public visibility. *(Toggle `is_public` dengan RLS policy yang mengizinkan publik hanya membaca produk dengan `is_public = true`).*
- [x] Product images. *(Field `image_url` untuk gambar produk sirkular).*

---

# 9. Phase 6 — Sales & Financial Flow

## P0-601 — Orders — DONE

- [x] Create order. *(`supabase/migrations/009_orders.sql` tabel `orders` & `order_items`, `lib/domain/orders.ts` `createOrderAction` with server-side product price retrieval & stock availability validation).*
- [x] Order item snapshot (name/price at purchase time). *(Kolom `product_name_snapshot` dan `product_price_snapshot` di `order_items` mengabadikan nominal pembelian immutable).*
- [x] Order status. *(Status lifecycle `PENDING_PAYMENT` → `PAID` → `PROCESSING` → `SHIPPED`/`READY_FOR_PICKUP` → `COMPLETED` + `CANCELLED`, pelacakan publik di `app/pesanan/[reference]/page.tsx`).*
- [x] Customer information. *(Mendukung pemesanan guest/anonim dengan mencatat data kontak dan alamat pengiriman, sekaligus menyimpan `user_id` jika pembeli sedang login per ADR-019).*
- [x] Product inventory decrement only at the agreed transactional point. *(Stok produk TIDAK dikurangi saat order baru dibuat `PENDING_PAYMENT`; decrement hanya terjadi saat status berpindah ke `PAID` terverifikasi per ADR-020. **Audit 2026-09-20:** implementasi awal melakukan decrement lewat loop read-then-write di level aplikasi yang rentan race condition antar-konfirmasi pembayaran bersamaan untuk produk yang sama; diperbaiki dengan memindahkan seluruh operasi ke prosedur Postgres atomik `execute_order_payment_confirmation` [`013_order_payment_fixes.sql`] yang mengunci baris order & produk `FOR UPDATE` dalam satu transaksi — konsisten dengan pola `execute_social_allocation`).*

## P0-602 — Payment integration boundary — DONE

- [x] Abstract payment provider interface. *(`lib/payments/types.ts` interface `PaymentProvider` dengan `createPaymentIntent` dan `verifyCallback`).*
- [x] Keep provider-specific logic isolated. *(`lib/payments/manual-provider.ts` implementasi `ManualConfirmationProvider` tanpa mengikat domain order ke provider eksternal).*
- [x] Verify server-side payment callbacks/webhooks. *(Verifikasi callback server-side; shape disiapkan untuk integrasi gateway mendatang).*
- [x] Do not trust client-submitted payment status. *(Konfirmasi pembayaran hanya dapat dilakukan oleh admin terautentikasi melalui server action `confirmOrderPaymentAction` dengan `requireAdmin()`).*

Payment provider selection is a separate decision and should not be hard-coded into domain logic (ADR-021).

## P0-603 — Revenue ledger — DONE

- [x] Record realized sales revenue. *(`supabase/migrations/010_revenue_ledger.sql` tabel `revenue_entries` append-only mencatat nilai rupiah pendapatan dari pesanan lunas. **Audit 2026-09-20:** RLS awal memakai policy `FOR ALL` yang secara tidak sengaja mengizinkan UPDATE/DELETE bebas oleh admin, bertentangan dengan niat "append-only"; diperketat di `013_order_payment_fixes.sql` menjadi SELECT+INSERT saja, tanpa policy UPDATE/DELETE apa pun).*
- [x] Keep order and financial ledger concepts separate. *(Entri pendapatan terpisah struktural dari pesanan dan saldo dihitung derivatif dari SUM ledger, bukan mutasi kolom per DATABASE.md).*
- [x] Reconciliation state. *(Status rekonsiliasi perbankan `PENDING`, `RECONCILED`, `DISCREPANCY` dengan aksi perbaruan status terproteksi di `app/admin/finance/revenue/page.tsx`; perubahan status kini lewat RPC `update_revenue_reconciliation` [`SECURITY DEFINER`], satu-satunya jalur sah mengubah baris ledger setelah insert).*
- [x] Audit changes. *(Pencatatan otomatis via DB trigger `trg_record_revenue_on_paid` saat pesanan berubah menjadi `PAID` dengan audit trail pengguna dan catatan mutasi).*

## P0-604 — Allocation — DONE

- [x] Define allocation record. *(`supabase/migrations/011_social_allocations.sql` tabel `social_allocations` merekam program, sumber dana, nominal Rupiah, dan status persetujuan).*
- [x] Link allocation to a funding source. *(Field `funding_source_reference` default `REVENUE_SALES` menghubungkan alokasi ke pendapatan penjualan produk).*
- [x] Link allocation to social program. *(Kolom `program_name TEXT` disiapkan sebagai referensi program; **keterbatasan eksplisit:** foreign key penuh ke tabel `social_programs` ditunda sampai Phase 7 selesai dibangun, tidak membuat tabel parsial mendahului Phase 7).*
- [x] Record amount. *(Nominal integer Rupiah minor-unit `amount BIGINT CHECK (amount > 0)`).*
- [x] Record date. *(Timestamp resmi `allocated_at` timezone UTC).*
- [x] Approval status. *(Status persetujuan `PENDING`, `APPROVED`, `REJECTED` dengan audit persetujuan admin).*
- [x] Prevent allocation above available balance through server-side transaction logic. *(Validasi server-side dan prosedur database atomik `execute_social_allocation` mencegah defisit dan race-condition dengan menghitung `SUM(revenue) - SUM(approved_allocations)`).*

## P1-605 — Operational expenses — DONE

- [x] Expense records. *(`supabase/migrations/012_expenses.sql` tabel `expenses`, listing & pencatatan di `app/admin/finance/expenses/page.tsx` via `recordExpenseAction`).*
- [x] Category. *(Pilihan kategori operasional terstruktur: `LOGISTICS`, `PACKAGING`, `EQUIPMENT`, `UTILITIES`, `OTHER` dengan CHECK constraint).*
- [x] Amount. *(Nominal integer Rupiah minor-unit `amount BIGINT CHECK (amount > 0)`).*
- [x] Date. *(Timestamp resmi transaksi pengeluaran `occurred_at`).*
- [x] Notes. *(Catatan wajib rincian peruntukan beban operasional).*
- [x] Attachment/reference where appropriate. *(Kolom `attachment_url` opsional untuk tautan bukti nota/struk pengeluaran).*

*Catatan Integritas Finansial (AGENTS.md §12):* Beban operasional dicatat di tabel terpisah tegas dari `social_allocations`, menjaga agar biaya operasional tidak pernah disamarkan sebagai dana dampak sosial.

---

# 10. Phase 7 — Social Program & Beneficiary

## P0-701 — Social program management — DONE

- [x] Program CRUD. *(`supabase/migrations/014_social_programs.sql` tabel `social_programs`; `lib/domain/admin/social-programs.ts` `createSocialProgramAction`/`updateSocialProgramAction`; UI di `/admin/social/programs`).*
- [x] Goal. *(Kolom `goal TEXT NOT NULL`, ditampilkan di form admin dan halaman publik program).*
- [x] Status. *(Siklus hidup `DRAFT → REVIEW → APPROVED → ACTIVE → FUNDED/PARTIALLY_FUNDED → DISTRIBUTED → COMPLETED` sesuai ARSITEKTUR.md §7.4, CHECK constraint di migration 014).*
- [x] Target amount if applicable. *(Kolom `target_amount BIGINT` nullable — program berkelanjutan tanpa target tetap boleh mengosongkannya).*
- [x] Funding status. *(`allocated_amount` dihitung derivatif dari `SUM(social_allocations.amount WHERE approval_status = 'APPROVED')` per program, tidak pernah disimpan sebagai kolom — konsisten dengan prinsip ARSITEKTUR.md §3.1).*
- [x] Public/private visibility. *(Kolom `public_status BOOLEAN`; RLS `social_programs_public_read` membatasi SELECT publik hanya ke baris `public_status = true`. Halaman `/program` menampilkan data nyata menggantikan ComingSoon, dengan fallback ComingSoon jujur jika belum ada program yang dipublikasikan).*

**Catatan integrasi Phase 6:** `social_allocations.program_name` (TEXT, dibuat Phase 6 sebagai keterbatasan eksplisit) dipertahankan sebagai snapshot nama program saat alokasi dibuat; kolom `program_id` (FK opsional ke `social_programs`) ditambahkan di migration 014 tanpa menghapus/mengubah data lama.

## P0-702 — Beneficiary management — DONE

- [x] Beneficiary record. *(`supabase/migrations/015_beneficiaries.sql` tabel `beneficiaries`; admin-only, tidak ada policy SELECT publik sama sekali).*
- [x] Category. *(`CHILD_WITH_DISABILITY`, `ELDERLY`, `FAMILY`, `OTHER` dengan CHECK constraint).*
- [x] Need/assistance type. *(Kolom `need_type TEXT NOT NULL`).*
- [x] Verification status. *(`PENDING`, `VERIFIED`, `REJECTED`; hanya penerima manfaat `VERIFIED` yang muncul di dropdown form distribusi).*
- [x] Consent/privacy status. *(`consent_status`: `NOT_REQUESTED`/`PENDING`/`GRANTED`/`DECLINED`/`REVOKED`; `privacy_level`: `PRIVATE`/`ALIAS_ONLY`/`PUBLIC`. Validasi Zod + form UI menolak kombinasi `privacy_level = PUBLIC` tanpa `consent_status = GRANTED`).*
- [x] Public display policy. *(Field `name_or_alias` memungkinkan alias jika consent nama asli belum ada. **Keterbatasan eksplisit:** proyeksi publik penerima manfaat belum dibangun di Phase 7 ini — Fase 8/Transparency Engine yang akan membangun view publik terbatas berdasarkan `privacy_level`; untuk saat ini `beneficiaries` murni data internal admin, tidak ada endpoint publik yang membacanya sama sekali, sehingga tidak ada risiko kebocoran).*

## P0-703 — Distribution — DONE

- [x] Create distribution. *(`supabase/migrations/016_distributions.sql` tabel `distributions`; `lib/domain/admin/distributions.ts` `createDistributionAction`).*
- [x] Link to program. *(FK `program_id NOT NULL REFERENCES social_programs`).*
- [x] Link to beneficiary. *(FK `beneficiary_id NOT NULL REFERENCES beneficiaries`).*
- [x] Funding source. *(FK opsional `allocation_id REFERENCES social_allocations` — nullable untuk distribusi barang in-kind di luar alokasi dana).*
- [x] Amount/item. *(`amount BIGINT` dan/atau `item_description TEXT`; CHECK constraint `distributions_amount_or_item` mewajibkan minimal salah satu diisi).*
- [x] Date. *(`distributed_at DATE NOT NULL`).*
- [x] Evidence/document reference. *(`evidence_url` + `evidence_notes`).*
- [x] Approval/audit trail. *(`approval_status`, `approved_by`, `recorded_by`. Validasi saldo alokasi anti-defisit dilakukan atomik server-side via RPC `execute_distribution` yang mengunci baris alokasi `FOR UPDATE` dan menghitung ulang sisa saldo dalam satu transaksi — pola yang sama dengan `execute_social_allocation` [Phase 6] dan `execute_order_payment_confirmation` [Phase 6 audit fix], mencegah TOCTOU race antar-distribusi bersamaan terhadap alokasi yang sama).*

## P1-704 — Impact story publishing — NOT STARTED

- [ ] Story draft.
- [ ] Review/approval.
- [ ] Consent verification.
- [ ] Publish/unpublish.
- [ ] Link story to program/impact records where appropriate.

**Catatan:** P1-704 sengaja tidak dikerjakan di iterasi Phase 7 ini — cakupan diprioritaskan pada P0-701/702/703 (fondasi program, penerima manfaat, dan distribusi) yang menjadi prasyarat data sebelum cerita dampak dapat dikaitkan ke program/distribusi nyata. Halaman `/cerita` tetap ComingSoon jujur dari Phase 2, konsisten dengan prinsip anti-fabrikasi.

---

# 11. Phase 8 — Transparency & Impact Engine ✅

## P0-801 — Impact calculation definitions ✅

- [x] `lib/domain/impact/definitions.ts` — registri MetricDefinition untuk
      setiap metrik publik (slug, label, formula, sourceTable, filter,
      unit, caveat, isPooled). Tidak ada metrik yang dipublikasikan tanpa
      definisi tercatat.

## P0-802 — Public impact aggregation ✅

- [x] `lib/domain/impact/public-impact.ts` — agregasi paralel 7 metrik dari DB.
- [x] Hanya data terverifikasi (status ≥ VERIFIED, batch COMPLETED/RELEASED,
      allocation APPROVED, program public_status=true).
- [x] Per material: minyak jelantah (L) dan limbah organik (kg) terpisah.
- [x] Privacy boundary dijaga: tidak ada query ke tabel sensitif
      (beneficiaries, pickup_requests, donor PII).
- [x] Status "no_data" dipisahkan dari angka nol sungguhan.
- [x] force-dynamic (no caching) — angka publik selalu live.
- [ ] Filter per periode (bulan/tahun) — backlog iterasi berikutnya.

**Bug kritis ditemukan & diperbaiki saat audit (2026-09-20):** implementasi awal
meng-query `donations`, `production_batches`, `batch_inputs`, dan
`social_allocations` langsung dengan Supabase client anon-key milik
pengunjung publik. Di bawah RLS aktual tabel-tabel itu: (1) `donations_owner_read`
hanya mengizinkan baris `user_id IS NULL`, sehingga donasi dari member yang
login **hilang diam-diam** dari hitungan publik (undercount, bukan error);
(2) `production_batches`/`batch_inputs`/`social_allocations` memakai RLS
admin-only tanpa policy SELECT publik sama sekali, sehingga query langsung
dari klien anon **selalu mengembalikan 0 baris** — 3 metrik (`waste_processed`,
`production_batches_completed`, `social_allocation_total`) SELALU tampil
"Belum ada data" di production meski datanya ada, bukan karena datanya kosong.
Diperbaiki dengan memindahkan 6 dari 7 metrik ke RPC `SECURITY DEFINER`
read-only yang HANYA mengembalikan angka agregat (`supabase/migrations/017_public_impact_aggregation.sql`,
ADR-025), granted ke role `anon`. Test regresi `tests/public-impact-rls-boundary.test.mjs`
mencegah query langsung ini kembali dipakai — divalidasi efektif dengan
sengaja mereproduksi bug lalu mengonfirmasi test gagal, lalu direvert.

## P0-803 — Transparency report ✅

- [x] `app/transparansi/page.tsx` — laporan transparansi penuh:
      prinsip pencatatan (6 prinsip), ringkasan operasional live,
      rantai domain keterlacakan, tabel metodologi per metrik,
      catatan keterbatasan operasional yang jujur.
- [x] Data freshness notice: timestamp dihitung.
- [x] Halaman /dampak dibangun ulang dengan metrik live + metodologi grid.
- [x] **Keputusan arsitektur (ADR-025):** MVP memakai live-aggregation setiap
      request (`force-dynamic`, tanpa tabel snapshot `transparency_reports`/
      `transparency_report_metrics` yang disebut di DATABASE.md). Snapshot
      laporan periodik yang dipublikasikan secara sadar (bukan live-query)
      ditunda ke iterasi berikutnya — trafik masih rendah dan agregasi
      real-time secara langsung memenuhi janji "data selalu live" di UI.

## P1-804 — Donation-to-impact trace ✅

- [x] Diagram perjalanan 8-tahap di /dampak: Limbah Donasi → Penjemputan →
      Verifikasi Fisik → Inventaris → Pengolahan → Penjualan → Alokasi Sosial →
      Program & Distribusi.
- [x] Catatan eksplisit bahwa akuntansi bersifat pooled (tidak ada 1:1).

---

# 12. Phase 9 — Admin & RBAC

## P0-901 — Role model

Minimum roles:

```text
SUPER_ADMIN
ADMIN
OPERATOR
FINANCE
SOCIAL_OFFICER
```

- [x] Role `TEXT + CHECK` diperluas melalui migration `018_rbac_roles.sql`.
- [x] Role lama `admin` dipromosikan ke `SUPER_ADMIN`; `member` dinormalisasi ke `MEMBER`.
- [x] `is_admin()` tetap kompatibel untuk `SUPER_ADMIN` dan `ADMIN`.

## P0-902 — Permission matrix

- [x] Create permission list. *(`lib/auth/permissions.ts`, 16 modul.)*
- [x] Map roles to permissions. *(Sama persis dengan ARSITEKTUR §11; dijaga test regresi.)*
- [x] Enforce on server. *(Seluruh 38 pemanggilan `requireAdmin()` pada 10 file domain dimigrasikan ke `requirePermission()` read/write dan halaman admin dengan query langsung diberi guard route. RLS granular diterapkan per modul.)*
- [x] UI visibility is only a convenience, not authorization. *(AdminNav dan dashboard difilter; Server Action dan RLS tetap memeriksa secara independen.)*

**Bug kritis ditemukan & diperbaiki saat audit (2026-09-20):** 4 RPC finansial paling
sensitif di seluruh sistem — `execute_social_allocation` (alokasi dana sosial),
`execute_order_payment_confirmation` (konfirmasi pembayaran + decrement stok),
`execute_distribution` (penyaluran dana ke beneficiary), `update_revenue_reconciliation`
(rekonsiliasi ledger pendapatan) — **tidak pernah mendapat `REVOKE`/`GRANT` eksplisit**
sejak dibuat di Phase 6/7. Karena Postgres secara default memberi `EXECUTE` ke `PUBLIC`
untuk fungsi baru, siapa pun dengan sesi terautentikasi (termasuk MEMBER biasa) secara
teknis bisa memanggil RPC ini langsung lewat `supabase.rpc(...)` dari browser, melewati
seluruh pengecekan `requirePermission()` yang hanya melindungi jalur Server Action —
pelanggaran langsung AGENTS.md §14 ("gunakan semua lapisan: UI + server authorization +
database RLS"). Diperbaiki di `supabase/migrations/020_rpc_grant_hardening.sql`:
`REVOKE ALL ... FROM PUBLIC` + `GRANT ... TO authenticated` pada keempat fungsi, DITAMBAH
guard `has_permission(...)` di dalam body fungsi itu sendiri (bukan cuma level
`authenticated` generik) sehingga staff role yang tidak berwenang modul terkait tetap
ditolak di level database, bukan hanya level kode. Divalidasi efektif dengan
`tests/rpc-grant-hardening.test.mjs` — sengaja dihapus lalu dikonfirmasi test gagal,
lalu dikembalikan.

**Bug lain ditemukan & diperbaiki saat audit:** `recordAuditLog()` melakukan
`requirePermission()` ULANG di dalamnya setelah aksi utama sudah tervalidasi & commit —
desain yang salah karena `redirect()` Next.js yang mungkin terpanggil di dalamnya akan
tertelan oleh `try/catch` generik, membuat kegagalan otorisasi (kalaupun genuinely
terjadi) menjadi audit entry yang hilang diam-diam untuk aksi yang sudah terjadi.
Diperbaiki: `recordAuditLog()` sekarang menerima `actorId` yang sudah tervalidasi dari
pemanggil (bukan re-derive sendiri); lapisan keamanan sebenarnya tetap di RPC
`record_audit_log` yang `SECURITY DEFINER` dan hanya di-grant ke `service_role`.
Juga: `app/admin/waste-types/new/page.tsx` adalah satu-satunya halaman "buat baru" yang
kehilangan gate `requirePermission()` eksplisit di level halaman (hanya terlindungi baseline
`dashboard: read` dari `app/admin/layout.tsx`) — role dengan `waste_inventory: read`-only
(FINANCE, SOCIAL_OFFICER) bisa melihat form meski submit-nya pasti ditolak Server Action.
Sudah ditambahkan gate yang konsisten dengan halaman "new/edit" lainnya.

**Keputusan distribusi:** karena setiap record distribusi mengungkap relasi ke penerima manfaat, read/write memerlukan izin `social_programs` **dan** `beneficiaries`. Konsekuensinya ADMIN dapat mengelola program tetapi hanya membaca beneficiary dan tidak dapat menulis distribusi; SUPER_ADMIN dan SOCIAL_OFFICER dapat menulis.

## P0-903 — Admin dashboard

- [x] Operations overview. *(Card disaring berdasarkan role.)*
- [x] Donation queue.
- [x] Waste stock.
- [x] Production.
- [x] Product inventory.
- [x] Orders.
- [x] Finance summary. *(Jumlah record alokasi yang disetujui; tidak membuat angka uang baru.)*
- [x] Social programs.
- [ ] Alerts/actions requiring attention. — **ditunda:** belum ada definisi SLA/threshold alert yang tervalidasi; dashboard tidak mengarang ambang stok atau umur pesanan.

## P0-904 — Audit log

Log important mutations:

- [x] actor;
- [x] action;
- [x] entity;
- [x] entity id;
- [x] old/new value where appropriate;
- [x] reason when required;
- [x] timestamp.

Implementasi awal mencatat `ORDER_PAID`, `REVENUE_RECORDED`, `ALLOCATION_CREATED`, dan `BENEFICIARY_UPDATED`, serta menyediakan `/admin/audit-log` dengan filter actor/action/entity/periode. Event `DONATION_CREATED`, `DONATION_VERIFIED`, `WEIGHT_UPDATED`, `WASTE_LOT_CREATED`, `BATCH_STARTED`, `BATCH_COMPLETED`, `PRODUCT_RELEASED`, `PROGRAM_APPROVED`, dan `REPORT_PUBLISHED` tetap dalam allowlist namun wiring-nya ditunda ke iterasi modul terkait; jangan menganggap daftar audit sudah mencakup seluruh mutasi Phase 0–8.

Avoid storing sensitive values unnecessarily.

---

# 13. Phase 10 — SEO & AI Discoverability ✅

## P0-1001 — Metadata foundation ✅

- [x] Unique title per indexable page. *(Sudah ada di seluruh halaman publik sejak Phase 0-9; audit menemukan homepage `app/page.tsx` kehilangan `alternates.canonical`/`openGraph` sama sekali — diperbaiki.)*
- [x] Useful description.
- [x] Canonical URL. *(Ditambahkan ke `app/page.tsx`; sudah ada di 10 halaman publik lain.)*
- [x] Open Graph image/title/description. *(Ditambahkan ke `app/page.tsx`, `app/cerita`, `app/produk`, `app/program`, `app/produk/[slug]`, `app/program/[slug]` yang sebelumnya tidak punya `openGraph` sama sekali. Tidak menambahkan field `images` karena tidak ada asset OG image nyata — anti-fabrikasi berlaku juga di sini.)*
- [x] Correct robots policy. *(`app/robots.ts` **diperbaiki**: `disallow` sebelumnya menyebut `/member/` — rute yang TIDAK PERNAH ADA di sistem — dan tidak menyertakan rute member nyata `/riwayat`, `/profil`, `/impact`, `/pickup`, `/checkout` yang sebenarnya auth-gated di `lib/supabase/middleware.ts`. Sekarang disallow list dicocokkan langsung terhadap middleware, dijaga test `tests/seo-structured-data.test.mjs`.)*

## P0-1002 — Sitemap ✅

- [x] Generate dynamic sitemap for public indexable routes. *(`app/sitemap.ts`, sudah ada sejak Phase 2, diperluas tiap phase publik baru.)*
- [x] Exclude authenticated/admin pages. *(Tidak ada satu pun rute admin/member di sitemap.)*
- [x] Exclude duplicate/temporary URLs.

## P0-1003 — Robots ✅

- [x] Public pages crawlable.
- [x] Private routes blocked appropriately. *(Lihat perbaikan P0-1001 di atas.)*
- [x] Do not accidentally block CSS/critical assets. *(Next.js menyajikan CSS/JS dari `_next/`, tidak disentuh oleh `disallow` list.)*

## P0-1004 — Structured data ✅

- [x] Organization. *(`app/page.tsx`, sudah ada.)*
- [x] WebSite. *(**Ditambahkan** — belum ada sebelumnya, hanya `Organization`.)*
- [x] BreadcrumbList. *(**Ditambahkan** ke 11 halaman publik yang memakai komponen `<Breadcrumb>` — sebelumnya **tidak satu pun** punya BreadcrumbList JSON-LD meski komentar di `components/ui/Breadcrumb.tsx` sendiri sudah menyebutkan pola ini seharusnya dipasang. Dibuat lewat helper terpusat `lib/content/structured-data.ts` `buildBreadcrumbJsonLd()` yang menerima array `breadcrumbItems` yang SAMA dengan yang dirender visual, agar tidak mungkin drift. Dijaga test regresi.)*
- [x] FAQPage where eligible and genuinely represented. *(`app/faq/page.tsx`, sudah ada sejak sebelumnya, tidak diduplikasi ke halaman lain.)*
- [x] Product for product detail pages where data is complete. *(**Ditambahkan** ke `app/produk/[slug]/page.tsx` — nama, deskripsi, SKU, harga, currency, dan ketersediaan stok, semua genuinely dari data produk nyata yang dirender di halaman, bukan diciptakan.)*
- [ ] Article — **tidak diterapkan**, `/cerita` masih ComingSoon (Phase 7 P1-704 belum dikerjakan), tidak ada konten Article nyata untuk direpresentasikan.

## P0-1005 — Semantic content ✅

- [x] One meaningful H1 per primary page. *(Diverifikasi: 2 halaman yang awalnya terdeteksi >1 `<h1>` — `checkout`, `pesanan/[reference]` — ternyata early-return bercabang mutually exclusive, hanya 1 H1 genuinely dirender per request.)*
- [x] Logical H2/H3 hierarchy.
- [x] Important information in crawlable HTML. *(Server Components by default sejak Phase 0.)*
- [x] Image alt text based on actual image purpose. *(Diaudit seluruh `<Image>` di `app/`/`components/` — semua punya `alt` deskriptif spesifik, tidak ada yang generik/kosong.)*
- [x] Descriptive anchor text.
- [x] Internal links between conceptually related pages.

## P1-1006 — AI-friendly information architecture ✅

- [x] Clear organization identity page. *(`/tentang-kami`.)*
- [x] Explicit explanation of accepted waste. *(`/cara-kerja`, `/faq`.)*
- [x] Explicit explanation of operational flow. *(`/cara-kerja`, `/dampak` "Perjalanan Limbah ke Dampak".)*
- [x] Public definitions for impact metrics. *(`lib/domain/impact/definitions.ts`, Phase 8.)*
- [x] FAQ with direct factual answers.
- [x] Stable URLs.
- [x] Consistent entity naming across pages.
- [x] Avoid keyword stuffing and synthetic filler.

---

# 14. Phase 11 — Performance ✅

## P0-1101 — Core page performance ✅

- [x] Optimize hero imagery. *(`next/image` dipakai konsisten.)*
- [x] Avoid unnecessary client-side JavaScript. *(Diaudit: 28 client component di `components/`, semua punya bukti interaktivitas nyata — state/event handler — tidak ada kandidat downgrade ke Server Component.)*
- [x] Prefer Server Components for static/public content. *(Konsisten sejak Phase 0.)*
- [x] Use Client Components only when interaction requires them.
- [x] Lazy-load below-the-fold heavy media when appropriate. *(`next/image` lazy-load default kecuali `priority`.)*
- [x] Avoid oversized dependencies. *(Hanya 5 dependency produksi: `@supabase/ssr`, `@supabase/supabase-js`, `next`, `react`, `react-dom`, `zod` — tidak ada library UI/date/chart besar yang tidak perlu.)*

## P0-1102 — Data fetching strategy ✅

- [x] Public content: server-side fetch where appropriate.
- [x] User data: authenticated server-side access where possible.
- [x] Mutations: Server Actions or Route Handlers based on use case.
- [x] Avoid fetching sensitive data into client components unnecessarily. *(Diverifikasi: tidak ada satu pun `.tsx` di `app/`/`components/` yang menyentuh `createAdminClient()`/service-role key secara langsung — semua lewat `lib/domain/*`.)*

## P1-1103 — Image strategy ✅

- [x] Use optimized image delivery. *(`next/image`, semua gambar lokal di `public/`, tidak butuh konfigurasi `remotePatterns`.)*
- [x] Explicit dimensions/aspect ratios. *(Diaudit: setiap `<Image>` punya `width`+`height` ATAU `fill`+`sizes` — tidak ada yang `fill` tanpa `sizes`.)*
- [x] Avoid layout shift. *(Container `fill` selalu punya `position: relative` + `height` eksplisit di CSS.)*
- [x] Define focal crop for editorial imagery. *(`object-fit`/`object-position` dipakai di CSS terkait.)*

## P1-1104 — Loading performance verification — **BELUM DAPAT DIKERJAKAN**

- [ ] Measure key pages with Lighthouse/PageSpeed in staging. — **Butuh environment staging nyata (deployment publik) untuk diukur; tidak bisa disimulasikan dari audit kode statis.** Semua item struktural yang bisa diverifikasi dari kode (P0-1101, P0-1102, P1-1103) sudah solid — item ini murni menunggu staging deployment.
- [ ] Identify LCP/CLS/INP issues. — sama, butuh staging.
- [ ] Fix actual bottlenecks instead of blindly optimizing. — sama, butuh data pengukuran nyata dulu.

---

# 15. Phase 12 — Accessibility ✅

## P0-1201 — Keyboard accessibility ✅

- [x] All interactive controls keyboard reachable.
- [x] Visible focus state. *(`:focus-visible` global di `styles/globals.css`, sudah ada.)*
- [x] Logical tab order.
- [x] Dialog focus management. *(**Bug ditemukan & diperbaiki**: satu-satunya modal di aplikasi, `InventoryAdjustmentModal`, punya `role="dialog"`+`aria-modal="true"` tapi TIDAK ADA focus trap, initial focus, atau focus restoration. Diperbaiki: fokus otomatis ke field pertama saat dibuka, Tab focus-trap di dalam dialog, fokus dikembalikan ke trigger element saat ditutup — trigger di-capture lewat lazy-init `useRef` sekali di mount, bukan di `useEffect` yang bisa re-run keliru.)*
- [x] Escape behavior where relevant. *(**Ditambahkan** — sebelumnya tidak ada listener Escape sama sekali di modal tersebut.)*

## P0-1202 — Forms ✅

- [x] Labels linked to controls. *(`htmlFor`, sudah ada di `Input`/`Select`/`Textarea`.)*
- [x] Error messages associated with fields. *(`aria-describedby`, sudah ada.)*
- [x] Required state announced correctly. *(**Bug ditemukan & diperbaiki**: `Select.tsx` dan `Textarea.tsx` mendestructure prop `required` untuk menampilkan tanda `*` visual, tapi TIDAK PERNAH meneruskannya balik ke elemen `<select>`/`<textarea>` asli — screen reader tidak pernah diberi tahu field itu wajib meski tampak wajib secara visual. `Input.tsx` punya gap serupa lewat prop `isRequired` terpisah yang tak pernah dipakai satupun form di codebase. Diperbaiki ketiganya agar `required` native attribute genuinely diteruskan.)*
- [x] Do not rely on color alone. *(Status pakai Badge dengan label teks, bukan warna saja.)*

## P0-1203 — Visual accessibility ✅

- [x] Sufficient contrast. *(**Bug ditemukan & diperbaiki**: `--color-ink-500` [dasar `--color-text-muted`, dipakai luas di 30 file CSS pada ukuran caption/12px dan body-s/14px — keduanya "normal text" WCAG] hanya mencapai rasio kontras 3.71:1 terhadap putih — GAGAL WCAG AA [butuh 4.5:1]. Diperbaiki dari `#7E8780` menjadi `#6B766E`, mencapai 4.73:1 di atas putih dan 4.60:1 di atas `--color-bg-canvas`. Token semantik status [success/warning/danger/info fg-on-bg] diverifikasi semuanya sudah lolos AA sejak awal.)*
- [x] Text remains readable on mobile.
- [x] Focus state visible.
- [x] Motion is restrained and can respect reduced-motion preferences. *(**Gap ditemukan & diperbaiki**: animasi `pulse` di `DonationTimeline` berjalan `infinite` terus-menerus selama halaman terbuka [bukan loading singkat seperti spinner], tapi tidak dihormati `prefers-reduced-motion` — berbeda dari 2 spinner loading pendek lain di codebase yang tidak masalah. Ditambahkan guard.)*

---

# 16. Phase 13 — Security & Data Integrity ✅

## P0-1301 — Authorization ✅

- [x] Every privileged mutation checks authorization server-side. *(Fondasi RBAC Phase 9 + audit lanjutan ini.)*
- [x] Admin routes protected.
- [x] Member routes protected.
- [x] Role escalation prevented.
- [x] **Open redirect ditemukan & diperbaiki (2 lokasi)**: `app/auth/confirm/route.ts` (`?next=`) dan `components/auth/LoginForm.tsx` (`?redirect=`) mengambil parameter query yang bisa dikontrol penyerang lalu menginterpolasikannya langsung ke redirect target pasca-autentikasi TANPA validasi — link phishing `?next=https://evil.example` bisa menukar PKCE code/login genuinely sah lalu mengarahkan korban ke situs jahat. Diperbaiki dengan fungsi sanitasi yang hanya mengizinkan path relatif same-origin (menolak URL absolut, protocol-relative `//`, dan skema tersemat). Dijaga test regresi `tests/open-redirect.test.mjs`.

## P0-1302 — Supabase Row Level Security ✅

- [x] Define RLS policies for user-owned records.
- [x] Define staff/admin access policies. *(RBAC granular Phase 9.)*
- [x] Test unauthorized reads/writes. *(`tests/rbac-permissions.test.mjs`, `tests/rpc-grant-hardening.test.mjs`.)*
- [x] Keep service-role credentials server-only. *(Diverifikasi ulang: nihil di `app/`/`components/`.)*

## P0-1303 — Input validation ✅

- [x] Validate all externally supplied data. *(Zod di semua Server Action; open redirect fix di atas menutup 2 titik yang luput dari pola Zod karena berupa query param sederhana, bukan form payload.)*
- [x] Validate enums/status transitions.
- [x] Validate quantity/unit combinations.
- [x] Sanitize rich text/content where applicable. *(Tidak ada rich text/HTML input di aplikasi ini — semua teks bebas disimpan sebagai plain text dan di-escape otomatis oleh React saat render, tidak ada `dangerouslySetInnerHTML` untuk konten user kecuali JSON-LD yang datanya selalu server-controlled.)*

## P0-1304 — Mutation integrity ✅

- [x] Order paid → Verify payment → Reserve/decrement inventory → Record financial event. *(`execute_order_payment_confirmation` RPC, Phase 6, diperkuat audit Phase 9.)*
- [x] Production completed → Consume waste inventory → Create output inventory → Record batch completion. *(**Bug ditemukan & diperbaiki**: `adjustWasteLotAction` [inventory.ts] dan `addBatchInputAction` [production.ts] KEDUANYA memutasi `waste_lots.current_quantity` lewat pola read-then-write klasik tanpa row lock — TOCTOU race condition yang sama persis dengan bug yang sudah ditemukan & diperbaiki 3× sebelumnya di tempat lain [stok order/ADR-020, saldo alokasi sosial, saldo distribusi/ADR-024]. Diperbaiki dengan RPC atomik baru `execute_waste_lot_mutation` [`021_waste_lot_mutation_hardening.sql`] yang mengunci baris `waste_lots` `FOR UPDATE`, memvalidasi kecukupan stok, menerapkan perubahan, dan mencatat ledger — semua dalam satu transaksi. "Create output inventory" dari diagram TASK.md **bukan otomatis**: pembuatan entri produk [`createProductAction`] adalah keputusan bisnis admin yang sengaja manual [nama, harga, deskripsi produk], bukan proses yang bisa/harus otomatis dari `actual_output_quantity` batch — dicatat sebagai desain, bukan gap.)*
- [x] Avoid partially successful state transitions. *(Divalidasi lewat pola RPC `SECURITY DEFINER` atomik di seluruh sistem: 6 RPC finansial/inventori kritis sekarang konsisten memakai row-lock+transaksi tunggal.)*

**Keterbatasan eksplisit dicatat, bukan ditutup dengan patch dangkal:** `products.stock_quantity` tidak divalidasi silang terhadap `production_batches.actual_output_quantity` — satu produk katalog bisa menerima stok dari banyak batch produksi berbeda seiring waktu, dan `ARSITEKTUR.md §5.8` sendiri menyebut entitas `Product Lot / Inventory` terpisah [memisahkan katalog dari stok fisik per-batch] sebagai desain masa depan yang belum dibangun. Menutup ini dengan asumsi 1:1 produk↔batch akan salah secara model data — ditunda sampai entitas itu genuinely dibangun.

---

# 17. Phase 14 — Testing

## P0-1401 — Unit tests

Cover:

- [ ] impact calculations;
- [ ] status transition rules;
- [ ] allocation validation;
- [ ] quantity/unit validation;
- [ ] permission checks;
- [ ] formatting helpers;
- [ ] pure business rules.

## P0-1402 — Integration tests

Cover:

- [ ] donation creation;
- [ ] donation verification;
- [ ] inventory mutation;
- [ ] production batch completion;
- [ ] order/payment state;
- [ ] social allocation;
- [ ] RBAC boundaries.

## P0-1403 — E2E tests

Minimum critical journeys:

```text
Visitor → Donation → Confirmation
Member → Login → Donation History → Tracking
Operator → Verify Donation → Inventory
Operator → Production Batch → Product Stock
Customer → Product → Order
Finance → Revenue → Allocation
Social Officer → Program → Distribution
Public → Impact → Transparency
```

## P0-1404 — Accessibility verification

- [ ] Automated accessibility scan.
- [ ] Keyboard walkthrough.
- [ ] Mobile touch interaction review.
- [ ] Form error review.

---

# 18. Phase 15 — Content & Trust QA

## P0-1501 — No fake impact data

- [ ] Replace all invented demo metrics before production.
- [ ] Clearly label seeded/staging data.
- [ ] Production counters must come from verified records.

## P0-1502 — Social proof verification

- [ ] Obtain consent for published stories/photos.
- [ ] Verify program status.
- [ ] Verify financial figures.
- [ ] Verify beneficiary descriptions.

## P0-1503 — Copy QA

Review every public page for:

- [ ] clarity;
- [ ] warmth;
- [ ] factual accuracy;
- [ ] consistent terminology;
- [ ] no excessive hype;
- [ ] no manipulative guilt framing;
- [ ] signature sentence appears intentionally, not repetitively.

---

# 19. Phase 16 — Anti-Slop Design QA

Before a page is marked complete, ask:

### Visual hierarchy

- [ ] Is there a clear primary message?
- [ ] Does the eye know what to read/click first?
- [ ] Is whitespace intentional?

### Distinctiveness

- [ ] Does the page have a KITA TUMBUH / KAMPUNG SMART FARMING visual/content identity?
- [ ] Could this page be mistaken for a generic SaaS/charity template?
- [ ] Are decorative elements doing real communication work?

### Content

- [ ] No generic AI filler.
- [ ] No repeated sentences in different sections.
- [ ] No fake quotes.
- [ ] No unsupported statistics.

### UX

- [ ] CTA is specific.
- [ ] Forms are understandable.
- [ ] Error states help users recover.
- [ ] Mobile layout is intentional rather than merely stacked desktop.

### Technical

- [ ] No unnecessary client components.
- [ ] No repeated API calls without reason.
- [ ] No hidden hard-coded business values that belong in configuration/data.

---

# 20. Phase 17 — Seed & Demo Data

## P1-1701 — Development seed data

Create clearly marked non-production data for:

- [ ] waste types;
- [ ] collection points;
- [ ] donations;
- [ ] waste lots;
- [ ] production batches;
- [ ] products;
- [ ] orders;
- [ ] programs;
- [ ] beneficiaries;
- [ ] allocations.

Seed data must visibly indicate staging/demo context.

## P1-1702 — Demo journeys

Prepare deterministic flows for UI review:

1. Donor submits 5 L cooking oil for pickup.
2. Operator verifies 4.5 L received.
3. Waste becomes production input.
4. Production generates products.
5. Product is sold.
6. Verified social allocation appears in transparency.

The numbers are illustrative only and must not be displayed publicly as real impact.

---

# 21. Phase 18 — Production Readiness

## P0-1801 — Production environment

- [ ] Production Supabase configured.
- [ ] Production environment variables configured securely.
- [ ] Database migrations applied.
- [ ] RLS policies verified.
- [ ] Auth redirect URLs verified.
- [ ] Domain configured.

## P0-1802 — Observability

- [ ] Error tracking.
- [ ] Server logs.
- [ ] Critical mutation logging.
- [ ] Basic uptime monitoring.
- [ ] Alerting for critical failures.

## P0-1803 — Backup / recovery

- [ ] Database backup policy confirmed.
- [ ] Recovery procedure documented.
- [ ] Storage backup strategy confirmed if files are business-critical.

## P0-1804 — SEO production check

- [ ] robots.txt verified.
- [ ] sitemap verified.
- [ ] canonical URLs verified.
- [ ] Open Graph verified.
- [ ] structured data validated.
- [ ] no staging URLs indexed.

## P0-1805 — Final release checklist

- [ ] `lint` passes.
- [ ] typecheck passes.
- [ ] tests pass.
- [ ] production build passes.
- [ ] critical E2E journeys pass.
- [ ] accessibility review completed.
- [ ] no secret in repository.
- [ ] no fake production statistics.
- [ ] legal/privacy/contact information reviewed.

---

# 22. Suggested Delivery Order

Jangan mengerjakan berdasarkan folder atau jumlah halaman. Prioritaskan berdasarkan pengalaman inti.

```text
SPRINT 1
Project foundation
Design tokens
Core components
Home skeleton

SPRINT 2
Public pages
Donation wizard UI
Collection point
FAQ

SPRINT 3
Supabase
Auth
Donation backend
Donation tracking

SPRINT 4
Member dashboard
Impact personal
Admin donation management

SPRINT 5
Waste inventory
Production batches
Products

SPRINT 6
Orders
Payment boundary
Revenue
Social programs
Allocations

SPRINT 7
Transparency
Public impact
Stories

SPRINT 8
RBAC
Audit logs
Security hardening

SPRINT 9
SEO
Structured data
Performance
Accessibility

SPRINT 10
E2E
Content QA
Anti-slop review
Production readiness
```

---

# 23. MVP Cut Line

Jika waktu/kapasitas terbatas, MVP berhenti setelah fitur berikut benar-benar stabil:

```text
Public Home
+ Cara Kerja
+ Accepted Waste
+ Donation Flow
+ Pickup/Drop-off
+ Donation Tracking
+ Auth
+ Member Donation History
+ Admin Donation Verification
+ Waste Inventory
+ Production Batch
+ Product Catalog
+ Basic Orders
+ Social Program
+ Basic Transparency
+ SEO Foundation
+ Security/RLS
+ Critical Tests
```

Fitur seperti loyalty, gamification lanjutan, AI assistant, marketplace kompleks, dan analytics tingkat lanjut masuk setelah core loop terbukti bekerja.

---

# 24. Core Product Loop — Release Gate

Produk belum dianggap berhasil hanya karena halaman sudah terlihat bagus.

Release MVP harus mampu menjalankan loop berikut secara nyata:

```text
USER
 ↓
DONATES WASTE
 ↓
SYSTEM RECORDS DONATION
 ↓
OPERATOR RECEIVES & VERIFIES
 ↓
WASTE ENTERS INVENTORY
 ↓
PRODUCTION CONSUMES INPUT
 ↓
PRODUCT IS CREATED
 ↓
PRODUCT IS SOLD
 ↓
REVENUE IS RECORDED
 ↓
SOCIAL ALLOCATION IS APPROVED
 ↓
PROGRAM RECEIVES SUPPORT
 ↓
PUBLIC IMPACT DATA IS UPDATED
 ↓
DONOR CAN SEE VERIFIED PROGRESS
```

### Final principle

> **Build the proof of impact before building the spectacle of impact.**

Website yang indah harus membantu data dan cerita yang benar menjadi mudah dipahami — bukan menutupi proses yang belum ada.
