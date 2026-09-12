import { test } from "node:test";
import assert from "node:assert/strict";
import { adaptZone, type ZoneRow } from "../lib/db/rows.ts";
import type { DataIssue } from "../lib/types.ts";
const row: ZoneRow = {
  zone_id: "test",
  nom: "Test",
  pays: "Test",
  hero_image_path: null,
  code_aeroport: "LIS",
  code_aeroport_alt: null,
  aeroport: null,
  transfert: null,
  lat_centre: "38.1",
  lon_centre: "-9.2",
  notes: null,
  spots: [
    {
      spot_id: "test-spot",
      zone_id: "test",
      nom: "Test",
      niveau_min: "debutant",
      niveau_ideal: "tous_niveaux",
      mois_debut: 10,
      mois_fin: 3,
      saison_ideale: null,
      type_vague: null,
      fond: null,
      notes: null,
      flag_verif: null,
    },
  ],
};
test("niveau historique isolé avec identifiant et champ, sans conversion", () => {
  const issues: DataIssue[] = [];
  const zone = adaptZone(row, issues);
  assert.equal(zone.spots[0].minimumLevel, "debutant");
  assert.equal(zone.spots[0].idealLevel, null);
  assert.equal(zone.spots[0].idealNeedsReview, true);
  assert.deepEqual(issues, [
    {
      entity: "spots",
      id: "test-spot",
      field: "niveau_ideal",
      value: "tous_niveaux",
    },
  ]);
  assert.equal(zone.latitude, 38.1);
});
test("niveau minimum inconnu, coordonnées et saison invalides sont isolés", () => {
  const issues: DataIssue[] = [];
  const zone = adaptZone(
    {
      ...row,
      lat_centre: "NaN",
      spots: [{ ...row.spots[0], niveau_min: "advanced", mois_debut: 0 }],
    },
    issues,
  );
  assert.equal(zone.spots[0].minimumLevel, null);
  assert.equal(zone.latitude, null);
  assert.equal(zone.spots[0].startMonth, null);
  assert.ok(
    issues.some((i) => i.field === "niveau_min" && i.id === "test-spot"),
  );
});
test("image : chemin de la zone conservé, autre zone ou URL isolée en diagnostic", () => {
  assert.equal(
    adaptZone({ ...row, hero_image_path: "test/hero.webp" }, []).heroImagePath,
    "test/hero.webp",
  );
  for (const path of [
    "other/hero.webp",
    "https://example.com/hero.webp",
    "test/../hero.webp",
  ]) {
    const issues: DataIssue[] = [];
    assert.equal(
      adaptZone({ ...row, hero_image_path: path }, issues).heroImagePath,
      null,
    );
    assert.deepEqual(
      issues.find((issue) => issue.field === "hero_image_path"),
      { entity: "zones", id: "test", field: "hero_image_path", value: path },
    );
  }
});
