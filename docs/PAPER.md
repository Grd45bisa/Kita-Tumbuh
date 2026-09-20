# KITA TUMBUH / Kampung Smart Farming
### Ringkasan Konsep dan Implementasi Platform Circular Economy Berbasis Dampak Sosial

---

## Abstrak

KITA TUMBUH adalah gerakan sosial yang mengoperasikan platform **Kampung Smart Farming**: sebuah sistem yang mengubah limbah rumah tangga — terutama minyak jelantah dan sampah organik dapur — menjadi produk bernilai jual, sambil menjadikan proses pengolahannya sebagai ruang belajar dan berkarya bagi anak-anak difabel. Hasil penjualan produk dialokasikan sebagian untuk mendanai program pemberdayaan sosial. Dokumen ini merangkum masalah yang dijawab platform, cara kerjanya, dan status implementasi teknisnya saat ini.

---

## 1. Masalah

Dua persoalan yang biasanya ditangani terpisah sebenarnya bisa saling menyelesaikan satu sama lain:

1. **Limbah rumah tangga yang masih bisa diolah** — seperti minyak jelantah bekas dan sisa organik dapur — umumnya dibuang begitu saja, padahal punya nilai ekonomi jika diproses dengan benar (menjadi lilin aromaterapi, sabun, kompos, dan sejenisnya).
2. **Keterbatasan ruang berkarya dan kemandirian ekonomi bagi anak-anak difabel** — proses pengolahan limbah yang berulang dan bisa dipelajari bertahap justru cocok dijadikan aktivitas produktif yang memberi mereka ruang belajar sekaligus penghasilan bagi program yang mendukung mereka.

Tantangan tambahan yang sering muncul pada platform donasi/dampak sosial serupa adalah **kepercayaan** — donatur sulit memverifikasi apakah klaim dampak yang ditampilkan benar-benar berasal dari aktivitas nyata, atau sekadar angka pemasaran.

## 2. Pendekatan

Platform ini dibangun di atas tiga prinsip yang secara langsung membentuk arsitektur teknisnya:

**a. Pemisahan estimasi dan fakta.** Jumlah yang diperkirakan donatur saat mengirim donasi disimpan terpisah dari jumlah hasil pengukuran fisik oleh operator. Angka yang boleh diklaim sebagai dampak publik hanya yang sudah diverifikasi, tidak pernah estimasi.

**b. Akuntansi pooled yang jujur ditampilkan sebagai pooled.** Bahan dari banyak donasi digabung untuk diproses efisien, dan pendapatan dari banyak transaksi digabung sebelum sebagian dialokasikan ke program sosial. Sistem tidak berpura-pura bisa melacak "donasi si A menjadi produk B yang mendanai program C" — karena secara operasional itu tidak benar. Ketidakmungkinan pelacakan satu-lawan-satu ini dinyatakan eksplisit ke pengguna, bukan disembunyikan.

**c. Tidak ada angka yang dikarang.** Jika suatu data belum tersedia atau belum terverifikasi, antarmuka menampilkan status "belum ada data" — bukan nol yang bisa disalahartikan sebagai hasil perhitungan, dan bukan angka ilustratif yang terlihat seperti data nyata.

## 3. Cara Kerja Singkat

```text
Donasi limbah → Verifikasi fisik → Inventaris (digabung per jenis)
     → Diolah bersama anak-anak difabel menjadi produk
     → Produk dijual → Pendapatan tercatat
     → Sebagian pendapatan dialokasikan ke program sosial
     → Disalurkan ke penerima manfaat
     → Angka agregat terverifikasi ditampilkan ke publik
```

Alur teknis lengkap beserta rujukan berkas kode ada di [`ALUR_DONASI.md`](./ALUR_DONASI.md).

## 4. Status Implementasi

Sistem dibangun sebagai aplikasi web dengan Next.js (App Router) dan PostgreSQL terkelola (Supabase), memakai kontrol akses berbasis peran (role-based access control) untuk memisahkan kewenangan operator limbah, tim keuangan, dan petugas program sosial.

**Sudah berjalan penuh:** alur donasi (drop-off dan pickup) dengan pelacakan status publik; verifikasi fisik oleh operator; inventaris limbah dan produksi; katalog dan pemesanan produk dengan konfirmasi pembayaran manual; pencatatan pendapatan otomatis; alokasi dana ke program sosial dengan validasi saldo yang tidak bisa dilewati; pencatatan penyaluran ke penerima manfaat; halaman dampak dan transparansi publik yang menghitung ulang angka secara langsung dari data terverifikasi; kontrol akses berjenjang untuk staf operasional.

**Belum dibangun / sengaja ditunda:** publikasi cerita dampak dengan alur persetujuan dan verifikasi consent; peran granular penuh di luar kebutuhan dasar; laporan transparansi berkala dalam bentuk snapshot tersimpan (saat ini angka selalu dihitung langsung/live, bukan snapshot periodik); pengujian end-to-end otomatis lintas-browser.

Setiap bagian yang belum dibangun didokumentasikan secara eksplisit di dalam kode dan dokumen internal proyek (`.agents/TASK.md`), tidak diklaim selesai jika kenyataannya belum.

## 5. Prinsip Penutup

Platform ini memperlakukan kepercayaan donatur sebagai sesuatu yang harus dijaga lewat kejujuran teknis — bukan lewat tampilan yang meyakinkan. Setiap klaim yang muncul di halaman publik, dari status donasi sampai angka dampak agregat, dirancang agar bisa ditelusuri balik ke catatan operasional nyata, atau secara eksplisit dinyatakan sebagai hal yang belum tersedia.

---

*Dokumen ini adalah ringkasan naratif, bukan spesifikasi teknis lengkap. Untuk alur data end-to-end yang rinci, lihat [`ALUR_DONASI.md`](./ALUR_DONASI.md). Untuk cara menjalankan proyek, lihat [`README.md`](../README.md) di root repositori.*
