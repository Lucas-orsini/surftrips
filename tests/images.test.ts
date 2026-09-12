import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getDestinationImageUrl,
  destinationImageRemotePatterns,
  destinationImageAlt,
  isDestinationImagePath,
} from "../lib/images/destination.ts";

const origin = "https://storage.example.test";
test("image : URL publique unique, WebP/AVIF et chemin de galerie futur", () => {
  assert.equal(
    getDestinationImageUrl("ericeira/hero.webp", origin),
    `${origin}/storage/v1/object/public/destinations/ericeira/hero.webp`,
  );
  assert.equal(isDestinationImagePath("ericeira/gallery/coast-02.avif"), true);
  assert.equal(
    destinationImageAlt("Ericeira", "Portugal"),
    "Surf à Ericeira, Portugal",
  );
});
test("image : absence, URL externe, traversée et configuration invalide donnent un fallback", () => {
  for (const path of [
    null,
    undefined,
    "",
    "hero.webp",
    "../hero.webp",
    "ericeira/../hero.webp",
    "ericeira/%2e%2e/hero.webp",
    "ericeira/hero.svg",
    "ericeira/hero.jpg",
    "ericeira/hero.webp?token=secret",
    "https://other.test/hero.webp",
    `ericeira/${"a".repeat(320)}.webp`,
  ])
    assert.equal(getDestinationImageUrl(path, origin), null);
  for (const url of [
    undefined,
    "",
    "invalid",
    "http://storage.example.test",
    "https://user:password@storage.example.test",
    `${origin}/api`,
    `${origin}?secret=value`,
    `${origin}:444`,
  ])
    assert.equal(getDestinationImageUrl("ericeira/hero.webp", url), null);
});
test("Next/Image : autorise uniquement le domaine configuré et le bucket destinations", () => {
  assert.deepEqual(destinationImageRemotePatterns(origin), [
    {
      protocol: "https",
      hostname: "storage.example.test",
      port: "",
      pathname: "/storage/v1/object/public/destinations/**",
      search: "",
    },
  ]);
  assert.deepEqual(destinationImageRemotePatterns(undefined), []);
});
