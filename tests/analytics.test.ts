import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeAnalyticsEvent } from "../lib/analytics.ts";

test("analytics : retire tous les critères, tokens, emails et fragments sans modifier l’URL du produit", () => {
  const event = {
    type: "pageview" as const,
    url: "https://www.surftrips.fr/destination/ericeira?niveau=expert&origine=PAR&dateDepart=2027-01-01&dateRetour=2027-01-10&email=example%40example.com&token=secret&utm_source=test#access_token=secret",
  };
  const original = { ...event };
  assert.deepEqual(sanitizeAnalyticsEvent(event), {
    type: "pageview",
    url: "https://www.surftrips.fr/destination/ericeira",
  });
  assert.deepEqual(event, original);
});

test("analytics : préserve chaque chemin public et l’origine réelle, y compris preview et local", () => {
  for (const origin of [
    "https://www.surftrips.fr",
    "https://surftrips-preview.vercel.app",
    "http://localhost:3000",
  ]) {
    for (const path of [
      "/",
      "/recherche",
      "/destination/biarritz",
      "/ou-surfer-en/novembre",
      "/ou-surfer-en/decembre",
      "/surf/portugal",
      "/comparer/ericeira-vs-peniche",
      "/mentions-legales",
    ]) {
      assert.deepEqual(
        sanitizeAnalyticsEvent({
          type: "pageview",
          url: `${origin}${path}?unknown=private#anchor`,
        }),
        { type: "pageview", url: `${origin}${path}` },
      );
    }
  }
});

test("analytics : rejette événements personnalisés, URL invalides et identifiants dans l’autorité", () => {
  assert.equal(
    sanitizeAnalyticsEvent({ type: "event", url: "https://www.surftrips.fr/" }),
    null,
  );
  for (const url of [
    "broken",
    "javascript:alert(1)",
    "https://user:password@www.surftrips.fr/",
    "file:///private/file",
  ]) {
    assert.equal(sanitizeAnalyticsEvent({ type: "pageview", url }), null);
  }
});
