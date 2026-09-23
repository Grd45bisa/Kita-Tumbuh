import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";
import { getOrderByReference } from "@/lib/domain/orders";
import { ORDER_PAYMENT_STATUS_LABELS } from "@/lib/validation/order-schema";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { env } from "@/lib/env";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ reference: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Pesanan ${reference} — SEMAI`,
    description: `Lacak status pesanan produk sirkular dengan referensi ${reference}.`,
    alternates: { canonical: `${env.siteUrl}/pesanan/${encodeURIComponent(reference)}` },
    robots: { index: false, follow: false },
  };
}

export default async function OrderTrackingPage({ params }: Props) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Pesanan" },
    { label: reference },
  ];

  if (!order) {
    return (
      <main id="main-content" className={styles.page}>
        <Container>
          <Breadcrumb items={breadcrumbItems} />
          <div className={styles.card} style={{ textAlign: "center" }}>
            <h1 className={styles.title}>Pesanan Tidak Ditemukan</h1>
            <p style={{ color: "var(--color-text-secondary)", margin: "var(--space-4) 0" }}>
              Nomor pesanan <strong>{reference}</strong> tidak ditemukan dalam sistem kami.
            </p>
            <div style={{ marginTop: "var(--space-6)" }}>
              <LinkButton href="/produk" variant="primary">
                Katalog Produk
              </LinkButton>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  const createdAt = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  const paymentStatusVariant =
    order.payment_status === "PAID"
      ? "success"
      : order.payment_status === "UNPAID" || order.payment_status === "PENDING_VERIFICATION"
      ? "warning"
      : "danger";

  return (
    <main id="main-content" className={styles.page}>
      <Container>
        <Breadcrumb items={breadcrumbItems} />

        <div className={styles.card}>
          <header className={styles.header}>
            <div className={styles.refRow}>
              <span className={styles.refCode}>{order.reference}</span>
              <Badge variant={paymentStatusVariant}>
                {ORDER_PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
              </Badge>
            </div>
            <h1 className={styles.title}>Pelacakan Pesanan</h1>
            <div className={styles.date}>
              Dipesan oleh <strong>{order.customer_name}</strong> pada {createdAt} WIB
            </div>
          </header>

          <div>
            <h2 className={styles.sectionTitle}>Status Progres Pesanan</h2>
            <OrderTimeline currentStatus={order.status} />
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Alamat Pengiriman</h2>
            <div className={styles.addressBox}>{order.shipping_address}</div>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Rincian Produk</h2>
            <div className={styles.itemsTable}>
              {order.items.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <div>
                    <span style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                      {item.product_name_snapshot}
                    </span>{" "}
                    x {item.quantity}
                    <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
                      @ Rp {item.product_price_snapshot.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
              <div className={styles.itemTotalRow}>
                <span>Total Pembayaran</span>
                <span>Rp {order.total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-8)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
            <LinkButton href="/produk" variant="secondary">
              Kembali ke Katalog
            </LinkButton>
            {order.payment_status !== "PAID" && order.status !== "CANCELLED" && (
              <LinkButton href={`/checkout?ref=${encodeURIComponent(order.reference)}`} variant="primary">
                Lihat Cara Pembayaran
              </LinkButton>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
