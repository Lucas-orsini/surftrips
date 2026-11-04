import test from "node:test";
import assert from "node:assert/strict";
import {
  destinationEditorials,
  validateDestinationEditorial,
  getDestinationEditorial,
  editorialSpotNote,
  relatedCountryDestinations,
} from "../lib/editorial/destinations.ts";
import { destinationBannerAlt } from "../lib/images/banner.ts";

test("éditorial : cinq contenus distincts, sources et références valides", () => {
  const introductions = new Set<string>();
  for (const [id, entry] of Object.entries(destinationEditorials)) {
    assert.ok(entry);
    const zone = {
      zoneId: id,
      country: entry.country,
      spots: entry.spotIds.map((spotId) => ({ spotId })),
    };
    assert.deepEqual(validateDestinationEditorial(entry, zone), []);
    assert.equal(getDestinationEditorial(zone), entry);
    assert.ok(entry.introduction?.sourceIds?.length);
    introductions.add(entry.introduction!.text);
  }
  assert.equal(introductions.size, 5);
  assert.equal(destinationEditorials.uluwatu, undefined);
  assert.ok(destinationEditorials["bukit-bali"]);
});

test("éditorial : une identité ou un rattachement périmé masque le contenu", () => {
  const zone = {
    zoneId: "ericeira",
    country: "Portugal",
    spots: [{ spotId: "coxos" }],
  };
  assert.equal(getDestinationEditorial(zone), undefined);
  assert.equal(
    getDestinationEditorial({ ...zone, country: "France" }),
    undefined,
  );
  assert.equal(
    getDestinationEditorial({ ...zone, zoneId: "zone-inexistante" }),
    undefined,
  );
});

test("éditorial : refuse sections vides, sources inconnues et URL actives", () => {
  const entry = destinationEditorials.biarritz!;
  const zone = {
    zoneId: entry.zoneId,
    country: entry.country,
    spots: [{ spotId: "cote-des-basques" }],
  };
  for (const invalid of [
    { ...entry, introduction: { text: " " } },
    { ...entry, practical: [] },
    { ...entry, introduction: { text: "Fait", sourceIds: ["absente"] } },
    {
      ...entry,
      sources: {
        ville: {
          label: "Ville",
          url: "javascript:alert(1)",
          checkedAt: "2026-11-04",
        },
      },
    },
    { ...entry, spotNotes: { autre: null } },
    { ...entry, spotIds: ["cote-des-basques", "cote-des-basques"] },
  ])
    assert.ok(validateDestinationEditorial(invalid, zone).length);
});

test("éditorial : notes historiques conservées ailleurs, retrait explicite sans mutation", () => {
  const spot = { spotId: "coxos", notes: "Note historique" };
  assert.deepEqual(editorialSpotNote(spot), { text: "Note historique" });
  assert.equal(editorialSpotNote(spot, destinationEditorials.ericeira), null);
  assert.equal(spot.notes, "Note historique");
  assert.equal(editorialSpotNote({ spotId: "autre", notes: null }), null);
});

test("maillage : même pays, uniques, routes valides, sans aéroport déjà lié", () => {
  const make = (zoneId: string, name: string, country = "France") => ({
    zoneId,
    name,
    country,
  });
  const catalog = [
    make("self", "Origine"),
    make("same-airport", "Aéroport"),
    make("other", "Ailleurs", "Portugal"),
    make("bad?slug", "Invalide"),
    make("z", "Zulu"),
    make("a", "Alpha"),
    make("b", "Bravo"),
    make("c", "Charlie"),
    make("a", "Alpha"),
  ];
  const before = JSON.stringify(catalog);
  const selected = relatedCountryDestinations(catalog[0], catalog, [
    "same-airport",
  ]);
  assert.deepEqual(
    selected.map((z) => z.zoneId),
    ["a", "b", "c"],
  );
  assert.equal(JSON.stringify(catalog), before);
  assert.deepEqual(
    relatedCountryDestinations(
      make("unique", "Unique", "Pays sans autre zone"),
      catalog,
    ),
    [],
  );
});

test("images : description liée au fichier vérifié, sans localisation de spot inventée", () => {
  assert.match(destinationBannerAlt("ericeira/hero.webp")!, /Deux surfeurs/);
  assert.doesNotMatch(
    destinationBannerAlt("biarritz/hero.webp")!,
    /Côte des Basques/,
  );
  assert.equal(destinationBannerAlt("biarritz/new.webp"), undefined);
  assert.equal(destinationBannerAlt(null), undefined);
});
