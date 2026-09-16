"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely to internal monitoring if needed
    console.error("Application error:", error);
  }, [error]);

  return (
    <Container>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: "var(--space-4)",
          textAlign: "center",
          paddingTop: "var(--space-12)",
          paddingBottom: "var(--space-12)",
        }}
      >
        <span
          style={{
            fontSize: "var(--font-size-caption)",
            fontWeight: "var(--font-weight-semibold)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--color-danger-fg)",
          }}
        >
          Terjadi Kendala
        </span>
        <h1
          style={{
            fontSize: "var(--font-size-heading-l)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-primary)",
          }}
        >
          Halaman Tidak Dapat Ditampilkan
        </h1>
        <p
          style={{
            maxWidth: "480px",
            fontSize: "var(--font-size-body-m)",
            color: "var(--color-text-secondary)",
            lineHeight: "var(--line-height-body-m)",
          }}
        >
          Permintaan belum berhasil diproses. Silakan periksa koneksi internet Anda atau coba muat ulang halaman.
        </p>
        <div style={{ marginTop: "var(--space-4)" }}>
          <Button variant="primary" onClick={() => reset()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    </Container>
  );
}
