# Prompt Lanjutan — Phase 14 (sisa) & Phase 15-18

Lanjutkan audit-dan-perbaiki untuk **Phase 14 (Testing) sisa item**, **Phase 15 (Content & Trust QA)**, **Phase 16 (Anti-Slop Design QA)**, **Phase 17 (Seed & Demo Data)**, **Phase 18 (Production Readiness)** dari `.agents/TASK.md` untuk proyek **KITA TUMBUH / Kampung Smart Farming**. Baca `.agents/AGENTS.md`, `.agents/ARSITEKTUR.md`, `.agents/DECISIONS.md` (terutama ADR-001 s/d ADR-030 sebagai riwayat keputusan) sebelum mulai.

## Status saat sesi terhenti (2026-09-20)

**Phase 14 (Testing) — SEBAGIAN dikerjakan, verifikasi hijau:**
- ✅ P0-1401: ditemukan & ditutup 2 gap nyata:
  - `formatMetricValue` (dulu di `lib/domain/impact/public-impact.ts`) tidak punya test unit sama sekali karena file itu import `@/lib/env` (butuh Next.js resolver, Node test runner biasa gagal). **Diperbaiki**: diekstrak ke `lib/domain/impact/format.ts` (dependency-free), di-re-export dari file lama untuk backward-compat, ditest penuh di `tests/impact-format.test.mjs` (5 test).
  - `UpdateDonationStatusSchema` **tidak pernah memvalidasi urutan transisi status donasi** — admin bisa melompat `SUBMITTED` langsung ke `IMPACTED` atau mundur dari `IMPACTED` ke `SUBMITTED` tanpa penolakan di mana pun (schema cuma cek "status ini valid enum", bukan "status ini reachable dari status sekarang"). **Diperbaiki**: fungsi baru `isValidDonationStatusTransition()` di `lib/validation/admin-donation-schema.ts` (linear maju satu langkah + shortcut DROP-OFF `SUBMITTED→COLLECTED` + `REJECTED` dari status manapun sebelum `CONVERTED`), di-wire ke `updateDonationStatusAction` (server-side enforcement) DAN `DonationStatusForm.tsx` (dropdown UI cuma menampilkan opsi valid). 12 test baru di `tests/admin-donations.test.mjs`.
- ⏳ P0-1402 integration tests: sudah cukup tercover secara struktural lewat schema+RPC+constraint-sync test yang ada (donation creation/verification, inventory mutation, production batch, order/payment, social allocation, RBAC boundaries semua ada test-nya dalam bentuk unit/struktural — BUKAN integration test yang genuinely hit database). **Belum diputuskan** apakah level tercover ini cukup atau perlu integration test sungguhan (butuh test Supabase lokal/mock DB — infrastruktur baru).
- ❌ P0-1403 E2E tests: **tidak ada framework E2E terpasang** (`package.json` tidak punya Playwright/Cypress/Puppeteer, semua test lewat `node --test` murni). 8 journey kritis di TASK.md (`Visitor→Donation→Confirmation`, dst) **belum ada test otomatisnya sama sekali**. Ini gap nyata dan genuinely butuh keputusan infrastruktur (pasang Playwright? atau terima sebagai manual QA checklist?).
- ❌ P0-1404 accessibility verification "Automated accessibility scan": test kontras warna statis sudah ada (`tests/accessibility.test.mjs`), tapi scan DOM otomatis (axe-core dsb) butuh browser runtime — sama seperti E2E, belum ada infrastrukturnya.

**Phase 15 (Content & Trust QA) — SEBAGIAN dikerjakan:**
- ✅ Diaudit seluruh halaman publik aktif untuk data fabricated — **bersih**, tidak ada angka/statistik hardcoded palsu di halaman yang genuinely dirender (`/dampak`, `/transparansi` semua dari `getPublicImpactSummary()`; `/tentang-kami` sengaja tidak punya section "team" karena data belum terverifikasi — sudah didokumentasikan jujur di `lib/content/organization.ts`).
- ✅ **Ditemukan & ditandai (bukan dihapus)**: `components/home/*` — 12 file component yang **yatim** (tidak diimpor `app/page.tsx` mana pun, ditemukan sejak audit Phase 1 lama). 2 di antaranya (`ProofStrip.tsx`, `ProductPreviewSection.tsx`) berisi **data fabricated nyata**: angka statistik palsu ("3.420 L", "12,8 Ton", "148 Paket") dan klaim finansial yang bertentangan dengan model pooled-accounting sistem ("100% pendapatan mendukung..."). Ditambahkan komentar peringatan tegas di puncak kedua file, TIDAK dihapus (mungkin memang disiapkan untuk redesign homepage nanti) — **BELUM diputuskan** apakah 12 file yatim ini harus dihapus total, atau dibiarkan dengan peringatan, atau justru genuinely dipakai dan datanya harus diganti data asli.
- ❌ **BELUM dikerjakan**: sisa checklist P0-1502 (Social proof verification — consent untuk cerita/foto, verifikasi status program/figur finansial/deskripsi beneficiary — ini sebagian besar bergantung pada Phase 7 P1-704 yang belum dikerjakan, jadi mostly N/A untuk saat ini tapi perlu dicatat eksplisit), P0-1503 (Copy QA menyeluruh — baru dicek sebagian kecil: signature sentence repetition sudah OK, TAPI belum systematic review "clarity, warmth, konsistensi terminologi, no excessive hype, no manipulative guilt framing" di SEMUA halaman publik).

**Phase 16 (Anti-Slop Design QA) — BELUM DIKERJAKAN SAMA SEKALI.**

**Phase 17 (Seed & Demo Data) — BELUM DIKERJAKAN SAMA SEKALI.** Cek dulu apakah `supabase/migrations/001_donation_foundation.sql` dkk sudah punya INSERT seed untuk waste_types/collection_points (ada, dari Phase 0-3) — tapi P1-1701 minta seed lebih luas (donations, waste_lots, production_batches, products, orders, programs, beneficiaries, allocations) dan P1-1702 minta demo journey deterministik terdokumentasi. Belum ada file seed terpisah untuk data non-foundational ini.

**Phase 18 (Production Readiness) — BELUM DIKERJAKAN SAMA SEKALI.**

## Tugas lanjutan

### Selesaikan Phase 14
1. **Putuskan sikap terhadap P0-1403 (E2E) dan P0-1404 (automated a11y scan)**: kalau user/tim ingin genuinely E2E test, ini butuh keputusan infrastruktur (Playwright direkomendasikan untuk Next.js — punya integrasi resmi). Kalau tidak, dokumentasikan eksplisit di TASK.md sebagai keterbatasan yang disengaja (sama pola dengan Lighthouse di Phase 11), JANGAN pura-pura selesai.
2. Kalau diputuskan membangun E2E: mulai dari 2-3 journey paling kritis dulu (`Visitor → Donation → Confirmation`, `Customer → Product → Order`), bukan semua 8 sekaligus — verifikasi setup dulu sebelum scale up.
3. P0-1402: putuskan apakah integration test level "schema+RPC+constraint-sync tanpa hit DB sungguhan" (kondisi saat ini) sudah dianggap cukup untuk MVP, atau perlu Supabase local/test-container. Dokumentasikan keputusan di ADR.

### Selesaikan Phase 15
1. **Putuskan nasib 12 file `components/home/*` yatim** — opsi: (a) hapus semua karena genuinely tidak dipakai dan berisiko data palsu kalau tidak sengaja diaktifkan, (b) pertahankan dengan peringatan (sudah dilakukan untuk 2 file paling berbahaya) dan dokumentasikan alasan disimpan, (c) audit semua 12 file satu per satu untuk fabricated content lain yang mungkin terlewat sapuan awal ini (baru 2 dari 12 file diperiksa detail). **Rekomendasi**: opsi (a) — hapus — kecuali ada bukti eksplisit di `.agents/*.md` bahwa file-file ini memang road-mapped untuk dipakai.
2. Selesaikan Copy QA (P0-1503) sistematis: baca ulang SETIAP halaman publik (`/`, `/cara-kerja`, `/faq`, `/tentang-kami`, `/collection-point`, `/produk`, `/program`, `/dampak`, `/transparansi`, `/cerita`) terhadap 7 kriteria checklist TASK.md satu per satu, bukan spot-check.
3. Tulis ringkasan status P0-1502 yang jujur: sebagian besar item bergantung Phase 7 P1-704 (belum dikerjakan) — jangan centang penuh, tandai blocked-by.

### Kerjakan Phase 16 (belum disentuh)
Jalankan checklist Anti-Slop di TASK.md terhadap SETIAP halaman publik utama — ini pekerjaan review manual/systematic, bukan pencarian pola otomatis semata. Fokus ke:
- Apakah homepage (`app/page.tsx`, sudah besar dan kompleks) masih terasa punya identitas KITA TUMBUH yang khas atau mulai terasa generik?
- Technical checklist ("No unnecessary client components", "No repeated API calls without reason", "No hidden hard-coded business values") — ini BISA diverifikasi lewat audit kode, mirip pola Phase 11. Cross-check ulang dengan temuan Phase 11 (sudah confirmed tidak ada unnecessary client component).
- "No hidden hard-coded business values that belong in configuration/data" — audit khusus ini: cari angka/threshold bisnis (harga, batas kuantitas, dll) yang hardcoded di komponen TSX padahal seharusnya dari `lib/validation/*-schema.ts` atau database.

### Kerjakan Phase 17 (belum disentuh)
1. Cek migration existing (001-021) untuk INSERT seed yang sudah ada (waste_types, collection_points dari Phase 0-3) — JANGAN duplikasi.
2. Buat migration/script seed BARU khusus development (jangan campur ke migration production-bound) untuk: donations, waste_lots, production_batches, products, orders, programs, beneficiaries, allocations — **setiap row harus visibly demo/staging** (mis. nama "DEMO -", email `@example.com`, atau flag eksplisit) sesuai DATABASE.md "Seed Data must be clearly non-production" dan "Never seed fake real-world beneficiary stories".
3. Dokumentasikan demo journey P1-1702 (6 langkah) sebagai panduan manual QA/review, dengan catatan eksplisit "angka ilustratif, bukan dampak nyata publik" — JANGAN sampai angka demo ini bocor ke halaman publik manapun.

### Kerjakan Phase 18 (belum disentuh)
Sebagian besar item Phase 18 (P0-1801 environment, P0-1802 observability, P0-1803 backup) adalah **keputusan operasional/infrastruktur di luar kode** (perlu akses dashboard Supabase production, DNS, dll) — TIDAK bisa "dikerjakan" lewat perubahan kode semata. Untuk ini:
1. P0-1804 (SEO production check) BISA diverifikasi dari kode — cross-check ulang `robots.ts`/`sitemap.ts`/canonical/OG/structured data yang sudah diperbaiki di Phase 10, pastikan tidak ada regresi.
2. P0-1805 (Final release checklist) — jalankan ulang `npm run lint && npm run typecheck && npm test && npm run build` sekali lagi sebagai gerbang akhir, dan audit manual "no secret in repository" (`git log`/`git diff` untuk `.env`, API key, service role key yang ter-commit tidak sengaja).
3. Untuk item operasional murni (P0-1801/1802/1803 sebagian besar sub-item) — dokumentasikan sebagai **runbook/checklist** di `.agents/` atau `README.md` untuk dieksekusi manual oleh pemilik project saat deploy sungguhan, BUKAN diklaim "selesai" karena tidak bisa diverifikasi dari sesi coding ini.

## Pola teknis wajib (konsisten dengan seluruh sesi sebelumnya)
- Audit dulu (baca kode nyata), baru simpulkan — jangan asumsi dari nama file/dokumen.
- Setiap bug yang ditemukan diperbaiki langsung, bukan cuma dilaporkan.
- Test regresi baru untuk tiap fix, divalidasi efektivitasnya (sengaja reproduksi bug → konfirmasi test gagal → revert) untuk temuan yang genuinely kritis.
- `.agents/TASK.md` dan `.agents/DECISIONS.md` diupdate jujur — centang HANYA yang genuinely selesai, tandai eksplisit yang ditunda/blocked dengan alasan.
- Verifikasi akhir: `npm run typecheck && npm run lint && npm test && npm run build` semua hijau sebelum menyatakan selesai.

## Pekerjaan yang SUDAH di working tree (belum di-commit) dari sesi ini
File yang sudah diubah/dibuat, jangan ditimpa tanpa dibaca dulu:
- `lib/domain/impact/format.ts` (baru), `lib/domain/impact/public-impact.ts` (re-export)
- `lib/validation/admin-donation-schema.ts` (+ `isValidDonationStatusTransition`)
- `lib/domain/admin/donations.ts` (wire validasi transisi)
- `components/admin/DonationStatusForm.tsx` (dropdown filter opsi valid)
- `components/home/ProofStrip.tsx`, `components/home/ProductPreviewSection.tsx` (peringatan ditambahkan)
- `tests/impact-format.test.mjs` (baru), `tests/admin-donations.test.mjs` (+12 test)
