import type { DataIssue, SurfSpot, Zone } from "../types.ts";
import { isSurfLevel } from "../surf/levels.ts";
import { isMonth } from "../surf/season.ts";
import { isDestinationImagePath } from "../images/destination.ts";
// PostgreSQL numeric is returned as text by pg; nullable fields stay nullable.
export interface SpotRow {
  spot_id: string;
  nom: string;
  zone_id: string;
  niveau_min: string | null;
  niveau_ideal: string | null;
  mois_debut: number | null;
  mois_fin: number | null;
  saison_ideale: string | null;
  type_vague: string | null;
  fond: string | null;
  notes: string | null;
  flag_verif: string | null;
}
export interface ZoneRow {
  zone_id: string;
  nom: string;
  pays: string;
  hero_image_path: string | null;
  code_aeroport: string | null;
  code_aeroport_alt: string | null;
  aeroport: string | null;
  transfert: string | null;
  lat_centre: string | number | null;
  lon_centre: string | number | null;
  notes: string | null;
  spots: SpotRow[];
}
export function adaptZone(row: ZoneRow, issues: DataIssue[]): Zone {
  function number(value: string | number | null, field: string, limit: number) {
    if (value === null) return null;
    const result = Number(value);
    if (value === "" || !Number.isFinite(result) || Math.abs(result) > limit) {
      issues.push({ entity: "zones", id: row.zone_id, field, value });
      return null;
    }
    return result;
  }
  const spots: SurfSpot[] = row.spots.map((s) => {
    for (const field of ["niveau_min", "niveau_ideal"] as const) {
      if (
        !isSurfLevel(s[field]) &&
        (field === "niveau_min" || s[field] !== null)
      )
        issues.push({ entity: "spots", id: s.spot_id, field, value: s[field] });
    }
    for (const field of ["mois_debut", "mois_fin"] as const)
      if (!isMonth(s[field]))
        issues.push({ entity: "spots", id: s.spot_id, field, value: s[field] });
    return {
      spotId: s.spot_id,
      name: s.nom,
      zoneId: s.zone_id,
      minimumLevel: isSurfLevel(s.niveau_min) ? s.niveau_min : null,
      idealLevel: isSurfLevel(s.niveau_ideal) ? s.niveau_ideal : null,
      minimumNeedsReview: !isSurfLevel(s.niveau_min),
      idealNeedsReview: s.niveau_ideal !== null && !isSurfLevel(s.niveau_ideal),
      startMonth: isMonth(s.mois_debut) ? s.mois_debut : null,
      endMonth: isMonth(s.mois_fin) ? s.mois_fin : null,
      season: s.saison_ideale,
      wave: s.type_vague,
      bottom: s.fond,
      notes: s.notes,
      caution: s.flag_verif,
    };
  });
  const airportCode =
    row.code_aeroport && /^[A-Z]{3}$/.test(row.code_aeroport)
      ? row.code_aeroport
      : null;
  if (!airportCode)
    issues.push({
      entity: "zones",
      id: row.zone_id,
      field: "code_aeroport",
      value: row.code_aeroport,
    });
  const heroImagePath =
    isDestinationImagePath(row.hero_image_path) &&
    row.hero_image_path.startsWith(`${row.zone_id}/`)
      ? row.hero_image_path
      : null;
  if (row.hero_image_path != null && !heroImagePath)
    issues.push({
      entity: "zones",
      id: row.zone_id,
      field: "hero_image_path",
      value: row.hero_image_path,
    });
  return {
    zoneId: row.zone_id,
    name: row.nom,
    country: row.pays,
    heroImagePath,
    airportCode,
    airportAlternative: row.code_aeroport_alt,
    airportName: row.aeroport,
    transfer: row.transfert,
    latitude: number(row.lat_centre, "lat_centre", 90),
    longitude: number(row.lon_centre, "lon_centre", 180),
    notes: row.notes,
    spots,
  };
}
