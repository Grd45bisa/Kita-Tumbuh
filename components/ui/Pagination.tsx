import React from "react";
import Link from "next/link";
import styles from "./Pagination.module.css";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  buildPageUrl: (page: number) => string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize = 10,
  buildPageUrl,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && (totalCount === undefined || totalCount === 0)) {
    return null;
  }

  const startRecord = totalCount != null && totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = totalCount != null ? Math.min(currentPage * pageSize, totalCount) : 0;

  return (
    <nav
      className={`${styles.pagination} ${className}`.trim()}
      aria-label="Navigasi Halaman"
    >
      <div className={styles.summary}>
        {totalCount != null ? (
          <span>
            Menampilkan <strong>{startRecord}</strong>-<strong>{endRecord}</strong> dari <strong>{totalCount}</strong> data
          </span>
        ) : (
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
        )}
      </div>

      <div className={styles.controls}>
        {currentPage > 1 ? (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className={styles.pageButton}
            aria-label="Halaman Sebelumnya"
          >
            ← Prev
          </Link>
        ) : (
          <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`} aria-disabled="true">
            ← Prev
          </span>
        )}

        <span className={styles.pageButton} style={{ pointerEvents: "none", borderColor: "transparent", background: "transparent" }}>
          {currentPage} / {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className={styles.pageButton}
            aria-label="Halaman Selanjutnya"
          >
            Next →
          </Link>
        ) : (
          <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`} aria-disabled="true">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}
