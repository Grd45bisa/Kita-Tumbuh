import React from "react";
import { LinkButton } from "./LinkButton";
import styles from "./EmptyState.module.css";

export interface EmptyStateAction {
  label: string;
  href: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: EmptyStateAction;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Honest "nothing here yet" state — used when a data-driven section has no
 * records to show (empty filter result, no data published yet). Never used
 * to imply that a feature is unavailable; see `ErrorState` for failures and
 * a dedicated "Coming Soon" treatment for features not yet built.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`${styles.emptyState} ${className}`.trim()} role="status">
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <LinkButton href={action.href} variant="secondary" size="md" className={styles.action}>
          {action.label}
        </LinkButton>
      )}
    </div>
  );
}
