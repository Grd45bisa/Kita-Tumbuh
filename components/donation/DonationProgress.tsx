import React from "react";
import styles from "./DonationWizard.module.css";
import { CheckIcon } from "./DonationIcons";

const STEP_LABELS = [
  "Pilih Limbah",
  "Perkiraan Jumlah",
  "Metode Penyerahan",
  "Konfirmasi Donasi",
];

export interface DonationProgressProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
}

export function DonationProgress({
  currentStep,
  totalSteps,
}: DonationProgressProps) {
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Langkah ${currentStep} dari ${totalSteps}: ${STEP_LABELS[currentStep - 1]}`}
    >
      {/* Header with step counter and active title */}
      <div className={styles.progressHeader}>
        <span className={styles.progressBadge}>
          Langkah {currentStep} dari {totalSteps}
        </span>
        <span className={styles.progressStepTitle}>
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>

      {/* Modern progress bar track */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className={styles.progressSteps} aria-hidden="true">
        {STEP_LABELS.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <div
              key={label}
              className={`${styles.progressStep} ${
                isCompleted ? styles.stepCompleted : ""
              } ${isCurrent ? styles.stepCurrent : ""}`}
            >
              <div className={styles.stepDot}>
                {isCompleted ? (
                  <CheckIcon size={14} className={styles.stepDotCheck} />
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>
              <span className={styles.stepDotLabel}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

