import React from "react";
import { LinkButton } from "./LinkButton";
import styles from "./ComingSoon.module.css";

export interface ComingSoonAction {
  label: string;
  href: string;
}

export interface ComingSoonProps {
  title: string;
  description: string;
  action?: ComingSoonAction;
  className?: string;
}

/**
 * Honest "not built yet" state for documented-but-unimplemented features —
 * per AGENTS.md §31. Used instead of fabricated data (product prices,
 * program targets, impact numbers, stories) whenever the underlying backend
 * for a Phase 2 page has not been built (Phase 5/7/8 work not yet done).
 */
export function ComingSoon({ title, description, action, className = "" }: ComingSoonProps) {
  return (
    <div className={`${styles.comingSoon} ${className}`.trim()} role="status">
      <span className={styles.badge}>Segera Hadir</span>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {action && (
        <LinkButton href={action.href} variant="primary" size="md" className={styles.action}>
          {action.label}
        </LinkButton>
      )}
    </div>
  );
}
