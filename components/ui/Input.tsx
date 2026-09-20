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
  required,
  ...props
}: InputProps) {
  // The visible "*" mark tracks either the explicit isRequired prop or the
  // native HTML `required` attribute — every form in this codebase passes
  // plain `required`, not `isRequired`, so without this the mark never
  // appeared even though the native attribute (and its screen-reader
  // announcement) was already correct via {...props}.
  const showRequiredMark = isRequired || Boolean(required);
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
            {showRequiredMark && <span className={styles.requiredMark} aria-hidden="true">*</span>}
          </label>
          {isOptional && <span className={styles.optionalTag}>Opsional</span>}
        </div>
      )}

      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ""} ${className}`.trim()}
        disabled={disabled}
        required={required}
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
