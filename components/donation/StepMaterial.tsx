import React from "react";
import styles from "./DonationWizard.module.css";
import type { WasteType } from "@/types/donation";
import {
  OilDropIcon,
  PlantLeafIcon,
  RecycleBottleIcon,
  CheckIcon,
  CrossIcon,
  InfoCircleIcon,
} from "./DonationIcons";

interface StepMaterialProps {
  wasteTypes: WasteType[];
  selectedId: string;
  onSelect: (wasteType: WasteType) => void;
  error?: string;
}

function getWasteIcon(slug: string) {
  switch (slug) {
    case "minyak-jelantah":
      return <OilDropIcon size={22} className={styles.wasteSvgIcon} />;
    case "limbah-organik":
      return <PlantLeafIcon size={22} className={styles.wasteSvgIcon} />;
    case "plastik-wadah":
      return <RecycleBottleIcon size={22} className={styles.wasteSvgIcon} />;
    default:
      return <PlantLeafIcon size={22} className={styles.wasteSvgIcon} />;
  }
}

function getWasteSnippet(slug: string, fallback: string | null) {
  switch (slug) {
    case "minyak-jelantah":
      return "Minyak goreng bekas dapur · Diolah jadi sabun & lilin";
    case "limbah-organik":
      return "Sisa sayur, buah & dapur · Diolah jadi kompos alami";
    case "plastik-wadah":
      return "Jeriken HDPE & botol PET bersih · Wadah daur ulang";
    default:
      return fallback ? fallback.slice(0, 48) : "";
  }
}

export function StepMaterial({
  wasteTypes,
  selectedId,
  onSelect,
  error,
}: StepMaterialProps) {
  const selectedType = wasteTypes.find((wt) => wt.id === selectedId);

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Pilih Jenis Limbah</h2>
        <p className={styles.stepSubtitle}>
          Pilih salah satu kategori limbah yang ingin kamu salurkan.
        </p>
      </div>

      {error && (
        <div className={styles.stepError} role="alert">
          <InfoCircleIcon size={16} className={styles.errorIcon} />
          <span>{error}</span>
        </div>
      )}

      {/* Ultra-compact, touch-friendly list */}
      <div className={styles.wasteGrid}>
        {wasteTypes.map((wt) => {
          const isSelected = selectedId === wt.id;
          return (
            <button
              key={wt.id}
              type="button"
              className={`${styles.wasteCard} ${
                isSelected ? styles.wasteCardSelected : ""
              }`}
              onClick={() => onSelect(wt)}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Dipilih: " : ""}${wt.name}`}
            >
              <div className={styles.wasteIconWrapper}>
                {getWasteIcon(wt.slug)}
              </div>

              <div className={styles.wasteCardBody}>
                <div className={styles.wasteCardTitleRow}>
                  <h3 className={styles.wasteName}>{wt.name}</h3>
                  <span className={styles.wasteMetaPill}>
                    Min.{" "}
                    {new Intl.NumberFormat("id-ID", {
                      maximumFractionDigits: 1,
                    }).format(wt.min_quantity)}{" "}
                    {wt.unit === "pcs" ? "wadah" : wt.unit}
                  </span>
                </div>
                <p className={styles.wasteSnippet}>
                  {getWasteSnippet(wt.slug, wt.description)}
                </p>
              </div>

              <div className={styles.wasteRadioWrapper}>
                {isSelected ? (
                  <span className={styles.wasteRadioChecked}>
                    <CheckIcon size={12} />
                  </span>
                ) : (
                  <span className={styles.wasteRadioUnchecked} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Compact accepted/rejected guidelines */}
      {selectedType && (selectedType.accepted_notes || selectedType.rejected_notes) && (
        <div className={styles.compactGuidelinesBox}>
          <div className={styles.guidelinesTopRow}>
            <InfoCircleIcon size={14} className={styles.guidelineInfoIcon} />
            <span className={styles.guidelinesTag}>
              Panduan Cepat ({selectedType.name})
            </span>
          </div>

          <div className={styles.guidelinesRowGroup}>
            {selectedType.accepted_notes && (
              <div className={styles.guidelineCompactItemAccepted}>
                <CheckIcon size={13} className={styles.checkIconGreen} />
                <span>
                  <strong>Diterima:</strong> {selectedType.accepted_notes}
                </span>
              </div>
            )}

            {selectedType.rejected_notes && (
              <div className={styles.guidelineCompactItemRejected}>
                <CrossIcon size={13} className={styles.crossIconMuted} />
                <span>
                  <strong>Belum diterima:</strong> {selectedType.rejected_notes}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtle single-line help banner */}
      <div className={styles.stepHelpBanner}>
        <InfoCircleIcon size={14} className={styles.helpIcon} />
        <span>
          Limbah jenis lain?{" "}
          <a
            href="mailto:kampungsmartfarming@gmail.com"
            className={styles.stepNoteLink}
          >
            Hubungi tim operasional
          </a>
        </span>
      </div>
    </div>
  );
}


