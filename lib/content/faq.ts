import type { FaqItem } from "./types";

/**
 * FAQ content for `/faq` (Phase 2, P1-210). Answers are written from what
 * the product actually does today — the real donation flow
 * (`components/donation/DonationWizard.tsx`, `lib/domain/donations.ts`),
 * the real lifecycle (`types/donation.ts` DonationStatus), and real
 * database constraints (`supabase/migrations/001_donation_foundation.sql`)
 * — not aspirational claims. Where a topic depends on backend work that
 * does not exist yet (e.g. detailed public impact numbers), the answer
 * says so honestly instead of inventing a figure.
 */
export const faqItems: FaqItem[] = [
  {
    category: "donasi",
    question: "Apakah donasi limbah ini gratis?",
    answer:
      "Ya. Kamu tidak perlu membayar apa pun untuk mendonasikan limbah. Kamu juga tidak perlu membuat akun — cukup isi formulir donasi dan pilih cara penyerahannya.",
  },
  {
    category: "donasi",
    question: "Bagaimana cara memulai donasi?",
    answer:
      'Buka halaman "Donasikan Limbah", pilih jenis limbah yang kamu punya, isi perkiraan jumlahnya, lalu pilih apakah kamu ingin mengantar sendiri ke titik penyerahan atau dijemput. Setelah donasi dikonfirmasi, kamu akan mendapat nomor referensi untuk melacak statusnya.',
  },
  {
    category: "limbah",
    question: "Limbah apa saja yang bisa didonasikan?",
    answer:
      "Saat ini kami menerima minyak jelantah, limbah organik dapur tertentu, dan plastik wadah tertentu (jeriken HDPE dan botol PET bersih). Setiap jenis punya syarat penyiapan dan batas jumlah yang berbeda — lihat detailnya di halaman Cara Kerja.",
  },
  {
    category: "limbah",
    question: "Limbah apa yang tidak diterima?",
    answer:
      "Kami belum dapat menerima limbah medis, oli kendaraan/mesin, cairan kimia, kemasan bahan berbahaya, plastik kresek atau styrofoam, dan sampah rumah tangga yang tercampur. Detail lengkap per jenis limbah ada di halaman Cara Kerja.",
  },
  {
    category: "pickup-dropoff",
    question: "Apa bedanya antar sendiri (drop-off) dan dijemput (pickup)?",
    answer:
      "Drop-off berarti kamu mengantar langsung limbahmu ke salah satu titik penyerahan sesuai jam operasionalnya. Pickup berarti tim kami menjemput ke alamatmu pada tanggal dan slot waktu yang kamu pilih saat mengisi formulir donasi.",
  },
  {
    category: "pickup-dropoff",
    question: "Di mana titik penyerahan (collection point) terdekat?",
    answer:
      "Semua titik penyerahan yang aktif, beserta jenis limbah yang diterima dan jam operasionalnya, bisa dilihat di halaman Titik Penyerahan.",
  },
  {
    category: "pengolahan",
    question: "Apakah jumlah yang saya isi di formulir menjadi jumlah final?",
    answer:
      "Tidak. Jumlah yang kamu isi adalah perkiraan. Jumlah aktual dicatat terpisah saat limbah diterima dan diverifikasi oleh tim kami — dua angka ini sengaja dibedakan agar catatan donasi tetap akurat.",
  },
  {
    category: "pengolahan",
    question: "Diolah menjadi apa limbah yang saya donasikan?",
    answer:
      "Minyak jelantah diarahkan menjadi produk seperti lilin aromaterapi dan sabun alami. Limbah organik diolah menjadi kompos untuk mendukung kebun smart farming kami. Prosesnya dikerjakan bersama anak-anak difabel sebagai bagian dari kegiatan belajar dan berkarya.",
  },
  {
    category: "dampak",
    question: "Bagaimana saya tahu limbah saya benar-benar diproses?",
    answer:
      "Setiap donasi mendapat nomor referensi yang bisa kamu gunakan untuk melacak statusnya, mulai dari diterima hingga tahap pengolahan berikutnya.",
  },
  {
    category: "dampak",
    question: "Apakah ada angka dampak publik yang bisa saya lihat?",
    answer:
      "Kami sedang membangun sistem agregasi data dampak publik agar angka yang ditampilkan benar-benar berasal dari catatan terverifikasi, bukan perkiraan. Halaman Dampak dan Transparansi akan diperbarui begitu sistem ini siap.",
  },
  {
    category: "produk",
    question: "Bisakah saya membeli produk hasil olahan limbah?",
    answer:
      "Katalog produk sedang kami siapkan. Untuk saat ini, cara utama berkontribusi adalah dengan mendonasikan limbahmu langsung.",
  },
  {
    category: "privasi",
    question: "Apakah data pribadi saya aman?",
    answer:
      "Alamat pickup yang kamu isi disimpan sebagai data privat dan hanya dapat diakses oleh tim operasional kami — tidak pernah ditampilkan secara publik. Donasi bisa dilakukan tanpa membuat akun, dan kamu bisa memilih untuk tidak mencantumkan nama/kontak jika ingin tetap anonim.",
  },
];
