import React from "react";
import type { WasteType } from "@/types/donation";
import styles from "./CollectionPointFilter.module.css";

interface CollectionPointFilterProps {
  wasteTypes: WasteType[];
  selectedWasteSlug?: string;
}

/**
 * Server-rendered filter form — submits via a plain GET request so the
 * filtered result is server-rendered from `searchParams`. No client-side
 * fetch/state involved, so no loading skeleton is needed here.
 */
export function CollectionPointFilter({
  wasteTypes,
  selectedWasteSlug,
}: CollectionPointFilterProps) {
  return (
    <form className={styles.filter} method="get">
      <div className={styles.field}>
        <label htmlFor="waste-filter" className={styles.label}>
          Filter berdasarkan jenis limbah
        </label>
        <select
          id="waste-filter"
          name="jenis"
          defaultValue={selectedWasteSlug ?? ""}
          className={styles.select}
        >
          <option value="">Semua jenis limbah</option>
          {wasteTypes.map((waste) => (
            <option key={waste.slug} value={waste.slug}>
              {waste.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className={styles.submit}>
        Terapkan
      </button>
    </form>
  );
}
