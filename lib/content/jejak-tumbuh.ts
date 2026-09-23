import type { JejakTumbuhMetric, JejakTumbuhStep } from "./types";

/**
 * Proof Mechanism: Jejak Tumbuh
 * Source: SEMAI_Room_to_Grow_Website_Reference.md §07
 * "Bukti, bukan klaim" — melacak kontribusi dari limbah hingga dampak nyata.
 */
export const jejakTumbuhContent: {
  eyebrow: string;
  title: string;
  headlineEmphasis: string;
  lead: string;
  metrics: JejakTumbuhMetric[];
  steps: JejakTumbuhStep[];
  ctaLabel: string;
  note: string;
} = {
  eyebrow: "Jejak Tumbuh · Proof Mechanism",
  title: "Jangan hanya percaya. ",
  headlineEmphasis: "Lihat perjalanannya.",
  lead: "Kami memastikan setiap kontribusi memiliki jejak yang terukur: dari penjemputan, pengolahan kompos, kebun inklusif, hingga hasil panen dan ruang belajar yang tercipta.",
  metrics: [
    {
      value: "12,8",
      unit: "kg",
      label: "Sisa Organik",
      description: "Terkumpul dan terhindar dari TPA",
    },
    {
      value: "4,6",
      unit: "kg",
      label: "Kompos Bernutrisi",
      description: "Dihasilkan melalui fermentasi alami",
    },
    {
      value: "2",
      unit: "bedeng",
      label: "Kebun Inklusif",
      description: "Disuburkan untuk ruang tanam",
    },
    {
      value: "18",
      unit: "anak",
      label: "Peserta Belajar",
      description: "Aktif berlatih dan berkarya",
    },
    {
      value: "34",
      unit: "kg",
      label: "Hasil Panen",
      description: "Sayuran segar & produk bernilai",
    },
  ],
  steps: [
    {
      step: "01",
      title: "Diterima & Terdata",
      description: "Setiap kantong atau wadah limbah dicatat dengan kode pelacakan unik tanpa harus registrasi rumit.",
      detail: "ID Referensi Digital",
    },
    {
      step: "02",
      title: "Ditimbang Akurat",
      description: "Estimasi awal dari donatur divalidasi dengan timbangan terkalibrasi untuk mencatat berat riil.",
      detail: "Verifikasi Bobot Fisik",
    },
    {
      step: "03",
      title: "Diolah di Ruang Belajar",
      description: "Bahan dipilah dan diolah bersama peserta difabel sebagai media belajar praktis yang terarah.",
      detail: "Proses Praktik Inklusif",
    },
    {
      step: "04",
      title: "Tumbuh Menjadi Manfaat",
      description: "Nutrisi tanah menumbuhkan tanaman pangan dan penjualan karya disalurkan untuk keberlanjutan program.",
      detail: "Dampak Terverifikasi",
    },
  ],
  ctaLabel: "Lihat Jejak Tumbuh",
  note: "Angka metrik merupakan representasi model sirkular pilot SEMAI dan terus diperbarui secara transparan.",
};
