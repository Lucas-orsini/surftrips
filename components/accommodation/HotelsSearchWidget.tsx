/** @jsxImportSource react */
"use client";

import { useEffect, useRef, useState } from "react";

export function HotelsSearchWidget({
  pubref,
  fallbackUrl,
}: {
  pubref: string;
  fallbackUrl?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const [height, setHeight] = useState(500);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" },
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    let ready = false;
    const timer = window.setTimeout(() => {
      if (!ready) setStatus("fallback");
    }, 8000);
    function receive(event: MessageEvent) {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== window.location.origin ||
        event.data?.channel !== `hotels-widget:${pubref}`
      )
        return;
      if (event.data.type === "failed" && !ready) setStatus("fallback");
      if (
        event.data.type === "ready" &&
        Number.isFinite(event.data.height) &&
        event.data.height > 100
      ) {
        ready = true;
        window.clearTimeout(timer);
        setHeight(Math.min(2400, Math.max(200, event.data.height + 8)));
        setStatus("ready");
      }
    }
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("message", receive);
    };
  }, [active, pubref, attempt]);

  return (
    <div ref={container} className="hotels-widget" data-state={status}>
      {status === "loading" && (
        <p className="booking-status" role="status">
          <span className="spinner" aria-hidden="true" />
          Le moteur Hotels.com se prépare…
        </p>
      )}
      {active && (
        <iframe
          key={`${pubref}-${attempt}`}
          ref={frame}
          src={`/widgets/hotels?${new URLSearchParams({ pubref })}`}
          title="Rechercher un hébergement sur Hotels.com"
          className="hotels-widget-frame"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ height, display: status === "fallback" ? "none" : "block" }}
        />
      )}
      {status === "fallback" && (
        <div className="hotels-widget-fallback" role="status">
          <p>Hotels.com n’a pas pu être chargé.</p>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setStatus("loading");
              setAttempt((value) => value + 1);
            }}
          >
            Réessayer le module Hotels.com
          </button>
        </div>
      )}
      {fallbackUrl && (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="text-link hotels-fallback-link"
        >
          Ouvrir Hotels.com<span className="sr-only"> — nouvel onglet</span>
        </a>
      )}
      <noscript>Active JavaScript pour utiliser le moteur Hotels.com.</noscript>
    </div>
  );
}
