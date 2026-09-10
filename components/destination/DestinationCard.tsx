import Image from "next/image";
import Link from "next/link";
import type { Destination, SearchMatch } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { SeasonTimeline } from "./SeasonTimeline";

export function DestinationCard({
  destination,
  index = 0,
  season,
  reasons,
}: {
  destination: Destination;
  index?: number;
  season?: SearchMatch["season"];
  reasons?: string[];
}) {
  const status =
    season ?? (destination.bestMonths.includes(9) ? "good" : "variable");
  return (
    <article className="destination-card">
      <Link
        className="destination-photo-link"
        href={`/destination/${destination.slug}`}
      >
        <div className="destination-photo">
          <Image
            src={destination.image}
            alt={destination.imageAlt}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 900px) 45vw, 31vw"
          />
          <span className={`season-badge season-${status}`}>
            <span />
            {status === "good"
              ? "Bonne période"
              : status === "variable"
                ? "Conditions variables"
                : "Hors saison"}
          </span>
          <span className="destination-photo-coordinates">
            {destination.coordinates}
          </span>
          <span className="destination-photo-arrow">
            <Icon name="diagonal" size={23} />
          </span>
        </div>
      </Link>
      <div className="destination-title-row">
        <div>
          <p className="country-label">
            {destination.country}
            <span> / {destination.region}</span>
          </p>
          <h3>
            <Link href={`/destination/${destination.slug}`}>
              {destination.name}
            </Link>
          </h3>
        </div>
        <span className="editorial-number">0{index + 1}</span>
      </div>
      <p className="destination-tagline">{destination.tagline}</p>
      <div className="destination-facts">
        <span>
          <Icon name="wave" size={16} />
          {destination.recommendedLevel}
        </span>
        <span>
          <Icon name="plane" size={15} />
          {destination.transferMinutes} min
        </span>
        <span>
          <Icon name="pin" size={15} />
          {destination.spotCount} spots
        </span>
      </div>
      <SeasonTimeline
        bestMonths={destination.bestMonths}
        shoulderMonths={destination.shoulderMonths}
      />
      {reasons && (
        <ul className="match-reasons">
          {reasons.map((reason) => (
            <li key={reason}>
              <Icon name="check" size={16} />
              {reason}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
