import { isValidDate } from "../validation/dates.ts";
export interface FlightParameters {
  origin: string;
  destination: string;
  departure: string;
  returnDate: string;
}
export function widgetKey(flight: FlightParameters) {
  return `${flight.origin}-${flight.destination}-${flight.departure}-${flight.returnDate}`;
}
function validateFlight(flight: FlightParameters) {
  if (
    !/^[A-Z]{3}$/.test(flight.origin) ||
    !/^[A-Z]{3}$/.test(flight.destination) ||
    flight.origin === flight.destination ||
    !isValidDate(flight.departure) ||
    !isValidDate(flight.returnDate) ||
    flight.returnDate <= flight.departure
  )
    throw new Error("INVALID_FLIGHT");
}
export function buildWidgetUrl(
  flight: FlightParameters,
  affiliation: { marker: string; shmarker: string },
): string {
  validateFlight(flight);
  if (!affiliation.marker || !affiliation.shmarker)
    throw new Error("AFFILIATION_NOT_CONFIGURED");
  const url = new URL("https://tpemd.com/content");
  url.search = new URLSearchParams({
    campaign_id: "111",
    promo_id: "4484",
    currency: "eur",
    locale: "fr",
    powered_by: "false",
    trs: affiliation.marker,
    shmarker: affiliation.shmarker,
    from_name: flight.origin,
    to_name: flight.destination,
    departure: flight.departure,
    return: flight.returnDate,
  }).toString();
  return url.toString();
}
// Preserve the complete trip in the widget fallback using the documented
// Kiwi deep-link contract (different from Specific Route's parameters).
// https://support.travelpayouts.com/hc/en-us/articles/360010109719
export function buildKiwiSearchUrl(
  flight: FlightParameters,
  shmarker?: string,
): string {
  validateFlight(flight);
  const search = new URL("https://www.kiwi.com/deep");
  search.search = new URLSearchParams({
    from: flight.origin,
    to: flight.destination,
    departure: flight.departure,
    return: flight.returnDate,
    lang: "fr",
    currency: "eur",
  }).toString();
  if (!shmarker) return search.toString();
  const affiliate = new URL("https://c111.travelpayouts.com/click");
  affiliate.search = new URLSearchParams({
    shmarker,
    promo_id: "3791",
    source_type: "customlink",
    type: "click",
    custom_url: search.toString(),
  }).toString();
  return affiliate.toString();
}
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function widgetDocument(url: string, key: string): string {
  if (new URL(url).origin !== "https://tpemd.com")
    throw new Error("INVALID_WIDGET_URL");
  const channel = JSON.stringify(key).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;width:100%;font-family:system-ui;background:#fff}*{box-sizing:border-box}#booking-root{display:flow-root;width:100%}iframe{display:block;max-width:100%}</style></head><body><div id="booking-root"><script>
  (() => {
    const channel = ${channel};
    const root = document.getElementById('booking-root');
    let ready = false;
    let lastHeight = -1;
    const loadedFrames = new WeakSet();
    const send = (type, height) => parent.postMessage({ channel, type, height }, '*');
    // Measure the intrinsic wrapper, never the viewport/document scrollHeight:
    // the latter cannot shrink below the current outer iframe height.
    const report = () => {
      const height = Math.ceil(root.getBoundingClientRect().height);
      if (!ready || height !== lastHeight) {
        send(ready ? 'resize' : 'ready', height);
        lastHeight = height;
        ready = true;
      }
    };
    const check = () => {
      const holder = document.getElementById('widget-holder');
      const content = holder && [...holder.querySelectorAll('iframe,form,input,button,a')].some(el => el.getBoundingClientRect().height > 8 && (!(el instanceof HTMLIFrameElement) || loadedFrames.has(el)));
      if (content) report();
    };
    // The partner reports a mounted UI, including its no-offers screen, via
    // { loaded: true, iframeId }. This does not guarantee flight availability.
    window.addEventListener('message', event => {
      const holder = document.getElementById('widget-holder');
      if (!holder || event.data?.loaded !== true) return;
      for (const child of holder.querySelectorAll('iframe')) {
        if (child.contentWindow === event.source && child.id === event.data.iframeId && child.src && event.origin === new URL(child.src).origin) { loadedFrames.add(child); check(); }
      }
    });
    // Observe only our same-origin wrapper. Kiwi's own script sizes its iframe
    // using its official messages; we never read or modify its internal DOM.
    const mutations = new MutationObserver(check);
    mutations.observe(root, { childList:true, subtree:true });
    const resize = new ResizeObserver(() => { if (ready) report(); else check(); });
    resize.observe(root);
    const timer = setInterval(check, 400);
    const stopTimer = setTimeout(() => clearInterval(timer), 30000);
    window.addEventListener('pagehide', () => {
      clearInterval(timer);
      clearTimeout(stopTimer);
      mutations.disconnect();
      resize.disconnect();
    }, { once:true });
    window.addEventListener('error', () => { if (!ready) send('failed'); });
  })();
  </script><script async src="${escapeHtml(url)}" onerror="parent.postMessage({channel:${escapeHtml(channel)},type:'failed'},'*')"></script></div></body></html>`;
}
