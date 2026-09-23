/** @jsxImportSource react */
import type { AccommodationResult } from "@/lib/accommodation/types";
import { Icon } from "@/components/ui/Icon";
import { AccommodationCard } from "./AccommodationCard";

/** Server-rendered editorial content. No provider script or affiliate configuration. */
export function AccommodationContent({
  zoneId,
  name,
  country,
  recommendations,
  bookingEnabled,
  destinationAvailable,
  trip,
}: {
  zoneId: string;
  name: string;
  country: string;
  recommendations: AccommodationResult;
  bookingEnabled: boolean;
  destinationAvailable: boolean;
  trip?: string;
}) {
  const hasRecommendations = recommendations.items.length > 0;
  const canBrowse = bookingEnabled && destinationAvailable;
  const hasLinks =
    canBrowse ||
    (bookingEnabled && recommendations.items.some((item) => item.bookingUrl));
  return (
    <section
      id="hebergement"
      className="accommodation-section"
      aria-labelledby="accommodation-title"
    >
      <div className="accommodation-heading">
        <p className="eyebrow">03 — OÙ DORMIR</p>
        <h2 id="accommodation-title">
          {hasRecommendations
            ? `Nos adresses pour surfer à ${name}`
            : `Trouve ton logement à ${name}`}
        </h2>
        <p className="body-copy">
          Reste proche des spots, pas seulement du centre-ville.
        </p>
      </div>
      {hasRecommendations && (
        <>
          <p className="body-copy accommodation-intro">
            Nous avons sélectionné des logements bien placés pour profiter des
            spots.
          </p>
          <div className="accommodation-grid">
            {recommendations.items.map((item) => (
              <AccommodationCard
                key={item.id}
                accommodation={item}
                bookingEnabled={bookingEnabled}
              />
            ))}
          </div>
        </>
      )}
      {recommendations.status === "unavailable" && (
        <p className="body-copy accommodation-intro">
          Les recommandations Surftrips sont momentanément indisponibles.
        </p>
      )}
      {canBrowse ? (
        <div className="accommodation-search-panel">
          <div className="accommodation-search-copy">
            <p className="eyebrow">TON POINT DE CHUTE</p>
            <h3>Trouve ton camp de base à {name}.</h3>
            <p className="body-copy">
              Surftrips t’aide à choisir où dormir pour surfer. Booking.com te
              donne les disponibilités, les chambres et les tarifs actuels.
            </p>
          </div>
          <div className="accommodation-search-box">
            <p className="accommodation-destination">
              Destination{" "}
              <strong>
                {name}, {country}
              </strong>
            </p>
            {trip && <p className="accommodation-trip">Ton voyage : {trip}</p>}
            <p className="accommodation-search-hint">
              Vérifie tes dates et le nombre de voyageurs sur Booking.com.
            </p>
            <a
              className="text-link"
              href={`/go/booking/destination/${encodeURIComponent(zoneId)}`}
              target="_blank"
              rel="sponsored noopener noreferrer"
            >
              Voir tous les logements à {name}
              <Icon name="arrow" size={18} />
              <span className="sr-only"> — Booking.com, nouvel onglet</span>
            </a>
            <p className="accommodation-search-hint">
              Réservation via Booking.com
            </p>
          </div>
        </div>
      ) : (
        <>
          {trip && <p className="accommodation-trip">Ton voyage : {trip}</p>}
          {!hasRecommendations && recommendations.status !== "unavailable" && (
            <p className="body-copy accommodation-intro">
              Nos adresses à {name} sont en préparation. Repère les spots que tu
              souhaites surfer pour choisir ton point de chute.
            </p>
          )}
        </>
      )}
      {hasLinks && (
        <p className="booking-disclosure">
          Surftrips peut percevoir une commission si tu réserves via certains
          liens, sans coût supplémentaire pour toi.
        </p>
      )}
    </section>
  );
}
