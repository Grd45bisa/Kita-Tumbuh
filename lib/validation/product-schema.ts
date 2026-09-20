import { z } from "zod";

export const PRODUCT_CATEGORIES = [
  "MINYAK_JELANTAH",
  "ORGANIK",
  "ANORGANIK",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  MINYAK_JELANTAH: "Hasil Minyak Jelantah",
  ORGANIK: "Hasil Limbah Organik",
  ANORGANIK: "Hasil Daur Ulang Anorganik",
};

export const ProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(3, "SKU minimal 3 karakter.")
    .max(50, "SKU maksimal 50 karakter.")
    .regex(/^[A-Z0-9-]+$/i, "SKU hanya boleh berupa huruf, angka, dan strip (-)."),
  name: z
    .string()
    .trim()
    .min(3, "Nama produk minimal 3 karakter.")
    .max(150, "Nama produk maksimal 150 karakter."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug URL minimal 3 karakter.")
    .max(150, "Slug URL maksimal 150 karakter.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip."),
  description: z
    .string()
    .trim()
    .min(10, "Deskripsi produk minimal 10 karakter.")
    .max(2000, "Deskripsi maksimal 2000 karakter."),
  story: z
    .string()
    .trim()
    .max(2000, "Cerita dampak maksimal 2000 karakter.")
    .optional()
    .default(""),
  category: z.enum(PRODUCT_CATEGORIES, {
    message: "Kategori produk tidak valid.",
  }),
  production_batch_id: z
    .string()
    .uuid("ID batch produksi tidak valid.")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  price: z.coerce
    .number({ message: "Harga harus berupa angka." })
    .int("Harga harus berupa bilangan bulat Rupiah.")
    .min(0, "Harga tidak boleh negatif."),
  currency: z.string().trim().default("IDR"),
  stock_quantity: z.coerce
    .number({ message: "Kuantitas stok harus berupa angka." })
    .int("Stok harus berupa bilangan bulat.")
    .min(0, "Stok tidak boleh negatif."),
  unit: z
    .string()
    .trim()
    .min(1, "Satuan takaran wajib diisi.")
    .max(20, "Maksimal 20 karakter.")
    .default("Pcs"),
  image_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  is_public: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof ProductSchema>;
