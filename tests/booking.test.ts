import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bookingDestinationUrl,
  bookingSid,
  createBookingAffiliateUrl,
  evergreenUrl,
} from "../lib/booking/urls.ts";
import {
  bookingRedirect,
  type BookingTarget,
} from "../lib/booking/redirect.ts";

// Technical fixtures only. The CJ domain is deliberately fictitious and never used by the app.
const base = "https://affiliate.example/click-account-link?existing=a%26b";
const property = "https://www.booking.com/hotel/pt/fixture.html";
const id = "00000000-0000-4000-8000-000000000001";
const target: BookingTarget = {
  zoneId: "ericeira",
  bookingUrl: property,
  active: true,
};
const buildUrl = (input: Parameters<typeof createBookingAffiliateUrl>[1]) =>
  createBookingAffiliateUrl(base, input);
const go = (
  row: BookingTarget | undefined,
  kind: "accommodation" | "destination" = "accommodation",
) =>
  bookingRedirect({
    kind,
    id: kind === "accommodation" ? id : "ericeira",
    lookup: async () => row,
    buildUrl,
  });

test("CJ : encodage une seule fois, paramètres existants et SID", () => {
  const destination = `${property}?label=a%26b&lang=fr&selected_currency=EUR#map`;
  const url = new URL(
    createBookingAffiliateUrl(base, {
      destinationUrl: destination,
      sid: bookingSid("ericeira", "hotel-card"),
    })!,
  );
  assert.equal(url.origin, new URL(base).origin);
  assert.equal(url.pathname, new URL(base).pathname);
  assert.equal(url.searchParams.get("existing"), "a&b");
  assert.equal(url.searchParams.get("url"), destination);
  assert.equal(url.searchParams.get("sid"), "surftrips-ericeira-hotel-card");
  assert.equal(url.searchParams.size, 3);
});

test("CJ : Evergreen sans query, avec query et avec anciens url/sid", () => {
  for (const evergreen of [
    "https://affiliate.example/click",
    base,
    `${base}&url=old&url=other&sid=old&sid=other`,
  ]) {
    const url = new URL(
      createBookingAffiliateUrl(evergreen, {
        destinationUrl: property,
        sid: bookingSid("ericeira", "all"),
      })!,
    );
    assert.deepEqual(url.searchParams.getAll("url"), [property]);
    assert.deepEqual(url.searchParams.getAll("sid"), [
      "surftrips-ericeira-all",
    ]);
    assert.equal(url.toString().includes("??"), false);
  }
  assert.equal(
    new URL(
      createBookingAffiliateUrl(`${base}&sid=old`, {
        destinationUrl: property,
      })!,
    ).searchParams.has("sid"),
    false,
  );
});

test("Booking : seuls les hostnames exacts HTTPS sont acceptés", () => {
  for (const value of [
    property,
    "https://booking.com/searchresults.html?ss=Ericeira%2C+Portugal",
    "https://www.booking.com/city/pt/ericeira.fr.html",
  ])
    assert.equal(bookingDestinationUrl(value), value);
  for (const value of [
    undefined,
    null,
    "",
    "http://booking.com",
    "https://booking.com.evil.test",
    "https://evilbooking.com",
    "https://evil.test/?site=booking.com",
    "https://booking.com@evil.test",
    "https://user:password@booking.com",
    "https://www.booking.com:444/",
    "https://www.booking.com./",
    "//booking.com",
    "https://www.booking.com\\@evil.test",
    "https://www.booking.com/\n",
    "https://a.booking.com",
    "javascript:alert(1)",
  ])
    assert.equal(bookingDestinationUrl(value), undefined, String(value));
});

test("configuration absente ou invalide : aucune affiliation de substitution", () => {
  for (const value of [
    undefined,
    "",
    "https://user:secret@affiliate.example",
    "http://affiliate.example/click",
    `${base}#fragment`,
    "https://affiliate.example/\n",
  ])
    assert.equal(evergreenUrl(value), undefined);
  assert.equal(
    createBookingAffiliateUrl(undefined, { destinationUrl: property }),
    undefined,
  );
  assert.equal(
    createBookingAffiliateUrl(base, { destinationUrl: "https://evil.test" }),
    undefined,
  );
});

test("SID déterministe : seulement zone interne et source autorisée", () => {
  assert.equal(bookingSid("bukit-bali", "all"), "surftrips-bukit-bali-all");
  assert.equal(
    bookingSid("ericeira", "hotel-card"),
    bookingSid("ericeira", "hotel-card"),
  );
  for (const value of [
    "",
    "../ericeira",
    "ericeira?email=a@example.com",
    "a".repeat(161),
  ])
    assert.throws(() => bookingSid(value, "all"));
  assert.equal(
    createBookingAffiliateUrl(base, {
      destinationUrl: property,
      sid: "person@example.com",
    }),
    undefined,
  );
});

test("redirection hôtel : 302 temporaire, SID, no-store et noindex", async () => {
  const response = await go(target);
  assert.equal(response.status, 302);
  const location = new URL(response.headers.get("location")!);
  assert.equal(location.searchParams.get("url"), property);
  assert.equal(
    location.searchParams.get("sid"),
    "surftrips-ericeira-hotel-card",
  );
  assert.match(response.headers.get("cache-control")!, /no-store/);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
});

for (const [label, row] of [
  ["inexistant", undefined],
  ["inactif", { ...target, active: false }],
  ["URL absente", { ...target, bookingUrl: null }],
  ["domaine externe", { ...target, bookingUrl: "https://evil.test" }],
] as const)
  test(`hôtel ${label} : refus sans redirection`, async () => {
    const response = await go(row);
    assert.equal(response.status, 404);
    assert.equal(response.headers.has("location"), false);
  });

test("destination avec URL, sans URL ou inconnue", async () => {
  const response = await go(
    {
      ...target,
      bookingUrl: "https://www.booking.com/city/pt/ericeira.fr.html",
    },
    "destination",
  );
  assert.equal(response.status, 302);
  assert.equal(
    new URL(response.headers.get("location")!).searchParams.get("sid"),
    "surftrips-ericeira-all",
  );
  for (const row of [undefined, { ...target, bookingUrl: null }])
    assert.equal((await go(row, "destination")).status, 404);
});

test("identifiants invalides rejetés avant tout accès base", async () => {
  for (const kind of ["accommodation", "destination"] as const) {
    const response = await bookingRedirect({
      kind,
      id: "https://evil.test",
      lookup: async () => {
        assert.fail("No DB access");
      },
      buildUrl,
    });
    assert.equal(response.status, 400);
    assert.equal(response.headers.has("location"), false);
  }
});

test("panne PostgreSQL ou configuration : erreur générique, aucun secret ni stack", async () => {
  const failed = await bookingRedirect({
    kind: "accommodation",
    id,
    lookup: async () => {
      throw new Error("SELECT secret FROM private_table");
    },
    buildUrl,
  });
  assert.equal(failed.status, 503);
  assert.doesNotMatch(
    await failed.text(),
    /SELECT|secret|private_table|Error:/,
  );
  const missing = await bookingRedirect({
    kind: "accommodation",
    id,
    lookup: async () => target,
    buildUrl: () => undefined,
  });
  assert.equal(missing.status, 503);
  assert.equal(missing.headers.has("location"), false);
});

test("clic suivant : relit l’état actif au lieu de garder une redirection en cache", async () => {
  let active = true;
  const options = {
    kind: "accommodation" as const,
    id,
    lookup: async () => ({ ...target, active }),
    buildUrl,
  };
  assert.equal((await bookingRedirect(options)).status, 302);
  active = false;
  assert.equal((await bookingRedirect(options)).status, 404);
});
