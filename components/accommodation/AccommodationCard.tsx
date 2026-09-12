/** @jsxImportSource react */
import { Icon } from "@/components/ui/Icon";
import {
  ACCOMMODATION_TYPES,
  PRICE_CATEGORIES,
  type Accommodation,
} from "@/lib/accommodation/types";

export function AccommodationCard({
  accommodation: a,
}: {
  accommodation: Accommodation;
}) {
  const price = a.priceCategory ? PRICE_CATEGORIES[a.priceCategory] : undefined;
  return (
    <article className="accommodation-card">
      {a.imageUrl && (
        <div className="accommodation-photo">
          {/* Editorial HTTPS hosts vary; load directly without an open image proxy. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.imageUrl}
            alt={a.name}
            loading="lazy"
            decoding="async"
            width={800}
            height={600}
          />
        </div>
      )}
      <div className="accommodation-card-copy">
        <p className="eyebrow">{ACCOMMODATION_TYPES[a.type]}</p>
        <h3>{a.name}</h3>
        {a.locationLabel && (
          <p className="accommodation-location">
            <Icon name="pin" size={15} />
            {a.locationLabel}
          </p>
        )}
        {a.description && <p className="body-copy">{a.description}</p>}
        {a.distanceLabel && (
          <p className="accommodation-distance">{a.distanceLabel}</p>
        )}
        {price && (
          <p className="accommodation-price">
            <span aria-label={price.description}>{price.label}</span>
            <span>Gamme indicative, hors tarif actuel</span>
          </p>
        )}
        <a
          href={a.affiliateUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="text-link"
        >
          Voir sur Hotels.com
          <Icon name="arrow" size={18} />
          <span className="sr-only"> — {a.name}, nouvel onglet</span>
        </a>
      </div>
    </article>
  );
}
