import { SkeletonCards, SkeletonTable } from "@/components/ui/Skeleton";

/**
 * Shown instantly by Next.js while any app/admin/** page is fetching its
 * data — the AdminNav sidebar in app/admin/layout.tsx keeps rendering
 * unchanged underneath (this only replaces `children`), so navigation
 * between admin sections no longer looks like a frozen/blank page while
 * requirePermission() + domain queries resolve.
 *
 * Kept intentionally generic (a metrics row + a table shape) rather than
 * one skeleton per route: most admin pages are either a paginated
 * DataTable or a small set of summary cards, and a rough content-shaped
 * placeholder that appears immediately beats a pixel-perfect one that's
 * slower to reach — the goal here is perceived speed, not decoration.
 */
export default function AdminLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <SkeletonCards count={4} />
      <SkeletonTable rows={6} />
    </div>
  );
}
