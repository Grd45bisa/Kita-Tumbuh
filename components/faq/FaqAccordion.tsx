"use client";

import React, { useState } from "react";
import type { FaqItem } from "@/lib/content/types";
import styles from "./FaqAccordion.module.css";

interface FaqAccordionProps {
  items: FaqItem[];
}

/**
 * Small client component for expand/collapse interaction only — the FAQ
 * content itself is server-rendered as plain text via `items`, so answers
 * remain crawlable and match what FAQPage structured data can legitimately
 * describe (the text is genuinely present in the page, not hidden behind
 * a client-only fetch).
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={item.question} className={styles.item}>
            <h3 className={styles.heading}>
              <button
                type="button"
                id={buttonId}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <span className={styles.icon} aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={styles.panel}
              hidden={!isOpen}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
