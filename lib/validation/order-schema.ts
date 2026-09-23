import { z } from "zod";

export const ORDER_STATUS_STEPS = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_STEPS)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; description: string }> = {
  PENDING_PAYMENT: {
    label: "Menunggu Pembayaran",
    description: "Pesanan telah dibuat, menunggu transfer dan konfirmasi pembayaran.",
  },
  PAID: {
    label: "Sudah Dibayar",
    description: "Pembayaran telah diverifikasi, stok produk dialokasikan.",
  },
  PROCESSING: {
    label: "Sedang Diproses",
    description: "Produk sedang disiapkan dan dikemas di workshop SEMAI.",
  },
  SHIPPED: {
    label: "Dalam Pengiriman",
    description: "Pesanan telah diserahkan ke kurir / armada pengantaran.",
  },
  READY_FOR_PICKUP: {
    label: "Siap Diambil",
    description: "Pesanan siap diambil di pos SEMAI.",
  },
  COMPLETED: {
    label: "Selesai",
    description: "Pesanan telah diterima oleh pembeli. Dana penjualan siap dialokasikan.",
  },
  CANCELLED: {
    label: "Dibatalkan",
    description: "Pesanan dibatalkan karena tidak dibayar atau permintaan pembeli.",
  },
};

export const ORDER_PAYMENT_STATUS_STEPS = [
  "UNPAID",
  "PENDING_VERIFICATION",
  "PAID",
  "REFUNDED",
  "FAILED",
] as const;

export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUS_STEPS)[number];

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  UNPAID: "Belum Bayar",
  PENDING_VERIFICATION: "Menunggu Verifikasi",
  PAID: "Lunas Terverifikasi",
  REFUNDED: "Dikembalikan",
  FAILED: "Gagal",
};

export const OrderItemInputSchema = z.object({
  product_id: z.string().uuid("ID produk tidak valid."),
  quantity: z.coerce
    .number({ message: "Kuantitas harus berupa angka." })
    .int("Kuantitas harus berupa bilangan bulat.")
    .positive("Kuantitas minimal 1."),
});

export const CreateOrderSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(3, "Nama lengkap minimal 3 karakter.")
    .max(100, "Nama lengkap maksimal 100 karakter."),
  customer_email: z
    .string()
    .trim()
    .email("Format email tidak valid."),
  customer_phone: z
    .string()
    .trim()
    .min(9, "Nomor telepon/WhatsApp minimal 9 digit.")
    .max(20, "Nomor telepon maksimal 20 digit.")
    .regex(/^(\+62|62|0)[0-9- ]+$/, "Format nomor telepon tidak valid."),
  shipping_address: z
    .string()
    .trim()
    .min(10, "Alamat pengiriman lengkap minimal 10 karakter.")
    .max(500, "Alamat pengiriman maksimal 500 karakter."),
  customer_notes: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter.")
    .optional()
    .default(""),
  items: z
    .array(OrderItemInputSchema)
    .min(1, "Pesanan harus memiliki minimal 1 produk."),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  order_id: z.string().uuid("ID pesanan tidak valid."),
  status: z.enum(ORDER_STATUS_STEPS, {
    message: "Status pesanan tidak valid.",
  }),
  notes: z.string().trim().max(500).optional().default(""),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
