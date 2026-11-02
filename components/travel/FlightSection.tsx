import type { Destination, SearchCriteria } from "@/lib/types";
import { AIRPORTS } from "@/lib/airports";
import { bookingConfig } from "@/lib/travel/config";
import { BookingForm } from "./BookingForm";
import { TravelpayoutsWidget } from "./TravelpayoutsWidget";
import { Icon } from "@/components/ui/Icon";

export function FlightSection({
  destination: d,
  criteria,
  error,
}: {
  destination: Destination;
  criteria?: SearchCriteria;
  error?: string;
}) {
  const sameAirport = !!criteria && criteria.origine === d.airportCode;
  const booking =
    criteria && d.airportCode && d.compatibleSpots > 0 && !sameAirport
      ? bookingConfig({
          origin: criteria.origine,
          destination: d.airportCode,
          departure: criteria.dateDepart,
          returnDate: criteria.dateRetour,
        })
      : null;
  const departure = AIRPORTS.find(
    (airport) => airport.code === criteria?.origine,
  );
  const dates = criteria
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).formatRange(
        new Date(`${criteria.dateDepart}T00:00:00Z`),
        new Date(`${criteria.dateRetour}T00:00:00Z`),
      )
    : undefined;
  return (
    <section
      id="reservation"
      className="booking-section"
      aria-labelledby="booking-title"
    >
      <p className="eyebrow">02 — S’Y RENDRE</p>
      <h2 id="booking-title">
        {criteria && d.airportCode ? (
          <span className="booking-route">
            <span>
              {departure?.city} ({criteria.origine})
            </span>
            <Icon name="arrow" size={22} />
            <span>
              {d.airportName || d.name} ({d.airportCode})
            </span>
          </span>
        ) : (
          <>Ton vol vers {d.name}.</>
        )}
      </h2>
      {criteria && d.airportCode ? (
        <div className="flight-summary">
          <p className="flight-dates">
            <Icon name="calendar" size={18} />
            {dates}
          </p>
          {d.transfer && (
            <p className="flight-transfer">
              <Icon name="clock" size={18} />
              {d.transfer} jusqu’à {d.name}
            </p>
          )}
        </div>
      ) : (
        <p className="body-copy">
          Choisis ton départ et tes dates pour préparer le voyage.
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {(!criteria || sameAirport || error) && (
        <BookingForm
          key={JSON.stringify(criteria)}
          zoneId={d.zoneId}
          criteria={criteria}
        />
      )}
      {sameAirport && (
        <p className="form-error" role="status">
          Ton aéroport de départ est aussi celui de cette destination. Choisis
          un autre aéroport de départ pour rechercher un vol.
        </p>
      )}
      {booking && (
        <TravelpayoutsWidget
          key={booking.key}
          widgetKey={booking.key}
          srcDoc={booking.srcDoc}
          searchUrl={booking.searchUrl}
          fallbackUrl={booking.fallbackUrl}
        />
      )}
      {!d.airportCode && (
        <p>L’aéroport d’arrivée reste à préciser pour cette destination.</p>
      )}
    </section>
  );
}
