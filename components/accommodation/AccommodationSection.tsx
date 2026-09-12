import { getRecommendedAccommodations } from "@/lib/db/accommodations";
import { hotelsFallbackUrl } from "@/lib/accommodation/config";
import { hotelsPubref } from "@/lib/accommodation/widget";
import type { SearchCriteria } from "@/lib/types";
import { AccommodationCard } from "./AccommodationCard";
import { HotelsSearchWidget } from "./HotelsSearchWidget";

interface Props {
  zoneId: string;
  name: string;
  country: string;
  criteria?: SearchCriteria;
}

export async function AccommodationSection({
  zoneId,
  name,
  country,
  criteria,
}: Props) {
  const recommendations = await getRecommendedAccommodations(zoneId);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const trip = criteria
    ? formatter.formatRange(
        new Date(`${criteria.dateDepart}T00:00:00Z`),
        new Date(`${criteria.dateRetour}T00:00:00Z`),
      )
    : undefined;
  const hasRecommendations = recommendations.items.length > 0;
  return (
    <section
      id="hebergement"
      className="accommodation-section"
      aria-labelledby="accommodation-title"
    >
      <div className="accommodation-heading">
        <p className="eyebrow">ENTRE DEUX SESSIONS</p>
        <h2 id="accommodation-title">Où dormir à {name} ?</h2>
        <p className="body-copy">
          Reste proche des spots, pas seulement du centre-ville.
        </p>
      </div>
      {hasRecommendations && (
        <>
          <p className="body-copy accommodation-intro">
            Notre sélection Surftrips : quelques hébergements bien situés pour
            accéder aux spots de la zone.
          </p>
          <div className="accommodation-grid">
            {recommendations.items.map((item) => (
              <AccommodationCard key={item.id} accommodation={item} />
            ))}
          </div>
        </>
      )}
      {recommendations.status === "unavailable" && (
        <p className="body-copy accommodation-intro">
          Les recommandations Surftrips sont momentanément indisponibles. Tu
          peux poursuivre avec le moteur Hotels.com.
        </p>
      )}
      <div className="hotels-search-panel">
        <div className="hotels-search-copy">
          <p className="eyebrow">TON POINT DE CHUTE</p>
          <h3>
            {hasRecommendations
              ? "Voir tous les hébergements disponibles"
              : `Trouve ton logement à ${name}`}
          </h3>
          <p className="body-copy">
            Compare les hôtels, appartements et autres hébergements disponibles
            sur Hotels.com pour tes dates.
          </p>
          <p className="body-copy">
            Repère les spots que tu souhaites surfer, puis compare les
            emplacements. Hotels.com te donnera les disponibilités, les chambres
            et les tarifs actuels.
          </p>
        </div>
        <div className="hotels-search-box">
          <p className="hotels-destination">
            Destination recommandée :{" "}
            <strong>
              {name}, {country}
            </strong>
          </p>
          {trip && <p className="hotels-trip">Ton voyage : {trip}</p>}
          <p className="hotels-search-hint">
            Renseigne cette destination et tes dates dans le moteur Hotels.com.
          </p>
          <HotelsSearchWidget
            key={zoneId}
            pubref={hotelsPubref(zoneId)}
            fallbackUrl={hotelsFallbackUrl()}
          />
        </div>
      </div>
      <p className="booking-disclosure">
        Surftrips peut percevoir une commission si tu réserves via certains
        liens, sans coût supplémentaire pour toi.
      </p>
    </section>
  );
}

export function AccommodationSkeleton() {
  return (
    <div
      className="accommodation-section skeleton"
      role="status"
      aria-label="Chargement de la section hébergement"
    >
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <span className="sr-only">La section hébergement se prépare…</span>
    </div>
  );
}
