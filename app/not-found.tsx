import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
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
            color: "var(--color-brand-secondary)",
          }}
        >
          404 — Tidak Ditemukan
        </span>
        <h1
          style={{
            fontSize: "var(--font-size-heading-l)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-primary)",
          }}
        >
          Halaman Tidak Ditemukan
        </h1>
        <p
          style={{
            maxWidth: "480px",
            fontSize: "var(--font-size-body-m)",
            color: "var(--color-text-secondary)",
            lineHeight: "var(--line-height-body-m)",
          }}
        >
          Halaman yang Anda tuju tidak tersedia atau alamat URL telah dipindahkan.
        </p>
        <div style={{ marginTop: "var(--space-4)" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--color-brand-primary)",
              color: "var(--color-brand-primary-fg)",
              padding: "var(--space-2) var(--space-5)",
              borderRadius: "var(--radius-md)",
              fontWeight: "var(--font-weight-medium)",
              minHeight: "44px",
              transition: "background-color var(--transition-fast)",
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </Container>
  );
}
