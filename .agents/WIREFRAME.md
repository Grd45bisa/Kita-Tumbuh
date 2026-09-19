# WIREFRAME.md — KITA TUMBUH / KAMPUNG SMART FARMING

> **Product Wireframe & UX Specification**
>
> **Status:** Approved v1.0  
> **Master Brand:** KITA TUMBUH  
> **Platform / Ekosistem:** KAMPUNG SMART FARMING  
> **Tagline:** Dari Limbah, Tumbuh Manfaat.  
> **Core Statement:** **“SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.”**

---

## 1. Tujuan Wireframe

Wireframe KITA TUMBUH / KAMPUNG SMART FARMING harus menjawab tiga pertanyaan pengguna secepat mungkin:

1. **Apa yang dilakukan Kampung Smart Farming di bawah naungan Kita Tumbuh?**
2. **Apa yang bisa saya lakukan sekarang?**
3. **Apa dampak nyata dari kontribusi saya?**

Desain tidak boleh terasa seperti template charity, marketplace, atau dashboard SaaS yang ditempeli foto lingkungan. Struktur harus berangkat dari alur manusia dan bukti nyata.

### Visual & Color Foundation
- **Canvas / Background Dominan:** Tulang / Warm Off-White (`#FDFCF8`, `#F8F5EC`) — 60–75% dominan.
- **Warna Aksi Utama (Primary):** Hijau Alami (`#2F6247`, `#214C37`).
- **Aksen Sekunder / Material:** Coklat Tanah (`#815843`, `#684636`).
- **Teks Utama:** Deep Green / Ink (`#173B2A`).
- **Aturan Tegas:** Dilarang menggunakan biru, ungu, pink, cyan, magenta, neon, atau merah terang dekoratif.

---

## 2. UX North Star

> Pengguna datang karena penasaran, memahami misi tanpa perlu membaca panjang, melakukan satu aksi utama dengan friksi rendah, lalu dapat melihat bukti bahwa kontribusinya bergerak dan menghasilkan dampak.

### Primary actions

- **Donasikan Limbah** (Green Primary CTA)
- **Lihat Dampak** (Brown Secondary Accent)
- **Beli Produk Berdampak**

### Secondary actions

- Lihat Cara Kerja
- Cari Collection Point
- Baca Cerita
- Lihat Transparansi

---

## 3. Navigation System

### Public desktop

```text
[KITA TUMBUH — KAMPUNG SMART FARMING]
Cara Kerja   Dampak   Program   Produk   Cerita   Transparansi
                                      [DONASIKAN LIMBAH]
```

### Public mobile

```text
┌──────────────────────────┐
│ KITA TUMBUH       ☰      │
│ Kampung Smart Farming    │
└──────────────────────────┘
```

Menu drawer harus mengelompokkan link berdasarkan intent, bukan daftar panjang tanpa hirarki.

```text
MULAI
→ Donasikan Limbah (Hijau)
→ Cari Collection Point
→ Lihat Dampak (Coklat)

JELAJAHI
→ Cara Kerja
→ Program Sosial
→ Produk
→ Cerita
→ Transparansi

AKUN
→ Masuk
→ Daftar
```

---

# 4. Public Website

## 4.1 Home — `/`

### Goal

Membangun pemahaman, kepercayaan, dan keinginan untuk ikut berkontribusi.

### Above the fold

```text
┌─────────────────────────────────────────────────────┐
│ NAVIGATION (Warm Off-White Surface, Border Coklat Lembut)│
├─────────────────────────────────────────────────────┤
│                                                     │
│   KITA TUMBUH                                       │
│   KAMPUNG SMART FARMING                             │
│   Dari Limbah, Tumbuh Manfaat.                      │
│                                                     │
│   “SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.”         │
│                                                     │
│   Sesuatu yang tidak lagi kamu butuhkan             │
│   bisa kami ubah menjadi nilai dan bantuan          │
│   bagi mereka yang membutuhkan.                     │
│                                                     │
│   [ DONASIKAN LIMBAH (HIJAU) ]  [ LIHAT CARA KERJA ]│
│                                                     │
│                 [foto autentik komunitas & kebun]   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Section order

```text
Hero (KITA TUMBUH > KAMPUNG SMART FARMING > Tagline > Statement)
↓
Proof strip / impact counters (Data Tervalidasi/Percontohan Jujur)
↓
Why it matters
↓
Transformation story (Limbah → Kumpul → Pilah → Olah → Produk → Dampak)
↓
Kampung Smart Farming ecosystem
↓
Waste accepted (Minyak Jelantah, Organik, Wadah Plastik Tertentu)
↓
Social impact / programs
↓
Product preview
↓
Transparency preview
↓
Final CTA
↓
Footer
```

### Rule

Hero tidak boleh dipenuhi jargon seperti “revolutionary platform”, “sustainable future”, “empowering communities” tanpa bukti konkret. Latar belakang harus menggunakan warm off-white, bukan putih silau atau gradasi neon.

---

## 4.2 Cara Kerja — `/cara-kerja`

### Goal

Menjelaskan circular flow dengan bahasa sederhana.

```text
┌──────────────────────────────────────┐
│ CARA KERJA                           │
│                                      │
│ 01 Donasikan                         │
│ 02 Kami kumpulkan & verifikasi      │
│ 03 Kami olah                          │
│ 04 Menjadi produk bernilai           │
│ 05 Produk dijual                      │
│ 06 Hasil dialokasikan ke sosial      │
└──────────────────────────────────────┘
```

Tambahkan visual hubungan:

```text
LIMBAH → PENGOLAHAN → PRODUK → PENJUALAN → DANA SOSIAL → DAMPAK
```

---

# 5. Donation Experience

## 5.1 Donation landing — `/donasi`

Tujuan: membuat pengunjung yakin bahwa mereka bisa mulai tanpa harus memberikan uang.

```text
┌─────────────────────────────────────────┐
│ APA YANG INGIN KAMU DONASIKAN?          │
│                                         │
│ [ Minyak Jelantah ] [ Plastik ]         │
│ [ Limbah Organik ]  [ Lainnya* ]        │
│                                         │
│ *Jika diterima/tersedia                 │
└─────────────────────────────────────────┘
```

Di bawah pilihan tampilkan:

- accepted condition;
- minimum/maximum quantity jika ada;
- packaging/safety instruction;
- rejected items.

---

## 5.2 Donation wizard

### Step 1 — Material

```text
Step 1 / 4
Pilih limbah

[Minyak Jelantah]
[Plastik]
[Organik]

[LANJUT]
```

### Step 2 — Quantity

```text
Step 2 / 4
Berapa banyak?

[ − ]  5  [ + ]
         Liter

Perkiraan kontribusi
5 L minyak jelantah
```

Untuk material tertentu gunakan unit yang sesuai: L, KG, pcs, atau unit lain yang dikonfigurasi admin.

### Step 3 — Fulfillment

```text
Step 3 / 4
Bagaimana menyerahkannya?

( ) Antar ke Collection Point
( ) Dijemput
```

Jika drop-off:

```text
[ Pilih lokasi ]
[ Lihat jam operasional ]
```

Jika pickup:

```text
Alamat
[_____________________]

Tanggal
[_____________________]

Slot waktu
[_____________________]

Catatan
[_____________________]
```

### Step 4 — Confirmation

```text
Step 4 / 4
PERIKSA DONASIMU

Jenis      Minyak Jelantah
Jumlah     5 L
Metode     Pickup
Tanggal    20 Sep 2026

[ KEMBALI ]       [ KONFIRMASI DONASI ]
```

Setelah submit:

```text
✓ Donasi berhasil dibuat

DON-2026-00124

[ LACAK DONASI ]
[ BAGIKAN DAMPAK ]
```

---

# 6. Donation Tracking

## `/donasi/:id`

```text
┌──────────────────────────────────────────┐
│ DON-2026-00124                           │
│ Minyak Jelantah · 5 L                   │
│                                          │
│ ✓ Donasi dibuat                          │
│ ✓ Pickup dijadwalkan                     │
│ ● Menunggu pengambilan                   │
│ ○ Verifikasi berat                       │
│ ○ Diproses                               │
│ ○ Menjadi produk                         │
│ ○ Terjual                                │
│ ○ Dampak tercatat                        │
└──────────────────────────────────────────┘
```

### Detail transparency panel

Setelah data tersedia:

```text
KONTRIBUSI INI
5 L minyak
↓
Batch: BATCH-MJ-0012
↓
Output: 8 produk
↓
Penjualan terkait: Rp...
↓
Alokasi sosial terkait: Rp...
```

Jangan menampilkan hubungan data yang belum tervalidasi.

---

# 7. Impact Experience

## 7.1 Public Impact — `/dampak`

### Hero

```text
DAMPAK YANG KITA BANGUN BERSAMA
```

### KPI cards

```text
[ 1.248 KG ] [ 1.520 ] [ Rp12,3 Jt ] [ 127 ]
 limbah       produk      dana sosial    penerima
```

### Filter

```text
[ Semua ] [ Tahun ] [ Material ] [ Program ]
```

### Journey visualization

```text
1.248 KG LIMBAH
       ↓
1.520 PRODUK
       ↓
1.102 PRODUK TERJUAL
       ↓
Rp... DANA SOSIAL
       ↓
PROGRAM SOSIAL
```

### Rule

Semua metrik diberi label periode dan definisi yang dapat dipahami.

---

## 7.2 Personal Impact — `/dashboard/impact`

```text
Halo, [Nama]

DAMPAK SAYA

23,5 KG           37               Rp425K
Limbah            Produk           Nilai sosial*

[ DONASI LAGI ]
```

Lalu:

```text
KONTRIBUSI SAYA
────────────────────
Minyak Jelantah   8,5 L
Plastik            10 KG
Organik             5 KG
```

`Nilai sosial*` harus memiliki definisi resmi pada UI atau tooltip.

---

# 8. Program Sosial

## 8.1 Program listing — `/program`

Card wajib memiliki:

- nama program;
- kebutuhan/tujuan;
- target;
- dana yang tersedia;
- periode/status;
- status verifikasi;
- CTA detail.

```text
┌──────────────────────────────┐
│ FOTO / COVER                 │
│                              │
│ Bantuan Alat Bantu Mobilitas │
│ Target     Rp5.000.000       │
│ Tersedia   Rp3.750.000       │
│ ███████████████░░ 75%        │
│                              │
│ [ LIHAT PROGRAM ]            │
└──────────────────────────────┘
```

## 8.2 Program detail — `/program/:slug`

Urutan:

```text
Hero + status
↓
Masalah / kebutuhan
↓
Tujuan program
↓
Penerima manfaat (privacy-safe)
↓
Dana yang tersedia & kebutuhan
↓
Sumber dana
↓
Progress
↓
Updates / evidence
↓
CTA
```

---

# 9. Produk Berdampak

## 9.1 Product listing — `/produk`

```text
PRODUK YANG MELANJUTKAN DAMPAK

[Filter]

[Lilin] [Kompos] [Material] ...

┌──────────────┐
│ PRODUCT IMG   │
│ Lilin         │
│ Rp25.000      │
│ Dari jelantah │
│ [ Lihat ]     │
└──────────────┘
```

## 9.2 Product detail — `/produk/:slug`

```text
PRODUCT IMAGE

Lilin Aromaterapi
Rp25.000

Cerita produk
...

Bahan / asal material
...

Dampak produk
...

[ BELI SEKARANG ]
```

Tambahkan “impact proof” hanya jika relasi penjualan → alokasi sudah valid.

---

# 10. Collection Point

## `/collection-point`

Desktop:

```text
┌─────────────────────┬──────────────────────┐
│ FILTER              │                      │
│ Material            │         MAP          │
│ Kota / Area         │                      │
│ Jam                  │     ●   ●   ●       │
│                     │                      │
│ LIST                 │                      │
│ CP-001               │                      │
│ CP-002               │                      │
└─────────────────────┴──────────────────────┘
```

Mobile: list lebih dahulu, map dapat dibuka melalui toggle.

---

# 11. Stories

## `/cerita`

Story harus menghubungkan:

```text
PEOPLE + WASTE + PRODUCT + IMPACT
```

Bukan hanya foto penerima manfaat.

Contoh card:

```text
[IMAGE]

Dari minyak jelantah menjadi cahaya.

Bagaimana kontribusi masyarakat berubah
menjadi produk dan dukungan sosial.

[ BACA CERITA ]
```

---

# 12. Transparency

## `/transparansi`

Ini harus terasa seperti **evidence center**, bukan halaman slogan.

```text
TRANSPARANSI

Periode: September 2026

Limbah masuk      1.248 KG
Limbah terolah       842 KG
Produk dibuat      1.520
Produk terjual     1.102
Penjualan      Rp18.450.000
Dana sosial    Rp12.300.000
```

Tambahkan:

- methodology/definitions;
- reporting period;
- last updated;
- downloadable report jika tersedia;
- source category;
- data corrections log jika ada koreksi material.

---

# 13. Authentication

## `/login`

Minimalis.

```text
Masuk ke KITA TUMBUH — Kampung Smart Farming

Email
[____________]
Password
[____________]

[ MASUK ]

atau

[ Google / provider lain jika disetujui ]

Belum punya akun? Daftar
```

Untuk donation-first UX, akun sebaiknya **tidak menjadi penghalang sebelum aksi awal** bila workflow backend memungkinkan anonymous donation.

---

# 14. Member Dashboard

## `/dashboard`

```text
┌────────────┬────────────────────────────────┐
│ Dashboard  │ Halo, [Nama]                  │
│ Donasi     │                                │
│ Pickup     │  DAMPAK SAYA                   │
│ Impact     │  23,5 KG | 37 | Rp425K        │
│ Riwayat    │                                │
│ Profile    │  DONASI TERBARU                │
│            │  DON-00124                     │
│            │  ● Diproses                    │
└────────────┴────────────────────────────────┘
```

Mobile: sidebar menjadi bottom nav / compact menu.

---

# 15. Admin / Operations Wireframe

Admin UI harus information-dense tetapi tidak padat secara visual.

## 15.1 Admin overview — `/admin`

```text
┌────────────────────────────────────────────────────┐
│ ADMIN                                               │
├────────────────────────────────────────────────────┤
│ DONASI 24 | PICKUP 12 | LIMBAH 183 KG | SALES 47  │
├────────────────────────────────────────────────────┤
│                                                     │
│ DONATION PIPELINE          INVENTORY ALERTS         │
│ Submitted    24            Jelantah    245 L       │
│ Collected    18            Plastik     480 KG      │
│ Verified     15            Organik     125 KG      │
│ Processed    12                                   │
│                                                     │
├────────────────────────────────────────────────────┤
│ Recent activity / exceptions / pending approvals   │
└────────────────────────────────────────────────────┘
```

---

## 15.2 Donation management — `/admin/donations`

Table columns:

```text
ID | Donor | Material | Est. Qty | Actual Qty | Method | Status | Updated
```

Action drawer:

```text
Donation details
→ source
→ verification
→ pickup
→ weight
→ attached evidence
→ timeline
→ audit history
```

---

## 15.3 Waste inventory — `/admin/inventory`

```text
MATERIAL INVENTORY

Minyak Jelantah     245 L
Plastik             480 KG
Organik             125 KG

[ ADJUSTMENT ] [ CREATE BATCH ]
```

Inventory adjustment harus selalu menyimpan actor, reason, dan timestamp.

---

## 15.4 Production batch — `/admin/production`

```text
BATCH-MJ-0012

INPUT
100 L Minyak Jelantah

PROCESS
[notes / operator / date]

OUTPUT
80 Lilin

[ COMPLETE BATCH ]
```

Output tidak boleh melebihi input tanpa alasan/metadata yang valid.

---

## 15.5 Sales — `/admin/sales`

```text
REVENUE
Rp18.450.000

ORDERS 142
PRODUCTS SOLD 1.102

[Orders] [Products] [Revenue Allocation]
```

---

## 15.6 Social programs — `/admin/programs`

```text
Program | Target | Available | Status | Verification
```

Detail program mempunyai tab:

```text
Overview | Beneficiaries | Funding | Updates | Evidence | Audit
```

---

## 15.7 Transparency publisher — `/admin/transparency`

```text
REPORT PERIOD
September 2026

[ DRAFT ]

Metrics
✓ checked
✓ approved

[ PREVIEW PUBLIC PAGE ]
[ PUBLISH ]
```

Publish harus memerlukan permission yang sesuai.

---

# 16. Responsive Rules

## Breakpoints

Gunakan breakpoint yang mengikuti layout content, bukan device marketing.

Target minimum:

- small mobile: ~320–479px;
- mobile/tablet: ~480–767px;
- tablet/small desktop: ~768–1023px;
- desktop: ~1024px+.

## Mobile rules

- primary CTA tetap mudah dijangkau;
- wizard donasi satu kolom;
- table admin berubah menjadi card/list atau horizontal scroll terkontrol;
- tidak ada tiny text;
- map tidak boleh memaksa seluruh layar pada donation flow;
- footer disusun dalam accordion bila perlu.

## Desktop rules

Gunakan max content width agar halaman tidak terasa kosong atau melebar tanpa batas.

---

# 17. UX States

### Intro kunjungan pertama

- Layar tulang dengan satu daun hijau berurat yang melayang mengikuti lintasan angin melingkar, identitas KITA TUMBUH, dan teks status singkat.
- Tampil sekali per sesi tab, minimal 2 detik. Jika halaman masih memuat, animasi terus berulang hingga event load browser selesai, tanpa batas waktu otomatis. Setelah kedua syarat terpenuhi, overlay memudar selama 350 ms. Satu putaran daun berlangsung 2 detik; daun berukuran 60% dari ilustrasi awal.
- Escape dapat melewati intro. Selama overlay tampil, halaman di belakangnya tidak menerima fokus atau scroll; keduanya dipulihkan setelah intro selesai.
- Preferensi reduced motion melewati intro. Loading rute memakai ilustrasi daun yang sama dalam keadaan diam untuk preferensi tersebut.
- Tanpa JavaScript, intro tidak menutupi konten halaman.

Setiap feature wajib memiliki minimal:

```text
Default
Loading
Empty
Success
Error
Disabled
Permission denied
Offline / network failure bila relevan
```

### Example empty donation

> Belum ada donasi. Mulai dari sesuatu yang ada di rumahmu hari ini.
>
> **[ DONASIKAN LIMBAH ]**

### Example error

> Donasi belum berhasil dikirim. Data belum tersimpan dan tidak ada perubahan yang dibuat.
>
> **[ COBA LAGI ]**

Jangan menggunakan error generik seperti “Something went wrong” tanpa konteks.

---

# 18. Accessibility Requirements

Minimum:

- semantic HTML;
- keyboard navigable;
- visible focus state;
- form labels jelas;
- error terkait field;
- heading hierarchy benar;
- touch target nyaman;
- contrast memenuhi WCAG sesuai target proyek;
- motion dapat dikurangi;
- gambar informatif memiliki alt text yang sesuai konteks.

---

# 19. Content Design

Tone:

**hangat, manusiawi, jujur, konkret, tidak menggurui.**

Hindari:

- corporate buzzwords;
- guilt-tripping;
- overclaim dampak;
- copy yang terlalu dramatis;
- CTA berulang dengan kata yang sama setiap section.

Gunakan prinsip:

> **Concrete first. Emotional second. Evidence always.**

### Core phrase

**“SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.”**

Kalimat ini menjadi anchor brand dan harus muncul secara natural, bukan dipaksakan di setiap halaman.

---

# 20. SEO & AI Discoverability Wireframe Requirements

Setiap halaman publik harus memiliki struktur konten yang bisa dipahami manusia dan mesin.

Wajib dipikirkan sejak wireframe:

- satu H1 utama;
- heading berhierarki;
- intro yang menjawab intent halaman;
- internal links yang kontekstual;
- nama program/material/produk yang eksplisit;
- FAQ jika memang membantu intent pencarian;
- breadcrumb untuk halaman dalam;
- structured data sesuai tipe konten;
- metadata unik;
- canonical;
- sitemap/indexability control;
- author / organization / date / update metadata bila relevan.

AI discoverability tidak boleh dilakukan dengan keyword stuffing. Prioritaskan:

**clear entities + factual claims + structured content + trustworthy evidence.**

---

# 21. Anti-Slop Visual Rules

## Jangan gunakan sebagai default

- gradient berlebihan;
- glassmorphism dekoratif tanpa fungsi;
- blob shapes generik;
- floating cards hanya agar terlihat “modern”;
- neumorphism;
- dashboard dengan terlalu banyak card kecil;
- stock-photo hero yang tidak berhubungan dengan proses nyata;
- animasi yang tidak membantu pemahaman.

## Gunakan

- whitespace yang sengaja;
- hierarchy tipografi yang kuat;
- photography dokumenter yang autentik;
- diagram proses yang sederhana;
- data visualization yang informatif;
- warna solid;
- radius konsisten;
- motion pendek dan fungsional.

---

# 22. Component Inventory

### Public

- Navbar
- Hero
- CTA
- Impact Stat
- Process Step
- Waste Category Card
- Product Card
- Program Card
- Story Card
- Transparency Metric
- Collection Point Card
- Footer

### Donation

- Material Selector
- Quantity Input
- Fulfillment Selector
- Address Form
- Date/Time Selector
- Donation Summary
- Tracking Timeline
- Impact Receipt

### Application

- Sidebar
- Topbar
- Data Table
- Filter Bar
- Status Badge
- Detail Drawer
- Timeline
- Metric Card
- Chart
- Empty State
- Confirmation Modal
- Audit Timeline

---

# 23. Wireframe Definition of Done

Sebuah screen dianggap siap masuk UI design jika:

- tujuan screen jelas;
- primary CTA jelas;
- information hierarchy jelas;
- success/error/empty states sudah dipikirkan;
- responsive behavior sudah ditentukan;
- source data diketahui;
- privacy/security concern diketahui;
- SEO requirement ditentukan bila public;
- copy utama tidak berupa placeholder generik.

---

# 24. Prototype Priority

Urutan prototype yang disarankan:

```text
1. Home
2. Donation Wizard
3. Donation Tracking
4. Public Impact
5. Program Detail
6. Product Detail
7. Member Dashboard
8. Admin Overview
9. Admin Donation Detail
10. Admin Production Batch
11. Admin Transparency Publisher
```

Prototype ini sudah cukup untuk menguji core loop sebelum seluruh screen dibuat.

---

## Final UX Principle

> **Buat orang mudah memahami. Buat orang mudah berkontribusi. Lalu buktikan ke mana kontribusinya pergi.**

KITA TUMBUH dan ekosistem KAMPUNG SMART FARMING tidak perlu terlihat seperti website yang paling ramai. Ia perlu terasa seperti website yang **paling jelas, manusiawi, dan dapat dipercaya**.
