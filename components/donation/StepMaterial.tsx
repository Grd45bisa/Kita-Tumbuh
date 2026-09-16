import React from "react";
import styles from "./DonationWizard.module.css";
import type { WasteType } from "@/types/donation";

interface StepMaterialProps {
  wasteTypes: WasteType[];
  selectedId: string;
  onSelect: (wasteType: WasteType) => void;
  error?: string;
}

const WASTE_ICONS: Record<string, string> = {
  "minyak-jelantah": "🛢️",
  "limbah-organik": "🌿",
  "plastik-wadah": "♻️",
};

export function StepMaterial({
  wasteTypes,
  selectedId,
  onSelect,
  error,
}: StepMaterialProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Apa yang ingin kamu donasikan?</h2>
        <p className={styles.stepSubtitle}>
          Pilih jenis limbah dari dapur atau rumah tanggamu.
        </p>
      </div>

      {error && (
        <p className={styles.stepError} role="alert">
          {error}
        </p>
      )}

      <div className={styles.wasteGrid}>
        {wasteTypes.map((wt) => {
          const isSelected = selectedId === wt.id;
          return (
            <button
              key={wt.id}
              type="button"
              className={`${styles.wasteCard} ${isSelected ? styles.wasteCardSelected : ""}`}
              onClick={() => onSelect(wt)}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Dipilih: " : ""}${wt.name}`}
            >
              <span className={styles.wasteIcon} aria-hidden="true">
                {WASTE_ICONS[wt.slug] ?? "🌱"}
              </span>
              <span className={styles.wasteName}>{wt.name}</span>
              {wt.description && (
                <span className={styles.wasteDesc}>{wt.description}</span>
              )}
              <span className={styles.wasteUnit}>
                Satuan: {wt.unit}
              </span>
              {isSelected && (
                <span className={styles.wasteSelectedBadge} aria-hidden="true">
                  ✓ Dipilih
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Show accepted/rejected notes for selected waste type */}
      {selectedId && (() => {
        const selected = wasteTypes.find((wt) => wt.id === selectedId);
        if (!selected) return null;
        return (
          <div className={styles.wasteNotes}>
            {selected.accepted_notes && (
              <div className={styles.wasteNoteAccepted}>
                <div className={styles.wasteNoteHeader}>
                  <span className={styles.wasteNoteIcon} aria-hidden="true">✓</span>
                  <strong>Yang kami terima</strong>
                </div>
                <p>{selected.accepted_notes}</p>
              </div>
            )}
            {selected.rejected_notes && (
              <div className={styles.wasteNoteRejected}>
                <div className={styles.wasteNoteHeader}>
                  <span className={styles.wasteNoteIcon} aria-hidden="true">✕</span>
                  <strong>Yang tidak kami terima</strong>
                </div>
                <p>{selected.rejected_notes}</p>
              </div>
            )}
          </div>
        );
      })()}

      <div className={styles.stepNote}>
        <p>
          Tidak ada yang cocok?{" "}
          <a href="mailto:kampungsmartfarming@gmail.com" className={styles.stepNoteLink}>
            Hubungi kami
          </a>{" "}
          — kami terus memperbarui kategori yang diterima.
        </p>
      </div>
    </div>
  );
}
