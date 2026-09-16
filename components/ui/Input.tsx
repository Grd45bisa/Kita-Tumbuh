import React, { useId } from "react";
import styles from "./Input.module.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isRequired?: boolean;
  isOptional?: boolean;
}

export function Input({
  label,
  helperText,
  error,
  isRequired = false,
  isOptional = false,
  id,
  className = "",
  disabled,
  ...props
}: InputProps) {
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
    <div className={styles.fieldWrapper}>
      {label && (
        <div className={styles.labelWrapper}>
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {isRequired && <span className={styles.requiredMark} aria-hidden="true">*</span>}
          </label>
          {isOptional && <span className={styles.optionalTag}>Opsional</span>}
        </div>
      )}

      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ""} ${className}`.trim()}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...props}
      />

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
