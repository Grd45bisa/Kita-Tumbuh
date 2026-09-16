import React from "react";
import styles from "./Card.module.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  padded?: boolean;
  hoverable?: boolean;
  subtle?: boolean;
  children: React.ReactNode;
}

export function Card({
  as: Component = "div",
  padded = true,
  hoverable = false,
  subtle = false,
  children,
  className = "",
  ...props
}: CardProps) {
  const classes = [
    styles.card,
    padded && styles.padded,
    hoverable && styles.hoverable,
    subtle && styles.subtle,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
