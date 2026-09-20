"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  confirmOrderPaymentAction,
  updateOrderStatusAction,
} from "@/lib/domain/admin/orders";
import type { OrderStatus, OrderPaymentStatus } from "@/lib/validation/order-schema";

interface OrderActionsProps {
  orderId: string;
  orderReference: string;
  currentStatus: OrderStatus;
  paymentStatus: OrderPaymentStatus;
}

export function OrderActions({
  orderId,
  orderReference,
  currentStatus,
  paymentStatus,
}: OrderActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleConfirmPayment = () => {
    if (!confirm(`Konfirmasi pembayaran lunas untuk pesanan ${orderReference}? Stok produk akan dikurangi secara otomatis.`)) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await confirmOrderPaymentAction({
        order_id: orderId,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error);
        return;
      }

      setSuccessMessage("Pembayaran berhasil diverifikasi dan stok produk telah dialokasikan!");
      router.refresh();
    });
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateOrderStatusAction({
        order_id: orderId,
        status: selectedStatus,
        notes: notes.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error);
        return;
      }

      setSuccessMessage(`Status pesanan berhasil diperbarui menjadi ${selectedStatus}.`);
      router.refresh();
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger-fg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-body-s)",
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          style={{
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--color-success-bg)",
            color: "var(--color-success-fg)",
            border: "1px solid var(--color-success-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-body-s)",
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Manual Payment Verification Section */}
      {paymentStatus !== "PAID" && (
        <div
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--color-warning-bg)",
            border: "1px solid var(--color-warning-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <h3
            style={{
              fontSize: "var(--font-size-body-m)",
              fontWeight: "bold",
              color: "var(--color-warning-fg)",
              marginBottom: "var(--space-2)",
            }}
          >
            Verifikasi Pembayaran Manual
          </h3>
          <p
            style={{
              fontSize: "var(--font-size-body-s)",
              color: "var(--color-ink-800)",
              marginBottom: "var(--space-3)",
            }}
          >
            Pastikan mutasi rekening bank telah masuk sesuai total tagihan sebelum menandai lunas. Mengonfirmasi pembayaran akan otomatis mendiskon stok inventaris produk terkait.
          </p>

          <div style={{ marginBottom: "var(--space-3)" }}>
            <label
              htmlFor="verify_notes"
              style={{
                display: "block",
                fontSize: "var(--font-size-caption)",
                fontWeight: "600",
                marginBottom: "var(--space-1)",
              }}
            >
              Catatan Bukti Mutasi (No. Rekening Pengirim / Ref Bank)
            </label>
            <input
              id="verify_notes"
              type="text"
              placeholder="Contoh: Transfer BCA an. Budi Santoso tgl 20/09"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border-default)",
                fontSize: "var(--font-size-body-s)",
                backgroundColor: "var(--color-bg-surface)",
              }}
            />
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmPayment}
            isLoading={isPending}
            disabled={isPending}
          >
            {isPending ? "Memproses..." : "Tandai Pembayaran Lunas (PAID)"}
          </Button>
        </div>
      )}

      {/* Lifecycle Status Transition Form */}
      <form
        onSubmit={handleUpdateStatus}
        style={{
          padding: "var(--space-4)",
          backgroundColor: "var(--color-bg-subtle)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <h3
          style={{
            fontSize: "var(--font-size-body-m)",
            fontWeight: "bold",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-2)",
          }}
        >
          Perbarui Status Pesanan
        </h3>

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            disabled={isPending}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border-default)",
              fontSize: "var(--font-size-body-s)",
              backgroundColor: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
              flex: "1 1 200px",
            }}
          >
            <option value="PENDING_PAYMENT">Menunggu Pembayaran</option>
            {currentStatus === "PAID" && (
              <option value="PAID" disabled>
                Sudah Dibayar (gunakan tombol Tandai Lunas)
              </option>
            )}
            <option value="PROCESSING">Sedang Diproses (Pengemasan)</option>
            <option value="SHIPPED">Dalam Pengiriman</option>
            <option value="READY_FOR_PICKUP">Siap Diambil di Pos</option>
            <option value="COMPLETED">Selesai (Diterima)</option>
            <option value="CANCELLED">Batalkan Pesanan</option>
          </select>

          <Button
            type="submit"
            variant="secondary"
            isLoading={isPending}
            disabled={isPending || selectedStatus === currentStatus}
          >
            Simpan Perubahan Status
          </Button>
        </div>
      </form>
    </div>
  );
}
