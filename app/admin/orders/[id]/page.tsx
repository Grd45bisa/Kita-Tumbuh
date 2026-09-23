import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { getAdminOrderById } from "@/lib/domain/admin/orders";
import {
  ORDER_STATUS_LABELS,
  ORDER_PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type OrderPaymentStatus,
} from "@/lib/validation/order-schema";
import { OrderActions } from "@/components/admin/OrderActions";

export const metadata: Metadata = {
  title: "Detail Pesanan | Admin SEMAI",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  const getPaymentVariant = (ps: OrderPaymentStatus): BadgeVariant => {
    switch (ps) {
      case "PAID":
        return "success";
      case "PENDING_VERIFICATION":
      case "UNPAID":
        return "warning";
      case "FAILED":
      case "REFUNDED":
        return "danger";
      default:
        return "neutral";
    }
  };

  const getOrderStatusVariant = (os: OrderStatus): BadgeVariant => {
    switch (os) {
      case "COMPLETED":
      case "PAID":
        return "success";
      case "PROCESSING":
      case "SHIPPED":
      case "READY_FOR_PICKUP":
        return "info";
      case "PENDING_PAYMENT":
        return "warning";
      case "CANCELLED":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link
          href="/admin/orders"
          style={{
            fontSize: "var(--font-size-body-s)",
            color: "var(--color-brand-primary)",
            textDecoration: "underline",
            display: "inline-block",
            marginBottom: "var(--space-2)",
          }}
        >
          ← Kembali ke Daftar Pesanan
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div>
            <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)" }}>
              Pesanan {order.reference}
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
              Dibuat pada {new Date(order.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Badge variant={getPaymentVariant(order.payment_status)}>
              {ORDER_PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
            </Badge>
            <Badge variant={getOrderStatusVariant(order.status)}>
              {ORDER_STATUS_LABELS[order.status]?.label || order.status}
            </Badge>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-6)" }}>
        {/* Actions panel */}
        <Card style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", marginBottom: "var(--space-4)", color: "var(--color-text-primary)" }}>
            Tindakan Operasional & Pembayaran
          </h2>
          <OrderActions
            orderId={order.id}
            orderReference={order.reference}
            currentStatus={order.status}
            paymentStatus={order.payment_status}
          />
        </Card>

        {/* Customer & Shipping Details */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-6)" }}>
          <Card style={{ padding: "var(--space-6)" }}>
            <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", marginBottom: "var(--space-4)", color: "var(--color-text-primary)" }}>
              Informasi Pembeli
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--font-size-body-s)" }}>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Nama: </span>
                <strong>{order.customer_name}</strong>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Email: </span>
                <span>{order.customer_email}</span>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Telepon / WA: </span>
                <span>{order.customer_phone}</span>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Akun Terdaftar: </span>
                <span>{order.user_id ? "Ya (Member)" : "Tidak (Tamu/Anonim)"}</span>
              </div>
            </div>
          </Card>

          <Card style={{ padding: "var(--space-6)" }}>
            <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", marginBottom: "var(--space-4)", color: "var(--color-text-primary)" }}>
              Tujuan Pengiriman
            </h2>
            <div style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)", lineHeight: "var(--line-height-body-s)" }}>
              {order.shipping_address}
            </div>
            {order.customer_notes && (
              <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border-subtle)" }}>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)", display: "block" }}>
                  Catatan Pembeli:
                </span>
                <span style={{ fontSize: "var(--font-size-body-s)", fontStyle: "italic" }}>
                  {order.customer_notes}
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Line Items Snapshot */}
        <Card style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: "bold", marginBottom: "var(--space-4)", color: "var(--color-text-primary)" }}>
            Snapshot Item Pesanan
          </h2>
          <div style={{ border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-body-s)" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--color-bg-subtle)", textAlign: "left" }}>
                  <th style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)" }}>Produk</th>
                  <th style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)" }}>Harga Snapshot</th>
                  <th style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)" }}>Jumlah</th>
                  <th style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)", textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <td style={{ padding: "var(--space-3) var(--space-4)", fontWeight: "600" }}>{item.product_name_snapshot}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>Rp {item.product_price_snapshot.toLocaleString("id-ID")}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>{item.quantity}</td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", fontWeight: "600" }}>Rp {item.subtotal.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "var(--color-bg-subtle)", fontWeight: "bold" }}>
                  <td colSpan={3} style={{ padding: "var(--space-3) var(--space-4)" }}>Total Pembayaran</td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", color: "var(--color-brand-primary)" }}>
                    Rp {order.total.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
