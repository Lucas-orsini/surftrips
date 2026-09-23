import { getRecommendedAccommodations } from "@/lib/db/accommodations";
import { getBookingDestination } from "@/lib/db/booking";
import { isBookingConfigured } from "@/lib/booking/buildBookingAffiliateUrl";
import { bookingDestinationUrl } from "@/lib/booking/urls";
import type { SearchCriteria } from "@/lib/types";
import { AccommodationContent } from "./AccommodationContent";

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
  const [recommendations, destination] = await Promise.all([
    getRecommendedAccommodations(zoneId),
    getBookingDestination(zoneId).catch(() => undefined),
  ]);
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
  return (
    <AccommodationContent
      zoneId={zoneId}
      name={name}
      country={country}
      recommendations={recommendations}
      bookingEnabled={isBookingConfigured()}
      destinationAvailable={Boolean(
        bookingDestinationUrl(destination?.bookingUrl),
      )}
      trip={trip}
    />
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
