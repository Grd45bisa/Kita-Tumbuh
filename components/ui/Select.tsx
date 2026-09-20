import React from "react";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  hint,
  error,
  required,
  options,
  placeholder,
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}
      <div className={styles.selectWrapper}>
        <select
          id={selectId}
          className={`${styles.select} ${error ? styles.hasError : ""} ${className}`.trim()}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <svg
          className={styles.chevron}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {error && (
        <p id={`${selectId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${selectId}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
