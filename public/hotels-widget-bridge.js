// Observe only our outer container's size. Never read hotel data or the
// generated widget's DOM. Expedia alone manages its own markup and iframe.
(() => {
  const pubref = document.querySelector(
    'meta[name="surftrips-hotels-pubref"]',
  )?.content;
  if (!pubref || window.parent === window) return;
  const send = (type, height) =>
    window.parent.postMessage(
      { channel: `hotels-widget:${pubref}`, type, height },
      window.location.origin,
    );
  window.addEventListener(
    "error",
    (event) => {
      if (event.target instanceof HTMLScriptElement) send("failed");
    },
    true,
  );
  const root = document.getElementById("hotels-widget-root");
  if (!root) return;
  const observer = new ResizeObserver(([entry]) => {
    const height = Math.ceil(entry.contentRect.height);
    if (height > 100) send("ready", height);
  });
  observer.observe(root);
  window.addEventListener("pagehide", () => observer.disconnect(), {
    once: true,
  });
})();
