"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createOrderAction } from "@/lib/domain/orders";
import styles from "./ProductOrderForm.module.css";

interface ProductOrderFormProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
  };
  initialUser?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
}

export function ProductOrderForm({ product, initialUser }: ProductOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(initialUser?.name || "");
  const [customerEmail, setCustomerEmail] = useState(initialUser?.email || "");
  const [customerPhone, setCustomerPhone] = useState(initialUser?.phone || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isOutOfStock = product.stock <= 0;
  const totalPrice = product.price * quantity;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await createOrderAction({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        customer_notes: customerNotes,
        items: [
          {
            product_id: product.id,
            quantity,
          },
        ],
      });

      if (!res.success) {
        setErrorMessage(res.error);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        return;
      }

      router.push(`/checkout?ref=${encodeURIComponent(res.data.reference)}`);
    });
  };

  if (isOutOfStock) {
    return (
      <div className={styles.formWrapper}>
        <h3 className={styles.title}>Pesan Produk</h3>
        <p className={styles.subtitle}>
          Maaf, stok {product.name} saat ini sedang habis. Batch produksi baru sedang disiapkan.
        </p>
        <Button variant="secondary" fullWidth disabled>
          Stok Habis
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.formWrapper}>
      <h3 className={styles.title}>Formulir Pemesanan</h3>
      <p className={styles.subtitle}>
        Isi alamat pengiriman dan kontak kamu untuk memesan produk hasil karya difabel ini.
      </p>

      {errorMessage && (
        <div className={styles.errorBanner} role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.quantitySection}>
          <div>
            <span className={styles.quantityLabel}>Jumlah Pesanan</span>
            <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
              Tersedia: {product.stock} {product.unit}
            </div>
          </div>
          <div className={styles.quantityControls}>
            <button
              type="button"
              className={styles.qtyButton}
              onClick={handleDecrement}
              disabled={quantity <= 1 || isPending}
              aria-label="Kurangi jumlah"
            >
              -
            </button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button
              type="button"
              className={styles.qtyButton}
              onClick={handleIncrement}
              disabled={quantity >= product.stock || isPending}
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>
        </div>

        <Input
          id="customer_name"
          name="customer_name"
          label="Nama Lengkap Pemesan"
          placeholder="Contoh: Budi Santoso"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          error={fieldErrors.customer_name?.[0]}
          required
          disabled={isPending}
        />

        <Input
          id="customer_email"
          name="customer_email"
          type="email"
          label="Email Penerima Konfirmasi"
          placeholder="nama@email.com"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          error={fieldErrors.customer_email?.[0]}
          required
          disabled={isPending}
        />

        <Input
          id="customer_phone"
          name="customer_phone"
          type="tel"
          label="Nomor WhatsApp / Telepon"
          placeholder="081234567890"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          error={fieldErrors.customer_phone?.[0]}
          required
          disabled={isPending}
        />

        <Textarea
          id="shipping_address"
          name="shipping_address"
          label="Alamat Pengiriman Lengkap"
          placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          error={fieldErrors.shipping_address?.[0]}
          required
          disabled={isPending}
        />

        <Textarea
          id="customer_notes"
          name="customer_notes"
          label="Catatan Pesanan (Opsional)"
          placeholder="Contoh: Titipkan di pos satpam bila tidak ada orang di rumah"
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          error={fieldErrors.customer_notes?.[0]}
          disabled={isPending}
        />

        <div className={styles.summaryBox}>
          <div className={styles.summaryRow}>
            <span>Harga Satuan</span>
            <span>Rp {product.price.toLocaleString("id-ID")}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Kuantitas</span>
            <span>
              {quantity} {product.unit}
            </span>
          </div>
          <div className={styles.summaryTotalRow}>
            <span>Total Pembayaran</span>
            <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isPending}
          disabled={isPending}
        >
          {isPending ? "Memproses Pesanan..." : "Konfirmasi & Lanjut Pembayaran"}
        </Button>
      </form>
    </div>
  );
}
