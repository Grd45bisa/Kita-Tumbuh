import React from "react";
import styles from "./DonationWizard.module.css";

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
  const step = unit === "L" ? 0.5 : unit === "kg" ? 0.5 : 1;

  function handleDecrement() {
    const next = Math.max(minQuantity, parseFloat((value - step).toFixed(2)));
    onChange(next);
  }

  function handleIncrement() {
    const max = maxQuantity ?? 9999;
    const next = Math.min(max, parseFloat((value + step).toFixed(2)));
    onChange(next);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseFloat(e.target.value);
    if (!isNaN(raw) && raw >= 0) {
      onChange(raw);
    } else if (e.target.value === "" || e.target.value === "0") {
      onChange(0);
    }
  }

  const displayValue = value > 0 ? value : "";

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Berapa banyak?</h2>
        <p className={styles.stepSubtitle}>
          Masukkan perkiraan jumlah <strong>{wasteTypeName}</strong> yang akan kamu donasikan.
        </p>
      </div>

      {error && (
        <p className={styles.stepError} role="alert">
          {error}
        </p>
      )}

      <div className={styles.quantityControl}>
        <button
          type="button"
          className={styles.quantityBtn}
          onClick={handleDecrement}
          disabled={value <= minQuantity}
          aria-label={`Kurangi ${step} ${unit}`}
        >
          −
        </button>
        <div className={styles.quantityInputWrapper}>
          <input
            type="number"
            inputMode="decimal"
            className={styles.quantityInput}
            value={displayValue}
            onChange={handleInput}
            min={minQuantity}
            max={maxQuantity ?? undefined}
            step={step}
            aria-label={`Jumlah dalam ${unit}`}
          />
          <span className={styles.quantityUnit}>{unit}</span>
        </div>
        <button
          type="button"
          className={styles.quantityBtn}
          onClick={handleIncrement}
          disabled={maxQuantity !== null && value >= maxQuantity}
          aria-label={`Tambah ${step} ${unit}`}
        >
          +
        </button>
      </div>

      {/* Range hint */}
      <p className={styles.quantityHint}>
        Minimum: {minQuantity} {unit}
        {maxQuantity && ` · Maksimum: ${maxQuantity} ${unit}`}
      </p>

      {/* Important disclaimer about estimated vs verified */}
      <div className={styles.quantityDisclaimer}>
        <span className={styles.disclaimerIcon} aria-hidden="true">ℹ️</span>
        <div>
          <strong>Jumlah ini adalah perkiraan.</strong>
          <p>
            Jumlah aktual akan ditimbang dan diverifikasi oleh tim kami saat
            pengambilan atau penyerahan. Perbedaan kecil antara perkiraan dan
            jumlah terverifikasi adalah hal yang wajar.
          </p>
        </div>
      </div>

      {/* Contribution preview */}
      {value > 0 && (
        <div className={styles.contributionPreview}>
          <p className={styles.contributionText}>
            Perkiraan kontribusimu:{" "}
            <strong>
              {value} {unit} {wasteTypeName}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
