import type { JourneyStep } from "./types";

/**
 * Homepage "cara kerja" preview — the short 4-step version shown inline on
 * the homepage.
 */
/**
 * Homepage "cara kerja" preview — the 5-step SEMAI circular loop
 * per SEMAI_Room_to_Grow_Website_Reference.md §06:
 * Sisihkan -> Donasikan -> Kembalikan -> Tumbuhkan -> Lihat Hasilnya
 */
export const homepageJourney: JourneyStep[] = [
  {
    number: "01",
    title: "Sisihkan",
    description: "Pisahkan sisa organik dapur, minyak jelantah, dan wadah plastik sesuai petunjuk dari rumah.",
  },
  {
    number: "02",
    title: "Donasikan",
    description: "Serahkan langsung ke titik pengumpulan SEMAI terdekat atau ajukan penjemputan berkala.",
  },
  {
    number: "03",
    title: "Kembalikan",
    description: "Sisa organik diolah jadi kompos bernutrisi; jelantah dan plastik disalurkan ke mitra daur ulang resmi.",
  },
  {
    number: "04",
    title: "Tumbuhkan",
    description: "Kompos menyuburkan kebun inklusif yang menjadi ruang nyata belajar, berlatih, dan berkarya bagi anak-anak.",
  },
  {
    number: "05",
    title: "Lihat Hasilnya",
    description: "Pantau dampak kontribusimu secara transparan dari bobot timbangan hingga hasil panen lewat Jejak Tumbuh.",
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
