import React from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    tertiary: styles.variantTertiary,
    destructive: styles.variantDestructive,
  }[variant];

  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];

  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${sizeClass} ${
        fullWidth ? styles.fullWidth : ""
      } ${className}`.trim()}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
