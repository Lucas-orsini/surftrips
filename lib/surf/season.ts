export type SeasonStatus = "optimale" | "epaule" | "hors_saison";
export interface SeasonMonth {
  month: number;
  label: string;
  status: SeasonStatus | null;
}
export interface SeasonRange {
  startMonth: number | null;
  endMonth: number | null;
}
export const SEASON_LABELS: Record<SeasonStatus, string> = {
  optimale: "Bonne période",
  epaule: "Début ou fin de saison — conditions variables",
  hors_saison: "Hors saison — vagues moins régulières, mais praticable",
};
export const SEASON_CLASS: Record<SeasonStatus, string> = {
  optimale: "good",
  epaule: "variable",
  hors_saison: "off",
};
export const SEASON_VALUE: Record<SeasonStatus, number> = {
  optimale: 1,
  epaule: 0.6,
  hors_saison: 0.2,
};
export function isMonth(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 12
  );
}
export function isMonthInSeason(
  month: number,
  start: number,
  end: number,
): boolean {
  if (![month, start, end].every(isMonth)) return false;
  return start <= end
    ? month >= start && month <= end
    : month >= start || month <= end;
}
export function monthStatus(
  month: number,
  start: number,
  end: number,
): SeasonStatus | null {
  if (![month, start, end].every(isMonth)) return null;
  if (isMonthInSeason(month, start, end)) return "optimale";
  if (month === ((start + 10) % 12) + 1 || month === (end % 12) + 1)
    return "epaule";
  return "hors_saison";
}
/** Best status across accessible spots and all months touched by the trip. */
export function bestSeasonStatus(
  spots: SeasonRange[],
  months: number[],
): SeasonStatus | null {
  let best: SeasonStatus | null = null;
  for (const spot of spots)
    for (const month of months) {
      if (!isMonth(spot.startMonth) || !isMonth(spot.endMonth)) continue;
      const status = monthStatus(month, spot.startMonth, spot.endMonth);
      if (
        status &&
        (best === null || SEASON_VALUE[status] > SEASON_VALUE[best])
      )
        best = status;
    }
  return best;
}
const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
export function seasonTimeline(spots: SeasonRange[]): SeasonMonth[] {
  return MONTH_NAMES.map((label, index) => ({
    month: index + 1,
    label,
    status: bestSeasonStatus(spots, [index + 1]),
  }));
}
