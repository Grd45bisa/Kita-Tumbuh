# ARSITEKTUR.md — KITA TUMBUH / KAMPUNG SMART FARMING

> **System & Information Architecture Specification**
>
> **Status:** Approved v1.0  
> **Master Brand:** KITA TUMBUH  
> **Platform / Ekosistem:** KAMPUNG SMART FARMING  
> **Tagline:** Dari Limbah, Tumbuh Manfaat.  
> **Core Statement:** SAMPAH KALIAN SANGAT BERARTI BAGI KAMI  
> **Domain:** Circular Economy + Social Impact Platform  
> **Dokumen terkait:** `RPD.md`, `WIREFRAME.md`, `TASK.md`, `AGENTS.md`

---

## 1. Tujuan Arsitektur

Arsitektur KITA TUMBUH / KAMPUNG SMART FARMING harus menjembatani tiga dunia yang berbeda:

1. **Public experience** — membuat orang memahami misi, percaya, lalu melakukan aksi.
2. **Member experience** — membuat kontribusi pribadi terasa jelas, mudah, dan terlacak.
3. **Operational system** — membuat tim dapat mengelola limbah, produksi, penjualan, keuangan, dan program sosial secara terstruktur.

Prinsip utamanya:

> **Jangan desain halaman sebagai kumpulan layar. Desain perjalanan data dan perjalanan manusia yang saling terhubung.**

---

## 2. Arsitektur Tingkat Tinggi

```text
                                      ┌───────────────────────┐
                                      │      PUBLIC WEB       │
                                      │ Home / Story / Impact │
                                      │ Donation / Product    │
                                      └───────────┬───────────┘
                                                  │
                                      ┌───────────▼───────────┐
                                      │     APPLICATION       │
                                      │ Auth / API / Business │
                                      │ Logic / Validation    │
                                      └───────┬───────┬───────┘
                                              │       │
                         ┌────────────────────┘       └────────────────────┐
                         ▼                                                 ▼
             ┌─────────────────────┐                          ┌──────────────────────┐
             │    MEMBER AREA      │                          │ ADMIN / OPERATIONS   │
             │ Donation / Impact   │                          │ Waste / Production   │
             │ Tracking / Profile  │                          │ Sales / Finance      │
             └──────────┬──────────┘                          │ Social / Reports     │
                        │                                     └──────────┬───────────┘
                        │                                                │
                        └──────────────────┬─────────────────────────────┘
                                           ▼
                              ┌────────────────────────┐
                              │      DATA LAYER        │
                              │ PostgreSQL / Storage   │
                              │ Audit / Reporting      │
                              └────────────┬───────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │   PUBLIC IMPACT DATA   │
                              │ Verified metrics only  │
                              └────────────────────────┘
```

---

## 3. Architectural Principles

### 3.1 Source of truth

Semua angka operasional penting harus mempunyai satu sumber data utama.

Contoh:

- berat limbah → donation/collection records;
- stok limbah → inventory ledger;
- output produksi → production batch;
- stok produk → product inventory;
- transaksi penjualan → orders + order items;
- revenue → payment/order records;
- alokasi sosial → allocation records;
- penerima manfaat → beneficiary/program records.

Dashboard tidak boleh menyimpan angka yang sebenarnya berasal dari perhitungan lain.

### 3.2 Immutable history untuk kejadian finansial dan operasional

Perubahan data sensitif harus meninggalkan jejak audit.

Contoh:

```text
berat aktual 8 KG
        ↓
admin mengubah menjadi 8.5 KG
        ↓
AUDIT LOG
old = 8 KG
new = 8.5 KG
actor = operator
reason = hasil penimbangan ulang
```

### 3.3 Public data ≠ internal data

Website publik hanya mengambil data yang sudah memenuhi status publikasi.

```text
INTERNAL RECORD
     ↓
VALIDATION
     ↓
APPROVAL / PUBLISH
     ↓
PUBLIC IMPACT DATA
```

### 3.4 Mobile-first

Sebagian besar interaksi masyarakat harus nyaman dilakukan dari ponsel.

### 3.5 Progressive disclosure

Informasi kompleks dibuka bertahap. Homepage tidak boleh menjadi dashboard operasional.

### 3.6 Accessible by default

Gunakan semantic HTML, keyboard navigation, focus state, readable contrast, label form yang jelas, error state yang informatif, dan target sentuh yang nyaman.

### 3.7 SEO + AI discoverability

Konten publik harus dapat diakses dan dipahami mesin:

- semantic HTML;
- metadata per halaman;
- canonical URL;
- sitemap.xml;
- robots.txt yang benar;
- Open Graph/Twitter metadata;
- structured data/Schema.org yang relevan;
- URL deskriptif;
- heading hierarchy konsisten;
- konten penting tersedia sebagai HTML, bukan hanya canvas/image;
- internal linking yang jelas;
- halaman FAQ dan knowledge content;
- fakta organisasi, proses, produk, dan impact mempunyai halaman sumber yang jelas.

AI discoverability tidak boleh dicapai dengan keyword stuffing atau teks generatif yang repetitif.

---

# 4. Domain Model Utama

```text
USER
 │
 ├──── DONATION ──── COLLECTION / PICKUP
 │                      │
 │                      ▼
 │                  WASTE LOT
 │                      │
 │                      ▼
 │               PRODUCTION BATCH
 │                      │
 │                      ▼
 │                   PRODUCT
 │                      │
 │                      ▼
 │                  ORDER
 │                      │
 │                      ▼
 │                 REVENUE
 │                      │
 │                      ▼
 │             SOCIAL ALLOCATION
 │                      │
 │                      ▼
 │                SOCIAL PROGRAM
 │                      │
 │                      ▼
 │                  BENEFICIARY
 │
 └──── IMPACT EVENT / IMPACT SUMMARY
```

---

# 5. Entitas Inti

## 5.1 User

Mewakili akun pengguna.

Minimal field konseptual:

```text
id
name
email
phone
password_hash / auth_provider
role_id
status
created_at
updated_at
```

## 5.2 Role

Menyimpan jenis akses pengguna.

```text
id
name
permissions
```

## 5.3 Donation

Catatan niat/kontribusi limbah dari user.

```text
donation_id
user_id
waste_type_id
estimated_quantity
unit
method              # pickup / dropoff
collection_point_id
scheduled_at
status
notes
created_at
updated_at
```

## 5.4 Collection / Handover

Catatan ketika limbah benar-benar diterima.

```text
collection_id
donation_id
actual_quantity
unit
received_by
received_at
verification_status
verification_note
```

## 5.5 Waste Lot

Unit inventory yang dapat dilacak ke sumber limbah.

```text
waste_lot_id
collection_id
waste_type_id
quantity
unit
quality_grade
status
stored_at
```

## 5.6 Production Batch

Menghubungkan input limbah dengan output produk.

```text
batch_id
batch_code
product_type_id
status
started_at
completed_at
notes
```

Relasi input/output harus mendukung traceability:

```text
Batch
 ├── Input Waste Lot(s)
 └── Output Product Lot(s)
```

## 5.7 Product

```text
product_id
sku
name
slug
description
price
status
impact_copy
created_at
updated_at
```

## 5.8 Product Lot / Inventory

Memisahkan produk secara katalog dari stok fisiknya.

```text
product_lot_id
product_id
batch_id
quantity
unit_cost
status
```

## 5.9 Order

```text
order_id
customer_id
status
subtotal
shipping_fee
total
payment_status
created_at
```

## 5.10 Order Item

```text
order_item_id
order_id
product_id
quantity
unit_price
```

## 5.11 Revenue / Financial Record

Menyimpan kejadian keuangan yang dibutuhkan untuk rekonsiliasi dan reporting.

```text
financial_record_id
type                  # revenue / expense / adjustment
reference_type
reference_id
amount
category
occurred_at
notes
```

## 5.12 Social Program

```text
program_id
name
slug
description
target_amount
status
start_date
end_date
public_status
```

## 5.13 Beneficiary

Data internal penerima manfaat.

```text
beneficiary_id
name_or_alias
category
verification_status
privacy_level
notes
```

Data publik harus memakai projection/view khusus sehingga informasi sensitif tidak ikut terekspos.

## 5.14 Social Allocation

```text
allocation_id
program_id
amount
source_type
source_reference
status
allocated_at
approved_by
```

## 5.15 Impact Record

Menyimpan event yang dapat dirangkum menjadi metrik dampak.

```text
impact_record_id
source_type
source_id
metric_type
value
unit
verified
published
occurred_at
```

---

# 6. Relasi Konseptual

```text
USER 1 ──── N DONATION
DONATION 1 ──── 0..1 COLLECTION
COLLECTION 1 ──── N WASTE_LOT
WASTE_LOT N ──── N PRODUCTION_BATCH
PRODUCTION_BATCH 1 ──── N PRODUCT_LOT
PRODUCT 1 ──── N PRODUCT_LOT
USER 1 ──── N ORDER
ORDER 1 ──── N ORDER_ITEM
PRODUCT 1 ──── N ORDER_ITEM
ORDER / EXPENSE ──── FINANCIAL_RECORD
FINANCIAL_RECORD ──── SOCIAL_ALLOCATION
SOCIAL_PROGRAM 1 ──── N SOCIAL_ALLOCATION
SOCIAL_PROGRAM 1 ──── N BENEFICIARY
ALL VERIFIED EVENTS ──── IMPACT_RECORD
```

Relasi many-to-many antara `WASTE_LOT` dan `PRODUCTION_BATCH` sebaiknya diwujudkan melalui tabel junction, misalnya `batch_inputs`, agar satu batch dapat memakai beberapa lot dan satu lot dapat dipakai secara bertahap bila operasional mengizinkan.

---

# 7. State Machine

## 7.1 Donation

Lifecycle implementasi Phase 3 (`donation_status`), selaras dengan tracking publik:

```text
SUBMITTED
  ↓
SCHEDULED        (pickup)
  ↓
COLLECTED
  ↓
VERIFIED
  ↓
SORTED
  ↓
PROCESSED
  ↓
CONVERTED
  ↓
IMPACTED
```

`DROP-OFF` dapat melewati `SCHEDULED` dan langsung masuk `COLLECTED`.

Donasi baru dimulai pada `SUBMITTED`. Event/transisi operasional dan pencatatan dampak nyata bergantung pada Phase 5/8; enum `IMPACTED` tidak berarti donasi otomatis mempunyai dampak terverifikasi. Draft formulir tetap state lokal, bukan status database. Keputusan diterima/ditolak menjadi bagian rancangan proses verifikasi operasional, bukan enum donasi terpisah pada MVP ini.

## 7.2 Production Batch

```text
PLANNED
  ↓
IN_PROGRESS
  ↓
QC_REVIEW
  ↓
COMPLETED
  ↓
RELEASED
```

## 7.3 Order

```text
PENDING_PAYMENT
  ↓
PAID
  ↓
PROCESSING
  ↓
SHIPPED / READY_FOR_PICKUP
  ↓
COMPLETED
```

## 7.4 Social Program

```text
DRAFT
  ↓
REVIEW
  ↓
APPROVED
  ↓
ACTIVE
  ↓
FUNDED / PARTIALLY_FUNDED
  ↓
DISTRIBUTED
  ↓
COMPLETED
```

---

# 8. Public Information Architecture

```text
/
├── /tentang
├── /cara-kerja
├── /donasikan                 # landing + wizard 4 langkah
├── /donasi/:reference         # tracking dengan referensi donasi
│   └── /receipt               # receipt ringkas yang aman dibagikan
├── /dampak
├── /program
│   ├── /
│   └── /:slug
├── /produk
│   ├── /
│   └── /:slug
├── /cerita
│   ├── /
│   └── /:slug
├── /collection-point
├── /transparansi
├── /faq
├── /kontak
├── /login
└── /register
```

### URL principle

Route donasi Phase 3 memakai `/donasikan` sebagai titik masuk resmi; tidak ada landing `/donasi` terpisah. Material, jumlah, dan metode/lokasi/jadwal dipilih di dalam wizard yang sama. Lihat ADR-013 di `DECISIONS.md`.

Gunakan URL yang:

- mudah dibaca manusia;
- deskriptif;
- stabil;
- tidak bergantung pada ID numerik sebagai satu-satunya konteks.

Contoh:

```text
/program/bantuan-alat-bantu-mobilitas
/produk/lilin-aromaterapi-minyak-jelantah
/cerita/dari-minyak-jelantah-menjadi-cahaya
```

---

# 9. Member Area Architecture

```text
/app
├── /dashboard
├── /donasi
│   ├── /baru
│   ├── /
│   └── /:id
├── /pickup
├── /impact
├── /riwayat
└── /profil
```

### Member navigation priority

1. Donasikan Limbah
2. Dashboard
3. Donasi Saya
4. Impact Saya
5. Pickup
6. Riwayat
7. Profil

CTA donasi harus selalu mudah ditemukan tetapi tidak mengganggu halaman informasional.

---

# 10. Admin / Operations Architecture

```text
/admin
├── /dashboard
├── /donations
├── /collections
├── /pickups
├── /waste
│   ├── /inventory
│   ├── /lots
│   └── /types
├── /production
│   ├── /batches
│   └── /outputs
├── /products
│   ├── /catalog
│   └── /inventory
├── /orders
├── /finance
│   ├── /revenue
│   ├── /expenses
│   └── /allocations
├── /social
│   ├── /programs
│   ├── /beneficiaries
│   └── /distributions
├── /stories
├── /transparency
├── /reports
├── /audit-log
└── /settings
    ├── /users
    ├── /roles
    └── /system
```

---

# 11. Role & Permission Matrix

| Modul | Super Admin | Admin | Operator | Finance | Social Officer |
|---|---:|---:|---:|---:|---:|
| Dashboard | RW | R | R | R | R |
| Donations | RW | RW | RW | R | R |
| Pickup / Collection | RW | RW | RW | R | R |
| Waste Inventory | RW | RW | RW | R | R |
| Production | RW | RW | RW | R | R |
| Product Catalog | RW | RW | R | R | R |
| Orders / Sales | RW | RW | R | RW | R |
| Finance | RW | R | - | RW | R |
| Social Program | RW | RW | - | R | RW |
| Beneficiary | RW | R | - | - | RW |
| Transparency | RW | RW | R | RW | RW |
| Stories | RW | RW | R | R | RW |
| Reports | RW | RW | R | RW | RW |
| Audit Log | R | R | R | R | R |
| User / Roles | RW | R | - | - | - |
| System Settings | RW | R | - | - | - |

`R = Read`, `W = Write`, `RW = Read + Write`, `- = No access`.

Finance and beneficiary permissions harus dipisahkan karena keduanya membawa jenis risiko yang berbeda.

---

# 12. API Boundary

API dipisahkan berdasarkan domain, bukan berdasarkan halaman.

```text
/api/auth/*
/api/users/*
/api/donations/*
/api/collections/*
/api/pickups/*
/api/waste/*
/api/production/*
/api/products/*
/api/orders/*
/api/finance/*
/api/social-programs/*
/api/beneficiaries/*
/api/impact/*
/api/transparency/*
/api/reports/*
/api/audit/*
```

Public endpoints harus menggunakan read model yang aman dan sudah disaring.

Contoh:

```text
/api/public/impact
/api/public/programs
/api/public/products
/api/public/collection-points
```

Hindari mengekspos tabel internal langsung ke frontend publik.

---

# 13. Public Data Pipeline

```text
Operational DB
      ↓
Validation / Business Rules
      ↓
Verified Metrics
      ↓
Aggregation
      ↓
Public Projection
      ↓
API / SSR / Static Cache
      ↓
Public Web
```

Tujuan pendekatan ini:

- angka publik konsisten;
- data sensitif tidak bocor;
- query frontend lebih sederhana;
- halaman SEO lebih mudah dirender;
- reporting dan UI tidak saling mengubah sumber data.

---

# 14. SEO Architecture

## 14.1 Page classes

### Informational

- homepage;
- tentang;
- cara kerja;
- FAQ.

### Transactional

- donasi;
- collection point;
- produk.

### Evidence / Trust

- dampak;
- transparansi;
- program;
- cerita.

Setiap kelas mempunyai intent pencarian yang berbeda dan harus mempunyai copy serta metadata berbeda.

## 14.2 Technical SEO

Setiap halaman publik harus mempunyai:

```text
title
meta description
canonical
robots directive bila diperlukan
Open Graph metadata
structured data bila relevan
semantic heading hierarchy
internal links
```

Tambahkan:

```text
/sitemap.xml
/robots.txt
```

## 14.3 Structured data

Gunakan tipe Schema.org hanya jika data tersebut benar-benar tersedia, misalnya:

- `Organization`;
- `WebSite`;
- `BreadcrumbList`;
- `Product` untuk produk yang benar-benar dijual;
- `FAQPage` untuk FAQ yang terlihat di halaman;
- tipe lain sesuai konten dan kelayakan implementasi.

Jangan membuat structured data untuk informasi yang tidak tampak atau tidak benar.

---

# 15. AI Discoverability Architecture

Tujuan bukan "menipu AI agar menyebut brand". Tujuannya membuat informasi KITA TUMBUH dan platform KAMPUNG SMART FARMING **mudah dipahami, diambil, dan dikutip** ketika seseorang bertanya tentang layanan atau aktivitas organisasi.

### Content requirements

Setiap halaman penting harus menjawab:

```text
Siapa kami?
Apa yang kami lakukan?
Limbah apa yang kami terima?
Bagaimana prosesnya?
Produk apa yang dihasilkan?
Bagaimana hasil penjualan digunakan?
Program apa yang berjalan?
Bagaimana dampak dihitung?
Di mana collection point berada?
Bagaimana cara berkontribusi?
```

Gunakan fakta yang eksplisit, definisi yang konsisten, heading jelas, FAQ, breadcrumb, dan internal links.

Jangan membuat paragraf keyword-stuffed seperti:

```text
"donasi sampah depok donasi sampah jakarta donasi limbah..."
```

---

# 16. Performance Architecture

Target engineering:

- mobile-first;
- lazy-load media non-kritis;
- image dimensions selalu ditentukan untuk mencegah layout shift;
- gunakan responsive image formats;
- minimalkan JavaScript client yang tidak diperlukan;
- gunakan server-rendering/static generation untuk halaman publik bila stack mendukung;
- jadikan dashboard sebagai aplikasi terpisah secara boundary, bukan memaksa seluruh public site menjadi SPA berat;
- API pagination untuk tabel admin;
- debounce search/filter;
- optimistic UI hanya untuk operasi yang aman dan dapat direkonsiliasi.

Prinsip:

> **Public website harus terasa seperti website cepat, bukan aplikasi dashboard yang kebetulan punya landing page.**

---

# 17. Security Architecture

Minimum requirement:

1. Password tidak pernah disimpan plaintext.
2. Authorization dicek di server, bukan hanya disembunyikan di frontend.
3. Role dan permission ditentukan dari server-side claims/session.
4. File upload divalidasi tipe, ukuran, dan aksesnya.
5. Data beneficiary dipisahkan dari public projection.
6. Audit log untuk aksi penting.
7. Rate limiting untuk endpoint sensitif.
8. Validasi input pada semua boundary API.
9. Secret/API key hanya di server environment.
10. Pembayaran dan status finansial tidak boleh dianggap valid hanya berdasarkan data dari client.

---

# 18. Observability & Audit

Operational events penting harus dapat ditelusuri.

Contoh audit event:

```text
DONATION_CREATED
DONATION_VERIFIED
WEIGHT_UPDATED
WASTE_LOT_CREATED
BATCH_STARTED
BATCH_COMPLETED
PRODUCT_RELEASED
ORDER_PAID
REVENUE_RECORDED
ALLOCATION_CREATED
PROGRAM_APPROVED
BENEFICIARY_UPDATED
REPORT_PUBLISHED
```

Audit record minimal:

```text
audit_id
actor_id
action
entity_type
entity_id
before_json
after_json
reason
created_at
```

---

# 19. Media / Story Architecture

Foto, video, dan cerita harus mempunyai metadata.

```text
media_id
owner_type
owner_id
file_url
alt_text
caption
credit
consent_status
visibility
created_at
```

Khusus dokumentasi penerima manfaat:

- simpan status consent;
- tentukan apakah foto boleh dipublikasikan;
- bedakan data internal dan media publik;
- jangan mengekspos alamat atau data sensitif.

---

# 20. Notification Architecture

Notification event dapat berasal dari:

```text
Donation
Pickup
Verification
Processing
Impact update
Order
Program
System
```

Channel MVP:

1. in-app notification;
2. email untuk event penting.

WhatsApp/SMS dapat ditambahkan kemudian melalui provider resmi, bukan menjadi dependency inti sejak awal.

---

# 21. Analytics Architecture

Analytics publik dan analytics internal harus dibedakan.

### Product analytics

Mengukur:

- landing → donation conversion;
- donation wizard completion;
- drop-off vs pickup;
- repeat donors;
- product views → purchase;
- public impact engagement.

### Operational analytics

Mengukur:

- donation volume;
- verification time;
- pickup completion;
- waste conversion;
- production yield;
- inventory turnover;
- sales;
- social allocation.

Jangan memasukkan data pribadi mentah ke analytics event bila tidak diperlukan.

---

# 22. Recommended Application Boundary

Untuk MVP, gunakan struktur sederhana:

```text
/apps
  /web        # public website + member area
  /admin      # operational dashboard

/services
  /api        # backend/business logic

/packages
  /ui         # shared design system/components
  /types      # shared types/contracts
  /config     # shared configuration
```

Atau monolith modular apabila tim masih kecil:

```text
WEB
 ├── Public
 ├── Member
 └── Admin
        │
        ▼
      API
        │
        ▼
   PostgreSQL
```

**Rekomendasi MVP:** mulai dari modular monolith. Pisahkan service hanya ketika ada kebutuhan nyata untuk scale, deployment, atau isolation.

---

# 23. Recommended Technology Direction

Stack final belum dikunci di dokumen ini. Namun arsitektur mengutamakan teknologi yang mendukung:

- SSR/SSG untuk public pages;
- Type-safe API contracts bila memungkinkan;
- PostgreSQL;
- object storage untuk media;
- background job untuk pekerjaan non-real-time;
- transactional consistency untuk inventory dan finansial;
- role-based access control;
- automated testing.

Jangan memilih teknologi hanya karena sedang trend. Pilihan akhir harus mengikuti kemampuan tim, biaya hosting, ecosystem, dan kebutuhan MVP.

---

# 24. Critical Business Invariants

Ini adalah aturan yang **tidak boleh dilanggar** oleh sistem.

### Inventory

```text
stok tidak boleh menjadi negatif
```

### Production

```text
output batch tidak boleh melebihi aturan produksi yang telah ditetapkan
```

### Finance

```text
alokasi sosial tidak boleh melebihi dana yang tersedia/diizinkan
```

### Public impact

```text
angka publik hanya berasal dari data yang verified/published
```

### Beneficiary

```text
data sensitif tidak boleh keluar melalui public API
```

### Audit

```text
perubahan data sensitif harus dapat ditelusuri ke actor + waktu + alasan
```

---

# 25. Traceability Principle

Setiap produk berdampak idealnya dapat ditelusuri sedekat mungkin ke sumbernya.

Contoh:

```text
PRODUCT: LILIN-001
       ↓
PRODUCT LOT: LOT-2026-011
       ↓
BATCH: BATCH-2026-021
       ↓
INPUT WASTE LOTS
       ├── WL-0012
       ├── WL-0017
       └── WL-0021
       ↓
COLLECTIONS
       ↓
DONATIONS
```

Tidak semua informasi traceability harus ditampilkan ke publik secara penuh. Public UI memakai ringkasan yang aman dan bermakna.

---

# 26. UX-to-Data Mapping

| Pengalaman User | Data utama |
|---|---|
| Pilih jenis limbah | waste_types |
| Kirim donasi | donations |
| Tracking donasi | donations + collections + waste_lots |
| Lihat progress limbah | donation lifecycle |
| Lihat produk hasil olahan | products + production_batches |
| Beli produk | orders + order_items |
| Lihat kontribusi pembelian | orders + published impact |
| Lihat dampak pribadi | user-scoped impact aggregation |
| Lihat dampak publik | published impact projection |
| Lihat program sosial | social_programs + allocations |
| Lihat transparansi | public financial/impact aggregates |

---

# 27. Error & Empty States

Setiap modul wajib memiliki:

```text
Loading
Empty
Success
Validation Error
Permission Error
Not Found
Server Error
Offline / Network Failure
```

Copy harus membantu user menyelesaikan masalah.

Contoh:

> **Belum ada donasi.**  
> Mari mulai dari sesuatu yang ada di rumahmu.
>
> `[ Donasikan Limbah ]`

Bukan:

> "No data found."

---

# 28. Anti-Slop Architecture Rule

Komponen tidak boleh dibuat dengan pola:

```text
hero generik
+ 3 cards
+ rounded gradient buttons
+ generic stats
+ testimonial palsu
+ giant whitespace
```

Sebaliknya setiap section harus mempunyai alasan keberadaan:

```text
USER NEED
   ↓
CONTENT
   ↓
ACTION
   ↓
SYSTEM RESPONSE
```

### Content integrity

- jangan gunakan testimonial palsu;
- jangan gunakan impact number placeholder di production;
- jangan membuat beneficiary story fiktif untuk terlihat menyentuh;
- jangan membuat foto dokumentasi palsu seolah kegiatan nyata;
- jangan menyatakan produk "ramah lingkungan" tanpa definisi atau bukti yang dapat dipertanggungjawabkan.

---

# 29. Acceptance Criteria Arsitektur

Arsitektur dianggap siap diturunkan ke wireframe ketika:

- seluruh primary user journey memiliki halaman tujuan;
- donation lifecycle jelas;
- waste-to-product traceability jelas;
- sales-to-social allocation flow jelas;
- public/internal data boundary jelas;
- role dan permission tidak ambigu;
- public SEO structure jelas;
- public impact metrics memiliki source of truth;
- audit requirement terdefinisi;
- privacy boundary beneficiary terdefinisi;
- error state utama diketahui;
- tidak ada fitur penting yang hanya muncul sebagai ide tanpa owner/data flow.

---

# 30. Next Document Contract

Dokumen berikutnya `WIREFRAME.md` harus mengubah arsitektur ini menjadi screen-level specification.

Minimal harus mencakup:

```text
Screen
├── tujuan
├── user
├── entry point
├── primary CTA
├── secondary CTA
├── content hierarchy
├── component inventory
├── responsive behavior
├── state
├── empty/error state
├── SEO notes untuk public pages
└── transition ke screen berikutnya
```

**Tidak boleh langsung membuat UI high-fidelity sebelum wireframe dan flow ini konsisten dengan arsitektur.**
