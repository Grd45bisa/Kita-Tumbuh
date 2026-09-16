import React from "react";
import styles from "./Badge.module.css";

export type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({
  variant = "neutral",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const variantClass = styles[variant] || styles.neutral;

  return (
    <span
      className={`${styles.badge} ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
