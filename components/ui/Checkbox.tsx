import React, { useId } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export function Checkbox({
  label,
  error,
  helperText,
  id,
  className = "",
  disabled,
  checked,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const describedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${styles.wrapper} ${className}`.trim()}>
      <label htmlFor={inputId} className={`${styles.labelContainer} ${disabled ? styles.disabled : ""}`}>
        <span className={styles.checkboxControl}>
          <input
            type="checkbox"
            id={inputId}
            checked={checked}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            className={styles.nativeCheckbox}
            {...props}
          />
          <span
            className={`${styles.customBox} ${checked ? styles.checked : ""} ${
              error ? styles.boxError : ""
            }`}
            aria-hidden="true"
          >
            {checked && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.checkIcon}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </span>
        {label && <span className={styles.labelText}>{label}</span>}
      </label>

      {error ? (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className={styles.helperText}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
