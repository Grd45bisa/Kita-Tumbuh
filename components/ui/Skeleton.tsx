import React from "react";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A single shimmering placeholder block. Compose these into
 * SkeletonTable/SkeletonCard-shaped layouts per page rather than reaching
 * for one generic "loading card" everywhere — a skeleton that roughly
 * matches the real content's shape reduces the layout shift when the real
 * data replaces it.
 */
export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`${styles.skeleton} ${className}`.trim()} style={style} aria-hidden="true" />;
}

/**
 * Skeleton shaped like DataTable — the most common admin content shape
 * (donations, orders, inventory, programs, etc. are all paginated tables).
 */
export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className={styles.tableWrapper} role="status" aria-label="Memuat data">
      <div className={styles.tableHeader}>
        <Skeleton style={{ width: "20%" }} />
        <Skeleton style={{ width: "30%" }} />
        <Skeleton style={{ width: "15%" }} />
        <Skeleton style={{ width: "15%" }} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.tableRow}>
          <Skeleton style={{ width: "20%" }} />
          <Skeleton style={{ width: "30%" }} />
          <Skeleton style={{ width: "15%" }} />
          <Skeleton style={{ width: "15%" }} />
        </div>
      ))}
      <span className={styles.srOnly}>Memuat data…</span>
    </div>
  );
}

/** Skeleton for a row of summary/metric cards (dashboard-style overview). */
export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.cardsGrid} role="status" aria-label="Memuat ringkasan">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          <Skeleton style={{ width: "50%", height: "12px" }} />
          <Skeleton style={{ width: "70%", height: "24px", marginTop: "8px" }} />
        </div>
      ))}
      <span className={styles.srOnly}>Memuat ringkasan…</span>
    </div>
  );
}
