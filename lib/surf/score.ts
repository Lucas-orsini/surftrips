import type { SurfLevel } from "./levels.ts";
import { SEASON_VALUE, type SeasonStatus } from "./season.ts";
import type { SurfSpot } from "../types.ts";
export const SCORE_WEIGHTS = {
  level: 0.45,
  season: 0.3,
  spots: 0.15,
  transfer: 0.1,
} as const;
/** Only unambiguous complete durations; mixed transport and ranges stay unknown. */
export function transferMinutes(text: string | null): number | null {
  if (!text) return null;
  const match =
    /^(\d+)\s*(?:h(?:\s*(\d{1,2}))?|min)(?:\s+(?:de route|route|taxi\/navette|taxi\/scooter|route ou bus direct))?$/i.exec(
      text.trim(),
    );
  if (!match) return null;
  return /h/i.test(match[0])
    ? Number(match[1]) * 60 + Number(match[2] || 0)
    : Number(match[1]);
}
export function destinationScore(
  spots: SurfSpot[],
  level: SurfLevel,
  season: SeasonStatus | null,
  transfer: string | null,
): number {
  if (!spots.length) return 0;
  // Accessible is the gate; an explicitly matching ideal gives an extra preference.
  const levelFit = Math.max(
    ...spots.map((s) => (s.idealLevel === level ? 1 : 0.8)),
  );
  const minutes = transferMinutes(transfer);
  const score =
    SCORE_WEIGHTS.level * levelFit +
    SCORE_WEIGHTS.season * (season ? SEASON_VALUE[season] : 0) +
    SCORE_WEIGHTS.spots * Math.min(spots.length / 5, 1) +
    SCORE_WEIGHTS.transfer *
      (minutes === null ? 0 : Math.max(0, 1 - minutes / 360));
  return Math.round(score * 10000) / 100;
}
