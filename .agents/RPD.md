# RPD — KITA TUMBUH / KAMPUNG SMART FARMING

> **Product Requirements Document**
>
> **Status:** Approved v1.0  
> **Master Brand:** KITA TUMBUH  
> **Platform / Ekosistem:** KAMPUNG SMART FARMING  
> **Tagline:** Dari Limbah, Tumbuh Manfaat.  
> **Core Statement:** SAMPAH KALIAN SANGAT BERARTI BAGI KAMI  
> **Fokus:** Product direction, user experience, content, trust, SEO, dan AI discoverability  
> **Dokumen berikutnya:** `ARSITEKTUR.md`, `WIREFRAME.md`, `TASK.md`, `AGENTS.md`

---

## 1. Product Vision & Brand Architecture

### 1.1 Brand Hierarchy

```text
KITA TUMBUH (Master Brand)
└── KAMPUNG SMART FARMING (Platform / Ekosistem Sirkular)
    └── Dari Limbah, Tumbuh Manfaat. (Tagline)
```

- **KITA TUMBUH**: Master brand gerakan sosial dan pemberdayaan masyarakat mandiri.
- **KAMPUNG SMART FARMING**: Platform operasional sirkular yang mempertemukan donasi limbah, pengolahan terpadu, pertanian pintar berbasis kebun warga, dan penyaluran dampak sosial.
- **Tagline**: *Dari Limbah, Tumbuh Manfaat.*
- **Core Emotional Statement**: *SAMPAH KALIAN SANGAT BERARTI BAGI KAMI*

### 1.2 Gagasan inti

Platform sosial berbasis **circular economy** yang mengubah limbah rumah tangga (seperti minyak jelantah dan sampah organik dapur) menjadi produk bernilai dan nutrisi pertanian pintar, kemudian mengalokasikan hasil panen dan keuntungannya untuk program sosial bagi keluarga yang membutuhkan.

**Limbah bukan akhir. Limbah adalah awal dari sebuah dampak.**

Alur inti produk:

```text
MASYARAKAT
    ↓
DONASI LIMBAH
    ↓
PENGUMPULAN
    ↓
PEMILAHAN
    ↓
PENGOLAHAN
    ↓
PRODUK BERNILAI & SMART FARMING
    ↓
PENJUALAN & PANEN
    ↓
HASIL EKONOMI & PANGAN
    ↓
ALOKASI SOSIAL
    ↓
PROGRAM BANTUAN
    ↓
PENERIMA MANFAAT
```

### 1.3 Pernyataan nilai utama

> **"SAMPAH KALIAN SANGAT BERARTI BAGI KAMI."**

Kalimat ini menjadi **signature copy** brand. Pesannya harus terasa hangat, tulus, dan spesifik: sesuatu yang tidak lagi berguna bagi seseorang masih dapat memiliki nilai bagi orang lain.

### 1.4 Visual & Product Personality

Produk dan antarmuka harus terasa:
- **warm** (hangat dan manusiawi);
- **natural** (berakar pada bumi, tanaman, bahan alami);
- **professional** (rapi, terstruktur, akuntabel);
- **human** (berpusat pada martabat manusia, bukan teknologi semata);
- **community-oriented** (berangkat dari gotong royong warga).

**Hindari:**
- memosisikan diri sebagai produk fintech atau instrumen spekulatif;
- visual gaming atau reward point artifisial;
- template SaaS korporat generik atau dashboard IoT futuristik neon;
- template charity klise yang mengeksploitasi rasa iba / kemiskinan.

### 1.5 Positioning

Positioning yang diinginkan:

> **Platform yang mempertemukan kontribusi limbah rumah tangga, pengolahan sirkular, pertanian pintar komunitas, dan dampak sosial nyata dalam satu perjalanan terbuka yang dapat dilihat dan dipercaya publik.**

---

## 2. Product Goals

### P0 — Tujuan utama

1. Membuat masyarakat mudah mendonasikan limbah yang dapat dikelola.
2. Menunjukkan perjalanan donasi dari limbah sampai menjadi produk dan dampak sosial.
3. Membangun kepercayaan melalui data, dokumentasi, dan transparansi.
4. Membuat pengalaman yang cukup emosional untuk mendorong tindakan, tetapi tidak mengeksploitasi rasa kasihan.
5. Membuat produk digital yang profesional, accessible, cepat, mobile-first, SEO-friendly, dan mudah dipahami mesin pencari maupun AI.

### P1 — Tujuan lanjutan

1. Membuat user memiliki riwayat dan profil impact pribadi.
2. Memungkinkan pembelian produk hasil pengolahan sebagai jalur kontribusi alternatif.
3. Menyediakan data publik mengenai limbah, produksi, penjualan, dan alokasi sosial.
4. Membantu tim internal mengelola operasional tanpa spreadsheet yang tersebar.

### Non-goals untuk MVP

- menerima semua jenis limbah tanpa klasifikasi;
- membangun marketplace dengan kompleksitas seperti e-commerce besar;
- membuat blockchain hanya demi klaim transparansi;
- menambahkan AI di setiap halaman tanpa manfaat nyata;
- gamifikasi kompetitif yang membandingkan besarnya donasi antar pengguna.

---

## 3. Target Users

### 3.1 Donatur rumah tangga

**Motivasi:** ingin membuang limbah secara lebih bertanggung jawab dan melakukan sesuatu yang bermanfaat.

**Kebutuhan:**
- tahu limbah apa yang diterima;
- tahu cara menyerahkannya;
- proses donasi singkat;
- bisa memilih pickup atau drop-off;
- mendapat bukti penerimaan;
- dapat melihat dampaknya.

### 3.2 Pembeli produk berdampak

**Motivasi:** ingin membeli produk yang memiliki nilai sosial/lingkungan.

**Kebutuhan:**
- tahu asal produk;
- tahu proses pembuatannya;
- tahu bagaimana pembelian berkontribusi;
- checkout yang sederhana dan aman.

### 3.3 Pengunjung yang belum siap berdonasi

**Motivasi:** ingin memahami siapa organisasi ini, prosesnya, dan bukti dampaknya.

**Kebutuhan:**
- cerita yang mudah dipahami;
- data yang dapat diverifikasi;
- jawaban atas pertanyaan umum;
- CTA yang tidak agresif.

### 3.4 Operator internal

Menangani penerimaan, penimbangan, pemilahan, inventory, dan produksi.

### 3.5 Finance / Social Officer / Admin

Mengelola penjualan, biaya, alokasi dana sosial, program, beneficiary, dokumentasi, dan publikasi transparansi.

---

## 4. Core Experience

### 4.1 Prinsip pengalaman

User harus memahami dalam beberapa detik:

> **Apa yang saya berikan → apa yang terjadi → siapa yang akhirnya mendapat manfaat.**

Jangan mengandalkan paragraf panjang untuk menjelaskan sistem. Gunakan kombinasi:

- headline kuat;
- visual proses;
- angka yang mempunyai konteks;
- contoh perjalanan donasi;
- status tracking;
- cerita manusia;
- CTA spesifik.

### 4.2 Primary conversion

```text
Landing → Pilih limbah → Tentukan metode → Konfirmasi → Tracking
```

### 4.3 Secondary conversion

```text
Landing → Lihat Dampak → Cerita/Program → Donasi
Landing → Produk → Detail → Beli
Landing → Collection Point → Pilih lokasi
```

---

## 5. Website Experience Map

```text
PUBLIC WEB
│
├── Home
├── Tentang Kami
├── Cara Kerja
├── Donasikan Limbah
├── Dampak
├── Program Sosial
├── Produk
├── Cerita
├── Collection Point
├── Transparansi
├── FAQ
└── Kontak

MEMBER AREA
│
├── Dashboard
├── Donasi Saya
├── Detail Donasi / Tracking
├── Impact Saya
├── Jadwal Pickup
├── Riwayat
└── Profil

ADMIN / OPERATIONS
│
├── Overview
├── Donations
├── Collection & Pickup
├── Waste Inventory
├── Production Batches
├── Products
├── Orders / Sales
├── Finance & Allocation
├── Social Programs
├── Beneficiaries
├── Stories / Documentation
├── Transparency
├── Reports
└── Settings / Permissions
```

---

## 6. Donation Experience

### 6.1 Supported MVP categories

| Kategori | Contoh | Pengolahan awal | Output yang direncanakan |
|---|---|---|---|
| Minyak jelantah | minyak goreng bekas | pengumpulan + pemrosesan | lilin / produk turunan |
| Plastik terpilah | jenis plastik yang memenuhi SOP | sortir + proses | material / produk konstruksi |
| Organik tertentu | sisa organik yang sesuai SOP | komposting | kompos / pupuk |

> **Catatan operasional:** daftar limbah yang diterima harus mengikuti SOP pengelola. Website wajib memiliki daftar "diterima" dan "tidak diterima" agar masyarakat tidak menyerahkan material yang membutuhkan penanganan khusus.

### 6.2 Donation wizard

```text
01 — Pilih jenis limbah
02 — Estimasi jumlah
03 — Pilih Pickup / Drop-off
04 — Tentukan lokasi / slot
05 — Review
06 — Konfirmasi
07 — Tracking
```

### 6.3 Aturan penting

- Estimasi user **bukan** berat final.
- Berat aktual ditetapkan ketika limbah diterima dan diverifikasi.
- Status donasi tidak boleh melompat tanpa event yang tercatat.
- User harus bisa melihat kapan status berubah.

---

## 7. Impact Model

### 7.1 Impact trail

Setiap donasi harus mempunyai kemungkinan untuk ditelusuri ke batch pengolahan dan produk/hasil ekonomi yang terkait.

```text
Donation
  ↓
Collection Event
  ↓
Verification
  ↓
Waste Batch / Inventory
  ↓
Production Batch
  ↓
Product
  ↓
Sale / Revenue
  ↓
Social Allocation
  ↓
Program
  ↓
Beneficiary
```

### 7.2 Impact metrics

MVP minimal menampilkan:

- total limbah diterima;
- total limbah diproses;
- produk dihasilkan;
- produk terjual;
- nilai penjualan;
- alokasi sosial;
- jumlah program;
- jumlah penerima manfaat.

**Aturan:** jangan menampilkan angka contoh sebagai fakta publik. Angka publik harus berasal dari data operasional yang dapat ditelusuri.

---

## 8. Transparency Requirements

Transparansi bukan sekadar halaman statement. Sistem harus memungkinkan angka publik diturunkan dari catatan operasional.

### Public transparency minimal

1. Periode laporan.
2. Limbah masuk.
3. Limbah diproses.
4. Produk dibuat.
5. Penjualan.
6. Biaya yang relevan.
7. Nilai yang dialokasikan ke dana sosial.
8. Program yang menerima alokasi.
9. Bukti/dokumentasi yang dapat dipublikasikan.

### Prinsip data

> **Evidence over claims.**

Statistik, testimonial, foto, dan klaim dampak harus benar-benar ada sumber atau bukti internal yang bisa dipertanggungjawabkan.

---

## 9. Brand Voice & Copy Direction

### 9.1 Karakter suara

**Hangat, manusiawi, jujur, tenang, optimistis, konkret.**

Bukan:

- terlalu korporat;
- terlalu dramatis;
- terlalu mengemis perhatian;
- penuh jargon sustainability;
- penuh kalimat AI yang generik.

### 9.2 Signature line

Gunakan kalimat berikut sebagai bagian penting identitas:

> **SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.**

Possible context:

> **SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.**  
> Karena yang tersisa di rumahmu, masih bisa menjadi sesuatu yang berarti bagi orang lain.

### 9.3 Copy principles

Copy harus:

- konkret;
- pendek ketika berada di UI;
- punya makna ketika menjadi storytelling;
- menyebut tindakan secara jelas;
- menghindari buzzword kosong seperti "revolusioner", "seamless", "cutting-edge", atau "AI-powered" jika tidak diperlukan.

CTA harus spesifik terhadap aksi, contohnya:

- **Donasikan Limbahmu**
- **Lihat Perjalanan Donasimu**
- **Lihat Dampak Nyata**
- **Temukan Collection Point**
- **Belanja Sambil Berdampak**

Hindari CTA generik seperti "Get Started" / "Learn More" ketika konteks spesifik tersedia.

---

## 10. Anti-Slop Product Direction

Proyek ini akan menggunakan prinsip **anti-slop** sebagai quality filter: AI boleh membantu menghasilkan UI dan copy, tetapi hasil akhir harus terasa dibuat khusus untuk produk ini, bukan template AI. Anti-slop yang dirujuk di sini menekankan intentionality, functional completeness, content-driven composition, resilience, dan evidence over claims; ia juga secara eksplisit membedakan filter kualitas dari `DESIGN.md` yang menjadi sumber arah visual. citeturn345686search0turn345686search1

### Aturan produk

1. Jangan memakai layout landing page generik hanya karena mudah dibuat.
2. Jangan membuat semua section menjadi kumpulan kartu dengan bentuk identik.
3. Setiap visual harus mempunyai alasan fungsional atau naratif.
4. Tidak ada statistik palsu, testimonial palsu, atau foto yang dipakai seolah-olah dokumentasi nyata.
5. Jangan membuat semua CTA menjadi pill button tanpa alasan.
6. Responsive bukan sekadar mengecilkan desktop.
7. Empty, loading, error, success, dan keyboard states harus dianggap sebagai bagian dari desain.
8. Motion digunakan untuk membantu orientasi/feedback, bukan sekadar dekorasi.
9. Identitas visual harus tetap terasa unik meskipun nama logo dilepas.
10. Sebelum sebuah screen dianggap selesai, review harus menjawab: **"Mengapa elemen ini ada?"**

---

## 11. Visual Direction — Initial Product Hypothesis

Ini **arah awal**, bukan final design system. Detail warna, typography, spacing, dan komponen akan dikunci pada dokumen desain terpisah setelah validasi brand.

### Desired feeling

- human;
- warm;
- grounded;
- optimistic;
- trustworthy;
- contemporary.

### Visual behavior

- gunakan fotografi nyata ketika menceritakan dampak;
- berikan ruang putih yang cukup;
- hierarchy harus terasa editorial, bukan seperti dashboard template di semua halaman;
- gunakan satu atau dua aksen warna yang konsisten;
- hindari visual overload;
- gunakan ilustrasi hanya jika benar-benar membantu menjelaskan proses;
- prioritaskan mobile readability.

---

## 12. SEO Requirements

SEO diperlakukan sebagai bagian dari product architecture, bukan pekerjaan terakhir.

### 12.1 Search intent utama

Website harus dapat ditemukan untuk intent seperti:

- donasi sampah / limbah rumah tangga;
- donasi minyak jelantah;
- daur ulang plastik menjadi produk;
- donasi limbah untuk kegiatan sosial;
- pengumpulan minyak jelantah;
- produk daur ulang berdampak sosial;
- program sosial berbasis lingkungan;
- collection point limbah.

Keyword final harus ditentukan melalui riset keyword nyata sebelum production copy dikunci.

### 12.2 On-page

Setiap halaman penting harus mempunyai:

- satu `title` yang spesifik;
- `meta description` yang menjelaskan intent halaman;
- satu H1 yang jelas;
- heading hierarchy yang konsisten;
- URL yang deskriptif;
- internal links yang relevan;
- image `alt` text yang bermakna;
- canonical URL;
- Open Graph / social metadata.

### 12.3 Structured content

Gunakan structured data yang sesuai dengan jenis halaman, misalnya:

- `Organization` untuk identitas organisasi;
- `WebSite` untuk situs;
- `BreadcrumbList` untuk navigasi;
- `Product` ketika produk benar-benar dijual;
- `FAQPage` hanya ketika FAQ nyata ditampilkan dan memenuhi pedoman mesin pencari yang berlaku.

Jangan membuat structured data yang tidak merepresentasikan konten yang terlihat.

### 12.4 Technical SEO

Target:

- crawlable;
- indexable;
- semantic HTML;
- fast initial load;
- responsive;
- accessible;
- image optimization;
- sitemap XML;
- robots.txt;
- redirect/canonical discipline;
- noindex hanya pada halaman yang memang tidak ditujukan untuk pencarian.

---

## 13. AI Discoverability / Answer Engine Readiness

Tujuannya bukan "mengakali AI", tetapi membuat informasi organisasi **mudah dipahami dan dikutip** oleh sistem pencarian dan answer engine.

### Requirements

1. Halaman "Tentang Kami" harus menjelaskan organisasi secara eksplisit dalam bahasa natural.
2. "Apa yang dilakukan?", "Limbah apa yang diterima?", "Bagaimana donasi diproses?", dan "Hasilnya digunakan untuk apa?" harus mempunyai jawaban langsung.
3. Gunakan heading deskriptif, bukan heading abstrak seperti "Make It Matter" tanpa konteks.
4. Satu konsep penting sebaiknya dapat dipahami tanpa harus membaca halaman lain.
5. Gunakan data yang terstruktur dan konsisten antara halaman, API, dan dashboard publik.
6. Nama organisasi, program, lokasi, kategori limbah, dan definisi metric harus konsisten.
7. Hindari copy yang terlalu metaforis untuk informasi factual. Storytelling boleh emosional; fakta harus eksplisit.
8. Publikasikan tanggal laporan dan konteks periode statistik.
9. Bila ada klaim dampak, sediakan sumber atau halaman penjelasan.

### Target kualitas

Seseorang yang belum mengenal organisasi harus dapat menjawab 5 pertanyaan berikut setelah membaca website:

```text
1. Siapa kalian?
2. Apa yang bisa saya donasikan?
3. Apa yang kalian lakukan terhadap limbah tersebut?
4. Bagaimana hasilnya membantu orang lain?
5. Bagaimana saya bisa memverifikasi dampaknya?
```

---

## 14. Accessibility Requirements

Target awal: **WCAG 2.2 AA sebagai arah implementasi**, dengan pengujian nyata di browser dan perangkat.

Minimal:

- keyboard navigable;
- visible focus state;
- semantic HTML;
- form labels jelas;
- error messages informatif;
- contrast cukup;
- target sentuh nyaman di mobile;
- jangan mengandalkan warna saja untuk status;
- reduced motion support;
- alt text yang tepat.

---

## 15. Performance Requirements

Prinsipnya: **impact storytelling tidak boleh mengorbankan usability.**

Target produk:

- gambar dikompresi dan responsive;
- lazy-load untuk media non-kritis;
- font tidak berlebihan;
- JavaScript tidak dikirim tanpa alasan;
- first viewport cepat tampil;
- halaman inti tetap usable pada koneksi mobile yang tidak ideal.

Core Web Vitals akan menjadi bagian dari acceptance criteria setelah stack teknis dipilih.

---

## 16. Trust & Safety Requirements

Karena produk menyangkut limbah, uang hasil penjualan, dan penerima manfaat, trust harus dibangun sejak level data.

### Wajib

- status donasi memiliki audit trail;
- perubahan berat aktual tercatat;
- transaksi penjualan dapat ditelusuri;
- alokasi sosial mempunyai sumber dan tujuan;
- beneficiary memiliki privacy boundary;
- bukti bantuan hanya dipublikasikan dengan izin dan dasar yang sesuai;
- data pribadi tidak ditampilkan ke publik secara default.

### Forbidden

- mempublikasikan alamat pribadi penerima;
- menggunakan foto penerima tanpa izin yang sesuai;
- membuat angka impact yang tidak berasal dari data;
- menyamarkan biaya operasional sebagai dana sosial;
- mengklaim bahwa suatu donasi "pasti" membiayai kebutuhan tertentu bila hubungan datanya belum terverifikasi.

---

## 17. Information Architecture Principle

Setiap halaman harus menjawab **satu pekerjaan utama**.

Contoh:

| Halaman | Pekerjaan utama |
|---|---|
| Home | Memahami misi dan terdorong untuk menjelajah |
| Cara Kerja | Memahami mekanisme secara cepat |
| Donasikan Limbah | Menyelesaikan proses donasi |
| Tracking | Mengetahui status donasi |
| Dampak | Memahami hasil kolektif |
| Program Sosial | Memahami penerima manfaat dan kebutuhan |
| Produk | Membeli produk |
| Transparansi | Memverifikasi angka dan alokasi |
| Collection Point | Menemukan titik penyerahan |
| Dashboard | Memahami kontribusi pribadi |
| Admin | Mengelola operasional |

---

## 18. MVP Acceptance Criteria

MVP dianggap berhasil ketika:

### User

- user dapat memahami konsep tanpa penjelasan manual;
- user dapat menemukan jenis limbah yang diterima;
- user dapat membuat donasi melalui mobile;
- user dapat memilih pickup/drop-off;
- user mendapat donation ID;
- user dapat melihat tracking;
- user dapat melihat impact pribadi;
- user dapat menemukan program sosial;
- user dapat memahami hubungan limbah → produk → dampak.

### Admin

- admin dapat memverifikasi donasi;
- operator dapat mencatat berat aktual;
- inventory dapat berubah berdasarkan transaksi operasional;
- production batch dapat mengonsumsi inventory;
- produk dapat dikaitkan ke batch;
- penjualan dapat tercatat;
- social allocation dapat dicatat;
- public transparency dapat dihasilkan dari data.

### Quality

- mobile responsive;
- keyboard accessible;
- SEO metadata lengkap;
- sitemap dan robots tersedia;
- tidak ada copy placeholder pada production page;
- tidak ada fabricated statistics;
- setiap CTA utama benar-benar berfungsi.

---

## 19. Success Metrics

Metric awal sebaiknya fokus pada **perilaku nyata**, bukan vanity metrics.

### Acquisition

- organic search impressions;
- organic sessions;
- branded vs non-branded discovery;
- landing-to-action rate.

### Donation

- donation start rate;
- donation completion rate;
- pickup completion rate;
- drop-off completion rate;
- repeat donor rate.

### Impact

- total limbah yang benar-benar diterima;
- processing completion rate;
- product conversion;
- sell-through;
- social allocation;
- program completion.

### Trust

- transparency page engagement;
- report views;
- tracking views;
- support/contact rate terkait status donasi.

---

## 20. Product Principles

### Principle 01 — Waste has a second life

Jangan berhenti pada narasi "sampah dibuang". Tunjukkan perjalanan nilai.

### Principle 02 — Hope, not pity

Cerita penerima manfaat harus menjaga martabat mereka.

### Principle 03 — Evidence over slogans

Klaim tanpa data tidak dianggap sebagai bukti.

### Principle 04 — Simple first

Donasi harus mudah bahkan bagi orang yang baru pertama kali berkunjung.

### Principle 05 — Every interface earns its place

Tidak ada section hanya karena template memilikinya.

### Principle 06 — Human words, factual data

Storytelling boleh menyentuh. Informasi operasional harus jelas.

### Principle 07 — Transparency is a product feature

Bukan halaman legal yang hanya dibuka sesekali.

### Principle 08 — Design for real devices

Mobile, low bandwidth, accessibility, dan touch interaction dipikirkan sejak awal.

---

## 21. Open Decisions

Hal berikut sengaja belum dikunci agar tidak membuat keputusan palsu terlalu dini:

1. Nama final brand.
2. Logo dan identitas visual final.
3. Kota/area operasional awal.
4. SOP penerimaan tiap jenis limbah.
5. Teknologi pengolahan aktual per kategori.
6. Pricing produk.
7. Formula biaya produksi dan operasional.
8. Formula social allocation.
9. Payment gateway yang digunakan.
10. Apakah pickup dilakukan internal atau mitra logistik.
11. Regulasi/izin yang relevan terhadap aktivitas operasional.
12. Stack frontend/backend final.

---

## 22. Next Documents

Urutan dokumen proyek:

```text
RPD.md              ← current
   ↓
ARSITEKTUR.md       → system + information architecture
   ↓
WIREFRAME.md        → screen-by-screen layout
   ↓
TASK.md             → implementation backlog
   ↓
AGENTS.md           → aturan kerja AI/coding agent
```

`RPD.md` adalah source of truth untuk **mengapa produk ini dibuat, siapa yang dilayani, experience seperti apa yang dituju, dan standar kualitas yang harus dijaga**.

---

## 23. Reference Note

Prinsip anti-slop yang dipakai sebagai quality filter dalam dokumen ini merujuk pada proyek open-source **anti-slop** yang menjelaskan bahwa filter tersebut bertujuan mencegah UI/copy generik, sementara arah visual tetap harus datang dari dokumen desain produk sendiri. citeturn345686search0turn345686search2

---
