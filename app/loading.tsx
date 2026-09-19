import { Container } from "@/components/ui/Container";
import { LeafLoader } from "@/components/ui/LeafLoader";

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
      >
        <LeafLoader />
      </div>
    </Container>
  );
}
