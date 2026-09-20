import React from "react";
import styles from "./Textarea.module.css";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  showCharCount?: boolean;
}

export function Textarea({
  label,
  hint,
  error,
  required,
  showCharCount,
  id,
  maxLength,
  value,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`${styles.textarea} ${error ? styles.hasError : ""} ${className}`.trim()}
        required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
        }
        maxLength={maxLength}
        value={value}
        {...props}
      />
      <div className={styles.footer}>
        {error && (
          <p id={`${textareaId}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className={styles.hint}>
            {hint}
          </p>
        )}
        {showCharCount && maxLength && (
          <span className={styles.charCount} aria-live="polite">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
