import React from "react";
import { LinkButton } from "./LinkButton";
import styles from "./ErrorState.module.css";

export interface ErrorStateAction {
  label: string;
  href: string;
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ErrorStateAction;
  className?: string;
}

/**
 * Reusable in-page error state — for when a page renders successfully but a
 * data fetch inside it fails (e.g. a Supabase query errors while header/
 * footer still render fine). Distinct from Next.js route-level `error.tsx`,
 * which handles uncaught render errors for an entire route segment.
 */
export function ErrorState({
  title = "Terjadi kendala saat memuat data.",
  description = "Coba muat ulang halaman ini. Jika masalah berlanjut, silakan hubungi kami.",
  action,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`${styles.errorState} ${className}`.trim()} role="alert">
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
