"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MemberNav.module.css";
import type { AuthUser } from "@/types/user";

interface MemberNavProps {
  user: AuthUser;
}

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

export function MemberNav({ user }: MemberNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: "Beranda",
      href: "/dashboard",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: "Riwayat",
      href: "/riwayat",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Dampak",
      href: "/impact",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      ),
    },
    {
      label: "Profil",
      href: "/profil",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const displayName = user.profile?.full_name || user.email.split("@")[0] || "Member";

  return (
    <aside className={styles.navShell} aria-label="Navigasi Area Member">
      <div className={styles.userCard}>
        <div className={styles.userAvatar} aria-hidden="true">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{displayName}</span>
          <span className={styles.userEmail}>{user.email}</span>
        </div>
      </div>

      <div className={styles.ctaWrapper}>
        <Link href="/donasikan" className={styles.donateCta}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Donasi limbah</span>
        </Link>
      </div>

      <nav className={styles.linksNav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={styles.linkIcon}>{item.icon(isActive)}</span>
                  <span className={styles.linkLabel}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}
