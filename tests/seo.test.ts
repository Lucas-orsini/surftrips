import test from "node:test";
import assert from "node:assert/strict";
import {
  siteOrigin,
  nonProduction,
  canonicalUrl,
  catalogSitemap,
  destinationMetadata,
  destinationStructuredData,
  serializeJsonLd,
  siteStructuredData,
} from "../lib/seo.ts";
import type { Zone } from "../lib/types.ts";

const zone: Zone = {
  zoneId: "test-zone",
  name: "Destination test",
  country: "Pays test",
  heroImagePath: null,
  airportCode: null,
  airportAlternative: null,
  airportName: null,
  transfer: null,
  latitude: null,
  longitude: null,
  notes: null,
  spots: [],
};

test("SEO : l’origine suit les redirects publics et refuse un domaine preview", () => {
  for (const value of [
    undefined,
    "",
    "https://surftrips.fr/",
    "http://www.surftrips.fr",
    "https://www.surftrips.fr",
  ])
    assert.equal(siteOrigin(value), "https://www.surftrips.fr");
  for (const value of [
    "https://preview.vercel.app",
    "http://localhost:3000",
    "https://www.surftrips.fr/path",
    "https://www.surftrips.fr?x=1",
    "https://user@www.surftrips.fr",
    "invalid",
  ])
    assert.throws(() => siteOrigin(value));
});

test("SEO : preview/dev noindex, production indexable même sans variable Vercel", () => {
  assert.equal(
    nonProduction({ VERCEL_ENV: "preview", NODE_ENV: "production" }),
    true,
  );
  assert.equal(nonProduction({ VERCEL_ENV: "development" }), true);
  assert.equal(
    nonProduction({ VERCEL_ENV: "staging", NODE_ENV: "production" }),
    true,
  );
  assert.equal(nonProduction({ NODE_ENV: "development" }), true);
  assert.equal(
    nonProduction({ VERCEL_ENV: "production", NODE_ENV: "production" }),
    false,
  );
  assert.equal(nonProduction({ NODE_ENV: "production" }), false);
});

test("SEO : sitemap canonique, dédupliqué, sans dates inventées ni données invalides", () => {
  const sitemap = catalogSitemap([
    zone,
    zone,
    { ...zone, zoneId: "../go/booking" },
    { ...zone, name: " " },
  ]);
  assert.deepEqual(
    sitemap,
    ["/", "/destinations", "/destination/test-zone"].map((path) => ({
      url: canonicalUrl(path),
    })),
  );
  assert.throws(() => catalogSitemap([]), /SEO_CATALOG_EMPTY/);
});

test("SEO : métadonnées spécifiques, image de secours et canonical sans critères", () => {
  const metadata = destinationMetadata(zone);
  assert.match(String(metadata.title), /Destination test/);
  assert.match(String(metadata.description), /Pays test/);
  assert.equal(
    metadata.alternates?.canonical,
    "https://www.surftrips.fr/destination/test-zone",
  );
  assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
  assert.deepEqual(metadata.twitter?.images, [
    "https://www.surftrips.fr/opengraph-image",
  ]);
  assert.deepEqual(destinationMetadata({ ...zone, name: "" }).robots, {
    index: false,
    follow: true,
  });
});

test("SEO : JSON-LD sans injection, sans offres ni identité inventée", () => {
  const value = destinationStructuredData({
    ...zone,
    name: '</script><script>alert("x")</script>',
  });
  const json = serializeJsonLd(value);
  assert.ok(!json.includes("<"));
  assert.deepEqual(JSON.parse(json), value);
  assert.equal(
    value.itemListElement[2].item,
    "https://www.surftrips.fr/destination/test-zone",
  );
  assert.deepEqual(
    Object.keys(siteStructuredData()).sort(),
    ["@context", "@id", "@type", "inLanguage", "name", "url"].sort(),
  );
  assert.equal(siteStructuredData()["@type"], "WebSite");
});
