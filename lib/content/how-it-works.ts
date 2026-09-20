import type { JourneyStep } from "./types";

/**
 * Homepage "cara kerja" preview — the short 4-step version shown inline on
 * the homepage.
 */
export const homepageJourney: JourneyStep[] = [
  {
    number: "01",
    title: "Pilah dari rumah",
    description: "Satu botol jelantah atau satu wadah sampah terpilah sudah menjadi awal yang berarti.",
  },
  {
    number: "02",
    title: "Serahkan kepada kami",
    description: "Isi formulir donasi agar tim dapat mengarahkan cara penyerahan yang tersedia.",
  },
  {
    number: "03",
    title: "Diolah bersama",
    description: "Bahan dibersihkan, dipilah, lalu diolah menjadi produk berguna dan bahan pendukung kebun.",
  },
  {
    number: "04",
    title: "Manfaatnya kembali",
    description: "Hasil pengolahan dan penjualan mendukung ruang belajar, berkarya, dan bertumbuh bersama.",
  },
];

/**
 * Full 6-stage explanation for `/cara-kerja` (Phase 2, P0-202), per
 * WIREFRAME.md §4.2 and the Core Product Loop in TASK.md §24. Each stage
 * maps to a real, traceable step in the donation lifecycle
 * (`types/donation.ts` DonationStatus / AGENTS.md §11), not an aspirational
 * one — e.g. "penjualan" and "alokasi sosial" are described as the intended
 * destination of the process, not claimed as something already measured
 * (that requires Phase 5-8 operational backend, not yet built).
 */
export const howItWorksSteps: JourneyStep[] = [
  {
    number: "01",
    title: "Donasikan",
    description:
      "Pilah minyak jelantah, limbah organik dapur, atau plastik tertentu dari rumah, lalu ajukan donasi lewat formulir — pilih diantar sendiri ke titik penyerahan atau dijemput.",
  },
  {
    number: "02",
    title: "Kami kumpulkan & verifikasi",
    description:
      "Saat limbah diterima, jumlahnya ditimbang ulang oleh tim kami. Perkiraan yang kamu isi di formulir bukan angka final — berat/volume aktual dicatat terpisah setelah verifikasi.",
  },
  {
    number: "03",
    title: "Kami olah",
    description:
      "Limbah yang sudah terverifikasi dipilah lagi sesuai jenisnya, lalu diproses bersama anak-anak difabel sebagai bagian dari kegiatan belajar dan berkarya.",
  },
  {
    number: "04",
    title: "Menjadi produk bernilai",
    description:
      "Hasil pengolahan diarahkan menjadi produk seperti lilin aromaterapi, sabun alami, atau kompos untuk kebun smart farming kami.",
  },
  {
    number: "05",
    title: "Produk dijual",
    description:
      "Produk yang layak jual ditawarkan kepada publik. Penjualan tercatat sebagai bagian dari siklus ekonomi sirkular yang mendukung program ini berjalan berkelanjutan.",
  },
  {
    number: "06",
    title: "Hasil dialokasikan ke sosial",
    description:
      "Sebagian hasil ekonomi dari penjualan dan kebun diarahkan untuk mendukung ruang belajar, berkarya, dan kemandirian anak-anak difabel.",
  },
];
