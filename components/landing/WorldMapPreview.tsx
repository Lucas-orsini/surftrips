"use client";

import { useState } from "react";
import Link from "next/link";
import { LazyMotion, m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { loadMotionFeatures } from "@/lib/load-motion";
import { Icon } from "@/components/ui/Icon";

const points = [
  {
    slug: "ericeira",
    name: "Ericeira",
    country: "Portugal",
    airport: "Lisbonne",
    iata: "LIS",
    x: 47.38,
    y: 29.31,
    time: 45,
    good: true,
  },
  {
    slug: "taghazout",
    name: "Taghazout",
    country: "Maroc",
    airport: "Agadir",
    iata: "AGA",
    x: 47.3,
    y: 35.32,
    time: 50,
    good: false,
  },
  {
    slug: "canggu",
    name: "Canggu",
    country: "Indonésie",
    airport: "Denpasar",
    iata: "DPS",
    x: 81.98,
    y: 63.32,
    time: 60,
    good: true,
  },
];

export function WorldMapPreview() {
  const [selected, setSelected] = useState(points[0]);
  const reduced = useReducedMotion();
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
              <small>ENV. {selected.time} MIN DE TRANSFERT</small>
            </span>
          </div>
        </div>
        <span className="map-caption">
          Un itinéraire illustratif, déjà un peu d’évasion.
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
                key={selected.slug}
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
              key={point.slug}
              className={`map-marker ${selected.slug === point.slug ? "is-selected" : ""}`}
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
            <span className="map-season">
              <i />
              {selected.good ? "Bonne période" : "Conditions variables"}
              <small> · septembre</small>
            </span>
          </div>
          <Link
            href={`/destination/${selected.slug}`}
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
              key={point.slug}
              type="button"
              aria-pressed={selected.slug === point.slug}
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
