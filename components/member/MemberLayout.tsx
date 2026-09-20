import React from "react";
import styles from "./MemberLayout.module.css";
import { MemberNav } from "./MemberNav";
import type { AuthUser } from "@/types/user";

interface MemberLayoutProps {
  user: AuthUser;
  children: React.ReactNode;
  activeKey?: string;
}

export function MemberLayout({ user, children }: MemberLayoutProps) {
  return (
    <div className={styles.layoutShell}>
      <div className={styles.container}>
        <div className={styles.navColumn}>
          <MemberNav user={user} />
        </div>
        <div className={styles.contentColumn}>{children}</div>
      </div>
    </div>
  );
}
