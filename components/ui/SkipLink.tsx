import React from "react";

export interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export function SkipLink({
  targetId = "main-content",
  label = "Lewati ke konten utama",
}: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className="skip-link">
      {label}
    </a>
  );
}
