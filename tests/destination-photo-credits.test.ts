import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { destinationPhotoCredit } from "../lib/images/credits.ts";

test("chaque nouvelle photo avec attribution possède le crédit exact de sa licence", () => {
  const manifest = JSON.parse(
    readFileSync("docs/destination-image-final-seven.json", "utf8"),
  );
  for (const entry of manifest.images) {
    const credit = destinationPhotoCredit(entry.storage_path);
    if (!entry.attribution_required) {
      assert.equal(credit, undefined);
      continue;
    }
    assert.ok(credit);
    assert.equal(credit.photographer, entry.photographer);
    assert.equal(credit.photographerUrl, entry.photographer_url);
    assert.equal(credit.sourceUrl, entry.source_url);
    assert.equal(credit.title, entry.title);
    assert.equal(credit.license, entry.license);
    assert.equal(credit.licenseUrl, entry.license_url);
  }
});

test("les 70 images précédentes restent hors du nouveau périmètre et sans crédit ajouté", () => {
  const previous = ["batch", "batch-02", "completion"].flatMap(
    (name) =>
      JSON.parse(readFileSync(`docs/destination-image-${name}.json`, "utf8"))
        .images,
  );
  const final = JSON.parse(
    readFileSync("docs/destination-image-final-seven.json", "utf8"),
  );
  assert.equal(previous.length, 70);
  for (const entry of previous) {
    assert.equal(destinationPhotoCredit(entry.storage_path), undefined);
    assert.ok(
      !final.images.some(
        (image: { zone_id: string }) => image.zone_id === entry.zone_id,
      ),
    );
  }
  for (const path of [
    null,
    undefined,
    "",
    "constructor",
    "__proto__",
    "future/hero.webp",
  ])
    assert.equal(destinationPhotoCredit(path), undefined);
});
