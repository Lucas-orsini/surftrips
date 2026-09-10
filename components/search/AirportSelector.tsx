"use client";

import { useState } from "react";
import { AIRPORTS } from "@/lib/airports";
import { Icon } from "@/components/ui/Icon";

export function AirportSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const airports = AIRPORTS.filter((airport) =>
    normalize(`${airport.city} ${airport.code} ${airport.name}`).includes(
      normalize(query),
    ),
  );
  return (
    <>
      <div className="airport-input">
        <Icon name="search" size={17} />
        <input
          type="search"
          aria-label="Rechercher une ville ou un aéroport"
          placeholder="Une ville, un code IATA…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </div>
      <p className="airport-whitelist-note">
        Aéroports de départ proposés · liste non exhaustive
      </p>
      <div className="airport-options" aria-label="Aéroports disponibles">
        {airports.length ? (
          airports.map((airport) => (
            <button
              type="button"
              key={airport.code}
              className={`airport-option ${value === airport.code ? "selected" : ""}`}
              onClick={() => onChange(airport.code)}
              aria-pressed={value === airport.code}
            >
              <span>
                <strong>{airport.city}</strong>
                <small>{airport.name}</small>
              </span>
              <span className="iata">{airport.code}</span>
            </button>
          ))
        ) : (
          <p className="empty-airports" role="status">
            Aucun aéroport trouvé. Essaie une autre ville ou un code IATA.
          </p>
        )}
      </div>
    </>
  );
}
