import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { CollectionPoint } from "@/types/donation";
import type { WasteType } from "@/types/donation";
import styles from "./CollectionPointCard.module.css";

const DAY_LABELS: Record<string, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

interface CollectionPointCardProps {
  point: CollectionPoint;
  wasteTypesBySlug: Map<string, WasteType>;
}

export function CollectionPointCard({ point, wasteTypesBySlug }: CollectionPointCardProps) {
  const locationParts = [point.address, point.district, point.city].filter(Boolean);
  const fullAddress = locationParts.join(", ");
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress || point.name
  )}`;

  const acceptedNames = (point.accepted_waste_slugs ?? [])
    .map((slug) => wasteTypesBySlug.get(slug)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{point.name}</h3>
        <span className={styles.code}>{point.code}</span>
      </div>

      <p className={styles.address}>{fullAddress}</p>

      {acceptedNames.length > 0 && (
        <div className={styles.wasteTags}>
          {acceptedNames.map((name) => (
            <Badge key={name} variant="brand">
              {name}
            </Badge>
          ))}
        </div>
      )}

      {point.operating_hours && (
        <dl className={styles.hours}>
          {Object.entries(point.operating_hours).map(([day, hours]) => (
            <div key={day} className={styles.hoursRow}>
              <dt>{DAY_LABELS[day] ?? day}</dt>
              <dd>{hours}</dd>
            </div>
          ))}
        </dl>
      )}

      {point.notes && <p className={styles.notes}>{point.notes}</p>}

      <div className={styles.footer}>
        {point.phone && (
          <a href={`tel:${point.phone}`} className={styles.phoneLink}>
            {point.phone}
          </a>
        )}
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.directionsLink}
        >
          Lihat arah
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
