# Alur Donasi End-to-End — KITA TUMBUH / Kampung Smart Farming

Dokumen ini menjelaskan perjalanan satu donasi dari saat donor mengisi formulir hingga hasilnya muncul sebagai angka dampak publik, sesuai implementasi kode saat ini (bukan rencana). Setiap tahap mencantumkan aktor, apa yang terjadi di sistem, dan berkas kode yang bertanggung jawab, supaya dokumen ini bisa diverifikasi ulang terhadap kode kapan saja.

> **Catatan penting yang berlaku di seluruh alur ini:** sejak tahap pengolahan, sistem menggunakan **akuntansi pooled** — limbah dan dana dari banyak donasi digabung sebelum diproses/dialokasikan. Tidak ada donasi tunggal yang bisa ditelusuri satu-lawan-satu menjadi satu produk atau satu alokasi dana sosial tertentu. Ini bukan keterbatasan tampilan, melainkan desain skema database yang disengaja — lihat bagian [Mengapa Tidak Ada Pelacakan 1:1](#mengapa-tidak-ada-pelacakan-11) di akhir dokumen.

---

## Ringkasan Alur

```text
DONOR                    OPERATOR/ADMIN                    SISTEM
  │                            │                              │
  ├─ Isi wizard 4 langkah      │                              │
  ├─ Submit donasi ────────────┼──────────────────────────────┤
  │                            │                    Simpan donations (SUBMITTED)
  │                            │                    Buat nomor referensi unik
  │  ◄── Halaman sukses + link tracking & receipt ─────────────┤
  │                            │                              │
  │                     Verifikasi fisik limbah                │
  │                     (timbang ulang, catat hasil)            │
  │                            ├──────────────────────────────►│
  │                            │                    Update donations (VERIFIED/REJECTED)
  │                            │                              │
  │                     Update status lanjutan                 │
  │                     (SCHEDULED→COLLECTED→SORTED→            │
  │                      PROCESSED→CONVERTED→IMPACTED)          │
  │                            ├──────────────────────────────►│
  │                            │                              │
  │                     Alokasikan lot limbah ke batch produksi │
  │                            ├──────────────────────────────►│
  │                            │                    Kurangi stok lot (atomik)
  │                            │                              │
  │                     Buat produk dari hasil olahan           │
  │                            ├──────────────────────────────►│
  │                            │                              │
  PEMBELI                      │                              │
  ├─ Pesan produk ─────────────┼──────────────────────────────►│
  │                            │                    Simpan order (PENDING_PAYMENT)
  │                     Konfirmasi pembayaran diterima          │
  │                            ├──────────────────────────────►│
  │                            │                    order → PAID, stok berkurang
  │                            │                    revenue_entries tercatat otomatis
  │                            │                              │
  │                     Alokasikan pendapatan ke program sosial │
  │                            ├──────────────────────────────►│
  │                            │                    social_allocations tercatat
  │                            │                              │
  │                     Catat penyaluran ke penerima manfaat    │
  │                            ├──────────────────────────────►│
  │                            │                    distributions tercatat
  │                            │                              │
PUBLIK                         │                              │
  ├─ Buka /dampak, /transparansi ─────────────────────────────►│
  │  ◄── Angka agregat terverifikasi (bukan estimasi) ─────────┤
```

---

## Tahap 1 — Donor Mengisi Formulir Donasi

**Aktor:** Donor (boleh anonim, tidak wajib punya akun).
**Lokasi:** `/donasikan`, komponen `components/donation/DonationWizard.tsx`.

Wizard terdiri dari 4 langkah:

1. **Pilih Jenis Limbah** — donor memilih satu jenis limbah yang diterima (misalnya minyak jelantah atau limbah organik).
2. **Perkiraan Jumlah** — donor memasukkan estimasi jumlah dalam satuan yang sesuai (liter/kilogram), dibatasi jumlah minimum dan maksimum per jenis limbah.
3. **Metode Penyerahan** — donor memilih salah satu:
   - **Drop-off**: memilih titik penyerahan (collection point) yang aktif dan menerima jenis limbah tersebut.
   - **Pickup**: mengisi alamat penjemputan lengkap, tanggal (minimal besok), dan slot waktu.
4. **Konfirmasi** — meninjau seluruh isian sebelum mengirim.

Validasi dilakukan dua kali: di browser (untuk pengalaman langsung) dan **diulang penuh di server** — server tidak pernah mempercayai input dari client begitu saja.

### Apa yang terjadi saat tombol "Kirim Donasi" ditekan

1. Sebuah **kunci idempotency** (UUID) dibuat dari sidik jari (hash) isi formulir dan disimpan sementara di `sessionStorage` browser (`lib/donation-submission.ts`). Kalau donor menekan submit dua kali atau koneksi terputus lalu retry, sistem mengenali ini sebagai percobaan yang sama dan tidak membuat donasi ganda.
2. Server (`lib/domain/donations.ts`, fungsi `createDonation`) menjalankan urutan berikut:
   - Validasi ulang seluruh data dengan Zod.
   - Cek kunci idempotency — jika donasi dengan kunci yang sama sudah ada, kembalikan data yang sudah ada (bukan membuat baru).
   - Validasi ulang jenis limbah masih aktif, dan jumlah masih dalam batas min/maks.
   - Untuk drop-off: pastikan titik penyerahan aktif dan genuinely menerima jenis limbah tersebut.
   - Buat **nomor referensi** unik lewat prosedur database khusus (`generate_donation_reference`), format `DON-{tahun}-{5 digit urut}` — dibuat atomik di database sehingga tidak mungkin dua donasi mendapat nomor yang sama meski dikirim bersamaan.
   - Simpan baris baru ke tabel `donations` dengan status **`SUBMITTED`**.
   - Jika metode pickup, simpan detail alamat ke tabel `pickup_requests` terpisah.
3. Data alamat/kontak donor **tidak pernah dikirim balik** ke browser setelah tersimpan — hanya nomor referensi dan ringkasan publik yang aman dibagikan.

**Halaman yang ditampilkan setelah sukses** (`components/donation/DonationSuccess.tsx`): bukti donasi ringkas, langkah selanjutnya (beda teks untuk drop-off vs pickup), dan tiga tombol: lacak status, bagikan bukti donasi, atau kembali ke beranda.

---

## Tahap 2 — Verifikasi Fisik oleh Operator

**Aktor:** Admin/operator dengan izin `donations:write`.
**Lokasi:** `/admin/donations/[reference]`, form `DonationVerificationForm`, fungsi `verifyDonationAction` (`lib/domain/admin/donations.ts`).

Saat limbah benar-benar diterima (baik lewat drop-off maupun pickup), operator:

1. Menimbang/mengukur ulang jumlah fisik yang **benar-benar diterima** — ini disimpan terpisah dari estimasi donor sebagai `verified_quantity`.
2. Menulis catatan verifikasi wajib (misalnya kondisi bahan, alasan jika ditolak).
3. Memutuskan **VERIFIED** (diterima) atau **REJECTED** (ditolak, misalnya kandungan air terlalu tinggi).

Begitu diputuskan, status donasi langsung berubah menjadi `VERIFIED` atau `REJECTED`, dan jumlah estimasi awal donor tetap tersimpan apa adanya untuk perbandingan — sistem tidak pernah menimpa estimasi donor dengan angka hasil verifikasi, keduanya adalah dua kolom terpisah.

**Prinsip penting:** angka yang nantinya boleh dipakai sebagai klaim dampak publik **hanya `verified_quantity`**, tidak pernah `estimated_quantity`.

---

## Tahap 3 — Progres Lanjutan Donasi

**Aktor:** Admin/operator.
**Lokasi:** form `DonationStatusForm`, fungsi `updateDonationStatusAction`.

Setelah terverifikasi, status donasi bergerak maju melalui tahapan berikut (dan hanya boleh maju satu langkah setiap kali, divalidasi server):

```text
SUBMITTED → SCHEDULED → COLLECTED → VERIFIED → SORTED → PROCESSED → CONVERTED → IMPACTED
```

Pengecualian: donasi drop-off boleh melompati `SCHEDULED` langsung dari `SUBMITTED` ke `COLLECTED` (karena tidak perlu dijadwalkan penjemputan). Status `REJECTED` bisa terjadi dari tahap manapun sebelum `CONVERTED`, tapi tidak bisa terjadi setelah donasi sudah dikonversi jadi produk.

Sistem menolak setiap upaya mengubah status secara tidak berurutan (misalnya melompat langsung dari `SUBMITTED` ke `IMPACTED`, atau mundur dari status lanjut ke status awal) — baik dari sisi antarmuka (pilihan yang ditampilkan otomatis disaring) maupun dari sisi server (ditolak meski request dipaksa langsung ke server).

Donor dapat memantau progres ini kapan saja lewat `/donasi/{reference}` — halaman ini menampilkan linimasa visual dengan penjelasan tiap tahap, tanpa membocorkan data internal (alamat, kontak, catatan operator).

---

## Tahap 4 — Limbah Masuk Inventaris dan Produksi

**Aktor:** Admin/operator produksi dengan izin `production:write`.
**Lokasi:** `/admin/production`, fungsi `addBatchInputAction` dan `updateBatchStatusAction` (`lib/domain/admin/production.ts`).

Ini adalah **titik di mana pelacakan individual donasi berhenti dan akuntansi pooled dimulai**. Limbah yang sudah terverifikasi masuk ke gudang sebagai "lot inventaris" (`waste_lots`) — satu lot bisa berisi hasil gabungan dari banyak donasi berbeda yang jenis limbahnya sama.

1. Operator mengalokasikan sebagian atau seluruh isi satu lot ke sebuah **batch produksi**. Pengurangan stok lot dilakukan secara atomik (mengunci baris database selama transaksi) sehingga dua operator yang bekerja bersamaan tidak bisa mengalokasikan stok yang sama dua kali.
2. Batch produksi berjalan melalui statusnya sendiri: `PLANNED → IN_PROGRESS → QC_REVIEW → COMPLETED → RELEASED`.
3. Setelah batch selesai, admin mencatat produk hasil olahan (`createProductAction`) — produk ini **boleh** ditautkan secara longgar ke satu batch produksi untuk keperluan riwayat, tapi jumlah stok produk diinput manual oleh admin, bukan dihitung otomatis dari jumlah keluaran batch.

---

## Tahap 5 — Penjualan Produk

**Aktor:** Pembeli (bisa anonim atau member), lalu admin untuk konfirmasi pembayaran.
**Lokasi:** `/produk/{slug}` untuk memesan, `/admin/orders` untuk konfirmasi. Fungsi `createOrderAction` (`lib/domain/orders.ts`) dan `confirmOrderPaymentAction` (`lib/domain/admin/orders.ts`).

1. Pembeli memilih produk dan jumlah. **Harga selalu diambil dari database di server**, tidak pernah dipercaya dari input browser. Sistem memvalidasi stok cukup, lalu menyimpan pesanan dengan status `PENDING_PAYMENT` — stok **belum** dikurangi pada tahap ini.
2. Pembeli mentransfer sesuai instruksi pembayaran manual yang ditampilkan.
3. Admin memeriksa mutasi rekening, lalu menekan konfirmasi pembayaran. Satu operasi atomik di database kemudian:
   - Mengunci dan memvalidasi stok tiap produk dalam pesanan.
   - Mengurangi stok.
   - Mengubah status pesanan menjadi `PAID`.
   - Sebuah pemicu otomatis di database langsung mencatat baris baru ke **buku besar pendapatan** (`revenue_entries`) sebesar total pesanan — tanpa perlu langkah manual tambahan, dan tidak bisa tercatat dua kali untuk pesanan yang sama.

Admin **tidak bisa** menandai pesanan lunas lewat jalur status umum lainnya — hanya lewat tombol konfirmasi pembayaran khusus ini, memastikan pengurangan stok dan pencatatan pendapatan selalu terjadi bersamaan, tidak pernah sebagian saja.

---

## Tahap 6 — Alokasi Dana ke Program Sosial

**Aktor:** Admin dengan izin `finance:write`.
**Lokasi:** `/admin/finance/allocations`, fungsi `allocateRevenueAction` (`lib/domain/admin/finance.ts`).

Admin mengalokasikan sejumlah dana dari **saldo pendapatan yang tersedia** — dihitung sebagai total seluruh pendapatan terverifikasi dikurangi total seluruh alokasi yang sudah disetujui sebelumnya. Sistem menolak permintaan alokasi yang melebihi saldo tersedia, divalidasi di database (bukan hanya di aplikasi) agar dua admin yang mengalokasikan dana bersamaan tidak bisa berdua-duanya lolos melebihi saldo yang sama.

**Tidak ada hubungan langsung** antara satu baris alokasi dana dengan satu pesanan atau satu donasi tertentu — sumber dananya adalah total pendapatan yang sudah terkumpul, bukan pendapatan dari transaksi tertentu.

---

## Tahap 7 — Penyaluran ke Penerima Manfaat

**Aktor:** Admin dengan izin `social_programs:write` dan `beneficiaries:write`.
**Lokasi:** `/admin/social/distributions`, fungsi `createDistributionAction` (`lib/domain/admin/distributions.ts`).

Admin mencatat penyaluran dana dan/atau barang ke penerima manfaat spesifik, dikaitkan ke sebuah program sosial dan (opsional) ke alokasi dana tertentu. Jika dikaitkan ke sebuah alokasi, sistem memvalidasi jumlah penyaluran tidak melebihi sisa alokasi tersebut yang belum disalurkan — juga divalidasi atomik di database. Distribusi barang hasil produksi (bukan uang) juga bisa dicatat tanpa harus terkait ke alokasi dana sama sekali.

Data penerima manfaat bersifat sensitif dan **tidak pernah** diekspos ke halaman publik — hanya bisa diakses admin/petugas sosial yang berwenang.

---

## Tahap 8 — Angka Dampak Muncul di Halaman Publik

**Aktor:** Sistem (dipicu setiap kali seseorang membuka halaman publik).
**Lokasi:** `/dampak`, `/transparansi`. Logika di `lib/domain/impact/public-impact.ts` dan `lib/domain/impact/definitions.ts`.

Setiap kali halaman `/dampak` atau `/transparansi` dibuka, sistem menghitung ulang secara langsung (bukan dari cache statis) angka-angka berikut, semuanya hanya dari data **yang sudah terverifikasi**:

| Metrik | Sumber data |
|---|---|
| Minyak jelantah diterima | Jumlah hasil verifikasi fisik donasi minyak jelantah (status ≥ `VERIFIED`) |
| Limbah organik diterima | Jumlah hasil verifikasi fisik donasi limbah organik |
| Limbah diproses | Jumlah bahan baku yang benar-benar sudah dipakai batch produksi yang selesai |
| Batch produksi selesai | Jumlah batch berstatus `COMPLETED`/`RELEASED` |
| Alokasi dana sosial | Total dana yang sudah disetujui dialokasikan ke program sosial |
| Program sosial | Jumlah program yang aktif/didanai dan memang dipublikasikan |
| Donasi terverifikasi | Jumlah donasi yang sudah lolos verifikasi fisik |

Kalau data untuk suatu metrik belum ada, halaman menampilkan "Belum ada data" — **tidak pernah** menampilkan angka nol yang bisa disalahartikan sebagai hasil hitungan nyata. Perkiraan donor (`estimated_quantity`) tidak pernah dipakai untuk angka ini, hanya hasil verifikasi fisik yang boleh.

---

## Mengapa Tidak Ada Pelacakan 1:1

Ditegaskan berulang kali di kode dan tampilan (bukan hanya kebijakan tertulis): **tidak ada satu pun kolom di database yang menghubungkan langsung satu baris donasi ke satu produk, satu alokasi dana, atau satu penyaluran ke penerima manfaat tertentu.**

Rantai koneksi selalu melalui data agregat:

- Sisi bahan: `donations` (individual) → `waste_lots` (gabungan banyak donasi) → `batch_inputs` (dipakai banyak batch produksi) → `products` (ditautkan longgar ke batch, jumlah stok input manual).
- Sisi uang: `orders` (individual) → `revenue_entries` (dicatat otomatis per pesanan) → **dijumlahkan menjadi satu saldo total** → `social_allocations` (diambil dari saldo total, bukan dari pesanan tertentu) → `distributions` (diambil dari sisa alokasi, bukan dari donasi tertentu).

Ini bukan kelalaian atau keterbatasan tampilan — ini adalah keputusan desain yang disengaja karena mencerminkan kenyataan operasional: bahan dari banyak donasi dicampur dan diproses bersama demi efisiensi, dan pendapatan dari banyak transaksi digabung sebelum sebagian dialokasikan untuk program sosial. Mengklaim hubungan 1:1 yang sebenarnya tidak ada akan menjadi bentuk representasi yang menyesatkan — karena itu sistem secara sengaja tidak dirancang untuk itu, dan setiap halaman yang menampilkan angka dampak menyatakan hal ini secara eksplisit kepada pengguna.
