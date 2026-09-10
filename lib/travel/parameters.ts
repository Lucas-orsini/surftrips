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
    powered_by: "true",
    trs: affiliation.marker,
    shmarker: affiliation.shmarker,
    from_name: flight.origin,
    to_name: flight.destination,
    departure: flight.departure,
    return: flight.returnDate,
  }).toString();
  return url.toString();
}
export function flightFallbackUrl(flight: FlightParameters): string {
  validateFlight(flight);
  return `https://www.kayak.fr/flights/${flight.origin}-${flight.destination}/${flight.departure}/${flight.returnDate}?sort=bestflight_a`;
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
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;font-family:system-ui;background:#fff}*{box-sizing:border-box}#booking-root{width:100%;overflow:hidden}iframe{max-width:100%}</style></head><body><div id="booking-root"></div><script>
  (() => {
    const channel = ${channel};
    let ready = false;
    const loadedFrames = new WeakSet();
    const send = (type, height) => parent.postMessage({ channel, type, height }, '*');
    const height = () => Math.ceil(document.body.getBoundingClientRect().height);
    const check = () => {
      const holder = document.getElementById('widget-holder');
      const content = holder && [...holder.querySelectorAll('iframe,form,input,button,a')].some(el => el.getBoundingClientRect().height > 8 && (!(el instanceof HTMLIFrameElement) || loadedFrames.has(el)));
      if (content) { ready = true; send('ready', height()); }
    };
    // A loaded iframe can still be blank. Specific Route's embedded partner
    // signals usable content with { loaded: true, iframeId }, not its load event.
    window.addEventListener('message', event => {
      const holder = document.getElementById('widget-holder');
      if (!holder || event.data?.loaded !== true) return;
      for (const child of holder.querySelectorAll('iframe')) {
        if (child.contentWindow === event.source && child.id === event.data.iframeId && child.src && event.origin === new URL(child.src).origin) { loadedFrames.add(child); check(); }
      }
    });
    new MutationObserver(check).observe(document.body, { childList:true, subtree:true });
    new ResizeObserver(() => { if (ready) send('resize', height()); else check(); }).observe(document.body);
    const timer = setInterval(check, 400);
    setTimeout(() => clearInterval(timer), 30000);
    window.addEventListener('error', () => { if (!ready) send('failed'); });
  })();
  </script><script async src="${escapeHtml(url)}" onerror="parent.postMessage({channel:${escapeHtml(channel)},type:'failed'},'*')"></script></body></html>`;
}
