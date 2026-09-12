import Link from "next/link";
import type { Destination, SearchCriteria } from "@/lib/types";
import { destinationHref } from "@/lib/validation/search";
import { SEASON_CLASS, SEASON_LABELS } from "@/lib/surf/season";
import { Icon } from "@/components/ui/Icon";
import { SeasonTimeline } from "./SeasonTimeline";
import { DestinationImage } from "./DestinationImage";
export function DestinationCard({
  destination: d,
  index = 0,
  criteria,
}: {
  destination: Destination;
  index?: number;
  criteria?: SearchCriteria;
}) {
  const href = destinationHref(d.zoneId, criteria);
  return (
    <article className="destination-card">
      <Link
        className="destination-photo-link"
        href={href}
        aria-label={`Découvrir ${d.name}`}
      >
        <div className="destination-photo">
          <DestinationImage
            src={d.image}
            name={d.name}
            country={d.country}
            sizes="(max-width: 760px) 90vw, (max-width: 1392px) 31vw, 407px"
          />
          {d.seasonStatus && (
            <span
              className={`season-badge season-${SEASON_CLASS[d.seasonStatus]}`}
            >
              <span />
              {SEASON_LABELS[d.seasonStatus]}
            </span>
          )}
          <span className="destination-photo-coordinates">{d.coordinates}</span>
          <span className="destination-photo-arrow">
            <Icon name="diagonal" size={23} />
          </span>
        </div>
      </Link>
      <div className="destination-title-row">
        <div>
          <p className="country-label">{d.country}</p>
          <h3>
            <Link href={href}>{d.name}</Link>
          </h3>
        </div>
        <span className="editorial-number">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <p className="destination-tagline">
        {d.airportName || "Un nouvel horizon à explorer"}
        {d.airportCode ? ` · ${d.airportCode}` : ""}
      </p>
      <div className="destination-facts">
        <span>
          <Icon name="wave" size={16} />
          {d.levelLabel}
        </span>
        {d.transfer && (
          <span>
            <Icon name="plane" size={15} />
            {d.transfer}
          </span>
        )}
        <span>
          <Icon name="pin" size={15} />
          {d.compatibleSpots} spot{d.compatibleSpots > 1 ? "s" : ""}
          {criteria ? " compatibles" : " documentés"}
        </span>
      </div>
      <SeasonTimeline timeline={d.timeline} />
      {criteria && (
        <ul className="match-reasons">
          <li>
            <Icon name="check" size={16} />
            Spots accessibles à ton niveau
          </li>
          <li>
            <Icon name="calendar" size={16} />
            {d.seasonStatus
              ? SEASON_LABELS[d.seasonStatus]
              : "Saison à vérifier"}
          </li>
        </ul>
      )}
    </article>
  );
}
