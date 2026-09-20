import React from "react";
import styles from "./DonationWizard.module.css";
import { CheckIcon, InfoCircleIcon, ScaleIcon } from "./DonationIcons";

type QuantityTier = "SEDIKIT" | "SEDANG" | "BANYAK";

interface QuantityTierOption {
  tier: QuantityTier;
  label: string;
  hint: string;
  /** Representative amount sent to the server for this tier. */
  value: number;
}

/**
 * Rough, presentational tiers instead of a precise number input. Donors
 * don't need to know an exact liter/kg count up front — the value picked
 * here is only ever an estimate; operators record the real weight when the
 * donation is actually received (see StepReview and StepQuantity disclaimer
 * copy). Values stay within each waste type's min/max quantity so server
 * validation (lib/validation/donation-schema.ts) keeps working unchanged.
 */
function getTierOptions(
  unit: string,
  minQuantity: number,
  maxQuantity: number | null
): QuantityTierOption[] {
  const ceiling = maxQuantity ?? Math.max(minQuantity * 20, 20);

  const clamp = (val: number) => Math.min(Math.max(val, minQuantity), ceiling);

  const small = clamp(minQuantity);
  const medium = clamp(Math.max(minQuantity * 3, (minQuantity + ceiling) / 3));
  const large = clamp(Math.max(minQuantity * 8, (ceiling * 2) / 3));

  const unitLabel = unit === "pcs" ? "wadah" : unit;

  return [
    {
      tier: "SEDIKIT",
      label: "Sedikit",
      hint: `Sekitar ${small} ${unitLabel} atau kurang`,
      value: small,
    },
    {
      tier: "SEDANG",
      label: "Sedang",
      hint: `Kira-kira ${medium} ${unitLabel}`,
      value: medium,
    },
    {
      tier: "BANYAK",
      label: "Banyak",
      hint: `Lebih dari ${large} ${unitLabel}`,
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
