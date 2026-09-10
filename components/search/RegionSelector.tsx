"use client";

import { Icon } from "@/components/ui/Icon";

export function RegionSelector({
  value,
  countries,
  onChange,
}: {
  value: string;
  countries: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="region-options">
      {["Monde entier", ...countries].map((region, index) => (
        <button
          key={region}
          type="button"
          className={`region-option ${value === region ? "selected" : ""} ${index === 1 ? "region-divider" : ""}`}
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
