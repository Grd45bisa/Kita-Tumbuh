import React from "react";
import styles from "./DonationWizard.module.css";
import { CheckIcon, InfoCircleIcon, ScaleIcon } from "./DonationIcons";

export type QuantityTier = "SEDIKIT" | "SEDANG" | "BANYAK";

export interface QuantityTierOption {
  tier: QuantityTier;
  label: string;
  hint: string;
  /** Representative amount sent to the server for this tier. */
  value: number;
}

/**
 * Helper to round arbitrary numbers into clean, natural human numbers (genap).
 * Avoids raw floating point artifacts like 16.833333333333332 or 33.333333333333336.
 */
function roundToSensibleQuantity(val: number): number {
  if (val <= 1) return 1;
  if (val <= 3) return Math.round(val);
  if (val <= 10) {
    const m5 = Math.round(val / 5) * 5;
    if (Math.abs(val - m5) <= 1.8) return m5;
    return Math.round(val);
  }
  if (val <= 30) {
    return Math.round(val / 5) * 5;
  }
  if (val <= 100) {
    return Math.round(val / 10) * 10;
  }
  return Math.round(val / 25) * 25;
}

/**
 * Rough, presentational tiers instead of a precise number input. Donors
 * don't need to know an exact liter/kg count up front — the value picked
 * here is only ever an estimate; operators record the real weight when the
 * donation is actually received (see StepReview and StepQuantity disclaimer
 * copy). Values stay within each waste type's min/max quantity so server
 * validation (lib/validation/donation-schema.ts) keeps working unchanged.
 */
export function getTierOptions(
  unit: string,
  minQuantity: number,
  maxQuantity: number | null
): QuantityTierOption[] {
  const ceiling = maxQuantity ?? Math.max(minQuantity * 20, 20);

  // Small tier: clean whole number (e.g. 1 L, 1 kg, 2 wadah)
  let small =
    unit === "pcs"
      ? Math.max(2, Math.ceil(minQuantity))
      : Math.max(1, Math.ceil(minQuantity));

  // Medium tier: ~30% of the range, rounded to a clean multiple
  let medium = roundToSensibleQuantity(small + (ceiling - small) * 0.3);
  if (medium <= small) medium = small + 1;

  // Large tier: ~62% of the range, rounded to a clean multiple
  let large = roundToSensibleQuantity(small + (ceiling - small) * 0.62);
  if (large <= medium) large = medium + (ceiling > medium ? 1 : 0);

  // Clamp within bounds
  const clamp = (val: number) => Math.min(Math.max(val, minQuantity), ceiling);
  small = clamp(small);
  medium = clamp(medium);
  large = clamp(large);

  const unitLabel = unit === "pcs" ? "wadah" : unit;
  const formatNum = (v: number) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(v);

  return [
    {
      tier: "SEDIKIT",
      label: "Sedikit",
      hint: `Sekitar ${formatNum(small)} ${unitLabel} atau kurang`,
      value: small,
    },
    {
      tier: "SEDANG",
      label: "Sedang",
      hint: `Kira-kira ${formatNum(medium)} ${unitLabel}`,
      value: medium,
    },
    {
      tier: "BANYAK",
      label: "Banyak",
      hint: `Lebih dari ${formatNum(large)} ${unitLabel}`,
      value: large,
    },
  ];
}

interface StepQuantityProps {
  unit: string;
  wasteTypeName: string;
  value: number;
  onChange: (val: number) => void;
  minQuantity: number;
  maxQuantity: number | null;
  error?: string;
}

export function StepQuantity({
  unit,
  wasteTypeName,
  value,
  onChange,
  minQuantity,
  maxQuantity,
  error,
}: StepQuantityProps) {
  const tiers = getTierOptions(unit, minQuantity, maxQuantity);
  const selectedTier = tiers.find((t) => t.value === value);

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Perkiraan Jumlah Donasi</h2>
        <p className={styles.stepSubtitle}>
          Tidak perlu angka pasti — pilih perkiraan jumlah{" "}
          <strong>{wasteTypeName}</strong> yang kamu miliki.
        </p>
      </div>

      {error && (
        <div className={styles.stepError} role="alert">
          <InfoCircleIcon size={18} className={styles.errorIcon} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.wasteGrid}>
        {tiers.map((option) => {
          const isSelected = selectedTier?.tier === option.tier;
          return (
            <button
              key={option.tier}
              type="button"
              className={`${styles.wasteCard} ${
                isSelected ? styles.wasteCardSelected : ""
              }`}
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Dipilih: " : ""}${option.label} — ${option.hint}`}
            >
              <div className={styles.wasteIconWrapper}>
                <ScaleIcon size={20} className={styles.wasteSvgIcon} />
              </div>

              <div className={styles.wasteCardBody}>
                <div className={styles.wasteCardTitleRow}>
                  <h3 className={styles.wasteName}>{option.label}</h3>
                </div>
                <p className={styles.wasteSnippet}>{option.hint}</p>
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

      {/* Reassuring disclaimer box */}
      <div className={styles.quantityDisclaimer}>
        <div className={styles.disclaimerIconWrap}>
          <InfoCircleIcon size={20} />
        </div>
        <div className={styles.disclaimerText}>
          <strong>Ini hanya perkiraan kasar</strong>
          <p>
            Jumlah pastinya terserah kamu — tim kami akan menimbang ulang
            secara akurat saat serah terima di collection point atau saat
            penjemputan.
          </p>
        </div>
      </div>
    </div>
  );
}
