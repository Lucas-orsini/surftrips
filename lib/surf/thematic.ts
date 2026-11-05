import type { SurfSpot, Zone } from "../types.ts";
import { isIndexableDestination } from "../seo.ts";
import {
  bestSeasonStatus,
  isMonth,
  monthStatus,
  type SeasonStatus,
} from "./season.ts";

/** Editorial ordering only. Never changes the personalized matching or scores. */
export function publicThemeZones(zones: readonly Zone[]): Zone[] {
  const unique = new Map<string, Zone>();
  for (const zone of zones)
    if (
      isIndexableDestination(zone) &&
      zone.spots.length &&
      !unique.has(zone.zoneId)
    )
      unique.set(zone.zoneId, zone);
  return [...unique.values()].sort(
    (a, b) =>
      a.country.localeCompare(b.country, "fr") ||
      a.name.localeCompare(b.name, "fr") ||
      a.zoneId.localeCompare(b.zoneId),
  );
}

export function monthlyZones(
  zones: readonly Zone[],
  month: number,
  status: SeasonStatus,
): Zone[] {
  if (!isMonth(month)) return [];
  return publicThemeZones(zones).filter(
    (zone) => bestSeasonStatus(zone.spots, [month]) === status,
  );
}

export function countryZones(zones: readonly Zone[], country: string): Zone[] {
  return publicThemeZones(zones).filter((zone) => zone.country === country);
}

export function monthTransitions(
  zones: readonly Zone[],
  from: number,
  to: number,
) {
  const before = monthlyZones(zones, from, "optimale");
  const after = monthlyZones(zones, to, "optimale");
  return {
    entering: after.filter(
      (z) => !before.some((other) => other.zoneId === z.zoneId),
    ),
    leaving: before.filter(
      (z) => !after.some((other) => other.zoneId === z.zoneId),
    ),
  };
}

export function crossesYearAtMonth(spot: SurfSpot, month: number): boolean {
  return (
    isMonth(spot.startMonth) &&
    isMonth(spot.endMonth) &&
    spot.startMonth > spot.endMonth &&
    monthStatus(month, spot.startMonth, spot.endMonth) === "optimale"
  );
}

/** A conservative editorial diagnostic, NOT a replacement for canSurf().
 * Passing this check alone is not proof of human verification or permission to publish.
 */
export function hasUnambiguousBeginnerLevel(spot: SurfSpot): boolean {
  return (
    spot.minimumLevel === "debutant" &&
    !spot.minimumNeedsReview &&
    spot.idealLevel !== null &&
    !spot.idealNeedsReview &&
    !spot.caution
  );
}
