import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildWidgetUrl,
  flightFallbackUrl,
  widgetDocument,
  widgetKey,
} from "../lib/travel/parameters.ts";
const flight = {
  origin: "PAR",
  destination: "LIS",
  departure: "2026-10-10",
  returnDate: "2026-10-20",
};
test("Specific Route : paramètres exacts et dates intactes", () => {
  const url = new URL(
    buildWidgetUrl(flight, {
      marker: "test-marker",
      shmarker: "test-affiliate",
    }),
  );
  assert.equal(url.origin, "https://tpemd.com");
  assert.equal(url.pathname, "/content");
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    campaign_id: "111",
    promo_id: "4484",
    currency: "eur",
    locale: "fr",
    powered_by: "true",
    trs: "test-marker",
    shmarker: "test-affiliate",
    from_name: "PAR",
    to_name: "LIS",
    departure: "2026-10-10",
    return: "2026-10-20",
  });
  for (const key of ["origin", "destination", "depart_date", "return_date"])
    assert.equal(url.searchParams.has(key), false);
});
test("chaque changement de voyage remonte le widget et le fallback garde les dates", () => {
  for (const changes of [
    { origin: "GVA" },
    { destination: "AGA" },
    { departure: "2026-10-11" },
    { returnDate: "2026-10-21" },
  ])
    assert.notEqual(widgetKey({ ...flight, ...changes }), widgetKey(flight));
  assert.match(flightFallbackUrl(flight), /PAR-LIS\/2026-10-10\/2026-10-20/);
});
test("srcdoc : un script externe, aucun holder dupliqué et échappement HTML", () => {
  const url = buildWidgetUrl(flight, {
    marker: 'test"<script>',
    shmarker: "test",
  });
  const doc = widgetDocument(url, widgetKey(flight));
  assert.equal((doc.match(/<script async src=/g) || []).length, 1);
  assert.equal(doc.includes('id="widget-holder"'), false);
  assert.equal(doc.includes('test"<script>'), false);
  assert.throws(() =>
    buildWidgetUrl(
      { ...flight, origin: 'PAR"' },
      { marker: "test", shmarker: "test" },
    ),
  );
  assert.throws(() => buildWidgetUrl(flight, { marker: "", shmarker: "" }));
  assert.throws(() => widgetDocument("https://example.com/script.js", "test"));
});
