"use client";

import { SURF_LEVELS, LEVEL_LABELS, type SurfLevel } from "@/lib/surf/levels";
import { Icon } from "@/components/ui/Icon";

const descriptions = [
  "Je découvre, je prends mes premières vagues.",
  "Je prends des vagues et je suis autonome.",
  "Je suis à l’aise dans des vagues exigeantes.",
];

export function SurfLevelSelector({
  value,
  onChange,
}: {
  value: SurfLevel;
  onChange: (value: SurfLevel) => void;
}) {
  return (
    <fieldset className="level-options">
      <legend className="sr-only">Ton niveau de surf</legend>
      {SURF_LEVELS.map((level, index) => (
        <label
          className={`level-option ${value === level ? "selected" : ""}`}
          key={level}
        >
          <input
            type="radio"
            name="surf-level"
            value={level}
            checked={value === level}
            onChange={() => onChange(level)}
          />
          <span>
            <strong>{LEVEL_LABELS[level]}</strong>
            <small>{descriptions[index]}</small>
          </span>
          {value === level && <Icon name="check" size={18} />}
        </label>
      ))}
    </fieldset>
  );
}
