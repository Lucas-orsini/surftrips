import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adaptAccommodation,
  suppliedHttpsUrl,
  type AccommodationRow,
} from "../lib/accommodation/validation.ts";
import {
  hotelsPubref,
  isHotelsPubref,
  HOTELS_WIDGET_ATTRIBUTES,
  HOTELS_WIDGET_SCRIPT,
} from "../lib/accommodation/widget.ts";
import {
  ACCOMMODATION_TYPES,
  PRICE_CATEGORIES,
} from "../lib/accommodation/types.ts";

// Technical fixtures only: no property identity, price, image or tracking invented.
const row: AccommodationRow = {
  id: "test-row",
  zone_id: "ericeira",
  name: "Recommandation éditoriale (test)",
  slug: "test",
  type: "hotel",
  location_label: null,
  description: null,
  image_url: null,
  distance_label: null,
  price_category: null,
  affiliate_url:
    "https://example.com/manually-supplied?value=a%26b&ref=unchanged",
  featured: true,
  display_order: 2,
};

test("liens fournis conservés exactement, protocoles dangereux rejetés", () => {
  assert.equal(suppliedHttpsUrl(row.affiliate_url), row.affiliate_url);
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
  assert.equal(item.affiliateUrl, row.affiliate_url);
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
    adaptAccommodation({ ...row, affiliate_url: "javascript:alert(1)" }),
    null,
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

test("widget officiel : affiliation inchangée, aucun préremplissage inventé", () => {
  assert.deepEqual(HOTELS_WIDGET_ATTRIBUTES, {
    "data-widget": "search",
    "data-program": "fr-hcom",
    "data-lobs": "stays",
    "data-network": "pz",
    "data-camref": "1011l5QTXG",
  });
  assert.equal(
    HOTELS_WIDGET_SCRIPT,
    "https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js",
  );
  assert.equal(hotelsPubref("ericeira"), "surftrips-ericeira");
  assert.equal(hotelsPubref("ericeira"), hotelsPubref("ericeira"));
  assert.notEqual(hotelsPubref("ericeira"), hotelsPubref("taghazout"));
  for (const id of [
    "",
    "../../",
    "ericeira?email=user@example.com",
    "<script>",
    "a".repeat(161),
  ])
    assert.throws(() => hotelsPubref(id));
  assert.equal(isHotelsPubref("surftrips-ericeira"), true);
  assert.equal(isHotelsPubref("surftrips-ericeira&secret=test"), false);
});
