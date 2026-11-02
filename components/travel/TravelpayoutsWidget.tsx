"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
const subscribe = () => () => {};
export function TravelpayoutsWidget({
  srcDoc,
  widgetKey,
  searchUrl,
  fallbackUrl,
}: {
  srcDoc: string | null;
  widgetKey: string;
  searchUrl: string;
  fallbackUrl: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const container = useRef<HTMLDivElement>(null);
  // Mount once after hydration; SSR srcdoc would execute again during hydration.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [state, setState] = useState<"loading" | "ready" | "fallback">(
    srcDoc ? "loading" : "fallback",
  );
  const [height, setHeight] = useState(120);
  useEffect(() => {
    if (!srcDoc || !hydrated) return;
    let ready = false;
    let timer: number | undefined;
    // The partner lazily loads its inner iframe. Count the five seconds when
    // the booking section approaches the viewport, not while it is offscreen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && timer === undefined && !ready) {
          timer = window.setTimeout(() => {
            if (!ready) setState("fallback");
          }, 5000);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );
    if (container.current) observer.observe(container.current);
    function receive(event: MessageEvent) {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== window.location.origin ||
        event.data?.channel !== widgetKey
      )
        return;
      const validHeight =
        Number.isFinite(event.data.height) && event.data.height > 0;
      if (event.data.type === "ready" && validHeight) {
        ready = true;
        setState("ready");
        window.clearTimeout(timer);
      }
      if (event.data.type === "failed" && !ready) setState("fallback");
      if (["ready", "resize"].includes(event.data.type) && validHeight)
        setHeight(Math.min(2400, Math.max(64, Math.ceil(event.data.height))));
    }
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("message", receive);
    };
  }, [srcDoc, widgetKey, hydrated]);
  const links = (
    <div className="booking-actions">
      <a
        className={state === "fallback" ? "button" : "text-link"}
        href={searchUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        Rechercher sur Kiwi.com
        <span className="sr-only"> — nouvel onglet</span>
      </a>
      <a
        className="text-link"
        href={fallbackUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Essayer aussi sur KAYAK
        <span className="sr-only"> — nouvel onglet</span>
      </a>
    </div>
  );
  const disclosure = (
    <p className="booking-disclosure">
      Réservation auprès de notre partenaire. Surftrips peut percevoir une
      commission.
    </p>
  );
  return (
    <div ref={container} className="flight-widget" data-state={state}>
      {state === "loading" && (
        <div className="booking-status" role="status">
          <span>Les vols se préparent…</span>
          <span className="skeleton-line" aria-hidden="true" />
        </div>
      )}
      {state === "ready" && (
        <details className="booking-options">
          <summary>Autres options de réservation</summary>
          {links}
          {disclosure}
        </details>
      )}
      {srcDoc && hydrated && (
        <iframe
          key={widgetKey}
          ref={frame}
          title="Rechercher un vol aller-retour pour cette destination"
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          referrerPolicy="strict-origin-when-cross-origin"
          className="booking-frame"
          style={{ height, display: state === "fallback" ? "none" : "block" }}
        />
      )}
      {state === "fallback" && (
        <div className="booking-fallback" role="status">
          <p>Impossible d’afficher les vols ici.</p>
          {links}
          {disclosure}
        </div>
      )}
    </div>
  );
}
