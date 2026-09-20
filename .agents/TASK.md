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

## P1-208 — `/produk` — PARTIAL

- [x] Product catalog. *(Route dibuat, `ComingSoon` untuk katalog — belum ada tabel/model produk; P0-506 Phase 5 belum dikerjakan.)*
- [x] Category/filter. *(3 kategori konseptual ditampilkan — minyak jelantah/organik/plastik — tanpa filter interaktif karena belum ada produk nyata untuk difilter.)*
- [ ] Product detail. — **diblokir**, belum ada produk individual.
- [ ] Product impact explanation. — **diblokir**, sama.
- [x] Availability state. *(`ComingSoon` itu sendiri adalah availability state yang jujur.)*

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

## P0-501 — Waste master data

- [ ] Waste type CRUD.
- [ ] Unit definition.
- [ ] Acceptance rules.
- [ ] Safety notes.
- [ ] Active/inactive status.

## P0-502 — Donation management

- [ ] Donation queue.
- [ ] Search/filter.
- [ ] Verify donation.
- [ ] Record actual quantity.
- [ ] Assign pickup/collection point.
- [ ] Update status with audit trail.

## P0-503 — Collection / handover

- [ ] Record receipt.
- [ ] Actual quantity.
- [ ] Receiver/operator.
- [ ] Timestamp.
- [ ] Verification notes.

## P0-504 — Waste inventory

- [ ] Waste lot creation.
- [ ] Inventory ledger.
- [ ] Incoming quantity.
- [ ] Consumption/processing quantity.
- [ ] Adjustment flow with reason.
- [ ] Low-stock/aging indicators if operationally useful.

## P0-505 — Production batch

- [ ] Create batch.
- [ ] Select input waste lots.
- [ ] Record input quantity.
- [ ] Record output quantity.
- [ ] Record loss/waste where necessary.
- [ ] Link output to product.
- [ ] Close batch.

## P0-506 — Product management

- [ ] Product CRUD.
- [ ] SKU.
- [ ] Price.
- [ ] Inventory.
- [ ] Production batch relationship.
- [ ] Public visibility.
- [ ] Product images.

---

# 9. Phase 6 — Sales & Financial Flow

## P0-601 — Orders

- [ ] Create order.
- [ ] Order item snapshot (name/price at purchase time).
- [ ] Order status.
- [ ] Customer information.
- [ ] Product inventory decrement only at the agreed transactional point.

## P0-602 — Payment integration boundary

- [ ] Abstract payment provider interface.
- [ ] Keep provider-specific logic isolated.
- [ ] Verify server-side payment callbacks/webhooks.
- [ ] Do not trust client-submitted payment status.

Payment provider selection is a separate decision and should not be hard-coded into domain logic.

## P0-603 — Revenue ledger

- [ ] Record realized sales revenue.
- [ ] Keep order and financial ledger concepts separate.
- [ ] Reconciliation state.
- [ ] Audit changes.

## P0-604 — Allocation

- [ ] Define allocation record.
- [ ] Link allocation to a funding source.
- [ ] Link allocation to social program.
- [ ] Record amount.
- [ ] Record date.
- [ ] Approval status.
- [ ] Prevent allocation above available balance through server-side transaction logic.

## P1-605 — Operational expenses

- [ ] Expense records.
- [ ] Category.
- [ ] Amount.
- [ ] Date.
- [ ] Notes.
- [ ] Attachment/reference where appropriate.

---

# 10. Phase 7 — Social Program & Beneficiary

## P0-701 — Social program management

- [ ] Program CRUD.
- [ ] Goal.
- [ ] Status.
- [ ] Target amount if applicable.
- [ ] Funding status.
- [ ] Public/private visibility.

## P0-702 — Beneficiary management

- [ ] Beneficiary record.
- [ ] Category.
- [ ] Need/assistance type.
- [ ] Verification status.
- [ ] Consent/privacy status.
- [ ] Public display policy.

## P0-703 — Distribution

- [ ] Create distribution.
- [ ] Link to program.
- [ ] Link to beneficiary.
- [ ] Funding source.
- [ ] Amount/item.
- [ ] Date.
- [ ] Evidence/document reference.
- [ ] Approval/audit trail.

## P1-704 — Impact story publishing

- [ ] Story draft.
- [ ] Review/approval.
- [ ] Consent verification.
- [ ] Publish/unpublish.
- [ ] Link story to program/impact records where appropriate.

---

# 11. Phase 8 — Transparency & Impact Engine

## P0-801 — Impact calculation definitions

Document every public metric.

Example:

```text
Waste Collected
= sum verified received quantities
for selected period
```

```text
Social Allocation
= sum approved social allocation records
published for selected period
```

No metric may be published without a defined source.

## P0-802 — Public impact aggregation

- [ ] Aggregate verified records.
- [ ] Filter by period.
- [ ] Filter by material where useful.
- [ ] Handle privacy boundaries.
- [ ] Cache/ISR only when safe and necessary.

## P0-803 — Transparency report

- [ ] Period summary.
- [ ] Methodology.
- [ ] Data freshness.
- [ ] Operational caveats.
- [ ] Source/report references.

## P1-804 — Donation-to-impact trace

Where data quality supports it, visualize:

```text
Donation
→ Collection
→ Waste Lot
→ Production Batch
→ Product
→ Sale
→ Social Allocation
→ Program
```

Do not imply direct one-to-one financial causality when the accounting model is pooled.

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

## P0-902 — Permission matrix

- [ ] Create permission list.
- [ ] Map roles to permissions.
- [ ] Enforce on server.
- [ ] UI visibility is only a convenience, not authorization.

## P0-903 — Admin dashboard

- [ ] Operations overview.
- [ ] Donation queue.
- [ ] Waste stock.
- [ ] Production.
- [ ] Product inventory.
- [ ] Orders.
- [ ] Finance summary.
- [ ] Social programs.
- [ ] Alerts/actions requiring attention.

## P0-904 — Audit log

Log important mutations:

- [ ] actor;
- [ ] action;
- [ ] entity;
- [ ] entity id;
- [ ] old/new value where appropriate;
- [ ] reason when required;
- [ ] timestamp.

Avoid storing sensitive values unnecessarily.

---

# 13. Phase 10 — SEO & AI Discoverability

## P0-1001 — Metadata foundation

- [ ] Unique title per indexable page.
- [ ] Useful description.
- [ ] Canonical URL.
- [ ] Open Graph image/title/description.
- [ ] Correct robots policy.

## P0-1002 — Sitemap

- [ ] Generate dynamic sitemap for public indexable routes.
- [ ] Exclude authenticated/admin pages.
- [ ] Exclude duplicate/temporary URLs.

## P0-1003 — Robots

- [ ] Public pages crawlable.
- [ ] Private routes blocked appropriately.
- [ ] Do not accidentally block CSS/critical assets.

## P0-1004 — Structured data

Implement only schema types actually supported by page content, such as:

- [ ] Organization.
- [ ] WebSite.
- [ ] BreadcrumbList.
- [ ] FAQPage where eligible and genuinely represented.
- [ ] Product for product detail pages where data is complete.
- [ ] Article where story/article content meets the structure.

## P0-1005 — Semantic content

- [ ] One meaningful H1 per primary page.
- [ ] Logical H2/H3 hierarchy.
- [ ] Important information in crawlable HTML.
- [ ] Image alt text based on actual image purpose.
- [ ] Descriptive anchor text.
- [ ] Internal links between conceptually related pages.

## P1-1006 — AI-friendly information architecture

- [ ] Clear organization identity page.
- [ ] Explicit explanation of accepted waste.
- [ ] Explicit explanation of operational flow.
- [ ] Public definitions for impact metrics.
- [ ] FAQ with direct factual answers.
- [ ] Stable URLs.
- [ ] Consistent entity naming across pages.
- [ ] Avoid keyword stuffing and synthetic filler.

---

# 14. Phase 11 — Performance

## P0-1101 — Core page performance

- [ ] Optimize hero imagery.
- [ ] Avoid unnecessary client-side JavaScript.
- [ ] Prefer Server Components for static/public content.
- [ ] Use Client Components only when interaction requires them.
- [ ] Lazy-load below-the-fold heavy media when appropriate.
- [ ] Avoid oversized dependencies.

## P0-1102 — Data fetching strategy

- [ ] Public content: server-side fetch where appropriate.
- [ ] User data: authenticated server-side access where possible.
- [ ] Mutations: Server Actions or Route Handlers based on use case.
- [ ] Avoid fetching sensitive data into client components unnecessarily.

## P1-1103 — Image strategy

- [ ] Use optimized image delivery.
- [ ] Explicit dimensions/aspect ratios.
- [ ] Avoid layout shift.
- [ ] Define focal crop for editorial imagery.

## P1-1104 — Loading performance verification

- [ ] Measure key pages with Lighthouse/PageSpeed in staging.
- [ ] Identify LCP/CLS/INP issues.
- [ ] Fix actual bottlenecks instead of blindly optimizing.

---

# 15. Phase 12 — Accessibility

## P0-1201 — Keyboard accessibility

- [ ] All interactive controls keyboard reachable.
- [ ] Visible focus state.
- [ ] Logical tab order.
- [ ] Dialog focus management.
- [ ] Escape behavior where relevant.

## P0-1202 — Forms

- [ ] Labels linked to controls.
- [ ] Error messages associated with fields.
- [ ] Required state announced correctly.
- [ ] Do not rely on color alone.

## P0-1203 — Visual accessibility

- [ ] Sufficient contrast.
- [ ] Text remains readable on mobile.
- [ ] Focus state visible.
- [ ] Motion is restrained and can respect reduced-motion preferences.

---

# 16. Phase 13 — Security & Data Integrity

## P0-1301 — Authorization

- [ ] Every privileged mutation checks authorization server-side.
- [ ] Admin routes protected.
- [ ] Member routes protected.
- [ ] Role escalation prevented.

## P0-1302 — Supabase Row Level Security

- [ ] Define RLS policies for user-owned records.
- [ ] Define staff/admin access policies.
- [ ] Test unauthorized reads/writes.
- [ ] Keep service-role credentials server-only.

## P0-1303 — Input validation

- [ ] Validate all externally supplied data.
- [ ] Validate enums/status transitions.
- [ ] Validate quantity/unit combinations.
- [ ] Sanitize rich text/content where applicable.

Use a runtime schema validation library such as Zod when appropriate.

## P0-1304 — Mutation integrity

For important operations use transactional logic where necessary:

```text
Order paid
   ↓
Verify payment
   ↓
Reserve/decrement inventory
   ↓
Record financial event
```

Similarly:

```text
Production completed
   ↓
Consume waste inventory
   ↓
Create output inventory
   ↓
Record batch completion
```

Avoid partially successful state transitions.

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
