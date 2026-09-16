import React from "react";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isCenter ? "center" : "flex-start",
        textAlign: isCenter ? "center" : "left",
        maxWidth: isCenter ? "720px" : "100%",
        marginLeft: isCenter ? "auto" : undefined,
        marginRight: isCenter ? "auto" : undefined,
        marginBottom: "var(--space-8)",
      }}
    >
      {eyebrow && (
        <span
          style={{
            fontSize: "var(--font-size-caption)",
            fontWeight: "var(--font-weight-semibold)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--color-brand-secondary)",
            marginBottom: "var(--space-2)",
          }}
        >
          {eyebrow}
        </span>
      )}
      <h2
        style={{
          fontSize: "var(--font-size-heading-l)",
          lineHeight: "var(--line-height-heading-l)",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-text-primary)",
          marginBottom: description ? "var(--space-3)" : 0,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontSize: "var(--font-size-body-l)",
            color: "var(--color-text-secondary)",
            lineHeight: "var(--line-height-body-l)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
