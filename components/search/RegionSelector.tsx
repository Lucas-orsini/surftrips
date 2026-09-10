"use client";

import { Icon } from "@/components/ui/Icon";

export const REGIONS = [
  "Monde entier",
  "Europe",
  "Afrique",
  "Asie",
  "Portugal",
  "Maroc",
  "Indonésie",
];

export function RegionSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="region-options">
      {REGIONS.map((region, index) => (
        <button
          key={region}
          type="button"
          className={`region-option ${value === region ? "selected" : ""} ${index === 4 ? "region-divider" : ""}`}
          aria-pressed={value === region}
          onClick={() => onChange(region)}
        >
          <span>{region}</span>
          {value === region && <Icon name="check" size={17} />}
        </button>
      ))}
    </div>
  );
}
