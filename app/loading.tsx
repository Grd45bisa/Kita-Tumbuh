import { Container } from "@/components/ui/Container";

export default function Loading() {
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
        }}
        aria-live="polite"
        aria-busy="true"
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid var(--color-border-default)",
            borderTopColor: "var(--color-brand-primary)",
            borderRadius: "var(--radius-full)",
            animation: "spin 0.8s linear infinite",
          }}
          aria-hidden="true"
        />
        <p
          style={{
            fontSize: "var(--font-size-body-m)",
            color: "var(--color-text-secondary)",
          }}
        >
          Memuat halaman...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
}
