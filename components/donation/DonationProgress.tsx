import React from "react";
import styles from "./DonationWizard.module.css";

const STEP_LABELS = ["Pilih Limbah", "Jumlah", "Cara Kirim", "Konfirmasi"];

export interface DonationProgressProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
}

export function DonationProgress({
  currentStep,
  totalSteps,
}: DonationProgressProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={styles.progress} role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Langkah ${currentStep} dari ${totalSteps}: ${STEP_LABELS[currentStep - 1]}`}>
      {/* Step counter */}
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>
          Langkah {currentStep} dari {totalSteps}
        </span>
        <span className={styles.progressStepName}>
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step dots */}
      <div className={styles.progressSteps} aria-hidden="true">
        {STEP_LABELS.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <div
              key={label}
              className={`${styles.progressStep} ${isCompleted ? styles.stepCompleted : ""} ${isCurrent ? styles.stepCurrent : ""}`}
            >
              <div className={styles.stepDot}>
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
