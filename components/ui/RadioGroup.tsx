import React from "react";
import styles from "./RadioGroup.module.css";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  orientation?: "vertical" | "horizontal";
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  hint,
  required,
  orientation = "vertical",
}: RadioGroupProps) {
  const groupId = `radio-group-${name}`;

  return (
    <fieldset
      className={styles.group}
      aria-describedby={
        error ? `${groupId}-error` : hint ? `${groupId}-hint` : undefined
      }
    >
      {label && (
        <legend className={styles.groupLabel}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </legend>
      )}
      <div
        className={`${styles.options} ${orientation === "horizontal" ? styles.horizontal : ""}`.trim()}
        role="radiogroup"
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`${styles.option} ${isSelected ? styles.selected : ""} ${opt.disabled ? styles.disabled : ""}`.trim()}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                disabled={opt.disabled}
                className={styles.radio}
                onChange={() => onChange?.(opt.value)}
              />
              <span className={styles.radioIndicator} aria-hidden="true" />
              <span className={styles.optionContent}>
                <span className={styles.optionLabel}>{opt.label}</span>
                {opt.description && (
                  <span className={styles.optionDescription}>{opt.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${groupId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${groupId}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </fieldset>
  );
}
