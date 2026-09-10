"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
const subscribe = () => () => {};
export function TravelpayoutsWidget({
  srcDoc,
  widgetKey,
  fallbackUrl,
}: {
  srcDoc: string | null;
  widgetKey: string;
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
  const [height, setHeight] = useState(430);
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
        event.data?.channel !== widgetKey
      )
        return;
      if (event.data.type === "ready") {
        ready = true;
        setState("ready");
        window.clearTimeout(timer);
      }
      if (event.data.type === "failed" && !ready) setState("fallback");
      if (
        ["ready", "resize"].includes(event.data.type) &&
        Number.isFinite(event.data.height)
      )
        setHeight(Math.min(1400, Math.max(300, event.data.height + 16)));
    }
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("message", receive);
    };
  }, [srcDoc, widgetKey, hydrated]);
  return (
    <div ref={container} className="flight-widget" data-state={state}>
      {state === "loading" && (
        <p className="booking-status" role="status">
          <span className="spinner" />
          Les vols se préparent…
        </p>
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
      <div className="booking-fallback" aria-live="polite">
        {state === "fallback" && (
          <p>
            Le module de vols ne s’affiche pas. Tu peux poursuivre ta recherche
            avec les mêmes aéroports et dates.
          </p>
        )}
        <a
          className={state === "fallback" ? "button" : "text-link"}
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {state === "fallback"
            ? "Rechercher mon vol"
            : "Ouvrir aussi la recherche de vols"}
          <span className="sr-only"> — nouvel onglet</span>
        </a>
      </div>
    </div>
  );
}
