import type { FourRoomItem } from "./types";

/**
 * Signature section content: The Four Rooms
 * Source: SEMAI_Room_to_Grow_Website_Reference.md §05
 * BCI: Room to Grow -> Four Rooms pilar
 */
export const fourRoomsContent: {
  eyebrow: string;
  title: string;
  lead: string;
  rooms: FourRoomItem[];
  closingQuote: string;
} = {
  eyebrow: "The Four Rooms",
  title: "Empat Ruang yang Dibuka Bersama",
  lead: "Satu ide besar — Room to Grow — diterjemahkan menjadi empat ruang nyata bagi alam, pembelajaran, karya, dan kebersamaan.",
  rooms: [
    {
      id: "nature",
      tag: "01 · ALAM",
      title: "Room for Nature",
      subtitle: "Ruang untuk kembali",
      description:
        "Sisa organik tidak harus berakhir sebagai sampah. Di SEMAI, ia kembali ke tanah sebagai kompos bernutrisi dan bagian utuh dari siklus baru.",
      badge: "Siklus Sirkular",
      iconName: "leaf",
    },
    {
      id: "learn",
      tag: "02 · BELAJAR",
      title: "Room to Learn",
      subtitle: "Ruang untuk mencoba",
      description:
        "Belajar membutuhkan ruang untuk memegang bibit, mencampur nutrisi, mencoba, gagal, mengulang, dan akhirnya mandiri.",
      badge: "Keterampilan Nyata",
      iconName: "book-open",
    },
    {
      id: "create",
      tag: "03 · KARYA",
      title: "Room to Create",
      subtitle: "Ruang untuk berkarya",
      description:
        "Kemampuan menjadi nyata ketika mendapat kesempatan untuk diwujudkan. Dari olahan limbah dan kebun lahir produk yang membanggakan.",
      badge: "Karya Bernilai",
      iconName: "sparkles",
    },
    {
      id: "belong",
      tag: "04 · KEBERSAMAAN",
      title: "Room to Belong",
      subtitle: "Ruang untuk menjadi bagian",
      description:
        "SEMAI bukan hubungan satu arah pemberi dan penerima, melainkan ekosistem inklusif tempat setiap peran saling terhubung secara setara.",
      badge: "Partisipasi Setara",
      iconName: "users",
    },
  ],
  closingQuote: "Ruang tempat semuanya bertemu: Room to Grow.",
};
