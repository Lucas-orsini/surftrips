import { AIRPORTS } from "../airports.ts";
import { isSurfLevel } from "../surf/levels.ts";
import { dateBounds, isValidDate } from "./dates.ts";
import type { SearchCriteria } from "../types.ts";
export type SearchParams = Record<string, string | string[] | undefined>;
export type ValidationResult =
  { success: true; data: SearchCriteria } | { success: false; error: string };
export const WORLD = "Monde entier";
export function validateSearch(
  input: SearchParams,
  countries: readonly string[],
  now = new Date(),
): ValidationResult {
  const { niveau, origine, dateDepart, dateRetour, region } = input;
  const fail = (error: string): ValidationResult => ({ success: false, error });
  if (!isSurfLevel(niveau)) return fail("Choisis un niveau de surf proposé.");
  if (
    typeof origine !== "string" ||
    !/^[A-Z]{3}$/.test(origine) ||
    !AIRPORTS.some((a) => a.code === origine)
  )
    return fail("Choisis un aéroport de départ proposé.");
  if (
    typeof dateDepart !== "string" ||
    typeof dateRetour !== "string" ||
    !isValidDate(dateDepart) ||
    !isValidDate(dateRetour)
  )
    return fail("Choisis une date de départ et une date de retour valides.");
  if (dateRetour <= dateDepart)
    return fail("La date de retour doit être après le départ.");
  const { today, maximum } = dateBounds(now);
  if (dateDepart < today || dateRetour > maximum)
    return fail(
      "Choisis un voyage entre aujourd’hui et les douze prochains mois.",
    );
  if (
    region !== undefined &&
    (typeof region !== "string" ||
      (region !== WORLD && !countries.includes(region)))
  )
    return fail("Choisis un pays proposé ou Monde entier.");
  return {
    success: true,
    data: {
      niveau,
      origine,
      dateDepart,
      dateRetour,
      ...(region && region !== WORLD ? { region } : {}),
    },
  };
}
export function searchQuery(criteria: SearchCriteria): string {
  const params = new URLSearchParams({
    niveau: criteria.niveau,
    origine: criteria.origine,
    dateDepart: criteria.dateDepart,
    dateRetour: criteria.dateRetour,
  });
  if (criteria.region && criteria.region !== WORLD)
    params.set("region", criteria.region);
  return params.toString();
}
export function destinationHref(
  zoneId: string,
  criteria?: SearchCriteria,
): string {
  return `/destination/${encodeURIComponent(zoneId)}${criteria ? `?${searchQuery(criteria)}` : ""}`;
}
