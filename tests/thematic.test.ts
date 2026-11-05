import test from "node:test";
import assert from "node:assert/strict";
import type { SurfSpot, Zone } from "../lib/types.ts";
import {
  monthlyZones,
  countryZones,
  monthTransitions,
  crossesYearAtMonth,
  hasUnambiguousBeginnerLevel,
} from "../lib/surf/thematic.ts";
import {
  THEMES,
  getMonthTheme,
  publishedThemes,
  themeDestinations,
  themesForDestination,
} from "../lib/editorial/themes.ts";
import {
  catalogSitemap,
  canonicalUrl,
  thematicStructuredData,
  serializeJsonLd,
} from "../lib/seo.ts";

function spot(patch: Partial<SurfSpot> = {}): SurfSpot {
  return {
    spotId: "spot",
    name: "Spot",
    zoneId: "zone",
    minimumLevel: "intermediaire",
    idealLevel: "expert",
    minimumNeedsReview: false,
    idealNeedsReview: false,
    startMonth: 10,
    endMonth: 3,
    season: "octobre a mars",
    wave: "point break",
    bottom: "roche",
    notes: null,
    caution: null,
    ...patch,
  };
}
function zone(id: string, spots = [spot()], patch: Partial<Zone> = {}): Zone {
  return {
    zoneId: id,
    name: id,
    country: "Portugal",
    heroImagePath: null,
    airportCode: "LIS",
    airportAlternative: null,
    airportName: "Lisbonne",
    transfer: "Transfert documenté",
    latitude: null,
    longitude: null,
    notes: null,
    spots,
    ...patch,
  };
}

test("guides : novembre, décembre et janvier inclus dans octobre → mars", () => {
  const catalog = [zone("a")];
  for (const month of [11, 12, 1, 2, 3])
    assert.equal(monthlyZones(catalog, month, "optimale").length, 1);
  for (const month of [9, 4])
    assert.equal(monthlyZones(catalog, month, "epaule").length, 1);
  assert.equal(monthlyZones(catalog, 7, "hors_saison").length, 1);
  assert.equal(crossesYearAtMonth(spot(), 12), true);
  assert.equal(
    crossesYearAtMonth(spot({ startMonth: 1, endMonth: 12 }), 12),
    false,
  );
});

test("guides : le meilleur statut ne change ni les autres spots ni leur niveau", () => {
  const catalog = [
    zone("a", [
      spot({ minimumLevel: "expert" }),
      spot({
        spotId: "b",
        minimumLevel: "debutant",
        idealLevel: null,
        idealNeedsReview: true,
        startMonth: 5,
        endMonth: 8,
      }),
    ]),
  ];
  const before = JSON.stringify(catalog);
  const selected = monthlyZones(catalog, 11, "optimale");
  assert.equal(selected[0].spots.length, 2);
  assert.equal(selected[0].spots[1].idealNeedsReview, true);
  assert.equal(JSON.stringify(catalog), before);
});

test("guides : saisons invalides ou absentes jamais favorables, mois hors limites refusés", () => {
  const catalog = [
    zone("a", [spot({ startMonth: null })]),
    zone("b", [spot({ endMonth: 13 })]),
  ];
  for (const status of ["optimale", "epaule", "hors_saison"] as const)
    assert.deepEqual(monthlyZones(catalog, 11, status), []);
  assert.deepEqual(monthlyZones([zone("a")], 13, "optimale"), []);
});

test("guides : sélection Portugal réelle, tri déterministe, déduplication et aucune mutation", () => {
  const catalog = [
    zone("z"),
    zone("a"),
    zone("a"),
    zone("elsewhere", undefined, { country: "France" }),
    zone("bad?slug"),
    zone("empty", []),
  ];
  const before = JSON.stringify(catalog);
  assert.deepEqual(
    countryZones(catalog, "Portugal").map((z) => z.zoneId),
    ["a", "z"],
  );
  assert.equal(countryZones([...catalog, zone("new")], "Portugal").length, 3);
  assert.equal(JSON.stringify(catalog), before);
});

test("guides : distinguer les entrées et sorties entre novembre et décembre", () => {
  const catalog = [
    zone("leaving", [spot({ startMonth: 9, endMonth: 11 })]),
    zone("entering", [spot({ startMonth: 12, endMonth: 3 })]),
    zone("staying"),
  ];
  const changes = monthTransitions(catalog, 11, 12);
  assert.deepEqual(
    changes.entering.map((z) => z.zoneId),
    ["entering"],
  );
  assert.deepEqual(
    changes.leaving.map((z) => z.zoneId),
    ["leaving"],
  );
});

test("guides : aucun niveau idéal ambigu ne devient une recommandation débutant", () => {
  const candidate = spot({
    minimumLevel: "debutant",
    idealLevel: "intermediaire",
  });
  assert.equal(hasUnambiguousBeginnerLevel(candidate), true);
  for (const patch of [
    { idealNeedsReview: true, idealLevel: null },
    { idealLevel: null },
    { minimumNeedsReview: true },
    { caution: "Accès à vérifier" },
  ] as Partial<SurfSpot>[])
    assert.equal(
      hasUnambiguousBeginnerLevel({ ...candidate, ...patch }),
      false,
    );
  assert.equal(
    THEMES.some((theme) => theme.path === "/surf-debutant"),
    false,
  );
});

test("guides : seulement les deux mois validés, comparatif soumis aux données", () => {
  for (const slug of [
    "janvier",
    "mars",
    "constructor",
    "__proto__",
    "Novembre",
    "novembre/debutant",
  ])
    assert.equal(getMonthTheme(slug), undefined);
  assert.equal(getMonthTheme("decembre")?.month, 12);
  const catalog = [zone("ericeira"), zone("peniche")];
  assert.equal(publishedThemes(catalog).length, 4);
  assert.equal(publishedThemes(catalog.slice(0, 1)).length, 0);
  assert.equal(
    publishedThemes([
      zone("ericeira"),
      zone("peniche", undefined, { airportCode: "FAO" }),
    ]).some((theme) => theme.kind === "comparison"),
    false,
  );
});

test("guides : liens retour seulement vers les sélections qui contiennent la zone", () => {
  const a = zone("ericeira");
  const b = zone("peniche");
  const off = zone("off", [spot({ startMonth: 5, endMonth: 8 })], {
    country: "France",
  });
  assert.deepEqual(themesForDestination(off, [a, b, off]), []);
  const links = themesForDestination(a, [a, b, off]);
  assert.equal(links.length, 4);
  assert.ok(
    links.every((theme) =>
      themeDestinations(theme, [a, b, off]).some((z) => z.zoneId === a.zoneId),
    ),
  );
});

test("guides : sitemap publié sans dates fabriquées, exclusion des routes non validées", () => {
  const catalog = [zone("ericeira"), zone("peniche")];
  const themes = publishedThemes(catalog);
  const sitemap = catalogSitemap(
    catalog,
    themes.map((theme) => theme.path),
  );
  assert.equal(sitemap.length, 2 + catalog.length + themes.length);
  assert.equal(new Set(sitemap.map((entry) => entry.url)).size, sitemap.length);
  assert.ok(
    sitemap.every((entry) => !entry.lastModified && !entry.url.includes("?")),
  );
  assert.ok(!sitemap.some((entry) => entry.url.endsWith("/surf-debutant")));
  assert.throws(() =>
    catalogSitemap(
      [],
      themes.map((theme) => theme.path),
    ),
  );
});

test("guides : JSON-LD fidèle à la liste et protégé contre les scripts", () => {
  const theme = THEMES[0];
  const zones = [
    zone("ericeira", undefined, { name: "</script><script>alert(1)</script>" }),
    zone("peniche"),
  ];
  const data = thematicStructuredData(theme, zones);
  const encoded = serializeJsonLd(data);
  assert.ok(!encoded.includes("<"));
  const parsed = JSON.parse(encoded);
  assert.equal(
    parsed["@graph"][0].itemListElement[2].item,
    canonicalUrl(theme.path),
  );
  assert.equal(parsed["@graph"][1].numberOfItems, zones.length);
  assert.deepEqual(
    parsed["@graph"][1].itemListElement.map(
      (item: { url: string }) => item.url,
    ),
    zones.map((z) => canonicalUrl(`/destination/${z.zoneId}`)),
  );
  assert.ok(
    !encoded.includes("FAQPage") && !encoded.includes("AggregateRating"),
  );
});

test("articles : une sélection courte ne supprime pas les relations thématiques existantes", async () => {
  const { articleHighlights } =
    await import("../lib/editorial/theme-articles.ts");
  const ericeira = zone("ericeira", [
    spot({ spotId: "coxos", zoneId: "ericeira" }),
    spot({ spotId: "other", zoneId: "ericeira" }),
  ]);
  const catalog = [
    ericeira,
    zone("unfeatured", [spot({ zoneId: "unfeatured" })]),
  ];
  const before = JSON.stringify(catalog);
  assert.equal(articleHighlights(THEMES[0], catalog).length, 1);
  assert.equal(themeDestinations(THEMES[0], catalog).length, 2);
  assert.ok(
    themesForDestination(catalog[1], catalog).some((t) => t.id === "novembre"),
  );
  assert.equal(JSON.stringify(catalog), before);
});

test("articles : association, pays, mois et angle éditorial périmés sont détectés", async () => {
  const { articleHighlights, articleSelectionIssues } =
    await import("../lib/editorial/theme-articles.ts");
  const reference = zone(
    "hossegor",
    [
      spot({
        spotId: "la-graviere",
        zoneId: "hossegor",
        startMonth: 9,
        endMonth: 11,
      }),
    ],
    { country: "France" },
  );
  assert.equal(articleHighlights(THEMES[0], [reference]).length, 1);
  for (const invalid of [
    { ...reference, country: "Portugal" },
    { ...reference, spots: [{ ...reference.spots[0], zoneId: "other" }] },
    { ...reference, spots: [{ ...reference.spots[0], endMonth: 12 }] },
    {
      ...reference,
      spots: [{ ...reference.spots[0], startMonth: 5, endMonth: 8 }],
    },
  ]) {
    assert.equal(articleHighlights(THEMES[0], [invalid]).length, 0);
    assert.ok(
      articleSelectionIssues(THEMES[0], [invalid]).some((i) =>
        i.includes("hossegor"),
      ),
    );
  }
});

test("articles : les dates affichées viennent des mois réels, aucune nouvelle saison", async () => {
  const { articlePeriod } = await import("../lib/editorial/theme-articles.ts");
  assert.equal(articlePeriod(spot()), "octobre–mars");
  assert.equal(
    articlePeriod(spot({ startMonth: 9, endMonth: 9 })),
    "septembre",
  );
  assert.equal(articlePeriod(spot({ startMonth: null })), "Période à vérifier");
});

test("articles : photo identifiée par son fichier exact et crédit fidèle au manifeste", async () => {
  const { articlePhoto } = await import("../lib/editorial/theme-photos.ts");
  const { readFileSync } = await import("node:fs");
  const initial = JSON.parse(
    readFileSync("docs/destination-image-batch.json", "utf8"),
  ).images;
  const completed = JSON.parse(
    readFileSync("docs/destination-image-completion.json", "utf8"),
  );
  const items = [
    ...initial,
    ...Object.values(completed).filter(Array.isArray).flat(),
  ];
  for (const id of [
    "ericeira",
    "peniche",
    "imsouane",
    "hossegor",
    "bukit-bali",
    "fernando-de-noronha",
    "mompiche",
    "jardim-do-mar",
  ]) {
    const photo = articlePhoto(`${id}/hero.webp`)!;
    const provenance = items.find(
      (row) =>
        row &&
        typeof row === "object" &&
        row.storage_path === `${id}/hero.webp`,
    );
    assert.ok(provenance, id);
    assert.equal(photo.author, provenance.photographer);
    assert.equal(
      new URL(photo.source).pathname.slice(-11),
      new URL(provenance.source_url).pathname.slice(-11),
    );
    assert.ok(photo.alt.length > 15 && photo.caption.length > 10);
  }
  assert.equal(articlePhoto("ericeira/replacement.webp"), undefined);
  assert.equal(articlePhoto("__proto__"), undefined);
});
