import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isValidDate,
  getTripMonths,
  searchDestinations,
  distanceKm,
} from "../lib/search.ts";
import { AIRPORTS, DEMO_DESTINATIONS } from "../lib/data.ts";
import type { SearchCriteria } from "../lib/types.ts";

const criteria: SearchCriteria = {
  level: "Intermédiaire",
  airport: "PAR",
  departure: "2027-09-10",
  returnDate: "2027-09-24",
  destination: "Monde entier",
};

test("dates : rejette les dates inexistantes et respecte les années bissextiles", () => {
  assert.equal(isValidDate("2027-02-29"), false);
  assert.equal(isValidDate("2028-02-29"), true);
  assert.equal(isValidDate("2027-13-10"), false);
  assert.equal(isValidDate("2027-09-10"), true);
  assert.equal(isValidDate("pas-une-date"), false);
});
test("le séjour prend en compte tous les mois et le changement d’année", () => {
  assert.deepEqual(getTripMonths("2027-12-28", "2028-02-03"), [12, 1, 2]);
  assert.deepEqual(getTripMonths("2027-09-10", "2027-09-24"), [9]);
  assert.deepEqual(getTripMonths("2027-09-24", "2027-09-10"), []);
});
test("une même recherche produit toujours les mêmes résultats et favorise la saison", () => {
  const first = searchDestinations(DEMO_DESTINATIONS, criteria, AIRPORTS[0]);
  assert.deepEqual(
    first,
    searchDestinations(DEMO_DESTINATIONS, criteria, AIRPORTS[0]),
  );
  assert.equal(first[0].destination.slug, "ericeira");
  assert.equal(first[0].season, "good");
  assert.equal(first.at(-1)?.destination.slug, "taghazout");
});
test("l’hiver favorise Taghazout et une date absente ne produit pas de faux résultats", () => {
  const winter = {
    ...criteria,
    departure: "2028-01-10",
    returnDate: "2028-01-24",
  };
  assert.equal(
    searchDestinations(DEMO_DESTINATIONS, winter, AIRPORTS[0])[0].destination
      .slug,
    "taghazout",
  );
  assert.deepEqual(
    searchDestinations(
      DEMO_DESTINATIONS,
      { ...criteria, departure: "" },
      AIRPORTS[0],
    ),
    [],
  );
});
test("les filtres de pays et de région limitent effectivement les résultats", () => {
  const byCountry = searchDestinations(
    DEMO_DESTINATIONS,
    { ...criteria, destination: "Portugal" },
    AIRPORTS[0],
  );
  const byRegion = searchDestinations(
    DEMO_DESTINATIONS,
    { ...criteria, destination: "Asie" },
    AIRPORTS[0],
  );
  assert.deepEqual(
    byCountry.map((m) => m.destination.slug),
    ["ericeira"],
  );
  assert.deepEqual(
    byRegion.map((m) => m.destination.slug),
    ["canggu"],
  );
  assert.deepEqual(
    searchDestinations(
      DEMO_DESTINATIONS,
      { ...criteria, destination: "Atlantide" },
      AIRPORTS[0],
    ),
    [],
  );
});
test("le niveau explique les spots accessibles et l’aéroport influence la distance", () => {
  const beginner = searchDestinations(
    DEMO_DESTINATIONS,
    { ...criteria, level: "Débutant" },
    AIRPORTS[0],
  );
  assert.match(beginner[0].reasons[0], /^1 exemple/);
  const expert = searchDestinations(
    DEMO_DESTINATIONS,
    { ...criteria, level: "Expert" },
    AIRPORTS[0],
  );
  assert.match(expert[0].reasons[0], /^3 exemples/);
  assert.equal(distanceKm(AIRPORTS[0], AIRPORTS[0]), 0);
  assert.notEqual(
    distanceKm(AIRPORTS[0], DEMO_DESTINATIONS[0].airport),
    distanceKm(AIRPORTS[3], DEMO_DESTINATIONS[0].airport),
  );
});
