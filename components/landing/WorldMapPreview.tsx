"use client";

import type { MapPoint } from "@/lib/types";
import { useState } from "react";
import Link from "next/link";
import { LazyMotion, m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { loadMotionFeatures } from "@/lib/load-motion";
import { Icon } from "@/components/ui/Icon";

export function WorldMapPreview({ points }: { points: MapPoint[] }) {
  const [selected, setSelected] = useState(points[0]);
  const reduced = useReducedMotion();
  if (!selected) return null;
  const endX = selected.x * 10;
  const endY = selected.y * 3.75;
  return (
    <section
      className="section container map-section"
      aria-labelledby="map-title"
    >
      <div className="map-copy">
        <p className="eyebrow">LAISSE TES ENVIES PRENDRE LE LARGE</p>
        <h2 id="map-title">
          Du départ
          <br />à la vague.
        </h2>
        <p className="body-copy">
          Un aéroport, une route,
          <br />
          et l’océan au bout.
        </p>
        <div className="itinerary" aria-live="polite">
          <div>
            <span className="itinerary-dot" />
            <span>
              <strong>Paris</strong>
              <small>TON POINT DE DÉPART · PAR</small>
            </span>
          </div>
          <div>
            <Icon name="plane" size={18} />
            <span>
              <strong>{selected.airport}</strong>
              <small>AÉROPORT D’ARRIVÉE · {selected.iata}</small>
            </span>
          </div>
          <div>
            <Icon name="wave" size={20} />
            <span>
              <strong>{selected.name}</strong>
              <small>{selected.transfer || "TRANSFERT À PRÉCISER"}</small>
            </span>
          </div>
        </div>
        <span className="map-caption">
          Les coordonnées et aéroports de nos destinations.
        </span>
      </div>
      <div className="map-visual">
        <div className="map-canvas">
          <Image
            src="/images/world-map.svg"
            alt=""
            fill
            sizes="(max-width: 760px) 90vw, 65vw"
            className="world-map-background"
          />
          <span className="ocean-label ocean-atlantic">
            OCÉAN
            <br />
            ATLANTIQUE
          </span>
          <span className="ocean-label ocean-indian">OCÉAN INDIEN</span>
          <div className="map-paris">
            <span />
            PARIS
          </div>
          <LazyMotion features={loadMotionFeatures}>
            <svg
              className="flight-route"
              viewBox="0 0 1000 375"
              fill="none"
              aria-hidden="true"
            >
              <m.path
                key={selected.zoneId}
                d={`M506.5 83.42 Q${endX < 600 ? 390 : 740} ${endX < 600 ? 10 : -75} ${endX} ${endY}`}
                stroke="var(--ocean)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={reduced ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
            </svg>
          </LazyMotion>
          {points.map((point) => (
            <span
              key={point.zoneId}
              className={`map-marker ${selected.zoneId === point.zoneId ? "is-selected" : ""}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              aria-hidden="true"
              onMouseEnter={() => setSelected(point)}
            >
              <span />
            </span>
          ))}
        </div>
        <div className="map-destination-preview" aria-live="polite">
          <div>
            <span className="eyebrow">PROCHAINE ESCALE</span>
            <strong>{selected.name}</strong>
            <span>{selected.country}</span>
          </div>
          <Link
            href={`/destination/${selected.zoneId}`}
            aria-label={`Voir ${selected.name}`}
            className="round-link"
          >
            <Icon name="diagonal" size={22} />
          </Link>
        </div>
        <div className="map-legend">
          <span>
            <i />
            Quelques points de départ pour tes envies
          </span>
          <Icon name="compass" size={30} />
        </div>
        <div
          className="map-point-options"
          role="group"
          aria-label="Choisir une escale sur la carte"
        >
          {points.map((point) => (
            <button
              key={point.zoneId}
              type="button"
              aria-pressed={selected.zoneId === point.zoneId}
              onClick={() => setSelected(point)}
            >
              {point.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
