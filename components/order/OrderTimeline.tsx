import React from "react";
import type { OrderStatus } from "@/lib/validation/order-schema";
import { ORDER_STATUS_LABELS } from "@/lib/validation/order-schema";
import styles from "./OrderTimeline.module.css";

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

const ORDER_FLOW: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
];

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === "CANCELLED") {
    return (
      <div
        style={{
          padding: "var(--space-4)",
          backgroundColor: "var(--color-danger-bg)",
          border: "1px solid var(--color-danger-border)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-danger-fg)",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "var(--font-size-body-m)" }}>
          Pesanan Telah Dibatalkan
        </div>
        <div style={{ fontSize: "var(--font-size-body-s)", marginTop: "var(--space-1)" }}>
          {ORDER_STATUS_LABELS.CANCELLED.description}
        </div>
      </div>
    );
  }

  // Handle READY_FOR_PICKUP as equivalent stage to SHIPPED in flow
  const normalizedCurrent =
    currentStatus === "READY_FOR_PICKUP" ? "SHIPPED" : currentStatus;
  const currentIndex = ORDER_FLOW.indexOf(normalizedCurrent);

  return (
    <div className={styles.timeline}>
      {ORDER_FLOW.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const stepInfo = ORDER_STATUS_LABELS[step];

        // Custom label if READY_FOR_PICKUP
        const title =
          currentStatus === "READY_FOR_PICKUP" && step === "SHIPPED"
            ? "Siap Diambil di Lokasi"
            : stepInfo.label;
        const description =
          currentStatus === "READY_FOR_PICKUP" && step === "SHIPPED"
            ? ORDER_STATUS_LABELS.READY_FOR_PICKUP.description
            : stepInfo.description;

        return (
          <div
            key={step}
            className={`${styles.step} ${isCompleted ? styles.stepCompleted : ""}`}
          >
            <div
              className={`${styles.indicator} ${
                isCompleted
                  ? styles.indicatorCompleted
                  : isActive
                  ? styles.indicatorActive
                  : ""
              }`}
            >
              {isCompleted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <div className={styles.content}>
              <div
                className={`${styles.stepTitle} ${
                  isActive ? styles.stepActiveTitle : ""
                }`}
              >
                {title}
              </div>
              <div className={styles.stepDescription}>{description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
