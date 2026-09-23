import type { OrganizationContent } from "./types";

/**
 * Content for `/tentang-kami` (Phase 2, P0-203). Mission/vision/values are
 * derived from the documented brand identity and product principles in
 * `.agents/RPD.md` and `.agents/CONTENT.md` — not invented. Team/
 * organization structure is intentionally omitted: per AGENTS.md §4.3, no
 * names, roles, or org structure may be fabricated, and no verified data
 * for that section exists yet.
 */
export const organizationContent: OrganizationContent = {
  mission:
    "Mengubah limbah rumah tangga yang masih bisa dikelola — minyak jelantah, sisa organik dapur, dan plastik tertentu — menjadi produk bernilai, sekaligus menjadikan proses pengolahannya sebagai ruang belajar, berkarya, dan bertumbuh bagi anak-anak difabel.",
  vision:
    "Sebab setiap potensi butuh ruang untuk bermula: bahwa yang kami tumbuhkan bukan hanya tanaman, melainkan ruang belajar, karya nyata, dan kemandirian yang setara.",
  values: [
    {
      title: "Martabat, bukan belas kasihan",
      description:
        "Anak-anak difabel yang terlibat dalam program ini adalah pribadi dengan kemampuan dan mimpi yang layak mendapat ruang untuk tumbuh — bukan penerima bantuan pasif.",
    },
    {
      title: "Bukti, bukan klaim",
      description:
        "Setiap donasi dicatat dengan nomor referensi yang bisa dilacak. Perkiraan jumlah dari donatur dan jumlah aktual setelah verifikasi selalu dibedakan secara jujur.",
    },
    {
      title: "Sederhana sejak langkah pertama",
      description:
        "Donasi tidak memerlukan uang maupun akun. Siapa pun bisa mulai dari bahan yang sudah ada di rumah hari ini.",
    },
    {
      title: "Sirkular, bukan sekali pakai",
      description:
        "Limbah yang diterima diarahkan kembali ke dalam siklus: menjadi produk, mendukung kebun smart farming, dan pada akhirnya kembali sebagai manfaat sosial.",
    },
  ],
  operationalApproach:
    "Limbah yang diterima melalui titik penyerahan atau penjemputan diverifikasi ulang jumlahnya, diolah bersama anak-anak difabel sebagai bagian dari kegiatan mereka, lalu diarahkan menjadi produk atau bahan pendukung kebun smart farming milik komunitas.",
};
