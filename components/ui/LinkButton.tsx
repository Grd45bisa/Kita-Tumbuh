import React from "react";
import Link from "next/link";
import styles from "./Button.module.css";
import type { ButtonVariant, ButtonSize } from "./Button";

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}: LinkButtonProps) {
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
    <Link
      href={href}
      className={`${styles.button} ${variantClass} ${sizeClass} ${
        fullWidth ? styles.fullWidth : ""
      } ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
    </Link>
  );
}
