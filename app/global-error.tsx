"use client";

import "@/styles/globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "var(--space-6)",
            textAlign: "center",
            gap: "var(--space-4)",
            backgroundColor: "var(--color-bg-canvas)",
            color: "var(--color-text-primary)",
          }}
        >
          <h1
            style={{
              fontSize: "var(--font-size-heading-l)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Terjadi Kesalahan Sistem
          </h1>
          <p
            style={{
              maxWidth: "500px",
              color: "var(--color-text-secondary)",
            }}
          >
            Aplikasi mengalami kendala teknis yang tidak terduga. Silakan coba memuat ulang halaman.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              backgroundColor: "var(--color-brand-primary)",
              color: "var(--color-brand-primary-fg)",
              padding: "var(--space-2) var(--space-5)",
              borderRadius: "var(--radius-md)",
              fontWeight: "var(--font-weight-medium)",
              cursor: "pointer",
            }}
          >
            Muat Ulang
          </button>
        </div>
      </body>
    </html>
  );
}
