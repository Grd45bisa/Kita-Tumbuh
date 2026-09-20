import type { WasteTypePreview } from "./types";

/**
 * Homepage preview copy for accepted waste categories. This is editorial
 * content, distinct from `lib/domain/waste-types.ts`, which queries the
 * live `waste_types` table (used by the donation flow and, later,
 * `/cara-kerja` and `/faq` for real accepted/rejected notes).
 */
export const acceptedWastePreview: WasteTypePreview[] = [
  {
    icon: "drop",
    title: "Minyak jelantah",
    description: "Minyak bekas menggoreng dari rumah atau usaha kuliner.",
    preparation: "Dinginkan, saring, lalu simpan dalam botol tertutup. Jangan dicampur air.",
    tag: "Paling dibutuhkan",
  },
  {
    icon: "leaf",
    title: "Sampah organik",
    description: "Kulit buah, sisa sayur mentah, ampas kopi, dan dedaunan.",
    preparation: "Pisahkan dari kuah, plastik, dan bahan kimia. Simpan dalam wadah tertutup.",
    tag: "Diterima terpilah",
  },
  {
    icon: "bottle",
    title: "Plastik tertentu",
    description: "Botol PET bening dan jeriken plastik yang masih layak digunakan.",
    preparation: "Kosongkan, bilas hingga bersih, lalu keringkan sebelum diserahkan.",
    tag: "Sesuai kebutuhan",
  },
];
