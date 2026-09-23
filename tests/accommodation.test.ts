import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adaptAccommodation,
  suppliedHttpsUrl,
  type AccommodationRow,
} from "../lib/accommodation/validation.ts";
import {
  ACCOMMODATION_TYPES,
  PRICE_CATEGORIES,
} from "../lib/accommodation/types.ts";

// Technical fixtures only: no property identity, price, image or tracking invented.
const row: AccommodationRow = {
  id: "00000000-0000-4000-8000-000000000001",
  zone_id: "ericeira",
  name: "Recommandation éditoriale (test)",
  slug: "test",
  type: "hotel",
  location_label: null,
  description: null,
  image_url: null,
  distance_label: null,
  price_category: null,
  booking_url:
    "https://www.booking.com/hotel/pt/fixture.html?value=a%26b&ref=unchanged",
  featured: true,
  display_order: 2,
};

test("liens fournis conservés exactement, protocoles dangereux rejetés", () => {
  assert.equal(suppliedHttpsUrl(row.booking_url), row.booking_url);
  for (const url of [
    undefined,
    "",
    "javascript:alert(1)",
    "http://example.com",
    "https:example.com",
    "//example.com",
    "https://user:secret@example.com",
    "https://example.com/\nlink",
    " https://example.com",
  ])
    assert.equal(suppliedHttpsUrl(url), undefined);
});

test("recommandation sans champs facultatifs : aucune information inventée", () => {
  const item = adaptAccommodation(row)!;
  assert.equal(item.bookingUrl, row.booking_url);
  assert.equal(item.zoneId, row.zone_id);
  for (const field of [
    "description",
    "imageUrl",
    "locationLabel",
    "distanceLabel",
    "priceCategory",
  ] as const)
    assert.equal(item[field], undefined);
  assert.equal(Object.hasOwn(item, "price"), false);
  assert.equal(Object.hasOwn(item, "rating"), false);
  assert.equal(Object.hasOwn(item, "availability"), false);
});

test("lien invalide et catégorie inconnue isolés", () => {
  assert.equal(
    adaptAccommodation({ ...row, booking_url: "javascript:alert(1)" })
      ?.bookingUrl,
    undefined,
  );
  assert.equal(adaptAccommodation({ ...row, type: "unknown" }), null);
  assert.equal(adaptAccommodation({ ...row, type: "__proto__" }), null);
  const item = adaptAccommodation({
    ...row,
    image_url: "data:image/svg+xml,test",
    price_category: "unknown",
  })!;
  assert.equal(item.imageUrl, undefined);
  assert.equal(item.priceCategory, undefined);
});

test("six types éditoriaux et trois gammes générales seulement", () => {
  assert.deepEqual(Object.keys(ACCOMMODATION_TYPES), [
    "hotel",
    "hostel",
    "surf_house",
    "apartment",
    "guesthouse",
    "surf_camp",
  ]);
  for (const type of Object.keys(ACCOMMODATION_TYPES))
    assert.equal(adaptAccommodation({ ...row, type })?.type, type);
  assert.deepEqual(Object.keys(PRICE_CATEGORIES), ["budget", "mid", "premium"]);
});

test("adresse éditoriale conservée sans URL Booking, sans reprendre un ancien lien affilié", () => {
  const item = adaptAccommodation({ ...row, booking_url: null });
  assert.equal(item?.name, row.name);
  assert.equal(item?.bookingUrl, undefined);
  assert.equal(Object.hasOwn(item!, "affiliateUrl"), false);
});
