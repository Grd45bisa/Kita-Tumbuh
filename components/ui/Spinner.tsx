import React from "react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function Spinner({ size = "md", className = "", label = "Memuat..." }: SpinnerProps) {
  const px = sizeMap[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={label}
      role="status"
      style={{ animation: "spin 0.7s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="50"
        strokeDashoffset="30"
        opacity="0.85"
      />
    </svg>
  );
}
