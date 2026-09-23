import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LinkButton } from "@/components/ui/LinkButton";
import { getOrderByReference } from "@/lib/domain/orders";
import styles from "./page.module.css";

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

export const metadata: Metadata = {
  title: "Konfirmasi Pesanan — SEMAI",
  description: "Instruksi pembayaran dan rincian pesanan produk sirkular SEMAI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutConfirmationPage({ searchParams }: Props) {
  const { ref } = await searchParams;

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Produk", href: "/produk" },
    { label: "Konfirmasi Pesanan" },
  ];

  if (!ref) {
    return (
      <main id="main-content" className={styles.page}>
        <Container>
          <Breadcrumb items={breadcrumbItems} />
          <div className={styles.card}>
            <div className={styles.successHeader}>
              <h1 className={styles.title}>Belum Ada Pesanan yang Dipilih</h1>
              <p className={styles.subtitle}>
                Silakan pilih produk yang ingin kamu pesan dari katalog produk sirkular kami.
              </p>
            </div>
            <div className={styles.actions} style={{ justifyContent: "center" }}>
              <LinkButton href="/produk" variant="primary">
                Buka Katalog Produk
              </LinkButton>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  const order = await getOrderByReference(ref);

  if (!order) {
    return (
      <main id="main-content" className={styles.page}>
        <Container>
          <Breadcrumb items={breadcrumbItems} />
          <div className={styles.card}>
            <div className={styles.successHeader}>
              <h1 className={styles.title}>Pesanan Tidak Ditemukan</h1>
              <p className={styles.subtitle}>
                Nomor pesanan <strong>{ref}</strong> tidak ditemukan dalam sistem kami.
              </p>
            </div>
            <div className={styles.actions} style={{ justifyContent: "center" }}>
              <LinkButton href="/produk" variant="secondary">
                Kembali ke Katalog
              </LinkButton>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main id="main-content" className={styles.page}>
      <Container>
        <Breadcrumb items={breadcrumbItems} />

        <div className={styles.card}>
          <div className={styles.successHeader}>
            <div className={styles.iconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className={styles.title}>Pesanan Berhasil Dibuat!</h1>
            <p className={styles.subtitle}>
              Terima kasih, <strong>{order.customer_name}</strong>. Pesananmu telah tercatat dan menunggu konfirmasi pembayaran.
            </p>
          </div>

          <div className={styles.refBadgeBox}>
            <span className={styles.refLabel}>Nomor Referensi Pesanan</span>
            <span className={styles.refCode}>{order.reference}</span>
          </div>

          <div className={styles.paymentBox}>
            <div className={styles.paymentTitle}>Petunjuk Pembayaran Transfer Manual</div>
            <div className={styles.amountHighlight}>
              Rp {order.total.toLocaleString("id-ID")}
            </div>

            <div className={styles.bankList}>
              <div className={styles.bankItem}>
                <div>
                  <div className={styles.bankName}>Bank BCA</div>
                  <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>a.n. Yayasan SEMAI</div>
                </div>
                <div className={styles.bankAccount}>841-092-3481</div>
              </div>
              <div className={styles.bankItem}>
                <div>
                  <div className={styles.bankName}>Bank Mandiri</div>
                  <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>a.n. Yayasan SEMAI</div>
                </div>
                <div className={styles.bankAccount}>137-00-1982734-5</div>
              </div>
            </div>

            <p className={styles.instructions}>
              Penting: Cantumkan nomor referensi <strong>{order.reference}</strong> pada berita transfer bank. Setelah melakukan pembayaran, tim kami akan memverifikasi mutasi dan memperbarui status pesananmu menjadi <em>Sudah Dibayar</em>.
            </p>
          </div>

          <div style={{ marginBottom: "var(--space-6)" }}>
            <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", marginBottom: "var(--space-3)", color: "var(--color-text-primary)" }}>
              Ringkasan Item Pesanan
            </h2>
            <div style={{ border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "var(--space-3) var(--space-4)",
                    borderBottom: idx < order.items.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                    backgroundColor: "var(--color-bg-subtle)",
                    fontSize: "var(--font-size-body-s)",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                      {item.product_name_snapshot}
                    </span>{" "}
                    x {item.quantity}
                  </div>
                  <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <LinkButton
              href={`/pesanan/${encodeURIComponent(order.reference)}`}
              variant="primary"
            >
              Lacak Status Pesanan
            </LinkButton>
            <LinkButton href="/produk" variant="secondary">
              Kembali ke Katalog
            </LinkButton>
          </div>
        </div>
      </Container>
    </main>
  );
}
