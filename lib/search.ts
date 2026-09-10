import type {
  Airport,
  Destination,
  SearchCriteria,
  SearchMatch,
} from "./types.ts";

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function getTripMonths(departure: string, returnDate: string): number[] {
  if (
    !isValidDate(departure) ||
    !isValidDate(returnDate) ||
    returnDate < departure
  )
    return [];
  const cursor = new Date(`${departure}T12:00:00Z`);
  const end = new Date(`${returnDate}T12:00:00Z`);
  cursor.setUTCDate(1);
  const months = new Set<number>();
  while (cursor <= end && months.size < 12) {
    months.add(cursor.getUTCMonth() + 1);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return [...months];
}

export function distanceKm(
  a: Pick<Airport, "latitude" | "longitude">,
  b: Pick<Airport, "latitude" | "longitude">,
): number {
  const rad = (value: number) => (value * Math.PI) / 180;
  const lat = rad(b.latitude - a.latitude);
  const lon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(lat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(lon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

export function searchDestinations(
  destinations: Destination[],
  criteria: SearchCriteria,
  airport: Airport,
): SearchMatch[] {
  const months = getTripMonths(criteria.departure, criteria.returnDate);
  if (!months.length) return [];
  return destinations
    .filter(
      (d) =>
        d.levels.includes(criteria.level) &&
        (criteria.destination === "Monde entier" ||
          d.country === criteria.destination ||
          d.region === criteria.destination),
    )
    .map((destination): SearchMatch => {
      const good = months.filter((month) =>
        destination.bestMonths.includes(month),
      ).length;
      const shoulder = months.filter((month) =>
        destination.shoulderMonths.includes(month),
      ).length;
      const season: SearchMatch["season"] =
        good === months.length
          ? "good"
          : good + shoulder > 0
            ? "variable"
            : "off";
      const distance = distanceKm(airport, destination.airport);
      const suitable = destination.spots.filter(
        (spot) =>
          ["Débutant", "Intermédiaire", "Expert"].indexOf(spot.level) <=
          ["Débutant", "Intermédiaire", "Expert"].indexOf(criteria.level),
      ).length;
      return {
        destination,
        season,
        distanceKm: distance,
        score:
          Math.round(((good + shoulder * 0.45) / months.length) * 100) -
          distance / 20000,
        reasons: [
          `${suitable} ${suitable > 1 ? "exemples de spots adaptés" : "exemple de spot adapté"} à ton niveau`,
          season === "good"
            ? "Tes dates correspondent à la période favorable"
            : season === "variable"
              ? "Une partie du séjour présente des conditions variables"
              : "Tes dates sont en dehors de la période favorable",
          `Environ ${destination.transferMinutes} min depuis ${destination.airport.city} (${destination.airport.code})`,
        ],
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.destination.slug.localeCompare(b.destination.slug),
    );
}
