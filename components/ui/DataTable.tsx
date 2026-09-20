import React from "react";
import styles from "./DataTable.module.css";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: React.ReactNode;
  className?: string;
  caption?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Tidak ada data yang tersedia.",
  className = "",
  caption,
}: DataTableProps<T>) {
  return (
    <div className={`${styles.tableWrapper} ${className}`.trim()}>
      <table className={styles.table}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`${styles.th} ${col.className || ""}`.trim()}
                style={{
                  textAlign: col.align || "left",
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyStateCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={keyExtractor(item, index)} className={styles.tr}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${styles.td} ${col.className || ""}`.trim()}
                    style={{
                      textAlign: col.align || "left",
                    }}
                  >
                    {col.render
                      ? col.render(item, index)
                      : (item as Record<string, unknown>)[col.key] != null
                      ? String((item as Record<string, unknown>)[col.key])
                      : "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
