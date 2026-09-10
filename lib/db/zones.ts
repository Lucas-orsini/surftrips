import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { readQuery } from "./index.ts";
import { adaptZone, type ZoneRow } from "./rows.ts";
import type { DataIssue } from "../types.ts";

// Existing public schema inspected on 2026-09-10. No migrations or schema writes.
// Explicit columns: future internal columns cannot accidentally reach the browser.
const ZONE_SELECT = `SELECT z.zone_id,z.nom,z.pays,z.code_aeroport,z.code_aeroport_alt,
 z.aeroport,z.transfert,z.lat_centre,z.lon_centre,z.notes,
 COALESCE((SELECT jsonb_agg(jsonb_build_object(
  'spot_id',s.spot_id,'nom',s.nom,'zone_id',s.zone_id,
  'niveau_min',s.niveau_min,'niveau_ideal',s.niveau_ideal,
  'mois_debut',s.mois_debut,'mois_fin',s.mois_fin,'saison_ideale',s.saison_ideale,
  'type_vague',s.type_vague,'fond',s.fond,'notes',s.notes,'flag_verif',s.flag_verif
 ) ORDER BY s.spot_id) FROM public.spots s WHERE s.zone_id=z.zone_id),'[]'::jsonb) AS spots
 FROM public.zones z`;

function adapt(rows: ZoneRow[]) {
  const issues: DataIssue[] = [];
  const zones = rows.map((row) => adaptZone(row, issues));
  return { zones, issues };
}
export const getCatalog = cache(
  unstable_cache(
    async () => {
      return adapt(
        await readQuery<ZoneRow>(`${ZONE_SELECT} ORDER BY z.zone_id`),
      );
    },
    ["surf-catalog-v1"],
    { revalidate: 60 },
  ),
);

export const getZone = cache(async (zoneId: string) => {
  if (!/^[a-zA-Z0-9_-]{1,160}$/.test(zoneId)) return undefined;
  return adapt(
    await readQuery<ZoneRow>(`${ZONE_SELECT} WHERE z.zone_id=$1`, [zoneId]),
  ).zones[0];
});
export async function getOtherZones(airportCode: string, zoneId: string) {
  return adapt(
    await readQuery<ZoneRow>(
      `${ZONE_SELECT} WHERE z.code_aeroport=$1 AND z.zone_id<>$2 ORDER BY z.nom,z.zone_id`,
      [airportCode, zoneId],
    ),
  ).zones;
}
export async function getCountries() {
  return [...new Set((await getCatalog()).zones.map((z) => z.country))].sort(
    (a, b) => a.localeCompare(b, "fr"),
  );
}
