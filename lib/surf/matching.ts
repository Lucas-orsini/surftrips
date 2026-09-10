import type {
  Destination,
  MapPoint,
  SearchCriteria,
  SearchDestination,
  Zone,
} from "../types.ts";
import { canSurf, LEVEL_LABELS, SURF_LEVELS } from "./levels.ts";
import { bestSeasonStatus, seasonTimeline } from "./season.ts";
import { destinationScore } from "./score.ts";
import { getTripMonths } from "../validation/dates.ts";
import { WORLD } from "../validation/search.ts";
export function prepareDestination(
  zone: Zone,
  criteria?: SearchCriteria,
): Destination {
  const spots = criteria
    ? zone.spots.filter(
        (s) =>
          s.minimumLevel !== null && canSurf(criteria.niveau, s.minimumLevel),
      )
    : zone.spots;
  const levels = SURF_LEVELS.filter((level) =>
    spots.some((s) => s.minimumLevel && canSurf(level, s.minimumLevel)),
  );
  return {
    ...zone,
    spots,
    compatibleSpots: spots.length,
    levelLabel: criteria
      ? LEVEL_LABELS[criteria.niveau]
      : levels.map((l) => LEVEL_LABELS[l]).join(" · ") || "Niveau à vérifier",
    seasonStatus: criteria
      ? bestSeasonStatus(
          spots,
          getTripMonths(criteria.dateDepart, criteria.dateRetour),
        )
      : null,
    timeline: seasonTimeline(spots),
    coordinates:
      zone.latitude !== null && zone.longitude !== null
        ? `${Math.abs(zone.latitude).toFixed(3)}° ${zone.latitude >= 0 ? "N" : "S"} · ${Math.abs(zone.longitude).toFixed(3)}° ${zone.longitude >= 0 ? "E" : "W"}`
        : undefined,
  };
}
export interface Exclusion {
  zoneId: string;
  reason:
    "niveau_trop_eleve" | "region_exclue" | "niveau_a_verifier" | "aucun_spot";
}
export function matchDestinations(
  zones: Zone[],
  criteria: SearchCriteria,
): { destinations: SearchDestination[]; exclusions: Exclusion[] } {
  const exclusions: Exclusion[] = [];
  const matches: SearchDestination[] = [];
  const worldwide = !criteria.region || criteria.region === WORLD;
  for (const zone of zones) {
    if (!worldwide && zone.country !== criteria.region) {
      exclusions.push({ zoneId: zone.zoneId, reason: "region_exclue" });
      continue;
    }
    const destination = prepareDestination(zone, criteria);
    if (!destination.spots.length) {
      exclusions.push({
        zoneId: zone.zoneId,
        reason: !zone.spots.length
          ? "aucun_spot"
          : zone.spots.every((s) => !s.minimumLevel)
            ? "niveau_a_verifier"
            : "niveau_trop_eleve",
      });
      continue;
    }
    matches.push({
      ...destination,
      score: destinationScore(
        destination.spots,
        criteria.niveau,
        destination.seasonStatus,
        zone.transfer,
      ),
    });
  }
  matches.sort(
    (a, b) =>
      b.score - a.score ||
      (a.zoneId < b.zoneId ? -1 : a.zoneId > b.zoneId ? 1 : 0),
  );
  if (!worldwide) return { destinations: matches, exclusions };
  const counts = new Map<string, number>();
  return {
    destinations: matches
      .filter((d) => {
        const count = counts.get(d.country) || 0;
        if (count >= 2) return false;
        counts.set(d.country, count + 1);
        return true;
      })
      .slice(0, 12),
    exclusions,
  };
}
export function mapPoints(zones: Zone[]): MapPoint[] {
  return zones.flatMap((zone) =>
    zone.latitude === null ||
    zone.longitude === null ||
    zone.latitude > 80 ||
    zone.latitude < -60
      ? []
      : [
          {
            zoneId: zone.zoneId,
            name: zone.name,
            country: zone.country,
            airport: zone.airportName,
            iata: zone.airportCode,
            transfer: zone.transfer,
            x: ((zone.longitude + 180) / 360) * 100,
            y: ((80 - zone.latitude) / 140) * 100,
          },
        ],
  );
}
