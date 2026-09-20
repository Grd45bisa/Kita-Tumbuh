import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { getAdminOrders } from "@/lib/domain/admin/orders";
import {
  ORDER_STATUS_LABELS,
  ORDER_PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type OrderPaymentStatus,
} from "@/lib/validation/order-schema";
import type { Order } from "@/types/orders";

export const metadata: Metadata = {
  title: "Kelola Pesanan | Admin KITA TUMBUH",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    payment_status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status, payment_status, search, page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  const { orders, totalCount, totalPages, error: ordersError } = await getAdminOrders({
    status,
    paymentStatus: payment_status,
    search,
    page,
    pageSize: 10,
  });

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

  const columns: Column<Order>[] = [
    {
      key: "reference",
      header: "Referensi",
      render: (order: Order) => (
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--color-brand-primary)" }}>
            {order.reference}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Pembeli",
      render: (order: Order) => (
        <div>
          <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
            {order.customer_name}
          </div>
          <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-muted)" }}>
            {order.customer_phone}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order: Order) => (
        <span style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
          Rp {order.total.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "payment_status",
      header: "Pembayaran",
      render: (order: Order) => (
        <Badge variant={getPaymentVariant(order.payment_status)}>
          {ORDER_PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status Pesanan",
      render: (order: Order) => (
        <Badge variant={getOrderStatusVariant(order.status)}>
          {ORDER_STATUS_LABELS[order.status]?.label || order.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Tanggal",
      render: (order: Order) => (
        <span style={{ fontSize: "var(--font-size-body-s)", color: "var(--color-text-secondary)" }}>
          {new Date(order.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (order: Order) => (
        <Link
          href={`/admin/orders/${order.id}`}
          style={{
            fontSize: "var(--font-size-body-s)",
            fontWeight: "600",
            color: "var(--color-brand-primary)",
            textDecoration: "underline",
          }}
        >
          Kelola
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: "var(--font-size-heading-m)", fontWeight: "bold", color: "var(--color-text-primary)" }}>
            Daftar Pesanan Produk Sirkular
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
            Kelola transaksi penjualan, verifikasi transfer pembayaran, dan pantau pengiriman produk.
          </p>
        </div>
      </div>

      <Card style={{ padding: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        <form method="GET" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "center" }}>
          <div style={{ flex: "1 1 200px" }}>
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Cari referensi, nama, atau email..."
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border-default)",
                fontSize: "var(--font-size-body-s)",
                backgroundColor: "var(--color-bg-surface)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          <div>
            <select
              name="status"
              defaultValue={status || "ALL"}
              style={{
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border-default)",
                fontSize: "var(--font-size-body-s)",
                backgroundColor: "var(--color-bg-surface)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="ALL">Semua Status Pesanan</option>
              <option value="PENDING_PAYMENT">Menunggu Pembayaran</option>
              <option value="PAID">Sudah Dibayar</option>
              <option value="PROCESSING">Sedang Diproses</option>
              <option value="SHIPPED">Dalam Pengiriman</option>
              <option value="READY_FOR_PICKUP">Siap Diambil</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          <div>
            <select
              name="payment_status"
              defaultValue={payment_status || "ALL"}
              style={{
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border-default)",
                fontSize: "var(--font-size-body-s)",
                backgroundColor: "var(--color-bg-surface)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="ALL">Semua Status Bayar</option>
              <option value="UNPAID">Belum Bayar</option>
              <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
              <option value="PAID">Lunas</option>
              <option value="REFUNDED">Dikembalikan</option>
              <option value="FAILED">Gagal</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: "var(--space-2) var(--space-4)",
              backgroundColor: "var(--color-brand-primary)",
              color: "var(--color-brand-primary-fg)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-body-s)",
              fontWeight: "var(--font-weight-medium)",
              cursor: "pointer",
            }}
          >
            Filter
          </button>
        </form>
      </Card>

      {ordersError && (
        <div
          role="alert"
          style={{
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-6)",
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger-fg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-body-s)",
          }}
        >
          Gagal memuat pesanan: {ordersError}. Coba ubah kata kunci pencarian.
        </div>
      )}

      <Card style={{ padding: "var(--space-6)" }}>
        <DataTable
          columns={columns}
          data={orders}
          keyExtractor={(o) => o.id}
          emptyMessage="Belum ada pesanan yang sesuai filter."
        />

        {totalPages > 1 && (
          <div style={{ marginTop: "var(--space-6)" }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={10}
              buildPageUrl={(p) => {
                const params = new URLSearchParams();
                if (status && status !== "ALL") params.set("status", status);
                if (payment_status && payment_status !== "ALL") params.set("payment_status", payment_status);
                if (search) params.set("search", search);
                params.set("page", String(p));
                return `/admin/orders?${params.toString()}`;
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
