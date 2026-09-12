import { test } from "node:test";
import assert from "node:assert/strict";
import { canSurf, SURF_LEVELS, type SurfLevel } from "../lib/surf/levels.ts";
import {
  isMonthInSeason,
  monthStatus,
  bestSeasonStatus,
  seasonTimeline,
} from "../lib/surf/season.ts";
import { matchDestinations } from "../lib/surf/matching.ts";
import { transferMinutes, SCORE_WEIGHTS } from "../lib/surf/score.ts";
import { validateSearch } from "../lib/validation/search.ts";
import { dateBounds, getTripMonths } from "../lib/validation/dates.ts";
import { createRateLimiter } from "../lib/security/rate-limit.ts";
import type { Zone, SurfSpot, SearchCriteria } from "../lib/types.ts";
// Isolated fixtures for unit tests only; never imported by application modules.
const criteria: SearchCriteria = {
  niveau: "intermediaire",
  origine: "PAR",
  dateDepart: "2026-10-10",
  dateRetour: "2026-10-20",
};
const now = new Date("2026-09-10T12:00:00Z");
function spot(level: SurfLevel | null = "debutant"): SurfSpot {
  return {
    spotId: "test",
    name: "Test",
    zoneId: "test",
    minimumLevel: level,
    idealLevel: null,
    minimumNeedsReview: level === null,
    idealNeedsReview: false,
    startMonth: 10,
    endMonth: 3,
    season: null,
    wave: null,
    bottom: null,
    notes: null,
    caution: null,
  };
}
function zone(id: string, country = "Test", spots = [spot()]): Zone {
  return {
    zoneId: id,
    name: id,
    country,
    heroImagePath: null,
    spots,
    airportCode: "LIS",
    airportAlternative: null,
    airportName: null,
    transfer: "45min de route",
    latitude: null,
    longitude: null,
    notes: null,
  };
}
test("les trois niveaux et les neuf comparaisons", () => {
  assert.deepEqual(SURF_LEVELS, ["debutant", "intermediaire", "expert"]);
  for (const [i, user] of SURF_LEVELS.entries())
    for (const [j, minimum] of SURF_LEVELS.entries())
      assert.equal(canSurf(user, minimum), i >= j);
  assert.equal(canSurf("expert", "avance" as SurfLevel), false);
});
for (const [start, end, month, expected] of [
  [10, 3, 1, true],
  [10, 3, 11, true],
  [10, 3, 7, false],
  [5, 9, 7, true],
  [5, 9, 12, false],
] as const)
  test(`saison ${start} → ${end}, mois ${month}`, () =>
    assert.equal(isMonthInSeason(month, start, end), expected));
test("épaule circulaire et meilleure saison des spots accessibles", () => {
  assert.equal(monthStatus(12, 1, 3), "epaule");
  assert.equal(monthStatus(1, 10, 12), "epaule");
  assert.equal(
    bestSeasonStatus(
      [
        { startMonth: 10, endMonth: 3 },
        { startMonth: 5, endMonth: 9 },
      ],
      [7],
    ),
    "optimale",
  );
  assert.equal(
    seasonTimeline([{ startMonth: 10, endMonth: 3 }])[0].status,
    "optimale",
  );
  assert.equal(
    bestSeasonStatus([{ startMonth: null, endMonth: null }], [1]),
    null,
  );
});
test("niveau bloquant côté métier, saison jamais éliminatoire", () => {
  const zones = [
    zone("expert", "Test", [spot("expert")]),
    zone("mixed", "Test", [spot("expert"), spot("intermediaire")]),
    zone("unknown", "Test", [spot(null)]),
  ];
  const result = matchDestinations(zones, {
    ...criteria,
    dateDepart: "2026-07-01",
    dateRetour: "2026-07-10",
  });
  assert.deepEqual(
    result.destinations.map((d) => d.zoneId),
    ["mixed"],
  );
  assert.equal(result.destinations[0].spots.length, 1);
  assert.equal(result.destinations[0].seasonStatus, "hors_saison");
  assert.equal(
    result.exclusions.find((e) => e.zoneId === "expert")?.reason,
    "niveau_trop_eleve",
  );
  assert.equal(
    matchDestinations(zones, { ...criteria, niveau: "debutant" }).destinations
      .length,
    0,
  );
});
test("classement déterministe, deux par pays, douze mondialement, toutes par pays", () => {
  const zones = Array.from({ length: 32 }, (_, i) =>
    zone(String(i).padStart(2, "0"), `Pays ${Math.floor(i / 4)}`),
  );
  const result = matchDestinations(zones, criteria).destinations;
  assert.deepEqual(
    result,
    matchDestinations([...zones].reverse(), criteria).destinations,
  );
  assert.equal(result.length, 12);
  for (const country of new Set(result.map((d) => d.country)))
    assert.equal(result.filter((d) => d.country === country).length, 2);
  assert.equal(
    matchDestinations(zones, { ...criteria, region: "Pays 0" }).destinations
      .length,
    4,
  );
  assert.equal(
    matchDestinations(zones, { ...criteria, region: "Monde entier" })
      .destinations.length,
    12,
  );
});
test("validation stricte IATA indépendante des arrivées et des paramètres multiples", () => {
  assert.equal(validateSearch({ ...criteria }, [], now).success, true);
  for (const origine of ["GVA", "BRU", "LYS"])
    assert.equal(
      validateSearch({ ...criteria, origine }, [], now).success,
      true,
    );
  for (const origine of ["ZZZ", "LIS", "par", "PAR<script>"])
    assert.equal(
      validateSearch({ ...criteria, origine }, [], now).success,
      false,
    );
  assert.equal(
    validateSearch({ ...criteria, niveau: ["expert", "debutant"] }, [], now)
      .success,
    false,
  );
  assert.equal(
    validateSearch({ ...criteria, niveau: "avance" }, [], now).success,
    false,
  );
  assert.equal(
    validateSearch({ ...criteria, region: "Atlantide" }, [], now).success,
    false,
  );
});
test("dates réelles, ordre strict, passé, douze mois et année bissextile", () => {
  for (const [dateDepart, dateRetour] of [
    ["2026-02-30", "2026-10-20"],
    ["2026-09-09", "2026-10-20"],
    ["2026-10-10", "2026-10-10"],
    ["2026-10-10", "2026-10-09"],
    ["2026-10-10", "2027-09-11"],
  ])
    assert.equal(
      validateSearch({ ...criteria, dateDepart, dateRetour }, [], now).success,
      false,
    );
  assert.equal(
    validateSearch({ ...criteria, dateRetour: "2027-09-10" }, [], now).success,
    true,
  );
  assert.equal(
    dateBounds(new Date("2028-02-29T12:00:00Z")).maximum,
    "2029-02-28",
  );
  assert.deepEqual(getTripMonths("2026-12-20", "2027-01-10"), [12, 1]);
});
test("poids et transferts incertains", () => {
  assert.equal(
    Object.values(SCORE_WEIGHTS).reduce<number>((a, b) => a + b, 0),
    1,
  );
  assert.equal(transferMinutes("1h15 de route"), 75);
  assert.equal(transferMinutes("45min-1h taxi/scooter"), null);
  assert.equal(transferMinutes("1h15 de route + bateau"), null);
});
test("trente recherches par minute par IP, fenêtre glissante", () => {
  const consume = createRateLimiter();
  for (let i = 0; i < 30; i++) assert.equal(consume("one", i).allowed, true);
  assert.equal(consume("one", 30).allowed, false);
  assert.equal(consume("two", 30).allowed, true);
  assert.equal(consume("one", 60000).allowed, true);
  assert.equal(consume("one", 60000).allowed, false);
});

test("une saison idéale d’un spot expert n’améliore pas le résultat débutant", () => {
  const beginner = { ...spot(), startMonth: 5, endMonth: 9 };
  const expert = { ...spot("expert"), startMonth: 10, endMonth: 3 };
  const result = matchDestinations(
    [zone("mixed", "Test", [beginner, expert])],
    {
      ...criteria,
      niveau: "debutant",
      dateDepart: "2026-12-01",
      dateRetour: "2026-12-15",
    },
  );
  assert.equal(result.destinations[0].seasonStatus, "hors_saison");
  assert.equal(result.destinations[0].timeline[0].status, "hors_saison");
});
